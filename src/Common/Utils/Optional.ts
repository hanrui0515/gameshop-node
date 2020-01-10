import NullableValueError from "~/Common/Utils/NullableValueError";

class Optional<T> {
    private constructor(
        private nullable: boolean,
        private value: T,
    ) {
    }

    public static nullable<T>(): Optional<T> {
        return new Optional<T>(true, null);
    }

    public static of<T>(value: T): Optional<T> {
        return new Optional<T>(false, value);
    }

    public static ofNullable<T>(value: T | null | undefined): Optional<T> {
        return value !== undefined && value !== null ? Optional.of<T>(value) : Optional.nullable<T>();
    }

    public isNullable(): boolean {
        return this.nullable;
    }

    public getValue(): T {
        if (this.isNullable()) {
            throw new NullableValueError();
        }

        return this.value;
    }
}

export default Optional;
