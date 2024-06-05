use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use rocket::serde::{Deserialize, Serialize};

use crate::service::db::{serialize_datetime, serialize_object_id};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Testcheck {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub testlist_id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub project_id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub account_id: ObjectId,
  pub name: String,
  pub description: String,
  pub expected: String,
  pub tags: Vec<String>,
  pub position: u16,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestcheckDto {
  pub name: String,
  pub description: String,
  pub expected: String,
  pub tags: Vec<String>,
}
