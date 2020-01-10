import {Db} from "mongodb";
import MongoUtil from "../Common/Utils/MongoUtil";
import Crypto from 'crypto';

export default class UserUtil {
    private static hmacKey = '@Us3r@Pa55W0rD_Hmac@!';

    public static async isDuplicatedName(db: Db, name: string): Promise<boolean> {
        const collection = db.collection('user');
        return await collection.findOne({name}) !== null;
    }

    public static async createUser(db: Db, document: object): Promise<boolean> {
        const collection = db.collection('user');
        const result = await collection.insertOne(document);

        return result.result.ok === 1;
    }

    public static async removeUser(db: Db, id: string): Promise<boolean> {
        const collection = db.collection('user');
        const result = await collection.deleteOne({_id: MongoUtil.convertToObjectId(id)});

        return result.result.ok === 1;
    }

    public static async findUser(db: Db, id: string): Promise<object> {
        const collection = db.collection('user');
        return await collection.findOne({_id: MongoUtil.convertToObjectId(id)});
    }

    public static async updateUser(db: Db, id: string, document: object): Promise<boolean> {
        const collection = db.collection('user');
        const result = await collection.updateOne({_id: MongoUtil.convertToObjectId(id)}, document);

        return result.result.ok === 1;
    }

    public static async nameToId(db: Db, name: string): Promise<string> {
        const collection = db.collection('user');
        const document = await collection.findOne({name});

        if (!document) {
            return null;
        }

        return document._id.toString();
    }

    public static makeHashedPassword(password: string) {
        const hmac = Crypto.createHmac('sha256', this.hmacKey);

        hmac.update(password);
        return hmac.digest('hex');
    }

    public static async verifyPassword(db: Db, name: string, password: string): Promise<boolean> {
        const collection = db.collection('user');
        const document = await collection.findOne({name});

        console.log(name, password, document);

        if (!document) {
            return false;
        }

        return this.makeHashedPassword(password) === document.password;
    }

    public static async setupToken(db: Db, userId: string, token: string, expiredAt: Date): Promise<boolean> {
        const collection = db.collection('user_token');
        const result = await collection.insertOne({userId: MongoUtil.convertToObjectId(userId), token, expiredAt});

        return result.result.ok === 1;
    }

    public static async revokeToken(db: Db, userId: string, token: string) {
        const collection = db.collection('user_token');
        const result = await collection.deleteOne({userId: MongoUtil.convertToObjectId(userId), token});

        return result.result.ok === 1;
    }

    public static async revokeAllTokens(db: Db, userId: string) {
        const collection = db.collection('user_token');
        const result = await collection.deleteMany({userId: MongoUtil.convertToObjectId(userId)});

        return result.result.ok === 1;
    }

    public static async matchToken(db: Db, token: string): Promise<object> {
        const collection = db.collection('user_token');
        const document = await collection.findOne({token});

        if (!document) {
            return null;
        }
        if (Date.now() > document.expiredAt * 1000) {
            await this.revokeToken(db, document.userId, token);
            return null;
        }

        return document;
    }
}
