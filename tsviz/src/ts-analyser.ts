import * as ts from "typescript";
import * as path from "path";
import { Element, Module, Class, Method, ImportedModule, Property, Visibility, QualifiedName, Lifetime, Doc } from "./ts-elements";
import { Collections } from "./collections-extensions";

export function collectInformation(program: ts.Program, sourceFile: ts.SourceFile): Module {
    const typeChecker = program.getTypeChecker();
    
    const filename = getFilenameWithoutExtension(sourceFile);
    const moduleName  = path.basename(filename); // get module filename without directory
    
    const module = new Module(moduleName);
    module.path = path.dirname(filename);
    
    analyseNode(sourceFile, module);
    
    function analyseNode(node: ts.Node, currentElement: Element) {
        let childElement: Element | null = null;
        let skipChildren = false;
        
        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration:
                const moduleDeclaration = node as ts.ModuleDeclaration;
                childElement = new Module(moduleDeclaration.name.text, currentElement, getVisibility(node));
                break;

            case ts.SyntaxKind.ImportEqualsDeclaration:
                const importEqualDeclaration = node as ts.ImportEqualsDeclaration;
                childElement = new ImportedModule(importEqualDeclaration.name.text, currentElement);
                break;
                
            case ts.SyntaxKind.ImportDeclaration:
                const importDeclaration = node as ts.ImportDeclaration;
                const moduleName = (importDeclaration.moduleSpecifier as ts.StringLiteral).text;
                childElement = new ImportedModule(moduleName, currentElement);
                break;
                
            case ts.SyntaxKind.ClassDeclaration:
                const classDeclaration = node as ts.ClassDeclaration;
                const classDef = new Class(classDeclaration.name!.text, currentElement, getVisibility(node));
                if (classDeclaration.heritageClauses) {
                    const extendsClause = Collections.firstOrDefault(classDeclaration.heritageClauses, c => c.token === ts.SyntaxKind.ExtendsKeyword);
                    if (extendsClause && extendsClause.types.length > 0) {
                        classDef.extends = getFullyQualifiedName(extendsClause.types[0], typeChecker);
                    }
                }
                childElement = classDef;
                break;
            
            case ts.SyntaxKind.GetAccessor:
            case ts.SyntaxKind.SetAccessor:
            case ts.SyntaxKind.PropertyDeclaration:
                const propertyDeclaration = node as ts.PropertyDeclaration;
                const property = new Property((propertyDeclaration.name as ts.Identifier).text, currentElement, getVisibility(node), getLifetime(node));
                switch (node.kind) {
                    case ts.SyntaxKind.GetAccessor:
                        property.hasGetter = true;
                        break;
                    case ts.SyntaxKind.SetAccessor:
                        property.hasSetter = true;
                }
                childElement = property;
                skipChildren = true;
                break;
                
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.FunctionDeclaration:
                const functionDeclaration = node as ts.FunctionDeclaration | ts.MethodDeclaration;
                childElement = new Method((functionDeclaration.name as ts.Identifier).text, currentElement, getVisibility(node), getLifetime(node));
                skipChildren = true;
                break;
                
            case ts.SyntaxKind.JSDocComment:
                const doc = node as ts.JSDocComment;
                childElement = new Doc(currentElement, doc.text);
        }
        
        if (skipChildren) {
            return; // no need to inspect children
        }
        
        ts.forEachChild(node, (node) => analyseNode(node, childElement || currentElement));
    }

    return module;
}

function getFullyQualifiedName(expression: ts.ExpressionWithTypeArguments, typeChecker: ts.TypeChecker) {
    const symbol = typeChecker.getSymbolAtLocation(expression.expression);
    if (symbol) {
        const nameParts = typeChecker.getFullyQualifiedName(symbol).split(".");
        if (symbol.declarations && symbol.declarations.length > 0 && symbol.declarations[0].kind === ts.SyntaxKind.ImportSpecifier) {
            // symbol comes from an imported module
            // get the module name from the import declaration
            const importSpecifier = symbol.declarations[0];
            const moduleName = ((importSpecifier.parent.parent.parent as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral).text;
            nameParts.unshift(moduleName);
        } else {
            if (nameParts.length > 0 && nameParts[0].indexOf("\"") === 0) {
                // if first name part has " then it should be a module name
                const moduleName = nameParts[0].replace(/\"/g, ""); // remove " from module name
                nameParts[0] = moduleName;
            }
        }
        return new QualifiedName(nameParts);
    }
    console.warn("Unable to resolve type: '" + expression.getText() + "'");
    return new QualifiedName(["unknown?"]);
}

function getVisibility(node: ts.Node) {
    if (node.modifiers) {
        const modifiers = node.modifiers.map(m => m.kind);
        if (modifiers.includes(ts.SyntaxKind.ProtectedKeyword)) {
            return Visibility.Protected;
        } else if (modifiers.includes(ts.SyntaxKind.PrivateKeyword)) {
            return Visibility.Private;
        } else if (modifiers.includes(ts.SyntaxKind.PublicKeyword)) {
            return Visibility.Public;
        } else if (modifiers.includes(ts.SyntaxKind.ExportKeyword)) {
            return Visibility.Public;
        }
    }
    switch (node.parent.kind) {
        case ts.SyntaxKind.ClassDeclaration:
            return Visibility.Public;
        case ts.SyntaxKind.ModuleDeclaration:
            return Visibility.Private;
    }
    return Visibility.Private;
}

function getLifetime(node: ts.Node) {
    if (node.modifiers) {
        const modifiers = node.modifiers.map(m => m.kind);
        if (modifiers.includes(ts.SyntaxKind.StaticKeyword)) {
            return Lifetime.Static;
        }
    }
    return Lifetime.Instance;
}

function getFilenameWithoutExtension(file: ts.SourceFile) {
    const filename = file.fileName;
    return filename.substr(0, filename.lastIndexOf(".")); // filename without extension
}