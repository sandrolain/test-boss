use log::{error, warn};
use rocket::{delete, get, put, routes, serde::json::Json, State};
use crate::{testlists::schema::TestlistDto, service::{db::MongoRepo, http_errors::JsonError}, sessions::{jwt::{get_jwt_session_and_user, JWT}, schema::{JWTSessionAndUser, Session}}, users::{roles::is_admin, schema::User}};

use super::schema::Testlist;

#[get("/")]
async fn get_testlists(testlist_repo: &State<MongoRepo<Testlist>>) -> Result<Json<Vec<Testlist>>, JsonError> {
  // TODO: admin guard
  let res = testlist_repo.get_all().await;
  match res {
    Ok(testlists) => Ok(Json(testlists)),
    Err(e) => {
      error!("Error getting testlists: {}", e);
      Err(JsonError::Internal("Error getting testlist".to_string()))
    },
  }
}

#[get("/<id>")]
async fn get_testlist(jwt: Result<JWT, JsonError>, id: &str, testlist_repo: &State<MongoRepo<Testlist>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testlist>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  match allowed_for_testlist(jwts, testlist_repo, id).await {
    Ok(testlist) => Ok(Json(testlist)),
    Err(e) => Err(e)
  }
}


#[put("/<id>", format = "json", data = "<data>")]
async fn update_testlist(jwt: Result<JWT, JsonError>, id: &str, data: Json<TestlistDto>, testlist_repo: &State<MongoRepo<Testlist>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testlist>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  allowed_for_testlist(jwts, testlist_repo, id).await?;

  match testlist_repo.update_testlist(id.to_string(), data.into_inner()).await {
    Ok(updated) => {
      if updated.modified_count == 0 {
        warn!("Testlist not found: {}", id);
        return Err(JsonError::NotFound("Testlist not found".to_string()));
      }
      match testlist_repo.get_testlist_by_id(id).await {
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
      error!("Error updating testlist: {}", e);
      Err(JsonError::Internal("Error updating testlist".to_string()))
    },
  }
}

#[delete("/<id>")]
async fn delete_testlist(jwt: Result<JWT, JsonError>, id: &str, testlist_repo: &State<MongoRepo<Testlist>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testlist>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let testlist = allowed_for_testlist(jwts, testlist_repo, id).await?;

  // TODO: delete subresources

  match testlist_repo.delete_testlist(id.to_string()).await {
    Ok(deleted) => {
      if deleted.deleted_count == 0 {
        warn!("Testlist not found: {}", id);
        return Err(JsonError::NotFound("Testlist not found".to_string()));
      }
      Ok(Json(testlist))
    },
    Err(e) => {
      error!("Error deleting testlist: {}", e);
      Err(JsonError::Internal("Error deleting testlist".to_string()))
    },
  }
}

pub fn get_testlists_routes() -> Vec<rocket::Route> {
  routes![get_testlists, get_testlist, update_testlist, delete_testlist]
}

async fn allowed_for_testlist(jwts: JWTSessionAndUser, testlist_repo: &State<MongoRepo<Testlist>>, testlist_id: &str) -> Result<Testlist, JsonError>  {
  if jwts.user.accounts.is_none() && !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden(
      "You are not allowed to retrieve this testlist".to_string(),
    ));
  }
  match testlist_repo.get_testlist_by_id(testlist_id).await {
    Ok(testlist) => match testlist {
      Some(testlist) => {
        let account_id = testlist.account_id;
        if let Some(accounts) = &jwts.user.accounts {
          if !accounts.iter().any(|account| account.account_id == account_id) && !is_admin(&jwts.user) {
            return Err(JsonError::Forbidden("You are not allowed to retrieve this testlist".to_string()));
          }
        }
        Ok(testlist)
      },
      None => {
        warn!("Testlist not found: {}", testlist_id);
        Err(JsonError::NotFound("Testlist not found".to_string()))
      },
    },
    Err(e) => {
      error!("Error getting testlist: {}", e);
      Err(JsonError::Internal("Error getting testlist".to_string()))
    },
  }
}
