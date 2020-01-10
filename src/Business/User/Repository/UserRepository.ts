import Optional from "~/Common/Utils/Optional";
import MongoTemplate from "~/Common/Mongo/MongoTemplate";
import MongoUtil from "~/Common/Utils/MongoUtil";

class UserRepository {

    public constructor(
        private mongoTemplate: MongoTemplate
    ) {
    }

    public async findById(id: string): Promise<Optional<App.Business.User.Value.User>> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('user')
            .findOne({_id: MongoUtil.convertToStringId(id)});

        return Optional.ofNullable<App.Business.User.Value.User>(doc);
    }

    public async findByName(name: string): Promise<Optional<App.Business.User.Value.User>> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('user')
            .findOne({name});

        return Optional.ofNullable<App.Business.User.Value.User>(doc);

    }

    public async findByToken(token: string): Promise<Optional<App.Business.User.Value.User>> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('user')
            .findOne({tenants: {token}});

        return Optional.ofNullable<App.Business.User.Value.User>(doc);
    }
}

export default UserRepository;
