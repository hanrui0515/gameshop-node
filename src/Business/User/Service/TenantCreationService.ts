import TenantCreationServiceInterface from "./TenantCreationServiceInterface";
import TenantVO from "../Data/VO/TenantVO";
import {injectable} from "inversify";
import MongoTemplate from "~/Common/Mongo/MongoTemplate";
import TenantEntity from "~/Business/User/Data/Entity/TenantEntity";

@injectable()
class TenantCreationService implements TenantCreationServiceInterface {
    public constructor(
        private mongoTemplate: MongoTemplate
    ) {
    }

    public async createTenant(tenant: TenantVO): Promise<TenantEntity> {
        const document = {
            user_id: tenant.userId,
            token: tenant.token,
            expired_at: tenant.expiredAt,
            created_at: new Date(),
        };
        const result = await this.mongoTemplate.getDatabase()
            .collection('tenant')
            .insertOne(document);

        return new TenantEntity({
            id: result.insertedId.toString(),
            userId: document.user_id,
            token: document.token,
            expiredAt: document.expired_at,
            createdAt: document.created_at,
        });
    }
}

export default TenantCreationService;
