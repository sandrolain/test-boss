use std::error::Error;
use std::env;
extern crate dotenv;
use dotenv::dotenv;

pub struct Config {
  pub mongodb_uri: String,
  pub jwt_secret: String,
  pub jwt_duration: i64,
  pub session_duration: i64,
  pub allowed_origins: String
}

pub fn get_config() -> Result<Config, Box<dyn Error>> {
  dotenv().ok();
  let config = Config {
    mongodb_uri: env::var("MONGODB_URI").expect("MONGODB_URI must be set."),
    jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set."),
    jwt_duration: env::var("JWT_DURATION").expect("JWT_DURATION must be set.").parse::<i64>().expect("JWT_DURATION must be an integer."),
    session_duration: env::var("SESSION_DURATION").expect("SESSION_DURATION must be set.").parse::<i64>().expect("SESSION_DURATION must be an integer."),
    allowed_origins: env::var("ALLOWED_ORIGINS").expect("ALLOWED_ORIGINS must be set.")
  };
  Ok(config)
}
