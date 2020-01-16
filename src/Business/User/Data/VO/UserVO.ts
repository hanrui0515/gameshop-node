import VOInterface from "~/Common/Data/VO/VOInterface";

interface UserVOProperties {
    id?: Nullable<string>;
    name?: Nullable<string>;
    password?: Nullable<string>;
    nickname?: Nullable<string>;
    createdAt?: Nullable<Date>;
}

class UserVO implements VOInterface {
    public id: Nullable<string>;
    public name: Nullable<string>;
    public password: Nullable<string>;
    public nickname: Nullable<string>;
    public createdAt: Nullable<Date>;

    public constructor(properties: UserVOProperties) {
        this.id = properties.id ?? null;
        this.name = properties.name ?? null;
        this.password = properties.password ?? null;
        this.nickname = properties.nickname ?? null;
        this.createdAt = properties.createdAt ?? null;
    }

    public toObject(): object {
        return {
            id: this.id,
            name: this.name,
            password: this.password,
            nickname: this.nickname,
            createdAt: this.createdAt,
        };
    }
}

export default UserVO;
