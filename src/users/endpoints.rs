use log::{error, warn};
use rocket::{delete, get, post, put, routes, serde::json::Json, State};
use crate::{service::{db::MongoRepo, http_errors::JsonError, passwords::valid_password}, users::schema::UserDto};

use super::schema::{User, UserDetailsDto, UserRes};

pub fn user_to_res(user: User) -> UserRes {
  UserRes {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    roles: user.roles,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}


#[get("/")]
pub async fn get_users(user_repo: &State<MongoRepo<User>>) -> Result<Json<Vec<UserRes>>, JsonError> {
  let res = user_repo.get_all().await;
  match res {
    Ok(users) => {
      let res: Vec<UserRes> = users.into_iter().map(user_to_res).collect();
      Ok(Json(res))
    },
    Err(e) => {
      error!("Error getting users: {}", e);
      Err(JsonError::Internal("Error getting user".to_string()))
    },
  }
}

#[get("/<id>")]
pub async fn get_user(id: &str, user_repo: &State<MongoRepo<User>>) -> Result<Json<UserRes>, JsonError> {
  let res = user_repo.get_user_by_id(id).await;
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
pub async fn create_user(user: Json<UserDto>, user_repo: &State<MongoRepo<User>>) -> Result<Json<UserRes>, JsonError> {
  // TODO: email validation
  // TODO: password validation
  let data = user.into_inner();
  let password = data.password.clone();
  if !valid_password(&password) {
    return Err(JsonError::BadRequest("Password is not strong enough".to_string()));
  }

  let res = user_repo.create_user(data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      let user = user_repo.get_user_by_id(id.as_str()).await;
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
pub async fn delete_user(id: &str, user_repo: &State<MongoRepo<User>>) -> Result<Json<UserRes>, JsonError> {
  let user_res = user_repo.get_user_by_id(id).await;
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
  let res = user_repo.delete_user(id.to_string()).await;
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
