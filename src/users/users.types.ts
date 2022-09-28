import { IsNotEmpty, IsString } from "class-validator";
import { User } from "./users.schema";

export interface UsersPaginated {
    users: User[];
    total: number;
}