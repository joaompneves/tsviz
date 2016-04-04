"use strict";
var tsviz = require("./tsviz");
function main(args) {
    var switches = args.filter(function (a) { return a.indexOf("-") === 0; });
    var nonSwitches = args.filter(function (a) { return a.indexOf("-") !== 0; });
    if (nonSwitches.length < 1) {
        console.error("Invalid number of arguments. Usage:\n" +
            "  <switches> <sources filename/directory> <output.png>\n" +
            "Available switches:\n" +
            "  -dependencies: produces the modules' dependencies diagram");
        return;
    }
    var targetPath = nonSwitches.length > 0 ? nonSwitches[0] : "";
    var outputFilename = nonSwitches.length > 1 ? nonSwitches[1] : "diagram.png";
    var dependenciesOnly = switches.indexOf("-dependencies") >= 0;
    tsviz.createGraph(targetPath, outputFilename, dependenciesOnly);
    console.log("done");
}
function run() {
    main(process.argv.slice(2));
}
exports.run = run;
