use log::{error, warn};
use rocket::{delete, get, put, routes, serde::json::Json, State};
use crate::{testchecks::schema::TestcheckDto, service::{db::MongoRepo, http_errors::JsonError}, sessions::{jwt::{get_jwt_session_and_user, JWT}, schema::{JWTSessionAndUser, Session}}, users::{roles::is_admin, schema::User}};

use super::schema::Testcheck;

#[get("/")]
async fn get_testchecks(testcheck_repo: &State<MongoRepo<Testcheck>>) -> Result<Json<Vec<Testcheck>>, JsonError> {
  // TODO: admin guard
  let res = testcheck_repo.get_all().await;
  match res {
    Ok(testchecks) => Ok(Json(testchecks)),
    Err(e) => {
      error!("Error getting testchecks: {}", e);
      Err(JsonError::Internal("Error getting testcheck".to_string()))
    },
  }
}

#[get("/<id>")]
async fn get_testcheck(jwt: Result<JWT, JsonError>, id: &str, testcheck_repo: &State<MongoRepo<Testcheck>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testcheck>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  match allowed_for_testcheck(jwts, testcheck_repo, id).await {
    Ok(testcheck) => Ok(Json(testcheck)),
    Err(e) => Err(e)
  }
}


#[put("/<id>", format = "json", data = "<data>")]
async fn update_testcheck(jwt: Result<JWT, JsonError>, id: &str, data: Json<TestcheckDto>, testcheck_repo: &State<MongoRepo<Testcheck>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testcheck>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  allowed_for_testcheck(jwts, testcheck_repo, id).await?;

  match testcheck_repo.update_testcheck(id.to_string(), data.into_inner()).await {
    Ok(updated) => {
      if updated.modified_count == 0 {
        warn!("Testcheck not found: {}", id);
        return Err(JsonError::NotFound("Testcheck not found".to_string()));
      }
      match testcheck_repo.get_testcheck_by_id(id).await {
        Ok(testcheck) => match testcheck {
          Some(testcheck) => Ok(Json(testcheck)),
          None => {
            warn!("Testcheck not found: {}", id);
            Err(JsonError::NotFound("Testcheck not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting testcheck: {}", e);
          Err(JsonError::Internal("Error getting testcheck".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error updating testcheck: {}", e);
      Err(JsonError::Internal("Error updating testcheck".to_string()))
    },
  }
}


#[delete("/<id>")]
async fn delete_testcheck(jwt: Result<JWT, JsonError>, id: &str, testcheck_repo: &State<MongoRepo<Testcheck>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testcheck>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let testcheck = allowed_for_testcheck(jwts, testcheck_repo, id).await?;

  // TODO: delete subresources

  match testcheck_repo.delete_testcheck(id.to_string()).await {
    Ok(deleted) => {
      if deleted.deleted_count == 0 {
        warn!("Testcheck not found: {}", id);
        return Err(JsonError::NotFound("Testcheck not found".to_string()));
      }
      Ok(Json(testcheck))
    },
    Err(e) => {
      error!("Error deleting testcheck: {}", e);
      Err(JsonError::Internal("Error deleting testcheck".to_string()))
    },
  }
}

pub fn get_testchecks_routes() -> Vec<rocket::Route> {
  routes![get_testchecks, get_testcheck, update_testcheck, delete_testcheck]
}

async fn allowed_for_testcheck(jwts: JWTSessionAndUser, testcheck_repo: &State<MongoRepo<Testcheck>>, testcheck_id: &str) -> Result<Testcheck, JsonError>  {
  if jwts.user.accounts.is_none() && !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden(
      "You are not allowed to retrieve this testcheck".to_string(),
    ));
  }

  match testcheck_repo.get_testcheck_by_id(testcheck_id).await {
    Ok(testcheck) => match testcheck {
      Some(testcheck) => {
        let account_id = testcheck.account_id;
        if let Some(accounts) = &jwts.user.accounts {
          if !accounts.iter().any(|account| account.account_id == account_id) && !is_admin(&jwts.user) {
            return Err(JsonError::Forbidden("You are not allowed to retrieve this testcheck".to_string()));
          }
        }
        Ok(testcheck)
      },
      None => {
        warn!("Testcheck not found: {}", testcheck_id);
        Err(JsonError::NotFound("Testcheck not found".to_string()))
      },
    },
    Err(e) => {
      error!("Error getting testcheck: {}", e);
      Err(JsonError::Internal("Error getting testcheck".to_string()))
    },
  }
}
