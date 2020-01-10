import InversifyUtil from "~/Common/Utils/InversifyUtil";
import MongoPool from "~/Common/Mongo/MongoPool";
import MongoConfigurer from "~/Common/Mongo/MongoConfigurer";
import MongoUtil from "~/Common/Utils/MongoUtil";
import MongoTemplate from "~/Common/Mongo/MongoTemplate";
import UserRepository from "~/Business/User/Repository/UserRepository";
import TenantRepository from "~/Business/User/Repository/TenantRepository";

const initApp = async () => {
    const mongoPool = MongoConfigurer.configure(MongoUtil.getMongoConfiguration());
    await mongoPool.connect();

    InversifyUtil.getContainer().bind(MongoPool).toConstantValue(mongoPool);
    InversifyUtil.getContainer().bind(MongoTemplate).toSelf();
    InversifyUtil.getContainer().bind(UserRepository).toSelf();
    InversifyUtil.getContainer().bind(TenantRepository).toSelf();
};

export {initApp};
