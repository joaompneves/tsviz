/// <reference path="typings/graphviz/graphviz.d.ts"/>

import * as graphviz from "graphviz";
import { Module, Class, Method, Visibility } from "./ts-elements";

let id = 0;

export function buildUml(modules: Module[], outputFilename: string) {
	let g: graphviz.Graph = graphviz.digraph("G");
	
	modules.forEach(module => {
		let cluster = g.addCluster("module" + id++);
		cluster.set("label", module.name);
		cluster.set("style", "filled");
		cluster.set("color", "lightgrey");
		module.classes.forEach(childClass => buildClass(childClass, cluster));
	});
	 
	// Print the dot script
	console.log(g.to_dot()); 
	
	// Set GraphViz path (if not in your path)
	g.setGraphVizPath("/usr/local/bin");
	
	// Generate a PNG output
	g.output("png", outputFilename);
	
	console.log("done");
}

function buildClass(classDef: Class, g: graphviz.Graph) {
	let  methodsSignature = classDef.methods
		.filter(m => m.visibility == Visibility.Public)
		.map(m => getMethodSignature(m) + "\\l")
		.reduce((prev, curr) => prev + curr, "");
		
	var classNode = g.addNode(
		classDef.name,
		{ 
			"label": "{" + classDef.name + "|" + methodsSignature + "}",
			"shape" : "record",
			"fontname": "Bitstream Vera Sans",
			"fontsize": "10"
		});
	
	if(classDef.extends) {
		g.addEdge(classNode, classDef.extends.fullyQualifiedName);
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
