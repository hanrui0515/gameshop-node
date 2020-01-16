import TenantVO from "../Data/VO/TenantVO";
import TenantEntity from "~/Business/User/Data/Entity/TenantEntity";

interface TenantCreationServiceInterface {
    createTenant(tenant: TenantVO): Promise<TenantEntity>;
}

export default TenantCreationServiceInterface;
