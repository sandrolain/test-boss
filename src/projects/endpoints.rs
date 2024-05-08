use log::{error, warn};
use rocket::{delete, get, http::Status, post, put, routes, serde::json::Json, State};
use crate::{projects::schema::ProjectDto, service::{db::MongoRepo, http_errors::JsonError}};

use super::schema::Project;

#[get("/")]
pub async fn get_projects(project_repo: &State<MongoRepo<Project>>) -> Result<Json<Vec<Project>>, JsonError> {
  let res = project_repo.get_all().await;
  match res {
    Ok(projects) => Ok(Json(projects)),
    Err(e) => {
      error!("Error getting projects: {}", e);
      Err(JsonError::Internal("Error getting project".to_string()))
    },
  }
}

#[get("/<id>")]
pub async fn get_project(id: &str, project_repo: &State<MongoRepo<Project>>) -> Result<Json<Project>, JsonError> {
  let res = project_repo.get_by_id(id).await;
  match res {
    Ok(project) => match project {
      Some(project) => Ok(Json(project)),
      None => {
        warn!("Project not found: {}", id);
        Err(JsonError::NotFound("Project not found".to_string()))
      },
    },
    Err(e) => {
      error!("Error getting project: {}", e);
      Err(JsonError::Internal("Error getting project".to_string()))
    },
  }
}

#[post("/", format = "json", data = "<project>")]
pub async fn create_project(project: Json<ProjectDto>, project_repo: &State<MongoRepo<Project>>) -> Result<Json<Project>, JsonError> {
  let data = project.into_inner();
  let res = project_repo.create(data).await;
  match res {
    Ok(inserted) => {
      let id = inserted.inserted_id.as_object_id().unwrap().to_hex();
      let project = project_repo.get_by_id(id.as_str()).await;
      match project {
        Ok(project) => match project {
          Some(project) => Ok(Json(project)),
          None => {
            warn!("Project not found: {}", id);
            Err(JsonError::NotFound("Project not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting project: {}", e);
          Err(JsonError::Internal("Error getting project".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error creating project: {}", e);
      Err(JsonError::Internal("Error creating project".to_string()))
    },
  }
}

#[put("/<id>", format = "json", data = "<project>")]
pub async fn update_project(id: &str, project: Json<ProjectDto>, project_repo: &State<MongoRepo<Project>>) -> Result<Json<Project>, JsonError> {
  let data = project.into_inner();
  let res = project_repo.update(id.to_string(), data).await;
  match res {
    Ok(updated) => {
      if updated.modified_count == 0 {
        warn!("Project not found: {}", id);
        return Err(JsonError::NotFound("Project not found".to_string()));
      }
      let project = project_repo.get_by_id(id).await;
      match project {
        Ok(project) => match project {
          Some(project) => Ok(Json(project)),
          None => {
            warn!("Project not found: {}", id);
            Err(JsonError::NotFound("Project not found".to_string()))
          },
        },
        Err(e) => {
          error!("Error getting project: {}", e);
          Err(JsonError::Internal("Error getting project".to_string()))
        },
      }
    },
    Err(e) => {
      error!("Error updating project: {}", e);
      Err(JsonError::Internal("Error updating project".to_string()))
    },
  }
}

#[delete("/<id>")]
pub async fn delete_project(id: &str, project_repo: &State<MongoRepo<Project>>) -> Result<Json<Project>, JsonError> {
  let project_res = project_repo.get_by_id(id).await;
  let project: Project;
  match project_res {
    Ok(project_opt) => match project_opt {
      Some(project_data) => project = project_data,
      None => {
        warn!("Project not found: {}", id);
        return Err(JsonError::NotFound("Project not found".to_string()));
      }
    }
    Err(e) => {
      error!("Error getting project: {}", e);
      return Err(JsonError::Internal("Error getting project".to_string()));
    }
  }
  let res = project_repo.delete(id.to_string()).await;
  match res {
    Ok(deleted) => {
      if deleted.deleted_count == 0 {
        warn!("Project not found: {}", id);
        return Err(JsonError::NotFound("Project not found".to_string()));
      }
      Ok(Json(project))
    },
    Err(e) => {
      error!("Error deleting project: {}", e);
      Err(JsonError::Internal("Error deleting project".to_string()))
    },
  }
}

pub fn get_projects_routes() -> Vec<rocket::Route> {
  routes![get_projects, get_project, create_project, update_project, delete_project]
}
