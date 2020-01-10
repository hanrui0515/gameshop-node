import {MongoClient, ObjectId} from 'mongodb';
import config from "~/config";

export default class MongoUtil {

    public static getMongoConfiguration(): App.Configuration.MongoConfiguration {
        return config.database.mongo;
    }

    public static async initializeMongoDB() {
        const config = this.getMongoConfiguration();
        // const mongo = MongoClient.connect('mongodb://' + config.host + ':' + config.port, {
        //     useUnifiedTopology: true,
        // });
    }

    public static convertToObjectId(id: string | ObjectId): ObjectId {
        return id instanceof ObjectId ? id : new ObjectId(id);
    }

    public static convertToStringId(objectId: ObjectId | string): string {
        return objectId instanceof ObjectId ? objectId.toHexString() : objectId;
    }
}
