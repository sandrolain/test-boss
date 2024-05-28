use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use rocket::serde::{Deserialize, Serialize};

use crate::service::db::{serialize_datetime, serialize_object_id};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestReport {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub testlist_id: ObjectId,
  pub name: String,
  pub description: String,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestReportDto {
  pub name: String,
  pub description: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestResult {
  #[serde(rename = "_id", serialize_with = "serialize_object_id")]
  pub id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub testreport_id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub testlist_id: ObjectId,
  #[serde(serialize_with = "serialize_object_id")]
  pub testcheck_id: ObjectId,
  pub name: String,
  pub description: String,
  pub expected: String,
  pub tags: Vec<String>,
  pub pass: bool,
  pub flacky: bool,
  pub automated: bool,
  pub notes: String,
  pub url_issue: String,
  pub url_result: String,
  #[serde(serialize_with = "serialize_datetime")]
  pub created_at: DateTime,
  #[serde(serialize_with = "serialize_datetime")]
  pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestResultDto {
  pub pass: bool,
  pub flacky: bool,
  pub automated: bool,
  pub notes: String,
  pub url_issue: String,
  pub url_result: String,
}
