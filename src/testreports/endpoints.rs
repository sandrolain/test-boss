use log::{error, warn};
use rocket::{delete, get, post, put, routes, serde::json::Json, State};
use crate::{service::{db::MongoRepo, http_errors::JsonError}, sessions::{jwt::{get_jwt_session_and_user, JWT}, schema::{JWTSessionAndUser, Session}}, testresults::schema::{Testresult, TestresultDto}, testreports::schema::TestreportDto, users::{roles::is_admin, schema::User}};

use super::schema::Testreport;

#[get("/")]
async fn get_testreports(testreport_repo: &State<MongoRepo<Testreport>>) -> Result<Json<Vec<Testreport>>, JsonError> {
  // TODO: admin guard
  let res = testreport_repo.get_all().await;
  match res {
    Ok(testreports) => Ok(Json(testreports)),
    Err(e) => {
      error!("Error getting testreports: {}", e);
      Err(JsonError::Internal("Error getting testreport".to_string()))
    },
  }
}

#[get("/<id>")]
async fn get_testreport(jwt: Result<JWT, JsonError>, id: &str, testreport_repo: &State<MongoRepo<Testreport>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testreport>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  match allowed_for_testreport(jwts, testreport_repo, id).await {
    Ok(testreport) => Ok(Json(testreport)),
    Err(e) => Err(e)
  }
}


#[put("/<id>", format = "json", data = "<data>")]
async fn update_testreport(jwt: Result<JWT, JsonError>, id: &str, data: Json<TestreportDto>, testreport_repo: &State<MongoRepo<Testreport>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testreport>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  allowed_for_testreport(jwts, testreport_repo, id).await?;

  match testreport_repo.update_testreport(id.to_string(), data.into_inner()).await {
    Ok(updated) => {
      if updated.modified_count == 0 {
        warn!("Testreport not found: {}", id);
        return Err(JsonError::NotFound("Testreport not found".to_string()));
      }
      match testreport_repo.get_testreport_by_id(id).await {
        Ok(testreport) => match testreport {
          Some(testreport) => Ok(Json(testreport)),
          None => {
            warn!("Testreport not found: {}", id);
            Err(JsonError::NotFound("Testreport not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting testreport: {}", e);
          Err(JsonError::Internal("Error getting testreport".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error updating testreport: {}", e);
      Err(JsonError::Internal("Error updating testreport".to_string()))
    },
  }
}

#[delete("/<id>")]
async fn delete_testreport(jwt: Result<JWT, JsonError>, id: &str, testreport_repo: &State<MongoRepo<Testreport>>, testresult_repo: &State<MongoRepo<Testresult>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testreport>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let testreport = allowed_for_testreport(jwts, testreport_repo, id).await?;

  if testresult_repo.delete_testreport_testresults(id).await.is_err() {
    error!("Error deleting testreport testresults: {}", id);
    return Err(JsonError::Internal("Error deleting testreport testresults".to_string()));
  }

  match testreport_repo.delete_testreport(id.to_string()).await {
    Ok(deleted) => {
      if deleted.deleted_count == 0 {
        warn!("Testreport not found: {}", id);
        return Err(JsonError::NotFound("Testreport not found".to_string()));
      }
      Ok(Json(testreport))
    },
    Err(e) => {
      error!("Error deleting testreport: {}", e);
      Err(JsonError::Internal("Error deleting testreport".to_string()))
    },
  }
}

#[get("/<testreport_id>/testresults")]
pub async fn get_testreport_testresults(jwt: Result<JWT, JsonError>, testreport_id: &str, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, testreport_repo: &State<MongoRepo<Testreport>>, testresult_repo: &State<MongoRepo<Testresult>>) -> Result<Json<Vec<Testresult>>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  allowed_for_testreport(jwts, testreport_repo, testreport_id).await?;

  match testresult_repo.get_testreport_testresults(testreport_id).await {
    Ok(testresults) => Ok(Json(testresults)),
    Err(e) => {
      error!("Error getting testresults: {}", e);
      Err(JsonError::Internal("Error getting testresults".to_string()))
    },
  }
}

pub fn get_testreports_routes() -> Vec<rocket::Route> {
  routes![get_testreports, get_testreport, update_testreport, delete_testreport, get_testreport_testresults]
}

async fn allowed_for_testreport(jwts: JWTSessionAndUser, testreport_repo: &State<MongoRepo<Testreport>>, testreport_id: &str) -> Result<Testreport, JsonError>  {
  if jwts.user.accounts.is_none() && !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden(
      "You are not allowed to retrieve this testreport".to_string(),
    ));
  }
  match testreport_repo.get_testreport_by_id(testreport_id).await {
    Ok(testreport) => match testreport {
      Some(testreport) => {
        let account_id = testreport.account_id;
        if let Some(accounts) = &jwts.user.accounts {
          if !accounts.iter().any(|account| account.account_id == account_id) && !is_admin(&jwts.user) {
            return Err(JsonError::Forbidden("You are not allowed to retrieve this testreport".to_string()));
          }
        }
        Ok(testreport)
      },
      None => {
        warn!("Testreport not found: {}", testreport_id);
        Err(JsonError::NotFound("Testreport not found".to_string()))
      },
    },
    Err(e) => {
      error!("Error getting testreport: {}", e);
      Err(JsonError::Internal("Error getting testreport".to_string()))
    },
  }
}
