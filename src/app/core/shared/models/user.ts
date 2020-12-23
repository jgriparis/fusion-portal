import { Role } from './role';

export class User {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    internal: boolean;
    enabled: boolean;
    clients: any;
    token?: string;
  user: any;
}
