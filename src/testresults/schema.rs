use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use rocket::serde::{Deserialize, Serialize};

use crate::{service::db::{serialize_datetime, serialize_object_id}, testreports::schema::TestExecutor};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Testresult {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub account_id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub testreport_id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub testcheck_id: ObjectId,
  // Derived from testcheck
  pub name: String,
  pub description: String,
  pub expected: String,
  pub tags: Vec<String>,
  pub position: u16,
  // auto managed
  pub updated: bool,
  // result
  pub pass: bool,
  pub flacky: bool,
  pub automated: bool,
  pub notes: String,
  pub url_issue: String,
  pub url_result: String,
  pub executors: Vec<TestExecutor>,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestresultDto {
  pub pass: bool,
  pub flacky: bool,
  pub automated: bool,
  pub notes: String,
  pub url_issue: String,
  pub url_result: String,
}

