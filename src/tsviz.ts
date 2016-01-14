#! /usr/bin/env node

/// <reference path="typings/node/node.d.ts" />

import { readFileSync, readdirSync, lstatSync, existsSync } from "fs";
import * as path from "path";
import * as ts from "typescript";
import * as analyser from "./ts-analyser"; 
import * as umlBuilder from "./uml-builder";

function main(args: string[]) {
    let switches = args.filter(a => a.indexOf("-") === 0);
    let nonSwitches = args.filter(a => a.indexOf("-") !== 0);
    
    if (nonSwitches.length < 1) {
        console.error(
            "Invalid number of arguments. Usage:\n" + 
            "  <switches> <sources filename/directory> <output.png>\n" +
            "Available switches:\n" +
            "  -dependencies: produces a modules' dependencies diagram");
        return;
    }
    
    let targetPath = nonSwitches.length > 0 ? nonSwitches[0] : "";
    let outputFilename = nonSwitches.length > 1 ? nonSwitches[1] : "diagram.png";
    
    if (!existsSync(targetPath)) {
        console.error("'" + targetPath + "' does not exist");
        return;
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
    
    if(switches.indexOf("-dependencies") >= 0) {
        umlBuilder.buildUml(modules, outputFilename, true); // dependencies diagram
    } else {
        umlBuilder.buildUml(modules, outputFilename, false); // uml diagram
    }
    
    console.log("done");
}

main(process.argv.slice(2));