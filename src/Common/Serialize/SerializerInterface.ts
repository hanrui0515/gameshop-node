interface SerializerInterface<T0, T1> {
    serialize(object: T0): T1;

    deserialize(object: T1): T0;
}

export default SerializerInterface;
