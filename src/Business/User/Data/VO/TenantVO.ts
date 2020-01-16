import VOInterface from "~/Common/Data/VO/VOInterface";

interface TenantVOOptionalParameters {
    id?: Nullable<string>;
    userId?: Nullable<string>;
    token?: Nullable<string>;
    expiredAt?: Nullable<Date>;
    createdAt?: Nullable<Date>;
}

class TenantVO implements VOInterface {
    public id: Nullable<string>;
    public userId: Nullable<string>;
    public token: Nullable<string>;
    public expiredAt: Nullable<Date>;
    public createdAt: Nullable<Date>;

    public constructor(optionalParameters: TenantVOOptionalParameters) {
        this.id = optionalParameters.id ?? null;
        this.userId = optionalParameters.userId ?? null;
        this.token = optionalParameters.token ?? null;
        this.expiredAt = optionalParameters.expiredAt ?? null;
        this.createdAt = optionalParameters.createdAt ?? null;
    }

    public toObject(): object {
        return {
            id: this.id,
            userId: this.userId,
            token: this.token,
            expiredAt: this.expiredAt,
            createdAt: this.createdAt
        }
    }
}

export default TenantVO;
