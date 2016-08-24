/// <reference path="typings/node/node.d.ts" />

import { readdirSync, lstatSync, existsSync } from "fs";
import * as ts from "typescript";
import { Module } from "./ts-elements";
import * as analyser from "./ts-analyser"; 
import * as umlBuilder from "./uml-builder";

export interface OutputModule {
	name: string;
	dependencies: string[];
}

function getModules(targetPath: string): Module[] {
    if (!existsSync(targetPath)) {
        console.error("'" + targetPath + "' does not exist");
        return [];
    }
    
    let fileNames: string[];
    let originalDir = process.cwd();
    
    if (lstatSync(targetPath).isDirectory()) {
        fileNames = readdirSync(targetPath);
        process.chdir(targetPath); // change to the sources dir to simplify module name resolution
    } else {
        fileNames = [ targetPath ];   
    }
    
    const compilerOptions: ts.CompilerOptions = {
        noEmitOnError: true, 
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5, 
        module: ts.ModuleKind.AMD
    };
    
    let compilerHost = ts.createCompilerHost(compilerOptions, /*setParentNodes */ true);
    let program = ts.createProgram(fileNames, compilerOptions, compilerHost);
    
    // analyse sources
    let modules = program.getSourceFiles()
        .filter(f => f.fileName.lastIndexOf(".d.ts") !== f.fileName.length - ".d.ts".length)
        .map(sourceFile => analyser.collectInformation(program, sourceFile));
    
    process.chdir(originalDir); // go back to the original dir
    
    console.log("Found " + modules.length + " module(s)");

    return modules;
}

export function createGraph(targetPath: string, outputFilename: string, dependenciesOnly: boolean) {
    let modules = getModules(targetPath);
    umlBuilder.buildUml(modules, outputFilename, dependenciesOnly);
}

export function getModulesDependencies(targetPath: string): OutputModule[] {
    let modules = getModules(targetPath);
    let outputModules: OutputModule[] = [];
	modules.sort((a, b) => a.name.localeCompare(b.name)).forEach(module => {
		let uniqueDependencies: { [name: string]: string } = {};
		module.dependencies.forEach(dependency => {
			uniqueDependencies[dependency.name] = null;
		});
		outputModules.push({
			name: module.name,
			dependencies: Object.keys(uniqueDependencies).sort()
		});
	});
    return outputModules;
}