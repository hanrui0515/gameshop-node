import UserEntity from "~/Business/User/Data/Entity/UserEntity";

declare module 'koa' {
    interface Request {
        user: Nullable<UserEntity>;
    }
}


