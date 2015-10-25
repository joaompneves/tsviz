var ts = require("typescript");
var path = require("path");
var ts_elements_1 = require("./ts-elements");
var extensions_1 = require("./extensions");
function collectInformation(program, sourceFile) {
    var typeChecker = program.getTypeChecker();
    var filename = sourceFile.fileName;
    filename = filename.substr(0, filename.lastIndexOf("."));
    var moduleName = path.basename(filename);
    var module = new ts_elements_1.Module(moduleName, null);
    module.path = path.dirname(filename);
    analyseNode(sourceFile, module);
    function analyseNode(node, currentElement) {
        var childElement;
        var skipChildren = false;
        switch (node.kind) {
            case 216:
                var moduleDeclaration = node;
                childElement = new ts_elements_1.Module(moduleDeclaration.name.text, currentElement, getVisibility(node));
                break;
            case 220:
                var importDeclaration = node;
                var moduleName_1 = importDeclaration.moduleSpecifier.text;
                childElement = new ts_elements_1.ImportedModule(moduleName_1, currentElement);
                break;
            case 212:
                var classDeclaration = node;
                var classDef = new ts_elements_1.Class(classDeclaration.name.text, currentElement, getVisibility(node));
                if (classDeclaration.heritageClauses) {
                    var extendsClause = extensions_1.Collections.firstOrDefault(classDeclaration.heritageClauses, function (c) { return c.token === 81; });
                    if (extendsClause && extendsClause.types.length > 0) {
                        classDef.extends = getFullyQualifiedName(extendsClause.types[0]);
                    }
                }
                childElement = classDef;
                break;
            case 143:
            case 144:
                var propertyDeclaration = node;
                var property = new ts_elements_1.Property(propertyDeclaration.name.text, currentElement, getVisibility(node));
                if (node.kind === 143) {
                    property.hasGetter = true;
                }
                else {
                    property.hasSetter = true;
                }
                childElement = property;
                skipChildren = true;
                break;
            case 141:
            case 211:
                var functionDeclaration = node;
                childElement = new ts_elements_1.Method(functionDeclaration.name.text, currentElement, getVisibility(node));
                skipChildren = true;
                break;
        }
        if (childElement) {
            currentElement.addElement(childElement);
        }
        if (skipChildren) {
            return;
        }
        ts.forEachChild(node, function (node) { return analyseNode(node, childElement || currentElement); });
    }
    function getFullyQualifiedName(expression) {
        var symbol = typeChecker.getSymbolAtLocation(expression.expression);
        if (symbol) {
            var nameParts = typeChecker.getFullyQualifiedName(symbol).split(".");
            if (symbol.declarations.length > 0 && symbol.declarations[0].kind === 224) {
                var importSpecifier = symbol.declarations[0];
                var moduleName_2 = importSpecifier.parent.parent.parent.moduleSpecifier.text;
                nameParts.unshift(moduleName_2);
            }
            else {
                if (nameParts.length > 0 && nameParts[0].indexOf("\"") === 0) {
                    var moduleName_3 = nameParts[0].replace(/\"/g, "");
                    nameParts[0] = moduleName_3;
                }
            }
            return new ts_elements_1.QualifiedName(nameParts);
        }
        console.warn("Unable to resolve type: '" + expression.getText() + "'");
        return new ts_elements_1.QualifiedName(["unknown?"]);
    }
    function getVisibility(node) {
        if (node.modifiers) {
            switch (node.modifiers.flags) {
                case 64:
                    return ts_elements_1.Visibility.Protected;
                case 32:
                    return ts_elements_1.Visibility.Private;
                case 16:
                case 1:
                    return ts_elements_1.Visibility.Public;
            }
        }
        switch (node.parent.kind) {
            case 212:
                return ts_elements_1.Visibility.Public;
            case 216:
                return ts_elements_1.Visibility.Private;
        }
        return ts_elements_1.Visibility.Private;
    }
    return module;
}
exports.collectInformation = collectInformation;
