import {Db} from "mongodb";
import MongoUtil from "../Common/Utils/MongoUtil";

export default class ChatUtil {

    public static async createSession(db: Db, fromUserId: string, toUserId: string): Promise<object> {
        const collection = db.collection('chat_session');
        const document = {fromUserId, toUserId, allMessages: [], offlineMessages: []};
        const result = await collection.insertOne(document);

        if (result.result.ok === 1) {
            return document;
        }

        return null;
    }

    public static async a() {
    }

    public static async pushOfflineMessage(db: Db, sessionId: string, message: object): Promise<boolean> {
        const collection = db.collection('chat_session');
        const result = await collection.updateOne({_id: MongoUtil.convertToObjectId(sessionId)}, {$push: {offlineMessages: message}});

        return result.result.ok === 1;
    }

    // public static async flushOfflineMessage(db: Db, sessionId: string): Promise<object[]> {
    //     const collection = db.collection('chat_session');
    //     try {
    //         const document = await collection.find({_id: MongoUtil.convertToObjectId(sessionId)}, {projection: {offlineMessages: 1}});
    //         const result = await collection
    //
    //     }
    //
    // }
}
