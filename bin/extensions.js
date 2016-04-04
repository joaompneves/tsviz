"use strict";
var Collections;
(function (Collections) {
    function firstOrDefault(collection, predicate) {
        for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
            var item = collection_1[_i];
            if (predicate(item)) {
                return item;
            }
        }
        return null;
    }
    Collections.firstOrDefault = firstOrDefault;
    function distinct(collection, getKey) {
        var hashset = {};
        var result = new Array();
        getKey = getKey || (function (item) { return "" + item; });
        for (var _i = 0, collection_2 = collection; _i < collection_2.length; _i++) {
            var item = collection_2[_i];
            var key = getKey(item);
            if (!hashset.hasOwnProperty(key)) {
                result.push(item);
                hashset[key] = null;
            }
        }
        return result;
    }
    Collections.distinct = distinct;
})(Collections = exports.Collections || (exports.Collections = {}));
