import InversifyUtil from "~/Common/Utils/InversifyUtil";
import MongoPool from "~/Common/Mongo/MongoPool";
import MongoConfigurer from "~/Common/Mongo/MongoConfigurer";
import MongoUtil from "~/Common/Utils/MongoUtil";
import MongoTemplate from "~/Common/Mongo/MongoTemplate";
import UserRepository from "~/Business/User/Data/Repository/UserRepository";
import TenantRepository from "~/Business/User/Data/Repository/TenantRepository";
import TenantCreationService from "~/Business/User/Service/TenantCreationService";
import UserCreationService from "~/Business/User/Service/UserCreationService";
import ConnectionManager from "~/Common/WebSocket/ConnectionManager";

const initApp = async () => {
    const mongoPool = MongoConfigurer.configure(MongoUtil.getMongoConfiguration());
    await mongoPool.connect();

    InversifyUtil.getContainer().bind(MongoPool).toConstantValue(mongoPool);
    InversifyUtil.getContainer().bind(MongoTemplate).toSelf();
    InversifyUtil.getContainer().bind(UserRepository).toSelf();
    InversifyUtil.getContainer().bind(TenantRepository).toSelf();
    InversifyUtil.getContainer().bind(UserCreationService).toSelf();
    InversifyUtil.getContainer().bind(TenantCreationService).toSelf();
    InversifyUtil.getContainer().bind(ConnectionManager).toSelf().inSingletonScope();
};

export {initApp};
