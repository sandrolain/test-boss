use log::{error, warn};
use rocket::{delete, get, post, put, routes, serde::json::Json, State};
use crate::{service::{db::MongoRepo, http_errors::JsonError}, sessions::{jwt::{get_jwt_session_and_user, JWT}, schema::{JWTSessionAndUser, Session}}, testchecks::schema::{Testcheck, TestcheckDto}, testlists::schema::TestlistDto, testreports::schema::{Testreport, TestreportDto}, testresults::schema::Testresult, users::{roles::is_admin, schema::User}};

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
async fn delete_testlist(jwt: Result<JWT, JsonError>, id: &str, testlist_repo: &State<MongoRepo<Testlist>>, testcheck_repo: &State<MongoRepo<Testcheck>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<Json<Testlist>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let testlist = allowed_for_testlist(jwts, testlist_repo, id).await?;

  if testcheck_repo.delete_testlist_testchecks(id).await.is_err() {
    error!("Error deleting testlist testchecks: {}", id);
    return Err(JsonError::Internal("Error deleting testlist testchecks".to_string()));
  }

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


#[get("/<testlist_id>/testchecks")]
pub async fn get_testlist_testchecks(jwt: Result<JWT, JsonError>, testlist_id: &str, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, testlist_repo: &State<MongoRepo<Testlist>>, testcheck_repo: &State<MongoRepo<Testcheck>>) -> Result<Json<Vec<Testcheck>>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  allowed_for_testlist(jwts, testlist_repo, testlist_id).await?;

  match testcheck_repo.get_testlist_testchecks(testlist_id).await {
    Ok(testchecks) => Ok(Json(testchecks)),
    Err(e) => {
      error!("Error getting testchecks: {}", e);
      Err(JsonError::Internal("Error getting testchecks".to_string()))
    },
  }
}

#[post("/<testlist_id>/testchecks", format = "json", data = "<data>")]
pub async fn create_testlist_testcheck(jwt: Result<JWT, JsonError>, testlist_id: &str, data: Json<TestcheckDto>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, testlist_repo: &State<MongoRepo<Testlist>>, testcheck_repo: &State<MongoRepo<Testcheck>>) -> Result<Json<Testcheck>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let testlist = allowed_for_testlist(jwts, testlist_repo, testlist_id).await?;
  let data = data.into_inner();
  let account_id = testlist.account_id.to_hex();
  let project_id = testlist.project_id.to_hex();

  let res = testcheck_repo.create_testcheck(&account_id, &project_id, testlist_id, data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      match testcheck_repo.get_testcheck_by_id(id.as_str()).await {
        Ok(testcheck) => match testcheck {
          Some(testcheck) => Ok(Json(testcheck)),
          None => {
            warn!("Testlist not found: {}", id);
            Err(JsonError::NotFound("Testlist not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting testcheck: {}", e);
          Err(JsonError::Internal("Error getting testcheck".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error creating testcheck: {}", e);
      Err(JsonError::Internal("Error creating testcheck".to_string()))
    },
  }
}

#[put("/<testlist_id>/testchecks", format = "json", data = "<data>")]
pub async fn update_testchecks_positions(jwt: Result<JWT, JsonError>, testlist_id: &str, data: Json<Vec<String>>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, testlist_repo: &State<MongoRepo<Testlist>>, testcheck_repo: &State<MongoRepo<Testcheck>>) -> Result<Json<i32>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let _ = allowed_for_testlist(jwts, testlist_repo, testlist_id).await?;
  let data = data.into_inner();

  let res = testcheck_repo.update_testlist_testchecks_positions(testlist_id, data).await;
  match res {
    Ok(inserted) => {
      Ok(Json(inserted))
    },
    Err(e) => {
      error!("Error updating testchecks positions: {}", e);
      Err(JsonError::Internal("Error updating testchecks positions".to_string()))
    },
  }
}


#[post("/<testlist_id>/testreports", format = "json", data = "<data>")]
pub async fn create_testreport(jwt: Result<JWT, JsonError>, testlist_id: &str, data: Json<TestreportDto>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, testlist_repo: &State<MongoRepo<Testlist>>, testcheck_repo: &State<MongoRepo<Testcheck>>, testreport_repo: &State<MongoRepo<Testreport>>, testresult_repo: &State<MongoRepo<Testresult>>) -> Result<Json<Testreport>, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  let testlist = allowed_for_testlist(jwts, testlist_repo, testlist_id).await?;;
  let data = data.into_inner();
  let account_id = testlist.account_id.to_hex();
  let project_id = testlist.project_id.to_hex();

  let testchecks = testcheck_repo.get_testlist_testchecks(testlist_id).await;
  if(testchecks.is_err()) {
    error!("Error getting testchecks: {}", testlist_id);
    return Err(JsonError::Internal("Error getting testchecks".to_string()));
  }
  let testchecks = testchecks.unwrap();

  let res = testreport_repo.create_testreport(&account_id, &project_id, testlist, data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      match testreport_repo.get_testreport_by_id(id.as_str()).await {
        Ok(testreport) => match testreport {
          Some(testreport) => {
            for testcheck in testchecks {
              let testcheck_id = testcheck.id.to_hex();
              let testresult = testresult_repo.create_testresult(&id, testcheck).await;
              if(testresult.is_err()) {
                let _ = testresult_repo.delete_testreport_testresults(id.as_str()).await;
                let _ = testresult_repo.delete_testresult(id.as_str()).await;
                error!("Error creating testresult for testcheck: {}", testcheck_id);
                return Err(JsonError::Internal("Error creating testresult".to_string()));
              }
            }
            Ok(Json(testreport))
          },
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
      error!("Error creating testreport: {}", e);
      Err(JsonError::Internal("Error creating testreport".to_string()))
    },
  }
}

pub fn get_testlists_routes() -> Vec<rocket::Route> {
  routes![get_testlists, get_testlist, update_testlist, delete_testlist, get_testlist_testchecks, create_testlist_testcheck, update_testchecks_positions, create_testreport]
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
