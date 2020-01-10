import BaseError from "~/Common/Error/BaseError";

class UnavailableInstanceError extends BaseError {
    public constructor(message?: string) {
        super(message || 'unavailable instance');
    }
}

export default UnavailableInstanceError;
