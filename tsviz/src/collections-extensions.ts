
export module Collections {
    export function firstOrDefault<T>(collection: Iterable<T>, predicate: (e: T) => boolean): T | null {
        for(const item of collection) {
            if (predicate(item)) {
                return item;
            }
        }
        return null;
    }
}