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
import SocketIOConstant from "./Common/WebSocket/SocketIOConstant";
import MongoUtil from "./Common/Utils/MongoUtil";
import ChatUtil from "./Chat/ChatUtil";
import UserRepository from "~/Business/User/Data/Repository/UserRepository";
import InversifyUtil from "~/Common/Utils/InversifyUtil";
import TenantRepository from "~/Business/User/Data/Repository/TenantRepository";
import ConnectionManager from "~/Common/WebSocket/ConnectionManager";
import Connection from "~/Common/WebSocket/Connection";
import TenantCreationService from "~/Business/User/Service/TenantCreationService";
import TenantVO from "~/Business/User/Data/VO/TenantVO";
import UserCreationService from "~/Business/User/Service/UserCreationService";
import UserVO from "~/Business/User/Data/VO/UserVO";


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


        const userRepository = InversifyUtil.getContainer().get(UserRepository);
        const tenantRepository = InversifyUtil.getContainer().get(TenantRepository);


        const tenant = await tenantRepository.findByToken(token);
        if (!tenant) {
            KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('Invalid authentication code'));
            return;
        }

        const user = await userRepository.findById(tenant.userId);
        if (!user) {
            ctx.request.user = user;
        }


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

            const userCreationService = InversifyUtil.getContainer().get(UserCreationService);

            await userCreationService.createUser(new UserVO({
                name: requestData.name,
                password: UserUtil.makeHashedPassword(requestData.password),
                nickname: requestData.nickname,
            }));

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

            const userRepository = InversifyUtil.getContainer().get(UserRepository);

            const user = await userRepository.findByName(requestData.name);

            if (UserUtil.makeHashedPassword(requestData.password) === user.password) {
                KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('Your provided credential had wrong, please check and try again'));
            }

            const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const token = JWTUtil.sign({name: requestData.name}, expiredAt);

            const tenantCreationService = InversifyUtil.getContainer().get(TenantCreationService);

            const tenant = await tenantCreationService.createTenant(new TenantVO({
                userId: user.id,
                token: token,
                expiredAt: expiredAt,
            }));

            KoaUtil.setResponse(ctx, ResponseBody.success({
                user_id: tenant.userId,
                token: tenant.token,
                expired_at: tenant.expiredAt.getTime() / 1000,
                created_at: tenant.expiredAt.getTime() / 1000,
            }));
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

            const tenant = await tenantRepository.findByToken(requestData.token);
            if (!tenant) {
                KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('invalid token', 'the tenant does not exist'));
                return;
            }

            const user = await userRepository.findById(tenant.userId);
            if (!user) {
                KoaUtil.setResponse(ctx, ResponseBody.unauthenticated('invalid token', 'the tenant was existed, but the user does not exist'));
                return;
            }

            KoaUtil.setResponse(ctx, ResponseBody.success({user: {...user, password: void 0}}));
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

    router.allowedMethods();

    koa.use(Parser());
    koa.use(router.routes());

    let connectionManager = InversifyUtil.getContainer().get(ConnectionManager);

    io.on('connection', (socket) => {
        console.log('[' + new Date().toISOString() + '] Incoming WebSocket connection from ' + socket.request.connection.remoteAddress);

        const conn = new Connection(socket);
        connectionManager.addConnection(conn);

        const socketId = socket.id;

        const destroySocket = () => {
        };

        socket.on('authorize', async (args: any) => {
            const tenantRepository = InversifyUtil.getContainer().get(TenantRepository);
            const userRepository = InversifyUtil.getContainer().get(UserRepository);

            const tenant = await tenantRepository.findByToken(args.token);
            if (!tenant) {
                socket.emit('onAuthorizationError', {error: {message: 'Invalid token'}});
                // socket.disconnect(true);
                return;
            }

            const user = await userRepository.findById(tenant.userId);
            if (!user) {
                socket.emit('onAuthorizationError', {error: {message: 'Invalid token'}});
                // socket.disconnect(true);
                return;
            }

            conn.setUser(user);
            socket.emit('authorizeResponse', {user: {...user, password: undefined}});
        });

        socket.on('sendMessage', (args) => {
            io.emit('pushMessage', {
                message: {
                    user: {
                        id: conn.getUser().id,
                        name: conn.getUser().name,
                        nickname: conn.getUser().nickname,
                    },
                    message: args.message,
                    createdAt: new Date(),
                }
            })
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
