use std::error::Error;

use mongodb::{
  bson::{doc, oid::ObjectId}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::service::db::{ self, MongoRepo};
use super::schema::Account;
use rocket::futures::TryStreamExt;

pub fn get_accounts_repo(client: Client) -> MongoRepo<Account> {
  return db::get_mongo_repo(client, "test_boss", "accounts");
}

impl MongoRepo<Account> {
  pub async fn get_all(&self) -> Result<Vec<Account>, Box<dyn Error>> {
    let cursor = self.col.find(None, None).await?;
    let accounts: Vec<Account> = cursor.try_collect().await?;
    Ok(accounts)
  }

  pub async fn get_by_id(&self, id: &str) -> Result<Option<Account>, Box<dyn Error>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let user = self.col.find_one(filter, None).await?;
    Ok(user)
  }

  pub async fn create(&self, account: Account) -> Result<InsertOneResult, Box<dyn Error>> {
    let new_doc = Account {
      id: ObjectId::new(),
      name: account.name,
      created_at: account.created_at,
      updated_at: account.updated_at,
    };
    let user = self.col.insert_one(new_doc, None).await?;
    Ok(user)
  }

  pub async fn update(&self, account: Account) -> Result<UpdateResult, Box<dyn Error>> {
    let filter = doc! { "_id": account.id };
    let upd_doc = doc! { "$set": {
      "name": account.name,
      "created_at": account.created_at,
      "updated_at": account.updated_at
    } };
    let user = self.col.update_one(filter, upd_doc, None).await?;
    Ok(user)
  }

  pub async fn delete(&self, id: String) -> Result<DeleteResult, Box<dyn Error>> {
    let filter = doc! { "_id": id };
    let user = self.col.delete_one(filter, None).await?;
    Ok(user)
  }
}
