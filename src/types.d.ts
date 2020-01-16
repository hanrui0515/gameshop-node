declare type Nullable<T> = T | null;

declare namespace App {

    namespace Network {
        namespace WebSocket {
            interface Connection {
                socket: import('socket.io').Socket;
                user?: Business.User.Value.User;
                token?: string;
            }
        }

    }

    namespace Business {

        namespace User {

            namespace Value {

                interface User {
                    name: string;
                    password?: string;
                    nickname: string;
                    avatarImage?: Buffer;
                    tenant: Tenant[],
                }

                interface Tenant {
                    userId: string;
                    token: string;
                    expiredAt: Date;
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
