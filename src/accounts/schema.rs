use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use rocket::serde::{Deserialize, Serialize, Serializer};

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

pub fn serialize_datetime<S>(date: &DateTime, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
  if serializer.is_human_readable() {
    return serializer.serialize_some(date.to_chrono().to_rfc3339().as_str())
  }
  return serializer.serialize_some(date)
}


pub fn serialize_object_id<S>(object_id: &ObjectId, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
  if serializer.is_human_readable() {
    return serializer.serialize_some(object_id.to_string().as_str())
  }
  return serializer.serialize_some(object_id)
}


// pub fn serialize_option_object_id<S>(object_id: &Option<ObjectId>, serializer: S) -> Result<S::Ok, S::Error>
// where
//     S: Serializer,
// {
//     match object_id {
//       Some(ref object_id) => serializer.serialize_some(object_id.to_string().as_str()),
//       None => serializer.serialize_none()
//     }
// }
