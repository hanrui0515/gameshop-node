import {ObjectId} from 'mongodb';

export default class MongoUtil {
    public static toObjectId(id: string | number | ObjectId) {
        return id instanceof ObjectId ? id : new ObjectId(id);
    }
}
