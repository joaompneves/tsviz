import * as ts from "typescript";
import { Element, Module, Class, Method, Visibility, QualifiedName } from "./ts-elements";
import { Collections } from "./extensions";

export function collectInformation(program: ts.Program, sourceFile: ts.SourceFile): Module {
    const typeChecker = program.getTypeChecker();
    
    let filename = sourceFile.fileName;
    filename = filename.substring(0, filename.lastIndexOf("."));
    
    let module = new Module(filename, null, Visibility.Public);
    
    analyseNode(sourceFile, module);
    
    function analyseNode(node: ts.Node, currentElement: Element) {
        let childElement: Element;
        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration:
                let moduleDeclaration = <ts.ModuleDeclaration> node;
                childElement = new Module(moduleDeclaration.name.text, currentElement, Visibility.Public);
                break;
                
            case ts.SyntaxKind.ImportDeclaration:
                //console.log((<ts.ImportDeclaration> node).moduleSpecifier.getText());
                break;
                
            case ts.SyntaxKind.ClassDeclaration:
                let classDeclaration = <ts.ClassDeclaration> node;
                let classDef = new Class(classDeclaration.name.text, currentElement, Visibility.Public);
                if (classDeclaration.heritageClauses) {
                    let extendsClause = Collections.firstOrDefault(classDeclaration.heritageClauses, c => c.token === ts.SyntaxKind.ExtendsKeyword);
                    if (extendsClause && extendsClause.types.length > 0) {
                        var baseType = typeChecker.getTypeAtLocation(extendsClause.types[0]);
                        classDef.extends = getFullyQualifiedName(typeChecker, sourceFile, baseType.symbol);
                    }
                }
                childElement = classDef;
                break;
                
            case ts.SyntaxKind.MethodDeclaration:
                let methodDeclaration = <ts.MethodDeclaration> node;
                childElement = new Method((<ts.Identifier>methodDeclaration.name).text, currentElement, Visibility.Public);
                break;
        }
        
        if (childElement) {
            currentElement.addElement(childElement);
        }
        
        ts.forEachChild(node, (node) => analyseNode(node, childElement || currentElement));
    }
    
    return module;
}

function getFullyQualifiedName(typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile, symbol: ts.Symbol): QualifiedName {
    let nameParts = typeChecker.getFullyQualifiedName(symbol).split(".");
    if(nameParts.length > 0) {
        nameParts[0] = nameParts[0].replace(/\"/g, "");
        //&& nameParts[0] !== sourceFile.fileName) {
        //nameParts.unshift((<any> sourceFile).symbol.name); // insert the name of the module at the beginning
    }
    return new QualifiedName(nameParts);
}