mod service;
mod accounts;

use accounts::{endpoints::{delete_account, update_account}, service::get_accounts_repo};
use rocket::{launch, routes};
use service::config::get_config;
use service::db::connect;
use accounts::endpoints::{get_accounts, get_account, create_account};

#[launch]
async fn rocket() -> _ {
  let cfg = get_config().unwrap();

  let conn = connect(&cfg.mongodb_uri).await;
  let client = conn.unwrap();
  let account_repo = get_accounts_repo(client);

  rocket::build()
    .mount("/api/v1/accounts", routes![get_accounts, get_account, create_account, update_account, delete_account])
    .manage(cfg)
    .manage(account_repo)
}
