use bson::{oid::ObjectId, DateTime};
use rocket::serde::{Deserialize, Serialize};

use crate::service::db::{serialize_datetime, serialize_object_id};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  pub email: String,
  pub pwdhash: String,
  pub firstname: String,
  pub lastname: String,
  pub roles: Option<Vec<String>>,
  pub accounts: Option<Vec<UserAccount>>,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserRes {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  pub email: String,
  pub firstname: String,
  pub lastname: String,
  pub roles: Vec<String>,
  pub accounts: Vec<UserAccount>,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserDto {
  pub email: String,
  pub password: String,
  pub firstname: String,
  pub lastname: String,
  pub roles: Vec<String>,
  pub accounts: Vec<UserAccount>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserDetailsDto {
  pub firstname: String,
  pub lastname: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserPasswordDto {
  pub password: String,
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserAccount {
  #[serde(serialize_with = "serialize_object_id")]
  pub account_id: ObjectId,
  pub is_manager: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UsersList {
  pub list: Vec<User>,
  pub total: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UsersResList {
  pub list: Vec<UserRes>,
  pub total: u64,
}
