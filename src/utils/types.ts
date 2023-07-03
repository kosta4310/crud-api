export type User = {
  username: string;
  id: string;
  age: number;
  hobbies: Array<string> | [];
};

export type ResponseServer = {
  statusCode: number;
  message: string | User | Array<User>;
};
