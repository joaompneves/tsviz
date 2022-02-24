import { dirname, resolve } from "path";
import * as ts from "typescript";
import { Module } from "./ts-elements";
import * as analyser from "./ts-analyser"; 

export interface OutputModule {
    name: string;
    dependencies: string[];
}

function readConfigOptionsFrom(targetPath: string): ts.CompilerOptions {
    const configFileName = ts.findConfigFile(targetPath, ts.sys.fileExists);
    if (configFileName) {
        const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
        return ts.parseJsonConfigFileContent(configFile.config, ts.sys, dirname(configFileName)).options;
    }

    console.warn(`Tsconfig file not found in "${targetPath}". Using defaults.`);

    const defaultCompilerOptions: ts.CompilerOptions = {
        noEmitOnError: true, 
        target: ts.ScriptTarget.ES5, 
        module: ts.ModuleKind.AMD
    };
    return defaultCompilerOptions;
}

export function getModules(targetPath: string): Module[] {
    targetPath = resolve(targetPath);

    const fileNames = ts.sys.readDirectory(targetPath);
    const options = readConfigOptionsFrom(targetPath);
    
    // analyse sources
    const dtsExtension = ".d.ts";
    const compilerHost = ts.createCompilerHost(options, /*setParentNodes */ true);
    const program = ts.createProgram(fileNames, options, compilerHost);
    const modules = program.getSourceFiles()
        .filter(f => !f.fileName.endsWith(dtsExtension) && (f.fileName.endsWith(".ts") || f.fileName.endsWith(".tsx")))
        .map(sourceFile => analyser.collectInformation(sourceFile, program, compilerHost));

    return modules;
}

export function getModulesDependencies(targetPath: string): OutputModule[] {
    const modules = getModules(targetPath);
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