use std::error::Error;

use bson::DateTime;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::service::db::{ self, MongoRepo};
use super::schema::{Project, ProjectDto};
use rocket::futures::TryStreamExt;

pub fn get_projects_repo(client: Client) -> MongoRepo<Project> {
  return db::get_mongo_repo(client, "test_boss", "projects");
}

impl MongoRepo<Project> {
  pub async fn get_all(&self) -> Result<Vec<Project>, Box<dyn Error + Send + Sync>> {
    let cursor = self.col.find(None, None).await?;
    let projects: Vec<Project> = cursor.try_collect().await?;
    Ok(projects)
  }

  pub async fn get_by_id(&self, id: &str) -> Result<Option<Project>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  pub async fn create(&self, data: ProjectDto) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
    let now = DateTime::from_chrono(chrono::Utc::now());
    let new_doc = Project {
      id: ObjectId::new(),
      name: data.name,
      version: data.version,
      description: data.description,
      repository: data.repository,
      created_at: now,
      updated_at: now,
    };
    let result = self.col.insert_one(new_doc, None).await?;
    Ok(result)
  }

  pub async fn update(&self, id: String, data: ProjectDto) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let now = chrono::Utc::now();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "name": data.name,
      "version": data.version,
      "description": data.description,
      "repository": data.repository,
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
