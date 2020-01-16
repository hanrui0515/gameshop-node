import {Socket} from "socket.io";
import UserEntity from "~/Business/User/Data/Entity/UserEntity";
import {IncomingMessage} from "http";

class Connection {
    private user: Nullable<UserEntity>;

    constructor(
        private socket: Socket
    ) {
        this.user = null;
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public getRequest(): IncomingMessage {
        return this.socket.request;
    }

    public setUser(user: UserEntity) {
        this.user = user;
    }

    public getUser(): UserEntity {
        return this.user;
    }
}

export default Connection;
