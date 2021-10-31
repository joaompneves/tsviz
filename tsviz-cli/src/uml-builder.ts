import * as graphviz from "graphviz";
import { Element, Module, Class, Method, Property, Visibility, Lifetime } from "tsviz";
import { Collections } from "./collections-extensions";

export function buildUml(modules: Module[], outputFilename: string, dependenciesOnly: boolean, svgOutput: boolean) {
    const g: graphviz.Graph = graphviz.digraph("G");

    const fontSizeKey = "fontsize";
    const fontSize = 12;
    const fontNameKey = "fontname";
    const fontName = "Verdana";

    // set diagram default styles
    g.set(fontSizeKey, fontSize);
    g.set(fontNameKey, fontName);
    g.setEdgeAttribut(fontSizeKey, fontSize);
    g.setEdgeAttribut(fontNameKey, fontName);
    g.setNodeAttribut(fontSizeKey, fontSize);
    g.setNodeAttribut(fontNameKey, fontName);
    g.setNodeAttribut("shape", "record");

    modules.forEach(module => {
        buildModule(module, g, module.path, 0, dependenciesOnly);
    });

    if (process.platform === "win32") {
        const pathVariable = process.env["PATH"] as string;
        if (pathVariable.indexOf("Graphviz") === -1) {
            console.warn("Could not find Graphviz in PATH.");
        }
    }

    // Generate a PNG/SVG output
    g.output(svgOutput ? "svg" : "png", outputFilename);
}

function buildModule(module: Module, g: graphviz.Graph, path: string, level: number, dependenciesOnly: boolean) {
    const ModulePrefix = "cluster_";

    const moduleId = getGraphNodeId(path, module.name);
    const cluster = g.addCluster("\"" + ModulePrefix + moduleId + "\"");

    cluster.set("label", (module.visibility !== Visibility.Public ? visibilityToString(module.visibility) + " " : "") + module.name);
    cluster.set("style", "filled");
    cluster.set("color", "gray" + Math.max(40, (95 - (level * 6))));

    if (dependenciesOnly) {
        Collections.distinct(module.dependencies, d => d.name).forEach(d => {
            g.addEdge(module.name, getGraphNodeId("", d.name));
        });
    } else {
        const moduleMethods = combineSignatures(module.methods, getMethodSignature);
        if (moduleMethods) {
            cluster.addNode(
                getGraphNodeId(path, module.name),
                {
                    "label": moduleMethods,
                    "shape": "none"
                });
        }

        module.modules.forEach(childModule => {
            buildModule(childModule, cluster, moduleId, level + 1, false);
        });

        module.classes.forEach(childClass => {
            buildClass(childClass, cluster, moduleId);
        });
    }
}

function buildClass(classDef: Class, g: graphviz.Graph, path: string) {
    const methodsSignatures = combineSignatures(classDef.methods, getMethodSignature);
    const propertiesSignatures = combineSignatures(classDef.properties, getPropertySignature);

    const classNode = g.addNode(
        getGraphNodeId(path, classDef.name),
        {
            "label": "{" + [ classDef.name, methodsSignatures, propertiesSignatures].filter(e => e.length > 0).join("|") + "}"
        });

    if(classDef.extends) {
        // add inheritance arrow
        g.addEdge(
            classNode,
            classDef.extends.parts.reduce((path, name) => getGraphNodeId(path, name), ""),
            { "arrowhead": "onormal" });
    }
}

function combineSignatures<T extends Element>(elements: T[], map: (e: T) => string): string {
    return elements.filter(e => e.visibility == Visibility.Public)
        .map(e => map(e) + "\\l")
        .join("");
}

function getMethodSignature(method: Method): string {
    return [
        visibilityToString(method.visibility),
        lifetimeToString(method.lifetime),
        getName(method) + "()"
    ].join(" ");
}

function getPropertySignature(property: Property): string {
    return [
        visibilityToString(property.visibility),
        lifetimeToString(property.lifetime),
        [
            (property.hasGetter ? "get" : null),
            (property.hasSetter ? "set" : null)
        ].filter(v => v !== null).join("/"),
        getName(property)
    ].join(" ");
}

function visibilityToString(visibility: Visibility) {
    switch(visibility) {
        case Visibility.Public:
            return "+";
        case Visibility.Protected:
            return "~";
        case Visibility.Private:
            return "-";
    }
}

function lifetimeToString(lifetime: Lifetime) {
    return lifetime === Lifetime.Static ? "\\<static\\>" : "";
}

function getName(element: Element) {
    return element.name;
}

function getGraphNodeId(path: string, name: string): string {
    const result = ((path ? path + "/" : "") + name).replace(/\//g, "|");
    return result;
}
