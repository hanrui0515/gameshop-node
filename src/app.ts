import HTTP from 'http';
import Koa from 'koa';
import Parser from 'koa-parser';
import Router from '@koa/router';
import SocketIO from "socket.io";
import MongoDB, {MongoClient, ObjectId} from 'mongodb';
import ResponseBody from "./Common/HTTP/ResponseBody";
import KoaUtil from "./Common/Utils/KoaUtil";
import JWTUtil from "./Common/Utils/JWTUtil";
import UserUtil from "./User/UserUtil";
import SocketIOConstant from "./Common/SocketIO/SocketIOConstant";
import MongoUtil from "./Common/Utils/MongoUtil";
import ChatUtil from "./Chat/ChatUtil";
import UserRepository from "~/Business/User/Repository/UserRepository";
import InversifyUtil from "~/Common/Utils/InversifyUtil";
import TenantRepository from "~/Business/User/Repository/TenantRepository";


async function connectMongoDB(): Promise<MongoClient> {
    console.log('[' + new Date().toISOString() + '] Connecting to MongoDB...');

    const mongo = await MongoDB.connect('mongodb://127.0.0.1:27017/?charset=utf-8', {useUnifiedTopology: true});

    console.log('[' + new Date().toISOString() + '] MongoDB has connected');

    return mongo;
}


async function runApp() {
    const mongo = await connectMongoDB();
    const db = mongo.db('gameshop');

    const http = HTTP.createServer();
    const koa = new Koa();
    const io = SocketIO();

    const router = new Router();

    const userAuthorizationMiddleware: Koa.Middleware = async (ctx, next) => {
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

        const userRepository = InversifyUtil.getContainer().get(UserRepository);
        ctx.request.user = await userRepository.findByToken(token);

        return await next();
    };

    const adminAuthorizationMiddleware: Koa.Middleware = async (ctx, next) => {
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
                name: ctx.request.body.name,
                password: ctx.request.body.password,
                passwordConfirmation: ctx.request.body.passwordConfirmation,
                nickname: ctx.request.body.nickname,
            };

            if (!requestData.name) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The field "name" is required'));
                return;
            }
            if (!requestData.password) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The field "password" is required'));
                return;
            }
            if (!requestData.passwordConfirmation) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The field "passwordConfirmation" is required'));
                return;
            }
            if (!requestData.nickname) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The field "nickname" is required'));
                return;
            }
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
                tenants: []
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
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('The field "name" is required'));
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

            const tenantRepository = InversifyUtil.getContainer().get(TenantRepository);

            const userId = await UserUtil.nameToId(db, requestData.name);
            const doc = {userId, token, expiredAt};

            await tenantRepository.createTenant(doc);

            KoaUtil.setResponse(ctx, ResponseBody.success({...doc, expiredAt: doc.expiredAt.getTime() / 1000}));
        });
    router
        .post('/api/v1/user/authorize', async (ctx) => {
            const requestData = {
                token: ctx.request.body.token,
            };

            if (!requestData.token) {
                KoaUtil.setResponse(ctx, ResponseBody.unprocessableEntity('the field "token" is required'));
                return;
            }

            const tenantRepository = InversifyUtil.getContainer().get(TenantRepository);
            const userRepository = InversifyUtil.getContainer().get(UserRepository);

            if (!await tenantRepository.existsTenantWithToken(requestData.token)) {
                KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('invalid token'));
                return;
            }

            const user = userRepository.findByToken(requestData.token);

            KoaUtil.setResponse(ctx, ResponseBody.success({user}));
        });
    router
        .use(userAuthorizationMiddleware)
        .get('/api/v1/user/info', (ctx) => {
            // @ts-ignore
            const user = UserUtil.findUser(db, MongoUtil.convertToStringId(ctx.user._id));

            KoaUtil.setResponse(ctx, ResponseBody.success({...user, password: void 0}));
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

    let connections: App.Network.WebSocket.Connection[] = [];

    io.on('connection', (socket) => {
        console.log('[' + new Date().toISOString() + '] Incoming WebSocket connection from ' + socket.request.connection.remoteAddress);

        connections.push({
            socket: socket,
            user: null,
            token: null,
        });

        const socketId = socket.id;

        const bindUser = (token: string, user: App.Business.User.Value.User) => {
            const conn = connections.filter(connection => connection.socket.id === socket.id)[0];

            conn.token = token;
            conn.user = user;
        };

        const unbindUser = () => {
            const conn = connections.filter(connection => connection.socket.id === socket.id)[0];

            conn.token = null;
            conn.user = null;
        };

        const destroySocket = () => {
            connections = connections.filter(connection => connection.socket.id !== socket.id);
        };

        socket.on('authorize', async (args: any) => {
            let user: object;

            const userRepository = InversifyUtil.getContainer().get(UserRepository);

            const result = await userRepository.findByToken(args.token);
            if (result.isNullable()) {
                socket.emit('authorizeError', {error: {message: 'Invalid token'}});
                socket.disconnect(true);
                return;
            }

            // @ts-ignore
            bindUser(args.token, MongoUtil.convertToStringId(user._id));

            socket.emit('authorizeResponse', {user: {...user, password: undefined}});
        });

        socket.on('startSession', ({userId}) => {
        });

        socket.on('listSession', () => {

        });

        socket.on('listMessage', () => {

        });

        socket.on('sendMessage', () => {

        });

        socket.on('disconnect', () => {
            destroySocket();
        })
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

export {runApp};
