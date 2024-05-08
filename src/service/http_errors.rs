use log::{error, warn};
use serde::{Serialize};
use std::io::Cursor;
use rocket::http::Status;
use rocket::request::Request;
use rocket::response::{self, Response, Responder};
use rocket::http::ContentType;

#[derive(Serialize)]
pub struct ErrorResponse {
    pub message: String,
}

#[derive( Debug, Clone)]
pub enum JsonError {
    Internal(String),
    NotFound(String),
    BadRequest(String),
}

impl JsonError {
    fn get_http_status(&self) -> Status {
        match self {
            JsonError::Internal(_) => Status::InternalServerError,
            JsonError::NotFound(_) => Status::NotFound,
            _ => Status::BadRequest,
        }
    }
}

impl std::fmt::Display for JsonError {
    fn fmt(&self, fmt: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        write!(fmt, "Error {}.", self.get_http_status())
    }
}

impl<'r> Responder<'r, 'static> for JsonError {
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'static> {
        // serialize struct into json string
        let err_response = serde_json::to_string(&ErrorResponse{
            message: self.to_string()
        }).unwrap();

        match self.clone() {
            JsonError::NotFound(message) => {
              warn!("Not Found: {}", message);
            },
            JsonError::BadRequest(message) => {
              warn!("Bad Request: {}", message);
            },
            JsonError::Internal(message) => {
              error!("Internal: {}", message);
            }
        }

        Response::build()
            .status(self.get_http_status())
            .header(ContentType::JSON)
            .sized_body(err_response.len(), Cursor::new(err_response))
            .ok()
    }
}
