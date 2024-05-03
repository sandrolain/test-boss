use std::error::Error;
use std::env;
extern crate dotenv;
use dotenv::dotenv;

pub struct Config {
  pub mongodb_uri: String
}

pub fn get_config() -> Result<Config, Box<dyn Error>> {
  dotenv().ok();
  let mongo_uri = match env::var("MONGODB_URI") {
    Ok(v) => v.to_string(),
    Err(_) => format!("Error loading env variable"),
  };
  let config = Config {
    mongodb_uri: mongo_uri
  };
  Ok(config)
}
