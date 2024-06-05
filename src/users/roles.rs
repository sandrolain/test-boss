use rocket::serde::{Deserialize, Serialize};

use super::schema::User;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum Role {
  Admin,
  AccountManager,
}

impl Role {
  fn to_string(&self) -> String {
      match self {
        Role::Admin => "admin".to_string(),
        Role::AccountManager => "account_manager".to_string(),
      }
  }
}

pub fn is_admin(user: &User) -> bool {
  if let Some(roles) = user.roles.as_ref() {
    roles.contains(&Role::Admin.to_string())
  } else {
    false
  }
}


