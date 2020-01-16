import Compared from "./Compared";

interface Comparable<T extends Comparable<T>> {
    compareWith(comparision: T): Compared;
}

export default Comparable;
