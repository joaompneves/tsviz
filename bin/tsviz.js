"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var ts = require("typescript");
var analyser = require("./ts-analyser");
var umlBuilder = require("./uml-builder");
function walk(dir, recursive) {
    var results = [];
    var list = fs_1.readdirSync(dir);
    var i = 0;
    (function next() {
        var file = list[i++];
        if (!file) {
            return results;
        }
        file = dir + '/' + file;
        var stat = fs_1.statSync(file);
        if (stat && stat.isDirectory()) {
            if (recursive) {
                results = results.concat(walk(file, recursive));
                next();
            }
        }
        else {
            results.push(file);
            next();
        }
    })();
    return results;
}
function getFiles(targetPath, recursive) {
    if (!fs_1.existsSync(targetPath)) {
        console.error("'" + targetPath + "' does not exist");
        return [];
    }
    var fileNames;
    if (fs_1.lstatSync(targetPath).isDirectory()) {
        fileNames = walk(targetPath, recursive);
    }
    else {
        fileNames = [targetPath];
    }
    return fileNames;
}
function getModules(targetPath, recursive) {
    var originalDir = process.cwd();
    var fileNames = getFiles(targetPath, recursive);
    var compilerOptions = {
        noEmitOnError: true,
        noImplicitAny: true,
        target: 1,
        module: 2
    };
    var compilerHost = ts.createCompilerHost(compilerOptions, true);
    var program = ts.createProgram(fileNames, compilerOptions, compilerHost);
    var modules = program.getSourceFiles()
        .filter(function (f) { return f.fileName.lastIndexOf(".d.ts") !== f.fileName.length - ".d.ts".length; })
        .map(function (sourceFile) { return analyser.collectInformation(program, sourceFile); });
    process.chdir(originalDir);
    console.log("Found " + modules.length + " module(s)");
    return modules;
}
function createGraph(targetPath, outputFilename, dependenciesOnly, recursive) {
    var modules = getModules(targetPath, recursive);
    umlBuilder.buildUml(modules, outputFilename, dependenciesOnly);
}
exports.createGraph = createGraph;
function getModulesDependencies(targetPath, recursive) {
    var modules = getModules(targetPath, recursive);
    var outputModules = [];
    modules.sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (module) {
        var uniqueDependencies = {};
        module.dependencies.forEach(function (dependency) {
            uniqueDependencies[dependency.name] = null;
        });
        outputModules.push({
            name: module.name,
            dependencies: Object.keys(uniqueDependencies).sort()
        });
    });
    return outputModules;
}
exports.getModulesDependencies = getModulesDependencies;
