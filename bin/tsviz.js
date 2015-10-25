#! /usr/bin/env node
var fs_1 = require("fs");
var ts = require("typescript");
var analyser = require("./ts-analyser");
var umlBuilder = require("./uml-builder");
function main(args) {
    var switches = args.filter(function (a) { return a.indexOf("-") === 0; });
    var nonSwitches = args.filter(function (a) { return a.indexOf("-") !== 0; });
    if (nonSwitches.length < 1) {
        console.error("Invalid number of arguments. Usage:\n" +
            "  <switches> <sources filename/directory> <output.png>\n" +
            "Available switches:\n" +
            "  -dependencies: produces a modules' dependencies diagram");
        return;
    }
    var targetPath = nonSwitches.length > 0 ? nonSwitches[0] : "";
    var outputFilename = nonSwitches.length > 1 ? nonSwitches[1] : "diagram.png";
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
        .filter(function (f) { return f.fileName.indexOf("lib.d.ts") === -1; })
        .map(function (sourceFile) { return analyser.collectInformation(program, sourceFile); });
    process.chdir(originalDir);
    if (switches.indexOf("-dependencies") >= 0) {
        umlBuilder.buildUml(modules, outputFilename, true);
    }
    else {
        umlBuilder.buildUml(modules, outputFilename, false);
    }
    console.log("done");
}
main(process.argv.slice(2));
