
export module Collections {
    export function distinct<T>(collection: Iterable<T>, getKey?: (item: T) => string): T[] {
        const hashset: Object = {};
        const result = new Array<T>();
        getKey = getKey || ((item) => "" + item);
        for(const item of collection) {
            var key = getKey(item);
            if (!hashset.hasOwnProperty(key)) {
                result.push(item);
                (hashset as any)[key] = null;
            }
        }
        return result;
    }
}