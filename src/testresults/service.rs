use std::error::Error;

use bson::DateTime;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::{service::db::{ self, MongoRepo}, testchecks::schema::Testcheck};
use super::schema::{Testresult, TestresultDto};
use rocket::futures::TryStreamExt;

pub fn get_testresults_repo(client: Client) -> MongoRepo<Testresult> {
  return db::get_mongo_repo(client, "test_boss", "testresults");
}

impl MongoRepo<Testresult> {
  pub async fn get_all(&self) -> Result<Vec<Testresult>, Box<dyn Error + Send + Sync>> {
    let cursor = self.col.find(None, None).await?;
    let testresults: Vec<Testresult> = cursor.try_collect().await?;
    Ok(testresults)
  }

  pub async fn get_testreport_testresults(&self, testreport_id: &str) -> Result<Vec<Testresult>, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "testreport_id": ObjectId::parse_str(testreport_id)? };
    let cursor = self.col.find(filter, None).await?;
    let testresults: Vec<Testresult> = cursor.try_collect().await?;
    Ok(testresults)
  }

  pub async fn get_testresult_by_id(&self, id: &str) -> Result<Option<Testresult>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  pub async fn create_testresult(&self, testreport_id: &str, testcheck: Testcheck) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
    let now = DateTime::from_chrono(chrono::Utc::now());
    let new_doc = Testresult{
      id: ObjectId::new(),
      account_id: testcheck.account_id,
      testreport_id: ObjectId::parse_str(testreport_id)?,
      testcheck_id: testcheck.id,
      name: testcheck.name,
      description: testcheck.description,
      expected: testcheck.expected,
      tags: testcheck.tags,
      updated: false,
      executors: vec![],
      pass: false,
      flacky: false,
      automated: false,
      notes: "".to_string(),
      url_issue: "".to_string(),
      url_result: "".to_string(),
      created_at: now,
      updated_at: now,
    };
    let result = self.col.insert_one(new_doc, None).await?;
    Ok(result)
  }

  pub async fn update_testresult(&self, id: String, data: TestresultDto) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let now = chrono::Utc::now();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "updated": true,
      "pass": data.pass,
      "flacky": data.flacky,
      "automated": data.automated,
      "notes": data.notes,
      "url_issue": data.url_issue,
      "url_result": data.url_result,
      "updated_at": DateTime::from_chrono(now)
    } };
    let result = self.col.update_one(filter, upd_doc, None).await?;
    Ok(result)
  }

  pub async fn delete_testresult(&self, id: &str) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": ObjectId::parse_str(id)? };
    let result = self.col.delete_one(filter, None).await?;
    Ok(result)
  }

  pub async fn delete_testreport_testresults(&self, testresult_id: &str) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "testresult_id": ObjectId::parse_str(testresult_id)? };
    let result = self.col.delete_many(filter, None).await?;
    Ok(result)
  }

}
