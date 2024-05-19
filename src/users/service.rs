use std::error::Error;

use bcrypt::{hash, verify, DEFAULT_COST};
use bson::DateTime;
use log::warn;
use mongodb::{
  bson::{self, doc, oid::ObjectId}, options::FindOptions, results::{DeleteResult, InsertOneResult, UpdateResult}, Client
};
use crate::{service::db::{ self, MongoRepo}, sessions::schema::LoginDto};
use super::schema::{User, UserDetailsDto, UserDto, UsersList};
use rocket::futures::TryStreamExt;

pub fn get_users_repo(client: Client) -> MongoRepo<User> {
  return db::get_mongo_repo(client, "test_boss", "users");
}

impl MongoRepo<User> {
  pub async fn verify_login(&self, data: LoginDto) -> Result<Option<User>, Box<dyn Error + Send + Sync>> {
    let user = self.get_user_by_email(&data.email).await?;
    if user.is_none() {
      warn!("User not found: {}", data.email);
      return Ok(None);
    }
    let user = user.unwrap();
    if verify(data.password, user.pwdhash.as_str())? {
      return Ok(Some(user));
    }
    warn!("Invalid password for user: {}", data.email);
    Ok(None)
  }

  pub async fn get_all(&self) -> Result<Vec<User>, Box<dyn Error + Send + Sync>> {
    let cursor = self.col.find(None, None).await?;
    let users: Vec<User> = cursor.try_collect().await?;
    Ok(users)
  }

  pub async fn get_users(&self, skip: u64, limit: i64, sort_by: String, sort_dir: String) -> Result<UsersList, Box<dyn Error + Send + Sync>> {
    let filter = doc! {};

    let sort = match sort_dir.as_str() {
      "asc" => Some(doc! { sort_by: 1 }),
      "desc" => Some(doc! { sort_by: -1 }),
      _ => None
    };

    let options = FindOptions::builder()
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .build();
    let cursor = self.col.find(filter.clone(), options).await?;
    let list: Vec<User> = cursor.try_collect().await?;
    let total = self.col.count_documents(filter, None).await?;

    Ok(UsersList {
      list,
      total,
    })
  }

  pub async fn get_user_by_id(&self, id: &str) -> Result<Option<User>, Box<dyn Error + Send + Sync>> {
    let oid = ObjectId::parse_str(id)?;
    let filter = doc! { "_id": oid };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  pub async fn get_user_by_email(&self, email: &str) -> Result<Option<User>, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "email": email };
    let result = self.col.find_one(filter, None).await?;
    Ok(result)
  }

  pub async fn create_user(&self, data: UserDto) -> Result<InsertOneResult, Box<dyn Error + Send + Sync>> {
    let pwdhash = hash(data.password, DEFAULT_COST)?;
    let now = DateTime::from_chrono(chrono::Utc::now());
    let new_doc = User {
      id: ObjectId::new(),
      email: data.email,
      pwdhash: pwdhash,
      firstname: data.firstname,
      lastname: data.lastname,
      roles: Some(data.roles),
      accounts: Some(vec![]),
      created_at: now,
      updated_at: now,
    };
    let result = self.col.insert_one(new_doc, None).await?;
    Ok(result)
  }

  pub async fn update_user(&self, id: String, data: UserDetailsDto) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let now = chrono::Utc::now();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "firstname": data.firstname,
      "lastname": data.lastname,
      "updated_at": DateTime::from_chrono(now)
    } };
    let result = self.col.update_one(filter, upd_doc, None).await?;
    Ok(result)
  }


  pub async fn change_password(&self, id: String, password: String) -> Result<UpdateResult, Box<dyn Error + Send + Sync>> {
    let pwdhash = hash(password, DEFAULT_COST)?;
    let now = chrono::Utc::now();
    let filter = doc! { "_id": ObjectId::parse_str(&id)? };
    let upd_doc = doc! { "$set": {
      "pwdhash": pwdhash,
      "updated_at": DateTime::from_chrono(now)
    } };
    let result = self.col.update_one(filter, upd_doc, None).await?;
    Ok(result)
  }

  pub async fn delete_user(&self, id: String) -> Result<DeleteResult, Box<dyn Error + Send + Sync>> {
    let filter = doc! { "_id": id };
    let result = self.col.delete_one(filter, None).await?;
    Ok(result)
  }
}
