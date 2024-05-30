export interface TestcheckDto {
  _id: string;
  testlist_id: string;
  name: string;
  description: string;
  expected: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type TestcheckEditDto = Omit<
  TestcheckDto,
  '_id' | 'testlist_id' | 'created_at' | 'updated_at'
>;
