use bson::{oid::ObjectId, DateTime};
use rocket::serde::{Deserialize, Serialize};

use crate::{service::db::{serialize_datetime, serialize_object_id}, users::schema::{User, UserRes}};

pub struct JWTSession {
  pub token: String,
  pub session: Session,
}

pub struct JWTSessionAndUser {
  pub token: String,
  pub session: Session,
  pub user: User,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Session {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  pub user_id: ObjectId,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub expires_at: DateTime,
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LoginDto {
  pub email: String,
  pub password: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LoginResponseDto {
  pub token: String,
  pub user: UserRes,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChangePasswordDto {
  pub old_password: String,
  pub new_password: String,
}
