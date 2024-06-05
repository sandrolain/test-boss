use std::error::Error;

use bson::DateTime;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, options::{FindOneOptions, FindOptions}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::service::db::{ self, MongoRepo};
use super::schema::{Testcheck, TestcheckDto};
use rocket::futures::TryStreamExt;

pub fn get_testchecks_repo(client: Client) -> MongoRepo<Testcheck> {
  return db::get_mongo_repo(client, "test_boss", "testchecks");
}

impl MongoRepo<Testcheck> {
  pub async fn get_all(&self) -> Result<Vec<Testcheck>, Box<dyn Error + Send + Sync>> {
    let cursor = self.col.find(None, None).await?;
    let testchecks: Vec<Testcheck> = cursor.try_collect().await?;
    Ok(testchecks)
  }

  pub async fn get_testlist_testchecks(&self, testlist_id: &str) -> Result<Vec<Testcheck>, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "testlist_id": ObjectId::parse_str(testlist_id)? };
    let options = FindOptions::builder().sort(doc! { "position": 1 }).build();
    let cursor = self.col.find(filter, options).await?;
    let testchecks: Vec<Testcheck> = cursor.try_collect().await?;
    Ok(testchecks)
  }

  pub async fn get_testcheck_by_id(&self, id: &str) -> Result<Option<Testcheck>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  async fn get_next_position(&self, testlist_id: &str) -> Result<u16, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "testlist_id": ObjectId::parse_str(testlist_id)? };
    let options = FindOneOptions::builder()
      .sort(doc! { "position": -1 })
      .build();
    let result = self.col.find_one(filter, options).await?;
    if let Some(testcheck) = result {
      return Ok(testcheck.position + 1);
    }
    Ok(0)
  }

  pub async fn create_testcheck(&self, account_id: &str, project_id: &str, testlist_id: &str, data: TestcheckDto) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
    let position = self.get_next_position(testlist_id).await?;
    let now = DateTime::from_chrono(chrono::Utc::now());
    let new_doc = Testcheck {
      id: ObjectId::new(),
      account_id: ObjectId::parse_str(account_id)?,
      project_id: ObjectId::parse_str(project_id)?,
      testlist_id: ObjectId::parse_str(testlist_id)?,
      name: data.name,
      description: data.description,
      expected: data.expected,
      tags: data.tags,
      position,
      created_at: now,
      updated_at: now,
    };
    let result = self.col.insert_one(new_doc, None).await?;
    Ok(result)
  }

  pub async fn update_testcheck(&self, id: String, data: TestcheckDto) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let now = chrono::Utc::now();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "name": data.name,
      "description": data.description,
      "expected": data.expected,
      "tags": data.tags,
      "updated_at": DateTime::from_chrono(now)
    } };
    let result = self.col.update_one(filter, upd_doc, None).await?;
    Ok(result)
  }

  pub async fn delete_testcheck(&self, id: String) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let result = self.col.delete_one(filter, None).await?;
    Ok(result)
  }

  pub async fn delete_testlist_testchecks(&self, testlist_id: &str) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "testlist_id": ObjectId::parse_str(testlist_id)? };
    let result = self.col.delete_many(filter, None).await?;
    Ok(result)
  }

  pub async fn update_testlist_testchecks_positions(&self, testlist_id: &str, testchecks_ids: Vec<String>) -> Result<i32, Box<dyn Error + Send + Sync>> {
    let mut position = 0;
    let mut updates = 0;
    for id in testchecks_ids {
      let filter = doc! { "_id": ObjectId::parse_str(&id)?, "testlist_id": ObjectId::parse_str(testlist_id)? };
      let upd_doc = doc! { "$set": {
        "position": position
      } };
      let result = self.col.update_one(filter, upd_doc, None).await?;
      if result.modified_count > 0 {
        updates += 1;
      }
      position += 1;
    }
    Ok(updates)
  }
}
