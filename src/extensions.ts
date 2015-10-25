
export module Collections {
    export function firstOrDefault<T>(collection: T[], predicate: (e: T) => boolean): T {
        for(let item of collection) {
            if (predicate(item)) {
                return item;
            }
        }
        return null;
    }
    
    export function distinct<T>(collection: T[], getKey?: (item: T) => string): T[] {
        let hashset: Object = {};
        let result = new Array<T>();
        getKey = getKey || ((item) => "" + item);
        for(let item of collection) {
            var key = getKey(item);
            if (!hashset.hasOwnProperty(key)) {
                result.push(item);
                (<any>hashset)[key] = null;
            }
        }
        return result;
    }
}