import {Db, MongoClient, MongoClientOptions} from "mongodb";
import NoAvailableInstanceError from "~/Common/Mongo/NoAvailableInstanceError";
import UnavailableInstanceError from "~/Common/Mongo/UnavailableInstanceError";

type MongoInstanceId = string;

interface MongoInstanceConfig {
    id: MongoInstanceId;
    uri: string;
    database: string;
    options?: MongoClientOptions;
}

class MongoInstance {
    private config: MongoInstanceConfig;
    private client: Optional<MongoClient> = null;

    public constructor(config: MongoInstanceConfig) {
        this.config = config;
    }

    public async connect(): Promise<void> {
        this.client = await MongoClient.connect(this.config.uri, this.config.options);
    }

    public async disconnect(shouldForceClose?: boolean): Promise<void> {
        await this.client.close(shouldForceClose);
        this.client = null;
    }

    public isConnected(): boolean {
        return this.client !== null && this.client.isConnected();
    }

    public getClient(): MongoClient {
        if (!this.client) {
            throw new UnavailableInstanceError('the instance is not connected');
        }

        return this.client;
    }

    public getDefaultDatabase(): Db {
        if (!this.client) {
            throw new UnavailableInstanceError('the instance is not connected');
        }

        return this.client.db(this.config.database);
    }
}

class MongoPool {
    private readonly instances: Map<MongoInstanceId, MongoInstance>;

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
        return this.instances.get(id) || null;
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
