import MongoTemplate from "~/Common/Mongo/MongoTemplate";
import MongoUtil from "~/Common/Utils/MongoUtil";
import UserEntity from "~/Business/User/Data/Entity/UserEntity";
import {injectable} from "inversify";
import { ObjectId } from "mongodb";

@injectable()
class UserRepository {

    public constructor(
        private mongoTemplate: MongoTemplate
    ) {
    }

    public async findById(id: string): Promise<Nullable<UserEntity>> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('user')
            .findOne({_id: new ObjectId(id)});

        return !doc ? null : UserRepository.mapToEntity(doc);
    }

    public async findByName(name: string): Promise<Nullable<UserEntity>> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('user')
            .findOne({name});

        return !doc ? null : UserRepository.mapToEntity(doc);

    }

    private static mapToEntity(document: any): UserEntity {
        return new UserEntity({
            id: document._id.toString(),
            name: document.name,
            password: document.password,
            nickname: document.nickname,
            createdAt: document.created_at,
        });
    }
}

export default UserRepository;
