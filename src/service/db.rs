use bson::{doc, oid::ObjectId, DateTime};
use mongodb::{error::Error, options::{ClientOptions, IndexOptions, ServerApi, ServerApiVersion}, results::CreateIndexResult, Client, Collection, Database, IndexModel};
use rocket::serde::Serializer;

pub async fn connect(uri: &str) -> Result<Client, Error> {
  let mut client_options = ClientOptions::parse_async(uri).await?;
  // Set the server_api field of the client_options object to Stable API version 1
  let server_api = ServerApi::builder().version(ServerApiVersion::V1).build();
  client_options.server_api = Some(server_api);

  // Create a new client and connect to the server
  let client = Client::with_options(client_options)?;

  Ok(client)
}


pub struct MongoRepo<T> {
  pub db: Database,
  pub col: Collection<T>,
}


impl<T> MongoRepo<T> {
  pub async fn unique_index(&self, prop: &str) -> Result<CreateIndexResult, Error> {
    let opts = IndexOptions::builder().unique(true).build();
    let index = IndexModel::builder().keys(doc! { prop: 1 }).options(opts).build();
    self.col.create_index(index, None).await
  }
}

pub fn get_mongo_repo<T>(client: Client, dbname: &str, collname: &str) -> MongoRepo<T> {
  let db = client.database(dbname);
  let col = db.collection(collname);
  MongoRepo { db, col }
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
