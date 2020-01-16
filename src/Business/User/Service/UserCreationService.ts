import UserCreationServiceInterface from "./UserCreationServiceInterface";
import UserVO from "../Data/VO/UserVO";
import UserEntity from "../Data/Entity/UserEntity";
import {injectable} from "inversify";
import MongoTemplate from "~/Common/Mongo/MongoTemplate";

@injectable()
class UserCreationService implements UserCreationServiceInterface {

    public constructor(
        private mongoTemplate: MongoTemplate
    ) {
    }

    public async createUser(user: UserVO): Promise<UserEntity> {
        const document = {
            name: user.name,
            password: user.password,
            nickname: user.nickname,
            created_at: new Date(),
        };
        const result = await this.mongoTemplate.getDatabase()
            .collection('user')
            .insertOne(document);

        return new UserEntity({
            id: result.insertedId.toString(),
            name: document.name,
            password: document.password,
            nickname: document.nickname,
            createdAt: document.created_at,
        });
    }

}

export default UserCreationService;
