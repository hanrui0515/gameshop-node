import {Container} from 'inversify';

export default class InversifyUtil {
    private static container: Container;

    public static getContainer() {
        if (!this.container) {
            this.container = new Container();
        }

        return this.container;
    }

}
