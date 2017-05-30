# tsviz
> This simple tool creates a UML diagram from typescript modules.

![alt tag](https://raw.githubusercontent.com/joaompneves/tsviz/master/samples/diagram.png)

## Installation

```bash
$ npm install -g tsviz
```
You also need to install [GraphViz](http://www.graphviz.org/Download.php), including correctly added it to your OS' PATH.

## Usage

In order to create a diagram for an entire project you simply type:

```bash
$ tsviz samples/ diagram.png
```

### Arguments
* `-dependencies`
  Produces a diagram with the dependencies between modules.
* `-recursive`
  Include files (typescript modules) in subdirectories (must be non-cyclic).
* `-svg`
  Prduces a SVG output file.
