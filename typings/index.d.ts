declare namespace App {

    namespace Business {

        namespace User {

            namespace Value {

                interface User {
                    name: string;
                    password?: string;
                    nickname: string;
                    avatarImage?: Buffer;
                }
            }
        }
    }

    namespace Configuration {

        interface Configuration {
            database: DatabaseConfiguration;
        }

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
