import HTTP from 'http';
import Koa, {BaseContext, Next} from 'koa';
import Parser from 'koa-parser';
import Router from '@koa/router';
import SocketIO from "socket.io";
import MongoDB, {MongoClient, ObjectId} from 'mongodb';
import ResponseBody from "./Common/HTTP/ResponseBody";
import KoaUtil from "./Common/HTTP/KoaUtil";
import JWTUtil from "./Common/HTTP/JWTUtil";
import UserUtil from "./User/UserUtil";
import SocketIOConstant from "./Common/SocketIO/SocketIOConstant";

declare module 'koa' {
    interface BaseContext {
        user: object;
    }
}

async function connectMongoDB(): Promise<MongoClient> {
    console.log('[' + new Date().toISOString() + '] Connecting to MongoDB...');

    const mongo = await MongoDB.connect('mongodb://127.0.0.1:27017/?charset=utf-8', {useUnifiedTopology: true});

    console.log('[' + new Date().toISOString() + '] MongoDB has connected');

    return mongo;
}


async function startApp() {
    const mongo = await connectMongoDB();
    const db = mongo.db('gameshop');

    const http = HTTP.createServer();
    const koa = new Koa();
    const io = SocketIO();

    const router = new Router();

    const userAuthorizationMiddleware = async (ctx: BaseContext, next: Next) => {
        if (!ctx.headers['authorization']) {
            KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('No valid authentication credential'));
            return;
        }
        const token = ctx.headers['authorization'].substring('Bearer '.length);
        const user = await UserUtil.matchToken(db, token);

        if (!user) {
            KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('Invalid authentication code'));
            return;
        }

        ctx.user = user;

        return await next();
    };

    const adminAuthorizationMiddleware = async (ctx: BaseContext, next: Next) => {
        if (!ctx.headers['authorization']) {
            KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('No valid authentication credential'));
            return;
        }

        return;
    };

    router
        .get('/', (ctx) => {
            ctx.body = '<!doctype html><html lang="en"><head><title>Test Page</title></head><body>Works fine</body></html>';
        });
    router
        .put('/api/v1/user/register', async (ctx) => {
            const requestData = {
                name: ctx.request.body.user,
                password: ctx.request.body.password,
                passwordConfirmation: ctx.request.body.passwordConfirmation,
                nickname: ctx.request.body.nickname,
            };

            if (requestData.password !== requestData.passwordConfirmation) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The passwords which your first and second typing are not equal'));
                return;
            }
            if (await UserUtil.isDuplicatedName(db, requestData.name)) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The name has been taken'));
                return;
            }

            if (!await UserUtil.createUser(db, {
                name: requestData.name,
                password: UserUtil.makeHashedPassword(requestData.password),
                nickname: requestData.nickname,
            })) {
                KoaUtil.setResponse(ctx, ResponseBody.error(-500, 'Internal error', 'Could not finished the request caused by internal error'));
                return;
            }

            KoaUtil.setResponse(ctx, ResponseBody.success({}));
        });
    router
        .post('/api/v1/user/login', async (ctx) => {
            const requestData = {
                name: ctx.request.body.name,
                password: ctx.request.body.password,
            };

            if (!requestData.name) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The field "user" is required'));
                return;
            }
            if (!requestData.password) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The field "password" is required'));
                return;
            }

            if (!await UserUtil.verifyPassword(db, requestData.name, requestData.password)) {
                KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('Your provided credential had wrong, please check and try again'));
                return;
            }

            const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const token = JWTUtil.sign({name: requestData.name}, expiredAt);

            await UserUtil.setupToken(db, await UserUtil.nameToId(db, requestData.name), token, expiredAt);

            KoaUtil.setResponse(ctx, ResponseBody.success({
                token: token,
                expiredAt: expiredAt.getTime() / 1000,
            }));
        });
    router
        .use(userAuthorizationMiddleware)
        .post('/api/v1/user/logout', (ctx) => {
        });
    router
        .use(adminAuthorizationMiddleware)
        .put('/api/v1/admin/register', (ctx) => {

        });
    router
        .post('/api/v1/admin/login', (ctx) => {

        });
    router
        .use(adminAuthorizationMiddleware)
        .post('/api/v1/admin/logout', (ctx) => {

        });

    router.allowedMethods();

    koa.use(Parser());
    koa.use(router.routes());

    const unauthorizedSockets: Map<string, boolean> = new Map<string, boolean>();
    const userIdToSocketIdMapping: Map<string, string> = new Map<string, string>();
    const socketIdToUserIdMapping: Map<string, string> = new Map<string, string>();

    io.on('connection', (socket) => {
        console.log('[' + new Date().toISOString() + '] Incoming WebSocket connection from ' + socket.request.connection.remoteAddress);

        const sid = socket.id;

        socket.emit('authorize', {waitingTime: SocketIOConstant.authorizationTimeout});
        unauthorizedSockets.set(sid, true);

        const authorizationTimer = setTimeout(() => {
            if (unauthorizedSockets.has(sid)) {
                socket.emit('AUTHORIZE_TIMEOUT');
                socket.disconnect(true);
                unauthorizedSockets.delete(sid);
            }
        }, SocketIOConstant.authorizationTimeout);

        socket.on('authorize', async ({token}) => {
            if (!await UserUtil.matchToken(db, token)) {
                socket.emit('authorizeError', {error: {message: 'Invalid token'}});
                socket.disconnect(true);
                unauthorizedSockets.delete(sid);
                clearTimeout(authorizationTimer);
                return;
            }

            socket.emit('authorized');
        });

        socket.on('startSession', () => {

        });

        socket.on('listSession', () => {

        });

        socket.on('listMessage', () => {

        });

        socket.on('sendMessage', () => {

        });
    });

    http.addListener('request', koa.callback());
    io.attach(http, {
        path: '/ws'
    });

    http.on('request', (req) => {
        console.log('[' + new Date().toISOString() + '] Incoming HTTP request from ' + req.connection.remoteAddress + ', url = ' + req.url);
    });

    http.listen(62180, () => {
        console.log('[' + new Date().toISOString() + '] HTTP server has started', http.address());
    });

}

startApp();
