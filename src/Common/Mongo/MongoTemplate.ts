import MongoPool from "~/Common/Mongo/MongoPool";
import {Db, MongoClient} from "mongodb";
import {injectable} from "inversify";

@injectable()
class MongoTemplate {

    public constructor(
        private mongoPool: MongoPool
    ) {
    }

    public getClient(): MongoClient {
        // TODO: Add smart selection strategy
        return this.mongoPool.getRandomAvailableInstance().getClient();
    }

    public getDatabase(): Db {
        return this.mongoPool.getRandomAvailableInstance().getDefaultDatabase();
    }
}

export default MongoTemplate;
