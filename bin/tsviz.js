var fs_1 = require("fs");
var ts = require("typescript");
var analyser = require("./ts-analyser");
var umlBuilder = require("./uml-builder");
function getModules(targetPath) {
    if (!fs_1.existsSync(targetPath)) {
        console.error("'" + targetPath + "' does not exist");
        return;
    }
    var fileNames;
    var originalDir = process.cwd();
    if (fs_1.lstatSync(targetPath).isDirectory()) {
        fileNames = fs_1.readdirSync(targetPath);
        process.chdir(targetPath);
    }
    else {
        fileNames = [targetPath];
    }
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
    return modules;
}
function createGraph(targetPath, outputFilename, dependenciesOnly) {
    var modules = getModules(targetPath);
    umlBuilder.buildUml(modules, outputFilename, dependenciesOnly);
}
exports.createGraph = createGraph;
function getModulesDependencies(targetPath) {
    var modules = getModules(targetPath);
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
