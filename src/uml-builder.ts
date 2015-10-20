/// <reference path="typings/graphviz/graphviz.d.ts"/>

import * as graphviz from "graphviz";
import { Element, Module, Class, Method, Visibility, QualifiedName } from "./ts-elements";
import { Collections } from "./extensions";

export function buildUml(modules: Module[], outputFilename: string) {
	let g: graphviz.Graph = graphviz.digraph("G");

	const FontSizeKey = "fontsize";
	const FontSize = 10;
	const FontNameKey = "fontname";
	const FontName = "Bitstream Vera Sans";
	
	g.set(FontSizeKey, FontSize);
	g.set(FontNameKey, FontName);
	g.setEdgeAttribut(FontSizeKey, FontSize);
	g.setEdgeAttribut(FontNameKey, FontName);
	g.setNodeAttribut(FontSizeKey, FontSize);
	g.setNodeAttribut(FontNameKey, FontName);
	g.setNodeAttribut("shape", "record");
	
	modules.forEach(module => {
		buildModule(module, g, "", 0);
	});
	 
	// Print the dot script
	console.log(g.to_dot()); 
	
	// Set GraphViz path (if not in your path)
	g.setGraphVizPath("/usr/local/bin");
	
	// Generate a PNG output
	g.output("png", outputFilename);
	
	console.log("done");
}

function buildModule(module: Module, g: graphviz.Graph, path: string, level: number) {
	const ModulePrefix = "cluster_";
	
	let moduleId = getGraphNodeId(path, module.name);
	let cluster = g.addCluster(ModulePrefix + moduleId);
	
	cluster.set("label", (module.visibility !== Visibility.Public ? visibilityToString(module.visibility) + " " : "") + module.name);
	cluster.set("style", "filled");
	cluster.set("color", "gray" + Math.max(40, (95 - (level * 6))));
	
	if (module.methods.length > 0) {
		var classNode = g.addNode(
			getGraphNodeId(path, module.name),
			{ 
				"label": "{(" + module.name + ")|" + getMethodsSignature(module.methods) + "}",
			});
	}
	
	module.modules.forEach(childModule => {
		buildModule(childModule, cluster, moduleId, level + 1);
	});
	
	module.classes.forEach(childClass => {
		buildClass(childClass, cluster, moduleId);
	});
	
	Collections.distinct(module.dependencies, d => d.name).forEach(d => {
		g.addEdge(module.name, getGraphNodeId("", d.name));
	});
}

function buildClass(classDef: Class, g: graphviz.Graph, path: string) {
	var classNode = g.addNode(
		getGraphNodeId(path, classDef.name),
		{ 
			"label": "{" + classDef.name + "|" + getMethodsSignature(classDef.methods) + "}",
		});
	
	if(classDef.extends) {
		g.addEdge(classNode, classDef.extends.parts.reduce((path, name) => getGraphNodeId(path, name), ""));
	}
}

function getMethodsSignature(methods: Method[]): string {
	return methods.filter(m => m.visibility == Visibility.Public)
		.map(m => getMethodSignature(m) + "\\l")
		.reduce((prev, curr) => prev + curr, "");
}


function getMethodSignature(method: Method): string {
	return visibilityToString(method.visibility) + " " + method.name + "()";
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

function getGraphNodeId(path: string, name: string): string {
	return ((path ? path + "÷" : "") + name).replace(/\//g, "|");
}