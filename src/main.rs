mod service;
mod accounts;

use accounts::service::get_accounts_repo;
use rocket::{launch, routes};
use service::config::get_config;
use service::db::connect;
use accounts::endpoints::{get_accounts, get_account};

#[launch]
async fn rocket() -> _ {
  let cfg = get_config().unwrap();

  let conn = connect(&cfg.mongodb_uri).await;
  let client = conn.unwrap();
  let account_repo = get_accounts_repo(client);

  rocket::build()
    .mount("/accounts", routes![get_accounts, get_account])
    .manage(cfg)
    .manage(account_repo)
}
