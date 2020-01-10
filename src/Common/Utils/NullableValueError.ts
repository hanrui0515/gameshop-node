class NullableValueError extends Error {
    public constructor(message?: string) {
        super(message || 'no present for any value');
    }

}

export default NullableValueError;
