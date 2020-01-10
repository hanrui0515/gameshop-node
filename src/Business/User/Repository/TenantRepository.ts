import {injectable} from 'inversify';
import MongoTemplate from "~/Common/Mongo/MongoTemplate";
import MongoUtil from "~/Common/Utils/MongoUtil";

@injectable()
class TenantRepository {
    public constructor(
        private mongoTemplate: MongoTemplate
    ) {
    }

    public async createTenant(tenant: App.Business.User.Value.Tenant) {
       const result = await this.mongoTemplate.getDatabase()
            .collection('user')
            .updateOne(
                {_id: MongoUtil.convertToObjectId(tenant.userId)},
                {$push: {tenants: [123123]}}
            );
        console.log(typeof MongoUtil.convertToObjectId(tenant.userId));
        console.log(result.matchedCount, result.modifiedCount);
    }

    public async deleteTenant(token: string) {
        await this.mongoTemplate.getDatabase()
            .collection('user')
            .updateOne(
                {tenants: {token}},
                {$pull: {tenants: {token}}}
            );
    }

    public async existsTenantWithToken(token: string): Promise<boolean> {
        const count = await this.mongoTemplate.getDatabase()
            .collection('user')
            .countDocuments({tenants: {token}});

        return count > 0;
    }
}

export default TenantRepository;
