import SerializerInterface from "~/Common/Serialize/SerializerInterface";
import TenantEntity from "../TenantEntity";

class TenantEntitySerializer implements SerializerInterface<TenantEntity, object> {

    public serialize(tenant: TenantEntity): object {
        return tenant.serialize();
    }

    public deserialize(object: object): TenantEntity {
        return new TenantEntity(object as any);
    }
}

export default TenantEntitySerializer;
