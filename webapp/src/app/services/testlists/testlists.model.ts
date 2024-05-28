export interface TestlistDto {
  _id: string;
  account_id: string;
  project_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type TestlistEditDto = Omit<
  TestlistDto,
  '_id' | 'account_id' | 'project_id' | 'created_at' | 'updated_at'
>;

export interface TestCheckDto {
  _id: string;
  testlist_id: string;
  name: string;
  description: string;
  expected: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type TestCheckEditDto = Omit<
  TestCheckDto,
  '_id' | 'testlist_id' | 'created_at' | 'updated_at'
>;
