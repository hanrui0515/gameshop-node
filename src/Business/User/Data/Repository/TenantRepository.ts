import {injectable} from 'inversify';
import MongoTemplate from "~/Common/Mongo/MongoTemplate";
import MongoUtil from "~/Common/Utils/MongoUtil";
import TenantEntity from "~/Business/User/Data/Entity/TenantEntity";

@injectable()
class TenantRepository {
    public constructor(
        private mongoTemplate: MongoTemplate
    ) {
    }

    public async findByToken(token: String): Promise<Nullable<TenantEntity>> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('tenant')
            .findOne({token: token, expired_at: {$gt: new Date()}});

        return !doc ? null : TenantRepository.mapToEntity(doc);
    }

    public async findByUserId(userId: String): Promise<TenantEntity[]> {
        const doc = await this.mongoTemplate.getDatabase()
            .collection('tenant')
            .find({user_id: userId, expired_at: {$gt: new Date()}});

        return await doc.map(TenantRepository.mapToEntity).toArray();
    }

    private static mapToEntity(document: any): TenantEntity {
        return new TenantEntity({
            id: document._id.toString(),
            userId: document.user_id,
            token: document.token,
            expiredAt: document.expired_at,
            createdAt: document.created_at,
        });
    }
}

export default TenantRepository;
