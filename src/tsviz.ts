/// <reference path="typings/node/node.d.ts" />

import { readFileSync, readdirSync, lstatSync, existsSync } from "fs";
import * as path from "path";
import * as ts from "typescript";
import * as analyser from "./ts-analyser"; 
import * as umlBuilder from "./uml-builder";

function main(args: string[]) {
    if (args.length < 1) {
        console.error("Invalid number of arguments. Usage:\n<sources filename/directory> <output.png>");
        return;
    }
    
    let targetPath = args[0];
    let outputFilename = args.length > 1 ? args[1] : "diagram.png";
    
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
        .filter(f => f.fileName.indexOf("lib.d.ts") === -1)
        .map(sourceFile => analyser.collectInformation(program, sourceFile));
    
    process.chdir(originalDir); // go back to the original dir
    
    umlBuilder.buildUml(modules, outputFilename);
    
    console.log("done");
}

main(process.argv.slice(2));