import { dirname, resolve } from "path";
import * as ts from "typescript";
import { Module } from "./ts-elements";
import * as analyser from "./ts-analyser"; 

export interface OutputModule {
    name: string;
    dependencies: string[];
}

export function getModules(targetPath: string, recursive: boolean): Module[] {
    targetPath = resolve(targetPath);
    const fileNames = ts.sys.readDirectory(targetPath);
    
    const configFileName = ts.findConfigFile(targetPath, ts.sys.fileExists);
    const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
    const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dirname(configFileName));
    
    // analyse sources
    const dtsExtension = ".d.ts";
    const compilerHost = ts.createCompilerHost(config.options, /*setParentNodes */ true);
    const program = ts.createProgram(fileNames, config.options, compilerHost);
    const modules = program.getSourceFiles()
        .filter(f => !f.fileName.endsWith(dtsExtension))
        .map(sourceFile => analyser.collectInformation(sourceFile, program, compilerHost));
    
    // console.log("Found " + modules.length + " module(s)");

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