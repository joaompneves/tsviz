
export module Collections {
	export function firstOrDefault<T>(collection: Array<T>, predicate: (e: T) => boolean): T {
		for(let item of collection) {
			if (predicate(item)) {
				return item;
			}
		}
		return null;
	}
}