use mongodb::{error::Error, options::{ClientOptions, ServerApi, ServerApiVersion}, Client, Collection, Database};

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

pub fn get_mongo_repo<T>(client: Client, dbname: &str, collname: &str) -> MongoRepo<T> {
  let db = client.database(dbname);
  let col = db.collection(collname);
  MongoRepo { db, col }
}
