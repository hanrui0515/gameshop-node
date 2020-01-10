import 'koa';

declare module 'koa' {
    interface Request {
        user: Optional<Application.Business.User.Value.User>;
    }
}


