import { getModules } from "tsviz";
import { buildUml } from "./uml-builder";

function main(args: string[]) {
    const switches = args.filter(a => a.indexOf("-") === 0);
    const nonSwitches = args.filter(a => a.indexOf("-") !== 0);
    
    if (nonSwitches.length < 1) {
        console.error(
            "Invalid number of arguments. Usage:\n" + 
            "  <switches> <sources filename/directory> <output.png>\n" +
            "Available switches:\n" +
            "  -d, dependencies: produces the modules' dependencies diagram\n" + 
            "  -r, recursive: include files in subdirectories (must be non-cyclic)" +
            "  -svg: output an svg file");
        return;
    }
    
    const targetPath = nonSwitches.length > 0 ? nonSwitches[0] : "";
    const outputFilename = nonSwitches.length > 1 ? nonSwitches[1] : "diagram.png";

    const dependenciesOnly = switches.indexOf("-d") >= 0 || switches.indexOf("-dependencies") >= 0; // dependencies or uml?
    const recursive = switches.indexOf("-r") >= 0 || switches.indexOf("-recursive") >= 0;
    const svgOutput = switches.indexOf("-svg") >= 0;

    try {
        createGraph(targetPath, outputFilename, dependenciesOnly, recursive, svgOutput);

        console.log("Done");
    } catch (e) {
        console.error(e);
    }
}

function createGraph(targetPath: string, outputFilename: string, dependenciesOnly: boolean, recursive: boolean, svgOutput: boolean) {
    const modules = getModules(targetPath, recursive);
    buildUml(modules, outputFilename, dependenciesOnly, svgOutput);
}

export function run() {
    main(process.argv.slice(2));
}
