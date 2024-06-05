use rocket::State;
use crate::{service::{db::MongoRepo, http_errors::JsonError}, sessions::{jwt::{get_jwt_session_and_user, JWT}, schema::{JWTSessionAndUser, Session}}, users::{roles::is_admin, schema::User}};

pub async fn authorize_as_admin(jwt: Result<JWT, JsonError>, sessions_repo: &State<MongoRepo<Session>>, users_repo: &State<MongoRepo<User>>) -> Result<JWTSessionAndUser, JsonError> {
  let jwts = get_jwt_session_and_user(sessions_repo, users_repo, jwt).await?;
  if !is_admin(&jwts.user) {
    return Err(JsonError::Forbidden("You are not allowed to perform this action".to_string()));
  }
  Ok(jwts)
}
