use log::{error, warn};
use rocket::{delete, get, http::Status, post, put, serde::json::Json, State};
use crate::{accounts::schema::AccountDto, service::db::MongoRepo};

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

#[post("/", format = "json", data = "<account>")]
pub async fn create_account(account: Json<AccountDto>, account_repo: &State<MongoRepo<Account>>) -> Result<Json<Account>, Status> {
  let data = account.into_inner();
  let res = account_repo.create(data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      let account = account_repo.get_by_id(id.as_str()).await;
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
  let res = account_repo.update(id.to_string(), data).await;
  match res {
    Ok(updated) => {
      if updated.modified_count == 0 {
        warn!("Account not found: {}", id);
        return Err(Status::NotFound);
      }
      let account = account_repo.get_by_id(id).await;
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
  let account_res = account_repo.get_by_id(id).await;
  let account: Account;
  match account_res {
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
  let res = account_repo.delete(id.to_string()).await;
  match res {
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
