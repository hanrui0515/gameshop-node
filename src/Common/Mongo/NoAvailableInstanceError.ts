import BaseError from "~/Common/Error/BaseError";

class NoAvailableInstanceError extends BaseError {
    public constructor() {
        super('No available instance');
    }
}

export default NoAvailableInstanceError;
