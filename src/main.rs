mod service;
mod accounts;
mod projects;

use accounts::{endpoints::get_accounts_routes, service::get_accounts_repo};
use projects::endpoints::get_projects_routes;
use projects::service::get_projects_repo;
use rocket::launch;
use service::config::get_config;
use service::db::connect;


#[launch]
async fn rocket() -> _ {
  let cfg = get_config().unwrap();

  let conn = connect(&cfg.mongodb_uri).await;
  let client = conn.unwrap();
  let account_repo = get_accounts_repo(client.clone());
  let project_repo = get_projects_repo(client.clone());

  rocket::build()
    .mount("/api/v1/accounts", get_accounts_routes())
    .mount("/api/v1/projects", get_projects_routes())
    .manage(cfg)
    .manage(account_repo)
    .manage(project_repo)
}
