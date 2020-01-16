import AbstractEntity from "~/Common/Data/Entity/AbstractEntity";

interface UserEntityProperties {
    id: string;
    name: string;
    password: string;
    nickname: string;
    createdAt: Date;
}

class UserEntity extends AbstractEntity {
    public id: string;
    public name: string;
    public password: string;
    public nickname: string;
    public createdAt: Date;

    public constructor(properties: UserEntityProperties) {
        super();

        this.id = properties.id;
        this.name = properties.name;
        this.password = properties.password;
        this.nickname = properties.nickname;
        this.createdAt = properties.createdAt;
    }

    public serialize(): object {
        return {
            id: this.id,
            name: this.name,
            password: this.password,
            nickname: this.nickname,
            createdAt: this.createdAt,
        };
    }
}

export default UserEntity;
