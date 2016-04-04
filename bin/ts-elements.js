"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (Visibility) {
    Visibility[Visibility["Private"] = 0] = "Private";
    Visibility[Visibility["Public"] = 1] = "Public";
    Visibility[Visibility["Protected"] = 2] = "Protected";
})(exports.Visibility || (exports.Visibility = {}));
var Visibility = exports.Visibility;
(function (Lifetime) {
    Lifetime[Lifetime["Static"] = 0] = "Static";
    Lifetime[Lifetime["Instance"] = 1] = "Instance";
})(exports.Lifetime || (exports.Lifetime = {}));
var Lifetime = exports.Lifetime;
var ModuleTypeName = "";
var ClassTypeName = "";
var MethodTypeName = "";
var PropertyTypeName = "";
var ImportedModuleTypeName = "";
var QualifiedName = (function () {
    function QualifiedName(nameParts) {
        this.nameParts = nameParts;
    }
    Object.defineProperty(QualifiedName.prototype, "parts", {
        get: function () {
            return this.nameParts;
        },
        enumerable: true,
        configurable: true
    });
    return QualifiedName;
}());
exports.QualifiedName = QualifiedName;
var Element = (function () {
    function Element(_name, _parent, _visibility, _lifetime) {
        if (_visibility === void 0) { _visibility = Visibility.Public; }
        if (_lifetime === void 0) { _lifetime = Lifetime.Instance; }
        this._name = _name;
        this._parent = _parent;
        this._visibility = _visibility;
        this._lifetime = _lifetime;
    }
    Object.defineProperty(Element.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "visibility", {
        get: function () {
            return this._visibility;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "lifetime", {
        get: function () {
            return this._lifetime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Element.prototype.addElement = function (element) {
        this.getElementCollection(element).push(element);
    };
    Element.prototype.getElementCollection = function (element) {
        throw new Error(typeof element + " not supported in " + typeof this);
    };
    return Element;
}());
exports.Element = Element;
var Module = (function (_super) {
    __extends(Module, _super);
    function Module() {
        _super.apply(this, arguments);
        this._classes = new Array();
        this._modules = new Array();
        this._dependencies = new Array();
        this._methods = new Array();
    }
    Object.defineProperty(Module.prototype, "classes", {
        get: function () {
            return this._classes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "modules", {
        get: function () {
            return this._modules;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "dependencies", {
        get: function () {
            return this._dependencies;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "methods", {
        get: function () {
            return this._methods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "path", {
        get: function () {
            return this._path;
        },
        set: function (value) {
            this._path = value;
        },
        enumerable: true,
        configurable: true
    });
    Module.prototype.getElementCollection = function (element) {
        switch (element.constructor.name) {
            case ClassTypeName:
                return this.classes;
            case ModuleTypeName:
                return this.modules;
            case ImportedModuleTypeName:
                return this.dependencies;
            case MethodTypeName:
                return this.methods;
        }
        return _super.prototype.getElementCollection.call(this, element);
    };
    return Module;
}(Element));
exports.Module = Module;
var Class = (function (_super) {
    __extends(Class, _super);
    function Class() {
        _super.apply(this, arguments);
        this._methods = new Array();
        this._properties = {};
    }
    Object.defineProperty(Class.prototype, "methods", {
        get: function () {
            return this._methods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Class.prototype, "properties", {
        get: function () {
            var result = new Array();
            for (var _i = 0, _a = Object.keys(this._properties); _i < _a.length; _i++) {
                var prop = _a[_i];
                result.push(this._properties[prop]);
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Class.prototype.getElementCollection = function (element) {
        if (element instanceof Method) {
            return this.methods;
        }
        return _super.prototype.getElementCollection.call(this, element);
    };
    Class.prototype.addElement = function (element) {
        if (element instanceof Property) {
            var property = element;
            var existingProperty = this._properties[property.name];
            if (existingProperty) {
                existingProperty.hasGetter = existingProperty.hasGetter || property.hasGetter;
                existingProperty.hasSetter = existingProperty.hasSetter || property.hasSetter;
            }
            else {
                this._properties[property.name] = property;
            }
            return;
        }
        this.getElementCollection(element).push(element);
    };
    Object.defineProperty(Class.prototype, "extends", {
        get: function () {
            return this._extends;
        },
        set: function (extendingClass) {
            this._extends = extendingClass;
        },
        enumerable: true,
        configurable: true
    });
    return Class;
}(Element));
exports.Class = Class;
var Method = (function (_super) {
    __extends(Method, _super);
    function Method() {
        _super.apply(this, arguments);
    }
    return Method;
}(Element));
exports.Method = Method;
var ImportedModule = (function (_super) {
    __extends(ImportedModule, _super);
    function ImportedModule() {
        _super.apply(this, arguments);
    }
    return ImportedModule;
}(Element));
exports.ImportedModule = ImportedModule;
var Property = (function (_super) {
    __extends(Property, _super);
    function Property() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Property.prototype, "hasGetter", {
        get: function () {
            return this._hasGetter;
        },
        set: function (value) {
            this._hasGetter = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "hasSetter", {
        get: function () {
            return this._hasSetter;
        },
        set: function (value) {
            this._hasSetter = value;
        },
        enumerable: true,
        configurable: true
    });
    return Property;
}(Element));
exports.Property = Property;
function typeName(_class) {
    return _class.prototype.constructor.name;
}
ModuleTypeName = typeName(Module);
ClassTypeName = typeName(Class);
MethodTypeName = typeName(Method);
PropertyTypeName = typeName(Property);
ImportedModuleTypeName = typeName(ImportedModule);
