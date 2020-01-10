import {Db, MongoClient, MongoClientOptions} from "mongodb";
import NoAvailableInstanceError from "~/Common/Mongo/NoAvailableInstanceError";
import UnavailableInstanceError from "~/Common/Mongo/UnavailableInstanceError";
import Optional from "~/Common/Utils/Optional";

type MongoInstanceId = string;

interface MongoInstanceConfig {
    id: MongoInstanceId;
    uri: string;
    database: string;
    options?: MongoClientOptions;
}

class MongoInstance {
    private config: MongoInstanceConfig;
    private client: Optional<MongoClient> = Optional.nullable();

    public constructor(config: MongoInstanceConfig) {
        this.config = config;
    }

    public async connect(): Promise<void> {
        this.client = Optional.of(await MongoClient.connect(this.config.uri, this.config.options));
    }

    public async disconnect(shouldForceClose?: boolean): Promise<void> {
        await this.getClient().close(shouldForceClose);
        this.client = Optional.nullable<MongoClient>();
    }

    public isConnected(): boolean {
        return !this.client.isNullable() && this.getClient().isConnected();
    }

    public getClient(): MongoClient {
        if (this.client.isNullable()) {
            throw new UnavailableInstanceError('the instance is not connected');
        }

        return this.client.getValue();
    }

    public getDefaultDatabase(): Db {
        return this.getClient().db(this.config.database);
    }
}

class MongoPool {
    private readonly instances: Map<MongoInstanceId, MongoInstance> = new Map<MongoInstanceId, MongoInstance>();

    public constructor(instances: MongoInstanceConfig[]) {
        if (instances.length === 0) {
            throw new Error('number of the MongoDB instance must be greater than 0');
        }

        instances.forEach(config => {
            this.instances.set(config.id, new MongoInstance(config));
        });
    }

    public getAllInstances(): MongoInstance[] {
        return Array.from(this.instances.values());
    }

    public getInstance(id: MongoInstanceId): Optional<MongoInstance> {
        return Optional.ofNullable<MongoInstance>(this.instances.get(id));
    }

    // TODO: Add smart selection strategy
    public getRandomInstance(): MongoInstance {
        const keys = Array.from(this.instances.keys());

        return this.instances.get(keys[0]);
    }

    public getAllAvailableInstances(): MongoInstance[] {
        return Array
            .from(this.instances.values())
            .filter(instance => instance.isConnected());
    }

    public getRandomAvailableInstance(): MongoInstance {
        const availableInstances = this.getAllAvailableInstances();

        if (availableInstances.length === 0) {
            throw new NoAvailableInstanceError();
        }

        return availableInstances[0];
    }

    public async connect(): Promise<void> {
        const promises: Promise<any>[] = [];

        this.instances.forEach(instance => {
            promises.push(instance.connect());
        });
        await Promise.all(promises);
    }

    public async disconnect(shouldForceCloseSelector: (instance: MongoInstance) => boolean): Promise<void> {
        const promises: Promise<any>[] = [];

        this.instances.forEach(instance => {
            promises.push(instance.disconnect(shouldForceCloseSelector(instance)));
        });
        await Promise.all(promises);
    }
}

export default MongoPool;
