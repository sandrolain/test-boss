use std::error::Error;

use bson::DateTime;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::service::db::{ self, MongoRepo};
use super::schema::{Testlist, TestlistDto};
use rocket::futures::TryStreamExt;

pub fn get_testlists_repo(client: Client) -> MongoRepo<Testlist> {
  return db::get_mongo_repo(client, "test_boss", "testlists");
}

impl MongoRepo<Testlist> {
  pub async fn get_all(&self) -> Result<Vec<Testlist>, Box<dyn Error + Send + Sync>> {
    let cursor = self.col.find(None, None).await?;
    let testlists: Vec<Testlist> = cursor.try_collect().await?;
    Ok(testlists)
  }

  pub async fn get_project_testlists(&self, project_id: &str) -> Result<Vec<Testlist>, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "project_id": ObjectId::parse_str(project_id)? };
    let cursor = self.col.find(filter, None).await?;
    let testlists: Vec<Testlist> = cursor.try_collect().await?;
    Ok(testlists)
  }

  pub async fn get_testlist_by_id(&self, id: &str) -> Result<Option<Testlist>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  pub async fn create_testlist(&self, account_id: &str, project_id: &str, data: TestlistDto) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
    let now = DateTime::from_chrono(chrono::Utc::now());
    let new_doc = Testlist {
      id: ObjectId::new(),
      account_id: ObjectId::parse_str(account_id)?,
      project_id: ObjectId::parse_str(project_id)?,
      name: data.name,
      description: data.description,
      created_at: now,
      updated_at: now,
    };
    let result = self.col.insert_one(new_doc, None).await?;
    Ok(result)
  }

  pub async fn update_testlist(&self, id: String, data: TestlistDto) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let now = chrono::Utc::now();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "name": data.name,
      "description": data.description,
      "updated_at": DateTime::from_chrono(now)
    } };
    let result = self.col.update_one(filter, upd_doc, None).await?;
    Ok(result)
  }

  pub async fn delete_testlist(&self, id: String) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let result = self.col.delete_one(filter, None).await?;
    Ok(result)
  }
}
