use log::{error, warn};
use rocket::{delete, get, http::Status, post, put, routes, serde::json::Json, State};
use crate::{accounts::schema::AccountDto, projects::schema::{Project, ProjectDto}, service::{db::MongoRepo, http_errors::JsonError}, sessions::{jwt::{get_jwt_session_and_user, JWT}, schema::Session}, users::{roles::is_admin, schema::User}};

use super::schema::{Account, AccountsList};

#[get("/?<page>&<per_page>&<sort_by>&<sort_dir>")]
pub async fn get_accounts(jwt: Result<JWT, JsonError>, page: usize, per_page: usize, sort_by: &str, sort_dir: &str, sessions_repos: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, account_repo: &State<MongoRepo<Account>>) -> Result<Json<AccountsList>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repos, users_repo, jwt).await?;
  if !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden(
      "You are not allowed to retrieve all users".to_string(),
    ));
  }

  let skip = page * per_page;
  let res = account_repo.get_accounts(skip, per_page, sort_by, sort_dir).await;
  match res {
    Ok(accounts) => Ok(Json(accounts)),
    Err(e) => {
      error!("Error getting accounts: {}", e);
      Err(JsonError::Internal("Error getting accounts".to_string()))
    },
  }
}

#[get("/<id>")]
pub async fn get_account(id: &str, account_repo: &State<MongoRepo<Account>>) -> Result<Json<Account>, Status> {
  let res = account_repo.get_account_by_id(id).await;
  match res {
    Ok(account) => match account {
      Some(account) => Ok(Json(account)),
      None => {
        warn!("Account not found: {}", id);
        Err(Status::NotFound)
      },
    },
    Err(e) => {
      error!("Error getting account: {}", e);
      Err(Status::InternalServerError)
    },
  }
}

#[post("/", format = "json", data = "<account>")]
pub async fn create_account(account: Json<AccountDto>, account_repo: &State<MongoRepo<Account>>) -> Result<Json<Account>, Status> {
  let data = account.into_inner();
  let res = account_repo.create_account(data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      let account = account_repo.get_account_by_id(id.as_str()).await;
      match account {
        Ok(account) => match account {
          Some(account) => Ok(Json(account)),
          None => {
            warn!("Account not found: {}", id);
            Err(Status::NotFound)
          },
        },
        Err(e) => {
          error!("Error getting account: {}", e);
          Err(Status::InternalServerError)
        },
      }
    },
    Err(e) => {
      error!("Error creating account: {}", e);
      Err(Status::InternalServerError)
    },
  }
}

#[put("/<id>", format = "json", data = "<account>")]
pub async fn update_account(id: &str, account: Json<AccountDto>, account_repo: &State<MongoRepo<Account>>) -> Result<Json<Account>, Status> {
  let data = account.into_inner();
  let res = account_repo.update_account(id.to_string(), data).await;
  match res {
    Ok(updated) => {
      if updated.modified_count == 0 {
        warn!("Account not found: {}", id);
        return Err(Status::NotFound);
      }
      let account = account_repo.get_account_by_id(id).await;
      match account {
        Ok(account) => match account {
          Some(account) => Ok(Json(account)),
          None => {
            warn!("Account not found: {}", id);
            Err(Status::NotFound)
          },
        },
        Err(e) => {
          error!("Error getting account: {}", e);
          Err(Status::InternalServerError)
        },
      }
    },
    Err(e) => {
      error!("Error updating account: {}", e);
      Err(Status::InternalServerError)
    },
  }
}

#[delete("/<id>")]
pub async fn delete_account(id: &str, account_repo: &State<MongoRepo<Account>>) -> Result<Json<Account>, Status> {
  let account: Account;
  match account_repo.get_account_by_id(id).await {
    Ok(account_opt) => match account_opt {
      Some(account_data) => account = account_data,
      None => {
        warn!("Account not found: {}", id);
        return Err(Status::NotFound);
      }
    }
    Err(e) => {
      error!("Error getting account: {}", e);
      return Err(Status::InternalServerError);
    }
  }
  match account_repo.delete_account(id.to_string()).await {
    Ok(deleted) => {
      if deleted.deleted_count == 0 {
        warn!("Account not found: {}", id);
        return Err(Status::NotFound);
      }
      Ok(Json(account))
    },
    Err(e) => {
      error!("Error deleting account: {}", e);
      Err(Status::InternalServerError)
    },
  }
}


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
  match project_repo.create_project(account_id, data).await {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      match project_repo.get_project_by_id(id.as_str()).await {
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



pub fn get_accounts_routes() -> Vec<rocket::Route> {
  routes![get_accounts, get_account, create_account, update_account, delete_account, get_account_projects, create_account_project]
}
