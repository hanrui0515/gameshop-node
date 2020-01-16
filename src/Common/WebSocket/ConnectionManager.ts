import Connection from "./Connection";
import UserEntity from "~/Business/User/Data/Entity/UserEntity";
import {injectable} from "inversify";

@injectable()
class ConnectionManager {
    private connections: Connection[];

    public constructor() {
        this.connections = [];
    }

    public addConnection(connection: Connection): void {
        this.connections.push(connection);

        connection.getSocket().on('disconnect', () => {
            this.removeConnection(connection);
        });
    }

    public removeConnection(connection: Connection): void {
        this.connections = this.connections.filter(c => c !== connection);
    }

    public searchWithUser(user: UserEntity): Connection[] {
        return this.connections.filter(c => c.getUser().id === user.id);
    }
}

export default ConnectionManager;
