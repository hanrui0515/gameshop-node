import {Db} from "mongodb";
import MongoTemplate from "~/Common/Mongo/MongoTemplate";
import MongoUtil from "~/Common/Utils/MongoUtil";

class UserRepository {

    public constructor(
        private mongoTemplate: MongoTemplate
    ) {
    }

    public async findById(id: string): Promise<Optional<Application.Business.User.Value.User>> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('user')
            .findOne({_id: MongoUtil.convertToStringId(id)});

        return doc ? doc as Application.Business.User.Value.User : null;
    }

    public async findByName(name: string): Promise<Optional<Application.Business.User.Value.User>> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('user')
            .findOne({name});

        return doc ? doc as Application.Business.User.Value.User : null;

    }

    public async findByToken(token: string): Promise<Optional<Application.Business.User.Value.User>> {
        const userId = (await this.mongoTemplate.getDatabase()
            .collection('user_token')
            .findOne({token})).userId;

        return await this.findById(userId);
    }
}

export default UserRepository;
