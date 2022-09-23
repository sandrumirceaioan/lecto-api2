import { User } from "../users.schema";

export const usersSwagger = {
    all: {
        res: {
            status: 200,
            isArray: true,
            type: User
        }
    },
}