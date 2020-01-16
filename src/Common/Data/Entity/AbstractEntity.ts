import EntityInterface from "~/Common/Data/Entity/EntityInterface";

abstract class AbstractEntity implements EntityInterface {
    abstract serialize(): object;
}

export default AbstractEntity;
