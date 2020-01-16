import UserVO from "../Data/VO/UserVO";
import UserEntity from "../Data/Entity/UserEntity";

interface UserCreationServiceInterface {
    createUser(user: UserVO): Promise<UserEntity>;
}

export default UserCreationServiceInterface;
