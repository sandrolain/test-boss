use rocket::serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Project {
  pub id: String,
  pub name: String,
  pub version: String,
  pub description: String,
  pub repository: String,
  pub created_at: String,
  pub updated_at: String,
}
