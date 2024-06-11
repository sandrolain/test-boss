use log::{error, warn};
use rocket::{delete, get, post, put, routes, serde::json::Json, State};
use crate::{projects::schema::ProjectDto, service::{db::MongoRepo, http_errors::JsonError}, sessions::{guards::authorize_as_admin, jwt::{get_jwt_session_and_user, JWT}, schema::{JWTSessionAndUser, Session}}, testlists::schema::{Testlist, TestlistDto}, testreports::schema::Testreport, users::{roles::is_admin, schema::User}};

use super::schema::Project;

#[get("/")]
async fn get_projects(jwt: Result<JWT, JsonError>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, project_repo: &State<MongoRepo<Project>>) -> Result<Json<Vec<Project>>, JsonError> {
  authorize_as_admin(jwt, sessions_repo, users_repo).await?;

  match project_repo.get_all().await {
    Ok(projects) => Ok(Json(projects)),
    Err(e) => {
      error!("Error getting projects: {}", e);
      Err(JsonError::Internal("Error getting project".to_string()))
    },
  }
}

#[get("/<id>")]
async fn get_project(jwt: Result<JWT, JsonError>, id: &str, project_repo: &State<MongoRepo<Project>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Project>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  match allowed_for_project(jwts, project_repo, id).await {
    Ok(project) => Ok(Json(project)),
    Err(e) => Err(e)
  }
}


#[put("/<id>", format = "json", data = "<data>")]
async fn update_project(jwt: Result<JWT, JsonError>, id: &str, data: Json<ProjectDto>, project_repo: &State<MongoRepo<Project>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Project>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  allowed_for_project(jwts, project_repo, id).await?;

  match project_repo.update(id.to_string(), data.into_inner()).await {
    Ok(updated) => {
      if updated.modified_count == 0 {
        warn!("Project not found: {}", id);
        return Err(JsonError::NotFound("Project not found".to_string()));
      }
      match project_repo.get_project_by_id(id).await {
        Ok(project) => match project {
          Some(project) => Ok(Json(project)),
          None => {
            warn!("Project not found: {}", id);
            Err(JsonError::NotFound("Project not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting project: {}", e);
          Err(JsonError::Internal("Error getting project".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error updating project: {}", e);
      Err(JsonError::Internal("Error updating project".to_string()))
    },
  }
}

#[delete("/<id>")]
async fn delete_project(jwt: Result<JWT, JsonError>, id: &str, project_repo: &State<MongoRepo<Project>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Project>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let project = allowed_for_project(jwts, project_repo, id).await?;

  // TODO: delete subresources

  match project_repo.delete(id.to_string()).await {
    Ok(deleted) => {
      if deleted.deleted_count == 0 {
        warn!("Project not found: {}", id);
        return Err(JsonError::NotFound("Project not found".to_string()));
      }
      Ok(Json(project))
    },
    Err(e) => {
      error!("Error deleting project: {}", e);
      Err(JsonError::Internal("Error deleting project".to_string()))
    },
  }
}

#[get("/<project_id>/testlists")]
pub async fn get_project_testlists(jwt: Result<JWT, JsonError>, project_id: &str, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, projects_repo: &State<MongoRepo<Project>>, testlist_repo: &State<MongoRepo<Testlist>>) -> Result<Json<Vec<Testlist>>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  allowed_for_project(jwts, projects_repo, project_id).await?;

  match testlist_repo.get_project_testlists(project_id).await {
    Ok(testlists) => Ok(Json(testlists)),
    Err(e) => {
      error!("Error getting testlists: {}", e);
      Err(JsonError::Internal("Error getting testlist".to_string()))
    },
  }
}

#[get("/<project_id>/testreports")]
pub async fn get_project_testreports(jwt: Result<JWT, JsonError>, project_id: &str, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, projects_repo: &State<MongoRepo<Project>>, testreport_repo: &State<MongoRepo<Testreport>>) -> Result<Json<Vec<Testreport>>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  allowed_for_project(jwts, projects_repo, project_id).await?;

  match testreport_repo.get_project_testreports(project_id).await {
    Ok(testreports) => Ok(Json(testreports)),
    Err(e) => {
      error!("Error getting testreports: {}", e);
      Err(JsonError::Internal("Error getting testreport".to_string()))
    },
  }
}

#[post("/<project_id>/testlists", format = "json", data = "<testlist>")]
pub async fn create_project_testlist(jwt: Result<JWT, JsonError>, project_id: &str, testlist: Json<TestlistDto>, projects_repo: &State<MongoRepo<Project>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, testlist_repo: &State<MongoRepo<Testlist>>) -> Result<Json<Testlist>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let project = allowed_for_project(jwts, projects_repo, project_id).await?;
  let data = testlist.into_inner();
  let account_id = project.account_id.to_hex();

  let res = testlist_repo.create_testlist(&account_id, project_id, data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      match testlist_repo.get_testlist_by_id(id.as_str()).await {
        Ok(testlist) => match testlist {
          Some(testlist) => Ok(Json(testlist)),
          None => {
            warn!("Testlist not found: {}", id);
            Err(JsonError::NotFound("Testlist not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting testlist: {}", e);
          Err(JsonError::Internal("Error getting testlist".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error creating testlist: {}", e);
      Err(JsonError::Internal("Error creating testlist".to_string()))
    },
  }
}


pub fn get_projects_routes() -> Vec<rocket::Route> {
  routes![get_projects, get_project, update_project, delete_project, get_project_testlists, create_project_testlist, get_project_testreports]
}


async fn allowed_for_project(jwts: JWTSessionAndUser, project_repo: &State<MongoRepo<Project>>, project_id: &str) -> Result<Project, JsonError>  {
  if jwts.user.accounts.is_none() && !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden(
      "You are not allowed to retrieve this project".to_string(),
    ));
  }
  match project_repo.get_project_by_id(project_id).await {
    Ok(project) => match project {
      Some(project) => {
        let account_id = project.account_id;
        if let Some(accounts) = &jwts.user.accounts {
          if !accounts.iter().any(|account| account.account_id == account_id) && !is_admin(&jwts.user) {
            return Err(JsonError::Forbidden("You are not allowed to retrieve this project".to_string()));
          }
        }
        Ok(project)
      },
      None => {
        warn!("Project not found: {}", project_id);
        Err(JsonError::NotFound("Project not found".to_string()))
      },
    },
    Err(e) => {
      error!("Error getting project: {}", e);
      Err(JsonError::Internal("Error getting project".to_string()))
    },
  }
}
