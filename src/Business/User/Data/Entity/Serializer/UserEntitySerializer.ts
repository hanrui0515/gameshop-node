import SerializerInterface from "~/Common/Serialize/SerializerInterface";
import UserEntity from "../UserEntity";

class UserEntitySerializer implements SerializerInterface<UserEntity, object> {

    public serialize(user: UserEntity): object {
        return user.serialize();
    }

    public deserialize(object: object): UserEntity {
        return new UserEntity(object as any);
    }
}

export default UserEntitySerializer;
