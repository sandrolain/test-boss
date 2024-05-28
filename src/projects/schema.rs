use bson::{oid::ObjectId, DateTime};
use rocket::serde::{Deserialize, Serialize};

use crate::service::db::{serialize_datetime, serialize_object_id};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Project {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  pub name: String,
  pub version: String,
  pub description: String,
  pub repository: String,
  #[serde(serialize_with = "serialize_object_id")]
  pub account_id: ObjectId,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectDto {
  pub name: String,
  pub version: String,
  pub description: String,
  pub repository: String,
}
