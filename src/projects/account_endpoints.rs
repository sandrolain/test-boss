use log::{error, warn};
use rocket::{get, post, routes, serde::json::Json, State};
use crate::{accounts::schema::Account, service::{db::MongoRepo, http_errors::JsonError}, sessions::{jwt::{get_jwt_session_and_user, JWT}, schema::Session}, users::schema::User};

use super::schema::{Project, ProjectDto};

#[get("/<account_id>/projects")]
pub async fn get_account_projects(jwt: Result<JWT, JsonError>, account_id: &str, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, accounts_repo: &State<MongoRepo<Account>>, project_repo: &State<MongoRepo<Project>>) -> Result<Json<Vec<Project>>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  if jwts.user.accounts.is_none() {
    return Err(JsonError::Forbidden(
      "You are not allowed to retrieve this account projects".to_string(),
    ));
  }

  let user_accounts = jwts.user.accounts.unwrap();
  let is_in_accounts = user_accounts.iter().any(|a| a.account_id.to_hex() == account_id);
  if !is_in_accounts {
    return Err(JsonError::Forbidden(
      "You are not allowed to retrieve this account projects".to_string(),
    ));
  }

  let account = accounts_repo.get_account_by_id(account_id).await;
  if account.is_err() {
    return Err(JsonError::NotFound("Account not found".to_string()));
  }
  let account = account.unwrap();
  if account.is_none() {
    return Err(JsonError::NotFound("Account not found".to_string()));
  }

  let res = project_repo.get_account_projects(account_id).await;
  match res {
    Ok(projects) => Ok(Json(projects)),
    Err(e) => {
      error!("Error getting projects: {}", e);
      Err(JsonError::Internal("Error getting project".to_string()))
    },
  }
}


#[post("/<account_id>/projects", format = "json", data = "<project>")]
pub async fn create_account_project(account_id: &str, project: Json<ProjectDto>, project_repo: &State<MongoRepo<Project>>) -> Result<Json<Project>, JsonError> {
  let data = project.into_inner();
  let res = project_repo.create(account_id, data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      let project = project_repo.get_by_id(id.as_str()).await;
      match project {
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
      error!("Error creating project: {}", e);
      Err(JsonError::Internal("Error creating project".to_string()))
    },
  }
}

