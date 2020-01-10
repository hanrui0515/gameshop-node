import Optional from "./Common/Utils/Optional";

declare module 'koa' {
    interface Request {
        user: Optional<App.Business.User.Value.User>;
    }
}


