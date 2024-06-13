export interface TestresultDto {
  _id: string;
  testlist_id: string;
  project_id: string;
  account_id: string;
  name: string;
  description: string;
  expected: string;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

export type TestresultEditDto = Omit<
  TestresultDto,
  | '_id'
  | 'testlist_id'
  | 'project_id'
  | 'account_id'
  | 'position'
  | 'created_at'
  | 'updated_at'
>;
