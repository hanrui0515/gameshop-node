import {Db} from "mongodb";
import MongoUtil from "../Common/Utils/MongoUtil";

export default class ShopUtil {
    public static async createGoods(db: Db, document: object): Promise<boolean> {
        const collection = db.collection('goods');
        const result = await collection.insertOne(document);

        return result.result.ok === 1;
    }

    public static async findGoods(db: Db, id: string): Promise<object> {
        const collection = db.collection('goods');
        return await collection.findOne({_id: MongoUtil.convertToObjectId(id)});
    }

    public static async findAllGoods(db: Db): Promise<object[]> {
        const collection = db.collection('goods');
        const cursor = collection.find();

        return await cursor.toArray();
    }

    public static async deleteGoods(db: Db, id: string): Promise<boolean> {
        const collection = db.collection('goods');
        const result = await collection.deleteOne({_id: MongoUtil.convertToObjectId(id)});

        return result.result.ok === 1;
    }

    public static async updateGoods(db: Db, id: string, document: object): Promise<boolean> {
        const collection = db.collection('goods');
        const result = await collection.updateOne({_id: MongoUtil.convertToObjectId(id)}, document);

        return result.result.ok === 1;
    }
}
