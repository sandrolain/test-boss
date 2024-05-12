use log::{error, warn};
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome};
use rocket::serde::{Deserialize, Serialize};
use jsonwebtoken::errors::{Error, ErrorKind};
use chrono::Utc;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rocket::{Request, State};
use std::env;

use crate::service::db::MongoRepo;
use crate::service::http_errors::JsonError;
use crate::users::schema::User;

use super::schema::{JWTSession, JWTSessionAndUser, Session};

#[derive(Debug, Deserialize, Serialize)]
pub struct Claims {
  pub session_id: String,
  exp: usize
}

#[derive(Debug)]
pub struct JWT {
  pub claims: Claims,
  pub token: String
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for JWT {
  type Error = JsonError;

  async fn from_request(req: &'r Request<'_>) -> Outcome<Self, JsonError> {
    match req.headers().get_one("authorization") {
      None => {
        let response = JsonError::Unauthorized("Error validating JWT token - No Token Provided".to_string());
        Outcome::Error((Status::Unauthorized, response))
      },
      Some(key) => {
        let token = key.trim_start_matches("Bearer").trim().to_string();
        match decode_jwt(token.clone()) {
          Ok(claims) => Outcome::Success(JWT {claims, token}),
          Err(err) => match err {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
              let response: JsonError = JsonError::Unauthorized("Error validating JWT token - Expired Token".to_string());
              Outcome::Error((Status::Unauthorized, response))
            },
            jsonwebtoken::errors::ErrorKind::InvalidToken => {
              let response = JsonError::Unauthorized("Error validating JWT token - Invalid Token".to_string());
              Outcome::Error((Status::Unauthorized, response))
            },
            _ => {
              let response = JsonError::Internal(format!("Error validating JWT token - {:?}", err));
              Outcome::Error((Status::Unauthorized, response))
            }
          }
        }
      },
    }
  }
}

pub fn get_jwt_secret() -> String {
  env::var("JWT_SECRET").expect("JWT_SECRET must be set.")
}

pub fn get_jwt_duration() -> i64 {
  env::var("JWT_DURATION").expect("JWT_DURATION must be set.").parse::<i64>().unwrap()
}

pub fn create_jwt(session_id: &str) -> Result<String, Error> {
  let secret = get_jwt_secret();
  let duration = get_jwt_duration();
  let delta = chrono::Duration::seconds(duration);
  let expiration = Utc::now().checked_add_signed(delta).expect("Invalid timestamp").timestamp();
  let claims = Claims {
    session_id: session_id.to_string(),
    exp: expiration as usize
  };
  let header = Header::new(Algorithm::HS512);
  encode(&header, &claims, &EncodingKey::from_secret(secret.as_bytes()))
}

pub fn decode_jwt(token: String) -> Result<Claims, ErrorKind> {
  let secret = get_jwt_secret();
  match decode::<Claims>(
    &token,
    &DecodingKey::from_secret(secret.as_bytes()),
    &Validation::new(Algorithm::HS512),
  ) {
    Ok(token) => Ok(token.claims),
    Err(err) => Err(err.kind().to_owned())
  }
}

pub async fn get_jwt_session(sessions_repos: &State<MongoRepo<Session>>, jwt: Result<JWT, JsonError>) -> Result<JWTSession, JsonError> {
  let jwt = jwt?;
  let session_id = jwt.claims.session_id;

  let session = sessions_repos.get_session_by_id(session_id.as_str()).await;
  if session.is_err() {
    error!("Error getting session: {}", session.is_err());
    return Err(JsonError::Unauthorized("Session not found".to_string()));
  }
  let session = session.unwrap();
  if session.is_none() {
    warn!("Session not found: {}", session_id);
    return Err(JsonError::Unauthorized("Session not found".to_string()));
  }
  Ok(JWTSession { token: jwt.token, session: session.unwrap() })
}

pub async fn get_jwt_session_and_user(sessions_repos: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>, jwt: Result<JWT, JsonError>) -> Result<JWTSessionAndUser, JsonError> {
  let jwt = jwt?;
  let session_id = jwt.claims.session_id;

  let session = sessions_repos.get_session_by_id(session_id.as_str()).await;
  if session.is_err() {
    error!("Error getting session: {}", session.is_err());
    return Err(JsonError::Unauthorized("Session not found".to_string()));
  }
  let session = session.unwrap();
  if session.is_none() {
    warn!("Session not found: {}", session_id);
    return Err(JsonError::Unauthorized("Session not found".to_string()));
  }
  let session = session.unwrap();

  let user = users_repo.get_user_by_id(session.user_id.to_hex().as_str()).await;
  if user.is_err() {
    error!("Error getting user: {}", user.is_err());
    return Err(JsonError::Internal("Error getting user".to_string()));
  }
  let user = user.unwrap();
  if user.is_none() {
    warn!("User not found: {}", session.user_id.to_hex());
    return Err(JsonError::NotFound("User not found".to_string()));
  }
  Ok(JWTSessionAndUser { token: jwt.token, session, user: user.unwrap() })
}
