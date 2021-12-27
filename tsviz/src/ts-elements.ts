
export enum Visibility {
    Private,
    Public,
    Protected
}

export enum Lifetime {
    Static,
    Instance
}

export class QualifiedName {
    private nameParts: string[];
    
    constructor(nameParts: string[]) {
        this.nameParts = nameParts;
    }
    
    public get parts(): string[] {
        return this.nameParts;
    }
}

export abstract class Element {
    private _documentations = new Array<Documentation>();

    constructor(
        private _name: string, 
        private _parent?: Element, 
        private _visibility: Visibility = Visibility.Public, 
        private _lifetime: Lifetime = Lifetime.Instance) { 
        if (_parent) {
            _parent.addElement(this);
        }
    }
    
    public get name(): string {
        return this._name;
    }
    
    public get visibility() : Visibility {
        return this._visibility;
    }
    
    public get lifetime() : Lifetime {
        return this._lifetime;
    }

    public get documentations(): Documentation[] {
        return this._documentations;
    }
    
    public get parent() : Element | undefined {
        return this._parent;
    }
    
    public addElement(element: Element) {
        this.getTargetCollection(element).push(element);
    }
    
    protected getTargetCollection(element: Element): Element[] {
        if (element instanceof Documentation) {
            return this.documentations;
        }
        throw new Error(element.constructor.name + " not supported in " + this.constructor.name);
    }
} 

export class Module extends Element {
    private _classes: Class[] = new Array<Class>();
    private _modules: Module[] = new Array<Module>();
    private _dependencies: ImportedModule[] = new Array<ImportedModule>();
    private _methods = new Array<Method>();
    private _path: string = "";
    
    public get classes(): Class[] {
        return this._classes;
    }
    
    public get modules(): Module[] {
        return this._modules;
    }
    
    public get dependencies(): ImportedModule[] {
        return this._dependencies;
    }
    
    public get methods(): Method[] {
        return this._methods;
    }
    
    public get path(): string {
        return this._path;
    }
    
    public set path(value: string) {
        this._path = value;
    }
    
    protected getTargetCollection(element: Element): Element[] {
        if (element instanceof Class) {
            return this.classes;
        } else if (element instanceof Module) {
            return this.modules;
        } else if (element instanceof ImportedModule) {
            return this.dependencies;
        } else if (element instanceof Method) {
            return this.methods;
        }
        return super.getTargetCollection(element);
    }
}

export class Class extends Element {
    private _methods = new Array<Method>();
    private _properties : { [name: string ] : Property } = {};
    private _extends: QualifiedName | null = null;
    
    public get methods(): Method[] {
        return this._methods;
    }
    
    public get properties(): Property[] {
        var result = new Array<Property>();
        for (const prop of Object.keys(this._properties)) {
            result.push(this._properties[prop]);
        }
        return result;
    }
    
    protected getTargetCollection(element: Element): Element[] {
        if (element instanceof Method) {
            return this.methods;
        }
        return super.getTargetCollection(element);
    }
    
    public addElement(element: Element) {
        if(element instanceof Property) {
            const property = element as Property;
            const existingProperty = this._properties[property.name];
            if (existingProperty) {
                existingProperty.hasGetter = existingProperty.hasGetter || property.hasGetter;
                existingProperty.hasSetter = existingProperty.hasSetter || property.hasSetter;
            } else {
                this._properties[property.name] = property;
            }
            return;
        }
        super.addElement(element);
    }
    
    public get extends(): QualifiedName {
        return this._extends!;
    }
    
    public set extends(extendingClass: QualifiedName) {
        this._extends = extendingClass;
    }
}

export class Method extends Element {
    
}

export class ImportedModule extends Element {
    
    constructor(moduleName: string, private readonly _path: string, parent: Element) {
        super(moduleName, parent);
    }

    public get path(): string {
        return this._path;
    }
}

export class Property extends Element {
    private _hasGetter = false;
    private _hasSetter = false;
    
    public get hasGetter(): boolean {
        return this._hasGetter;
    }
    
    public set hasGetter(value: boolean) {
        this._hasGetter = value;
    }
    
    public get hasSetter(): boolean {
        return this._hasSetter;
    }
    
    public set hasSetter(value: boolean) {
        this._hasSetter = value;
    }
}

export class Documentation extends Element {
    constructor(parent: Element, private readonly _text: string, private readonly _tags: string[]) {
        super("", parent);
    }

    public get text(): string {
        return this._text;
    }

    public get tags(): string[] {
        return this._tags;
    }
}