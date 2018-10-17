"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphviz = require("graphviz");
var ts_elements_1 = require("./ts-elements");
var extensions_1 = require("./extensions");
var fs = require("fs");
function buildUml(modules, outputFilename, dependenciesOnly) {
    var g = graphviz.digraph("G");
    var FontSizeKey = "fontsize";
    var FontSize = 12;
    var FontNameKey = "fontname";
    var FontName = "Verdana";
    g.set(FontSizeKey, FontSize);
    g.set(FontNameKey, FontName);
    g.setEdgeAttribut(FontSizeKey, FontSize);
    g.setEdgeAttribut(FontNameKey, FontName);
    g.setNodeAttribut(FontSizeKey, FontSize);
    g.setNodeAttribut(FontNameKey, FontName);
    g.setNodeAttribut("shape", "record");
    modules.forEach(function (module) {
        buildModule(module, g, module.path, 0, dependenciesOnly);
    });
    if (process.platform === "win32") {
        var pathVariable = process.env["PATH"];
        if (pathVariable.indexOf("Graphviz") === -1) {
            console.warn("Could not find Graphviz in PATH.");
        }
    }
    var configFile = process.cwd() + "/tsviz-config.json";
    var config = { type: "png" };
    if (fs.existsSync(configFile)) {
        console.info('using config file:+', configFile);
        config = JSON.parse(fs.readFileSync(configFile).toString());
    }
    if (dependenciesOnly) {
        if (!config.G) {
            config.G = {};
        }
        if (!config.G.rankdir) {
            config.G.rankdir = "LR";
        }
    }
    g.output(config, outputFilename);
}
exports.buildUml = buildUml;
function buildModule(module, g, path, level, dependenciesOnly) {
    var ModulePrefix = "cluster_";
    var moduleId = getGraphNodeId(path, module.name);
    var cluster = g.addCluster("\"" + ModulePrefix + moduleId + "\"");
    cluster.set("label", (module.visibility !== ts_elements_1.Visibility.Public ? visibilityToString(module.visibility) + " " : "") + module.name);
    cluster.set("style", "filled");
    cluster.set("color", "gray" + Math.max(40, (95 - (level * 6))));
    if (dependenciesOnly) {
        extensions_1.Collections.distinct(module.dependencies, function (d) { return d.name; }).forEach(function (d) {
            g.addEdge(module.name, getGraphNodeId("", d.name));
        });
    }
    else {
        var moduleMethods = combineSignatures(module.methods, getMethodSignature);
        if (moduleMethods) {
            cluster.addNode(getGraphNodeId(path, module.name), {
                "label": moduleMethods,
                "shape": "none"
            });
        }
        module.modules.forEach(function (childModule) {
            buildModule(childModule, cluster, moduleId, level + 1, false);
        });
        module.classes.forEach(function (childClass) {
            buildClass(childClass, cluster, moduleId);
        });
    }
}
function buildClass(classDef, g, path) {
    var methodsSignatures = combineSignatures(classDef.methods, getMethodSignature);
    var propertiesSignatures = combineSignatures(classDef.properties, getPropertySignature);
    var classNode = g.addNode(getGraphNodeId(path, classDef.name), {
        "label": "{" + [classDef.name, methodsSignatures, propertiesSignatures].filter(function (e) { return e.length > 0; }).join("|") + "}"
    });
    if (classDef.extends) {
        g.addEdge(classNode, classDef.extends.parts.reduce(function (path, name) { return getGraphNodeId(path, name); }, ""), { "arrowhead": "onormal" });
    }
}
function combineSignatures(elements, map) {
    return elements.filter(function (e) { return e.visibility == ts_elements_1.Visibility.Public; })
        .map(function (e) { return map(e) + "\\l"; })
        .join("");
}
function getMethodSignature(method) {
    return [
        visibilityToString(method.visibility),
        lifetimeToString(method.lifetime),
        getName(method) + "()"
    ].join(" ");
}
function getPropertySignature(property) {
    return [
        visibilityToString(property.visibility),
        lifetimeToString(property.lifetime),
        [
            (property.hasGetter ? "get" : null),
            (property.hasSetter ? "set" : null)
        ].filter(function (v) { return v !== null; }).join("/"),
        getName(property)
    ].join(" ");
}
function visibilityToString(visibility) {
    switch (visibility) {
        case ts_elements_1.Visibility.Public:
            return "+";
        case ts_elements_1.Visibility.Protected:
            return "~";
        case ts_elements_1.Visibility.Private:
            return "-";
    }
}
function lifetimeToString(lifetime) {
    return lifetime === ts_elements_1.Lifetime.Static ? "\\<static\\>" : "";
}
function getName(element) {
    return element.name;
}
function getGraphNodeId(path, name) {
    var result = ((path ? path + "/" : "") + name).replace(/\//g, "|");
    return result;
}
