use std::error::Error;

use bson::DateTime;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::service::db::{ self, MongoRepo};
use super::schema::{Account, AccountDto};
use rocket::futures::TryStreamExt;

pub fn get_accounts_repo(client: Client) -> MongoRepo<Account> {
  return db::get_mongo_repo(client, "test_boss", "accounts");
}

impl MongoRepo<Account> {
  pub async fn get_all(&self) -> Result<Vec<Account>, Box<dyn Error + Send + Sync>> {
    let cursor = self.col.find(None, None).await?;
    let accounts: Vec<Account> = cursor.try_collect().await?;
    Ok(accounts)
  }

  pub async fn get_by_id(&self, id: &str) -> Result<Option<Account>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  pub async fn create(&self, data: AccountDto) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
    let now = DateTime::from_chrono(chrono::Utc::now());
    let new_doc = Account {
      id: ObjectId::new(),
      name: data.name,
      created_at: now,
      updated_at: now,
    };
    let result = self.col.insert_one(new_doc, None).await?;
    Ok(result)
  }

  pub async fn update(&self, id: String, data: AccountDto) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let now = chrono::Utc::now();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "name": data.name,
      "updated_at": DateTime::from_chrono(now)
    } };
    let result = self.col.update_one(filter, upd_doc, None).await?;
    Ok(result)
  }

  pub async fn delete(&self, id: String) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": id };
    let result = self.col.delete_one(filter, None).await?;
    Ok(result)
  }
}
