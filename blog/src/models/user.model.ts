export interface User {
    id: number;
    username: string;
    password: string;
  }
  
export interface CreateUserDTO extends Omit<User, 'id'> {}