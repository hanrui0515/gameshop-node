import Comparable from "~/Common/Utils/Comparable";

enum Color { RED, BLUE}

class RBNode<K extends Comparable<K>, V> {
    public constructor(
        public left: RBNode<K, V>,
        public right: RBNode<K, V>,
        public color: Color,
        public key: K,
        public value: V,
    ) {
    }

    private leftZig() {

    }

    private rightZig() {
    }

    private zigZig() {
    }
}
