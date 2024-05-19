use log::{error, warn};
use rocket::{delete, get, post, put, routes, serde::json::Json, State};
use crate::{service::{db::MongoRepo, http_errors::JsonError, validation::{valid_email, valid_password}}, sessions::{jwt::{get_jwt_session_and_user, JWT}, schema::Session}, users::schema::UserDto};

use super::{roles::is_admin, schema::{User, UserDetailsDto, UserRes, UsersResList}};

pub fn user_to_res(user: User) -> UserRes {
  UserRes {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    roles: user.roles.unwrap_or(vec![]),
    accounts: user.accounts.unwrap_or(vec![]),
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

#[get("/")]
pub async fn get_users(jwt: Result<JWT, JsonError>, sessions_repos: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<UsersResList>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repos, users_repo, jwt).await?;
  if !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden(
      "You are not allowed to retrieve all users".to_string(),
    ));
  }

  let res = users_repo.get_users(0, 10, "name".to_string(), "asc".to_string()).await;
  match res {
    Ok(users) => {
      let list: Vec<UserRes> = users.list.into_iter().map(user_to_res).collect();
      Ok(Json(UsersResList { list, total: users.total }))
    },
    Err(e) => {
      error!("Error getting users: {}", e);
      Err(JsonError::Internal("Error getting user".to_string()))
    },
  }
}

#[get("/<id>")]
pub async fn get_user(id: &str, jwt: Result<JWT, JsonError>, sessions_repos: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<UserRes>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repos, users_repo, jwt).await?;
  if id != jwts.user.id.to_string() && !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden("Forbidden".to_string()));
  }

  let res = users_repo.get_user_by_id(id).await;
  match res {
    Ok(user) => match user {
      Some(user) => {
        Ok(Json(user_to_res(user)))
      },
      None => {
        warn!("User not found: {}", id);
        Err(JsonError::NotFound("User not found".to_string()))
      },
    },
    Err(e) => {
      error!("Error getting user: {}", e);
      Err(JsonError::Internal("Error getting user".to_string()))
    },
  }
}

#[post("/", format = "json", data = "<user>")]
pub async fn create_user(user: Json<UserDto>, jwt: Result<JWT, JsonError>, sessions_repos: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<UserRes>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repos, users_repo, jwt).await?;
  if !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden("Forbidden".to_string()));
  }

  if !valid_email(&user.email) {
    return Err(JsonError::BadRequest("Invalid email address".to_string()));
  }

  let data = user.into_inner();
  let password = data.password.clone();
  if !valid_password(&password) {
    return Err(JsonError::BadRequest("Password is not strong enough".to_string()));
  }

  let res = users_repo.create_user(data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      let user = users_repo.get_user_by_id(id.as_str()).await;
      match user {
        Ok(user) => match user {
          Some(user) => Ok(Json(user_to_res(user))),
          None => {
            warn!("User not found: {}", id);
            Err(JsonError::NotFound("User not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting user: {}", e);
          Err(JsonError::Internal("Error getting user".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error creating user: {}", e);
      Err(JsonError::Internal("Error creating user".to_string()))
    },
  }
}

#[put("/<id>", format = "json", data = "<user>")]
pub async fn update_user(id: &str, user: Json<UserDetailsDto>, user_repo: &State<MongoRepo<User>>) -> Result<Json<UserRes>, JsonError> {
  let data = user.into_inner();
  let res = user_repo.update_user(id.to_string(), data).await;
  match res {
    Ok(updated) => {
      if updated.modified_count == 0 {
        warn!("User not found: {}", id);
        return Err(JsonError::NotFound("User not found".to_string()));
      }
      let user = user_repo.get_user_by_id(id).await;
      match user {
        Ok(user) => match user {
          Some(user) => Ok(Json(user_to_res(user))),
          None => {
            warn!("User not found: {}", id);
            Err(JsonError::NotFound("User not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting user: {}", e);
          Err(JsonError::Internal("Error getting user".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error updating user: {}", e);
      Err(JsonError::Internal("Error updating user".to_string()))
    },
  }
}

#[delete("/<id>")]
pub async fn delete_user(id: &str, jwt: Result<JWT, JsonError>, sessions_repos: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<UserRes>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repos, users_repo, jwt).await?;
  if !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden("Forbidden".to_string()));
  }

  let user_res = users_repo.get_user_by_id(id).await;
  let user: User;
  match user_res {
    Ok(user_opt) => match user_opt {
      Some(user_data) => user = user_data,
      None => {
        warn!("User not found: {}", id);
        return Err(JsonError::NotFound("User not found".to_string()));
      }
    }
    Err(e) => {
      error!("Error getting user: {}", e);
      return Err(JsonError::Internal("Error getting user".to_string()));
    }
  }
  let res = users_repo.delete_user(id.to_string()).await;
  match res {
    Ok(deleted) => {
      if deleted.deleted_count == 0 {
        warn!("User not found: {}", id);
        return Err(JsonError::NotFound("User not found".to_string()));
      }
      Ok(Json(user_to_res(user)))
    },
    Err(e) => {
      error!("Error deleting user: {}", e);
      Err(JsonError::Internal("Error deleting user".to_string()))
    },
  }
}

pub fn get_users_routes() -> Vec<rocket::Route> {
  routes![get_users, get_user, create_user, update_user, delete_user]
}
