# tsviz
![npm](https://img.shields.io/npm/v/tsviz?label=tsviz)
![npm](https://img.shields.io/npm/v/tsviz-cli?label=tsviz-cli)

This simple tool creates a UML diagram from typescript modules.

![diagram](https://github.com/joaompneves/tsviz/blob/master/samples/diagram.png)

## Installation

```bash
npm install -g tsviz-cli
```
You also need to install [GraphViz](http://www.graphviz.org/download/), including correctly added it to your PATH.

## Usage

### Cli
```
tsviz-cli <switches> <sources filename/directory> <output.png>

Available switches:
  -d, dependencies: produces the modules dependencies diagram
  -svg: output an svg file

```

In order to create a diagram for an entire project you simply type:

```bash
tsviz-cli samples/ diagram.png
```

### Library
You may also consume tsviz npm library in your project to obtain a digest of modules, classes, methods, etc, of a given typescript project.

```bash
npm install tsviz
```

```typescript
import { getModules } from "tsviz";

const modules = getModules("path/where/your/tsconfig/lives");
...
```
