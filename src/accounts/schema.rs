use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use rocket::serde::{Deserialize, Serialize};

use crate::service::db::{serialize_datetime, serialize_object_id};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Account {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  pub name: String,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AccountDto {
  pub name: String,
}
