import { readdirSync, lstatSync, existsSync, statSync } from "fs";
import { join, isAbsolute, dirname } from "path";
import * as ts from "typescript";
import { Module } from "./ts-elements";
import * as analyser from "./ts-analyser"; 

export interface OutputModule {
    name: string;
    dependencies: string[];
}

function getDirectoryFiles(dirPath: string, recursive: boolean) {
    function innerGetAllFiles(dirPath: string, allFiles: string[]) {
        const files = readdirSync(dirPath);
        files.forEach((file) => {
            const path = join(dirPath, file);
            if (recursive && statSync(path).isDirectory()) {
                innerGetAllFiles(path, allFiles);
            } else {
                allFiles.push(path);
            }
        });
      
        return allFiles
    }

    return innerGetAllFiles(dirPath, []);
}

function getFiles(targetPath: string, recursive: boolean): string[] {
    if (!existsSync(targetPath)) {
        throw new Error("'" + targetPath + "' does not exist");
    }

    if (lstatSync(targetPath).isDirectory()) {
        return getDirectoryFiles(targetPath, recursive);
    }
    
    return [targetPath];
}

export function getModules(targetPath: string, recursive: boolean): Module[] {
    targetPath = isAbsolute(targetPath) ? targetPath : join(process.cwd(), targetPath);
    const fileNames = getFiles(targetPath, recursive);
    const compilerOptions: ts.CompilerOptions = {
        noEmitOnError: true, 
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5, 
        module: ts.ModuleKind.AMD
    };

    // analyse sources
    const dtsExtension = ".d.ts";
    const compilerHost = ts.createCompilerHost(compilerOptions, /*setParentNodes */ true);
    const program = ts.createProgram(fileNames, compilerOptions, compilerHost);
    const modules = program.getSourceFiles()
        .filter(f => f.fileName.lastIndexOf(dtsExtension) !== f.fileName.length - dtsExtension.length)
        .map(sourceFile => analyser.collectInformation(program, sourceFile));
    
    console.log("Found " + modules.length + " module(s)");

    return modules;
}

export function getModulesDependencies(targetPath: string, recursive: boolean): OutputModule[] {
    const modules = getModules(targetPath, recursive);
    const outputModules: OutputModule[] = [];
    modules.sort((a, b) => a.name.localeCompare(b.name)).forEach(module => {
        const uniqueDependencies = new Set<string>();
        module.dependencies.forEach(dependency => {
            uniqueDependencies.add(dependency.name);
        });
        outputModules.push({
            name: module.name,
            dependencies: Object.keys(uniqueDependencies).sort()
        });
    });
    return outputModules;
}