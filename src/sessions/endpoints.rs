
use std::error::Error;

use bcrypt::verify;
use bson::oid::ObjectId;
use log::error;
use rocket::{delete, get, post, routes, serde::json::Json, State};

use crate::{accounts::schema::{Account, LoginAccount}, service::{db::MongoRepo, http_errors::JsonError, schema::Empty, validation::valid_password}, users::{endpoints::user_to_res, schema::{User, UserRes}}};

use super::{jwt::{create_jwt, get_jwt_session, get_jwt_session_and_user, JWT}, schema::{ChangePasswordDto, LoginDto, LoginResponseDto, Session}};

#[post("/login", format = "json", data = "<login>")]
pub async fn login(login: Json<LoginDto>, users_repo: &State<MongoRepo<User>>, sessions_repos: &State<MongoRepo<Session>>, accounts_repo: &State<MongoRepo<Account>>) -> Result<Json<LoginResponseDto>, JsonError> {
  let user = users_repo.verify_login(login.into_inner()).await;
  if user.is_err() {
    error!("Error verifying login: {}", user.unwrap_err());
    return Err(JsonError::Internal("Error verifying login".to_string()));
  }
  let user = user.unwrap();

  match user {
    Some(user) => {
      let user = user_to_res(user);
      let res = sessions_repos.create_session(user.id.to_string().as_str()).await;
      match res {
        Ok(inserted) => {
          let token = create_jwt(inserted.inserted_id.as_object_id().unwrap().to_hex().as_str());
          match token {
            Ok(token) => {
              match get_login_response(accounts_repo, token, user).await {
                Ok(res) => Ok(Json(res)),
                Err(e) => {
                  error!("Error getting login response: {}", e);
                  Err(JsonError::Internal("Error getting login response".to_string()))
                },
              }
            },
            Err(e) => {
              error!("Error creating token: {}", e);
              Err(JsonError::Internal("Error creating token".to_string()))
            },
          }
        },
        Err(e) => {
          error!("Error creating session: {}", e);
          Err(JsonError::Internal("Error creating session".to_string()))
        },
      }
    },
    None => Err(JsonError::Unauthorized("Invalid credentials".to_string())),
  }

}

#[get("/me")]
pub async fn get_session(jwt: Result<JWT, JsonError>, users_repo: &State<MongoRepo<User>>, sessions_repos: &State<MongoRepo<Session>>, accounts_repos: &State<MongoRepo<Account>>) -> Result<Json<LoginResponseDto>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repos, users_repo, jwt).await?;
  match get_login_response(accounts_repos, jwts.token, user_to_res(jwts.user)).await {
    Ok(res) => Ok(Json(res)),
    Err(e) => {
      error!("Error getting login response: {}", e);
      Err(JsonError::Internal("Error getting login response".to_string()))
    },
  }
}


#[post("/me")]
pub async fn update_session(jwt: Result<JWT, JsonError>, users_repo: &State<MongoRepo<User>>, sessions_repos: &State<MongoRepo<Session>>, accounts_repos: &State<MongoRepo<Account>>) -> Result<Json<LoginResponseDto>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repos, users_repo, jwt).await?;

  let session_id = jwts.session.id.to_hex();
  match sessions_repos.update_session(session_id.clone()).await {
    Ok(_) => match create_jwt(session_id.as_str()) {
      Ok(token) => {
        match get_login_response(accounts_repos, token, user_to_res(jwts.user)).await {
          Ok(res) => Ok(Json(res)),
          Err(e) => {
            error!("Error getting login response: {}", e);
            Err(JsonError::Internal("Error getting login response".to_string()))
          },
        }
      },
      Err(e) => {
        error!("Error creating token: {}", e);
        Err(JsonError::Internal("Error creating token".to_string()))
      }
    },
    Err(e) => {
      error!("Error updating session: {}", e);
      Err(JsonError::Internal("Error updating session".to_string()))
    },
  }
}

#[delete("/")]
pub async fn delete_session(jwt: Result<JWT, JsonError>, sessions_repos: &State<MongoRepo<Session>>) -> Result<Empty, JsonError> {
  let jwts = get_jwt_session(sessions_repos, jwt).await?;
  let session_id = jwts.session.id.to_hex();
  match sessions_repos.delete_session(session_id.clone()).await {
    Ok(_) => Ok(()),
    Err(e) => {
      error!("Error deleting session: {}", e);
      Err(JsonError::Internal("Error deleting session".to_string()))
    },
  }
}

#[post("/password", format = "json", data = "<change>")]
pub async fn change_password(jwt: Result<JWT, JsonError>, change: Json<ChangePasswordDto>, users_repo: &State<MongoRepo<User>>, sessions_repos: &State<MongoRepo<Session>>) -> Result<Empty, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repos, users_repo, jwt).await?;
  let old_password = change.old_password.clone();
  let new_password = change.new_password.clone();

  if old_password.is_empty() || new_password.is_empty() {
    return Err(JsonError::BadRequest("Old password and new password cannot be empty".to_string()));
  }
  if !valid_password(&new_password) {
    return Err(JsonError::BadRequest("New password is not strong enough".to_string()));
  }

  match verify(old_password, jwts.user.pwdhash.as_str()) {
    Ok(res) => {
      if res {
        match users_repo.change_password(jwts.user.id.to_hex(), new_password).await {
          Ok(_) => Ok(()),
          Err(e) => {
            error!("Error changing password: {}", e);
            Err(JsonError::Internal("Error changing password".to_string()))
          }
        }
      } else {
        Err(JsonError::Unauthorized("Invalid password".to_string()))
      }
    },
    Err(e) => {
      error!("Error verifying password: {}", e);
      return Err(JsonError::Internal("Error verifying password".to_string()));
    }
  }
}

pub fn get_sessions_routes() -> Vec<rocket::Route> {
  routes![login, get_session, update_session, delete_session, change_password]
}


pub async fn get_login_response(accounts_repos: &State<MongoRepo<Account>>,  token: String, user: UserRes) -> Result<LoginResponseDto, Box<dyn Error + Send + Sync>> {
  let user_accounts = user.accounts.clone();
  let account_ids: Vec<ObjectId> = user_accounts.iter().map(|account| account.account_id).collect();
  let accounts_list = accounts_repos.get_accounts_by_object_ids(account_ids).await?;
  let mut accounts = Vec::new();
  for account_rec in accounts_list {
    let user_account = user_accounts.iter().find(|account| account.account_id == account_rec.id);
    let mut is_manager: bool = false;
    if let Some(account) = user_account {
      is_manager = account.is_manager;
    }
    accounts.push(LoginAccount {
      id: account_rec.id,
      name: account_rec.name,
      created_at: account_rec.created_at,
      updated_at: account_rec.updated_at,
      is_manager,
    });
  }
  return Ok(LoginResponseDto { token, user, accounts });
}
