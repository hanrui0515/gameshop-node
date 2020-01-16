import AbstractEntity from "~/Common/Data/Entity/AbstractEntity";

interface TenantEntityProperties {
    id: string;
    userId: string;
    token: string;
    expiredAt: Date;
    createdAt: Date;
}

class TenantEntity extends AbstractEntity {
    public id: string;
    public userId: string;
    public token: string;
    public expiredAt: Date;
    public createdAt: Date;

    public constructor(properties: TenantEntityProperties) {
        super();

        this.id = properties.id;
        this.userId = properties.userId;
        this.token = properties.token;
        this.expiredAt = properties.expiredAt;
        this.createdAt = properties.createdAt;
    }

    public serialize(): object {
        return {
            id: this.id,
            userId: this.userId,
            token: this.token,
            expiredAt: this.expiredAt,
            createdAt: this.createdAt,
        };
    }
}

export default TenantEntity;
