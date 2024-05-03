use log::{error, warn};
use rocket::{get, http::Status, serde::json::Json, State};
use crate::service::db::MongoRepo;

use super::schema::Account;

#[get("/")]
pub async fn get_accounts(account_repo: &State<MongoRepo<Account>>) -> Result<Json<Vec<Account>>, Status> {
  let res = account_repo.get_all().await;
  match res {
    Ok(accounts) => Ok(Json(accounts)),
    Err(e) => {
      error!("Error getting accounts: {}", e);
      Err(Status::InternalServerError)
    },
  }
}

#[get("/<id>")]
pub async fn get_account(id: &str, account_repo: &State<MongoRepo<Account>>) -> Result<Json<Account>, Status> {
  let res = account_repo.get_by_id(id).await;
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

