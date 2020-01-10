import MongoPool from "./MongoPool";

class MongoConfigurer {
    public static configure(configuration: Application.Configuration.MongoConfiguration): MongoPool {
        return new MongoPool(configuration.instances.map((instanceConfiguration, i) => {
            return {
                id: 'instance-' + i,
                uri: 'mongodb://' + instanceConfiguration.host + ':' + instanceConfiguration.port,
                database: instanceConfiguration.database,
                options: instanceConfiguration.options,
            }
        }));
    }
}

export default MongoConfigurer;
