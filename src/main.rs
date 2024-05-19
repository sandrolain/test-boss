mod service;
mod accounts;
mod projects;
mod users;
mod sessions;

use accounts::{endpoints::get_accounts_routes, service::get_accounts_repo};
use projects::endpoints::get_projects_routes;
use projects::service::get_projects_repo;
use rocket::http::Method;
use rocket::{catch, catchers, launch, Request};
use rocket_cors::{AllowedHeaders, AllowedOrigins};
use service::config::get_config;
use service::db::connect;
use service::http_errors::JsonError;
use sessions::endpoints::get_sessions_routes;
use sessions::service::get_sessions_repo;
use users::endpoints::get_users_routes;
use users::service::get_users_repo;


#[launch]
async fn rocket() -> _ {
  let cfg = get_config().unwrap();

  let client = connect(&cfg.mongodb_uri).await.unwrap();

  let account_repo = get_accounts_repo(client.clone());
  let project_repo = get_projects_repo(client.clone());
  let sessions_repo = get_sessions_repo(client.clone());
  let users_repo = get_users_repo(client.clone());

  let _ = users_repo.unique_index("email").await;

  let allowed_origins = AllowedOrigins::some_exact(&[&cfg.allowed_origins]);

    // You can also deserialize this
  let cors = rocket_cors::CorsOptions {
      allowed_origins,
      allowed_methods: vec![Method::Get, Method::Post, Method::Delete, Method::Put, Method::Options].into_iter().map(From::from).collect(),
      allowed_headers: AllowedHeaders::all(),
      allow_credentials: true,
      ..Default::default()
  }
  .to_cors().unwrap();

  rocket::build()
    .mount("/api/v1/accounts", get_accounts_routes())
    .mount("/api/v1/projects", get_projects_routes())
    .mount("/api/v1/sessions", get_sessions_routes())
    .mount("/api/v1/users", get_users_routes())
    .attach(cors)
    .manage(cfg)
    .manage(account_repo)
    .manage(project_repo)
    .manage(sessions_repo)
    .manage(users_repo)
    .register("/", catchers![
      catch_bad_request,
      catch_unauthorized,
      catch_forbidden,
      catch_unprocessble_entity,
      catch_not_found,
      catch_internal_error
    ])
}

#[catch(400)]
fn catch_bad_request(req: &Request) -> JsonError {
  JsonError::BadRequest(format!("Bad request: {}", req.uri()))
}

#[catch(401)]
fn catch_unauthorized(req: &Request) -> JsonError {
  JsonError::BadRequest(format!("Unauthorized: {}", req.uri()))
}

#[catch(403)]
fn catch_forbidden(req: &Request) -> JsonError {
  JsonError::BadRequest(format!("Forbidden: {}", req.uri()))
}

#[catch(422)]
fn catch_unprocessble_entity(req: &Request) -> JsonError {
  JsonError::BadRequest(format!("Bad request: {}", req.uri()))
}

#[catch(404)]
fn catch_not_found(req: &Request) -> JsonError {
  JsonError::NotFound(format!("Resource {} not found", req.uri()))
}

#[catch(500)]
fn catch_internal_error(req: &Request) -> JsonError {
  JsonError::Internal(format!("Internal error: {}", req.uri()))
}
