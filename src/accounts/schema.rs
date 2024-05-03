use mongodb::bson::{oid::ObjectId, serde_helpers::serialize_object_id_as_hex_string};
use rocket::serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Account {
  #[serde(rename = "_id", serialize_with = "serialize_object_id_as_hex_string")]
  pub id: ObjectId,
  pub name: String,
  pub created_at: String,
  pub updated_at: String,
}
