use std::error::Error;

use bson::DateTime;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::service::db::{ self, MongoRepo};
use super::schema::{Session};

pub fn get_sessions_repo(client: Client) -> MongoRepo<Session> {
  return db::get_mongo_repo(client, "test_boss", "sessions");
}

impl MongoRepo<Session> {
  pub async fn get_session_by_id(&self, id: &str) -> Result<Option<Session>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  fn get_session_expire(&self) -> DateTime {
    let env_session_expire = std::env::var("SESSION_DURATION").unwrap_or_else(|_| "1800".to_string());
    let session_expire: i64 = env_session_expire.parse().unwrap_or(1800);
    let expire_date = chrono::Utc::now() + chrono::Duration::seconds(session_expire);
    return DateTime::from_chrono(expire_date);
  }

  pub async fn create_session(&self, user_id: &str) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
    let created_at = DateTime::from_chrono(chrono::Utc::now());
    let expires_at = self.get_session_expire();
    let new_doc = Session {
      id: ObjectId::new(),
      user_id: ObjectId::parse_str(user_id)?,
      created_at,
      expires_at,
    };
    let result = self.col.insert_one(new_doc, None).await?;
    Ok(result)
  }

  pub async fn update_session(&self, id: String) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let expires_at = self.get_session_expire();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "expires_at": expires_at
    } };
    let result = self.col.update_one(filter, upd_doc, None).await?;
    Ok(result)
  }

  pub async fn delete_session(&self, id: String) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": id };
    let result = self.col.delete_one(filter, None).await?;
    Ok(result)
  }
}
