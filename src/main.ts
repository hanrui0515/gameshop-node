import InversifyUtil from "~/Common/Utils/InversifyUtil";
import MongoPool from "~/Common/Mongo/MongoPool";
import MongoConfigurer from "~/Common/Mongo/MongoConfigurer";
import MongoUtil from "~/Common/Utils/MongoUtil";
import MongoTemplate from "~/Common/Mongo/MongoTemplate";

import User from "~/Business/User/Repository/UserRepository";
import {runApp} from '~/app';

const mongoPool = MongoConfigurer.configure(MongoUtil.getMongoConfiguration());

InversifyUtil.getContainer().bind(MongoPool).toConstantValue(mongoPool);
InversifyUtil.getContainer().bind(MongoTemplate).toSelf();

InversifyUtil.getContainer().bind(User).toSelf();

const bootstrap = async () => {
    await mongoPool.connect();
    await runApp();
};

bootstrap()
    .catch((err) => console.log(err));
