declare type Optional<T> = T | null;

declare namespace Application {
    namespace Business {
        namespace User {
            namespace Value {
                interface User {
                    name: string;
                    password?: string;
                    nickname: string;
                    avatarImage: Buffer;
                }
            }
        }
    }

    interface Configuration {
        database: Configuration.DatabaseConfiguration;
    }

    namespace Configuration {
        interface DatabaseConfiguration {
            mongo: MongoConfiguration;
        }

        interface MongoConfiguration {
            instances: MongoInstanceConfiguration[];
        }

        interface MongoInstanceConfiguration {
            host: string;
            port: number;
            database: string;
            options?: import('mongodb').MongoClientOptions;
        }
    }
}

