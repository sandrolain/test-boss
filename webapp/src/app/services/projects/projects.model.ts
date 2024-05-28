export interface ProjectDto {
  _id: string;
  name: string;
  version: string;
  description: string;
  repository: string;
  created_at: string;
  updated_at: string;
}

export type ProjectEditDto = Omit<
  ProjectDto,
  '_id' | 'created_at' | 'updated_at'
>;
