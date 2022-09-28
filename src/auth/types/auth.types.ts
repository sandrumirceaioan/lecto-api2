import { IsNotEmpty, IsString } from "class-validator";
import { User } from "../../users/users.schema";
import { Tokens } from "./token.types";

export class RegisterRequest {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    role: 'admin' | 'user';
}

export class RegisterResponse {
    tokens: Tokens
}

export class LoginRequest {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    remember?: boolean;
}

export class LoginResponse {
    user: User;
    tokens: Tokens;
}

export class RefreshRequest {
    @IsNotEmpty()
    @IsString()
    refreshToken: string
}