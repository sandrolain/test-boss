export interface TestreportDto {
  _id: string;
  account_id: string;
  project_id: string;
  testlist_id: string;
  name: string;
  description: string;
  execution: string;
  created_at: string;
  updated_at: string;
}

export type TestreportEditDto = Omit<
  TestreportDto,
  | '_id'
  | 'account_id'
  | 'project_id'
  | 'testlist_id'
  | 'created_at'
  | 'updated_at'
>;
