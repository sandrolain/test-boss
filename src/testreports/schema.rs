use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use rocket::serde::{Deserialize, Serialize};

use crate::service::db::{serialize_datetime, serialize_object_id};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Testreport {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub account_id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub project_id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub testlist_id: ObjectId,
  pub name: String,
  pub description: String,
  pub execution: String,
  pub executors: Option<Vec<TestExecutor>>,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestreportDto {
  pub name: String,
  pub description: String,
  pub execution: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestExecutor {
  #[serde(serialize_with = "serialize_object_id")]
  pub user_id: ObjectId,
  #[serde(serialize_with = "serialize_datetime")]
  pub start_date: DateTime,
}
