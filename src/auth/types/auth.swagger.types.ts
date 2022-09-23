import { User } from "../../users/users.schema";
import { LoginRequest, LoginResponse, RefreshRequest, RegisterRequest, RegisterResponse } from "./auth.types";

export const authSwagger = {
    login: {
        req: {
            type: LoginRequest,
        },
        res: {
            status: 200,
            type: LoginResponse,
        }
    },
    register: {
        req: {
            type: RegisterRequest,
        },
        res: {
            type: RegisterResponse
        }
    },
    refresh: {
        req: {
            type: RefreshRequest,
        },
        res: {
            type: LoginResponse
        }
    },
    verify: {
        res: {
            type: User
        }
    }
}