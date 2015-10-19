/// <reference path="typings/graphviz/graphviz.d.ts"/>

import * as graphviz from "graphviz";
import { Element, Module, Class, Method, Visibility, QualifiedName } from "./ts-elements";

export function buildUml(modules: Module[], outputFilename: string) {
	let g: graphviz.Graph = graphviz.digraph("G");

	modules.forEach(module => {
		buildModule(module, g, "");
	});
	 
	// Print the dot script
	console.log(g.to_dot()); 
	
	// Set GraphViz path (if not in your path)
	g.setGraphVizPath("/usr/local/bin");
	
	// Generate a PNG output
	g.output("png", outputFilename);
	
	console.log("done");
}

function buildModule(module: Module, g: graphviz.Graph, path: string) {
	let moduleId = getGraphNodeId(path, module.name);
	let cluster = g.addCluster("cluster_" + moduleId);
	
	cluster.set("label", module.name);
	cluster.set("style", "filled");
	cluster.set("color", "lightgrey");
		
	module.modules.forEach(childModule => {
		buildModule(childModule, cluster, moduleId);
	});
	
	module.classes.forEach(childClass => {
		buildClass(childClass, cluster, moduleId);
	});
}

function buildClass(classDef: Class, g: graphviz.Graph, path: string) {
	let  methodsSignature = classDef.methods
		.filter(m => m.visibility == Visibility.Public)
		.map(m => getMethodSignature(m) + "\\l")
		.reduce((prev, curr) => prev + curr, "");
		
	var classNode = g.addNode(
		getGraphNodeId(path, classDef.name),
		{ 
			"label": "{" + classDef.name + "|" + methodsSignature + "}",
			"shape" : "record",
			"fontname": "Bitstream Vera Sans",
			"fontsize": "10"
		});
	
	if(classDef.extends) {
		g.addEdge(classNode, classDef.extends.parts.reduce((path, name) => getGraphNodeId(path, name), ""));
	}
}

function getMethodSignature(method: Method): string {
	return visibilityToString(method.visibility) + " " + method.name + "()";
}

function visibilityToString(visibility: Visibility) {
	switch(visibility) {
		case Visibility.Public:
			return "+";
		case Visibility.Protected:
			return "-";
		case Visibility.Private:
			return "-";		
	}
}

function getGraphNodeId(path: string, name: string): string {
	return (path ? path + "÷" : "") + name;
}
