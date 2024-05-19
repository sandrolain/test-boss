use std::error::Error;

use bson::DateTime;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, options::{Collation, FindOptions}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::service::db::{ self, MongoRepo};
use super::schema::{Account, AccountDto, AccountsList};
use rocket::futures::TryStreamExt;

pub fn get_accounts_repo(client: Client) -> MongoRepo<Account> {
  return db::get_mongo_repo(client, "test_boss", "accounts");
}

impl MongoRepo<Account> {
  pub async fn get_all_accounts(&self) -> Result<Vec<Account>, Box<dyn Error + Send + Sync>> {
    let cursor = self.col.find(None, None).await?;
    let accounts: Vec<Account> = cursor.try_collect().await?;
    Ok(accounts)
  }

  pub async fn get_accounts(&self, skip: usize, limit: usize, sort_by: &str, sort_dir: &str) -> Result<AccountsList, Box<dyn Error + Send + Sync>> {
    let filter = doc! {};

    let sort = match sort_dir {
      "asc" => Some(doc! { sort_by: 1 }),
      "desc" => Some(doc! { sort_by: -1 }),
      _ => None
    };

    let options = FindOptions::builder()
      .collation(Some(Collation::builder().locale("en").build()))
      .skip(skip as u64)
      .limit(limit as i64)
      .sort(sort)
      .build();
    let cursor = self.col.find(filter.clone(), options).await?;
    let list: Vec<Account> = cursor.try_collect().await?;
    let total = self.col.count_documents(filter, None).await?;

    Ok(AccountsList {
      list,
      total,
    })
  }

  pub async fn get_account_by_id(&self, id: &str) -> Result<Option<Account>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  pub async fn get_accounts_by_object_ids(&self, oids: Vec<ObjectId>) -> Result<Vec<Account>, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": { "$in": oids } };
    let cursor = self.col.find(filter, None).await?;
    let accounts: Vec<Account> = cursor.try_collect().await?;
    Ok(accounts)
  }

  pub async fn create_account(&self, data: AccountDto) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
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

  pub async fn update_account(&self, id: String, data: AccountDto) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let now = chrono::Utc::now();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "name": data.name,
      "updated_at": DateTime::from_chrono(now)
    } };
    let result = self.col.update_one(filter, upd_doc, None).await?;
    Ok(result)
  }

  pub async fn delete_account(&self, id: String) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": id };
    let result = self.col.delete_one(filter, None).await?;
    Ok(result)
  }
}
