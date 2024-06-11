use std::error::Error;

use bson::DateTime;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::{service::db::{ self, MongoRepo}, testlists::schema::Testlist};
use super::schema::{Testreport, TestreportDto};
use rocket::futures::TryStreamExt;

pub fn get_testreports_repo(client: Client) -> MongoRepo<Testreport> {
  return db::get_mongo_repo(client, "test_boss", "testreports");
}

impl MongoRepo<Testreport> {
  pub async fn get_all(&self) -> Result<Vec<Testreport>, Box<dyn Error + Send + Sync>> {
    let cursor = self.col.find(None, None).await?;
    let testreports: Vec<Testreport> = cursor.try_collect().await?;
    Ok(testreports)
  }

  pub async fn get_project_testreports(&self, project_id: &str) -> Result<Vec<Testreport>, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "project_id": ObjectId::parse_str(project_id)? };
    let cursor = self.col.find(filter, None).await?;
    let testreports: Vec<Testreport> = cursor.try_collect().await?;
    Ok(testreports)
  }

  pub async fn get_testreport_by_id(&self, id: &str) -> Result<Option<Testreport>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  pub async fn create_testreport(&self, account_id: &str, project_id: &str, testlist: Testlist, data: TestreportDto) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
    let now = DateTime::from_chrono(chrono::Utc::now());
    let new_doc = Testreport {
      id: ObjectId::new(),
      account_id: ObjectId::parse_str(account_id)?,
      project_id: ObjectId::parse_str(project_id)?,
      testlist_id: testlist.id,
      name: testlist.name,
      description: testlist.description,
      execution: data.execution,
      executors: None,
      created_at: now,
      updated_at: now,
    };
    let result = self.col.insert_one(new_doc, None).await?;
    Ok(result)
  }

  pub async fn update_testreport(&self, id: String, data: TestreportDto) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
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

  pub async fn delete_testreport(&self, id: String) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let result = self.col.delete_one(filter, None).await?;
    Ok(result)
  }

}
