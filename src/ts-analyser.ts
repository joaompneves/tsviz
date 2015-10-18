import * as ts from "typescript";
import { Element, Module, Class, Method, Visibility, QualifiedName } from "./ts-elements";

export function collectInformation(sourceFile: ts.SourceFile): Module {
    let filename = sourceFile.fileName;
    filename = filename.substring(0, filename.lastIndexOf("."));
    
    let module = new Module(filename, Visibility.Public);
    
    analyseNode(sourceFile, module);
    
    function analyseNode(node: ts.Node, currentElement: Element) {
        let childElement: Element;
        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration:
                break;
                
            case ts.SyntaxKind.ImportDeclaration:
                //console.log((<ts.ImportDeclaration> node).moduleSpecifier.getText());
                break;
                
            case ts.SyntaxKind.ClassDeclaration:
                let classDeclaration = <ts.ClassDeclaration> node;
                let classDef = new Class(classDeclaration.name.text, Visibility.Public);
                if (classDeclaration.heritageClauses && classDeclaration.heritageClauses.length > 0) {
                    let extendsClause = classDeclaration.heritageClauses.filter(h => h.token === ts.SyntaxKind.ExtendsKeyword);
                    if (extendsClause.length > 0 && extendsClause[0].types.length > 0) {
                        classDef.extends = new QualifiedName((<ts.Identifier> extendsClause[0].types[0].expression).text);
                    }
                }
                childElement = classDef;
                break;
                
            case ts.SyntaxKind.MethodDeclaration:
                let methodDeclaration = <ts.MethodDeclaration> node;
                childElement = new Method((<ts.Identifier>methodDeclaration.name).text, Visibility.Public);
                break;
        }
        
        if (childElement) {
            currentElement.addElement(childElement);
        }
        
        ts.forEachChild(node, (node) => analyseNode(node, childElement || currentElement));
    }
    
    return module;
}