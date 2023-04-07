import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from "fs"

import { processDir } from "./process-dir.js"
import { Tree } from "./Tree.tsx"

const main = async () => {

  const rootPath = getInput("root_path") || "./"; // Micro and minimatch do not support paths starting with ./
  const maxDepth = getInput("max_depth") || 9
  const customFileColors = JSON.parse(getInput("file_colors") ||  '{}');
  const colorEncoding = getInput("color_encoding") || "type"
  const excludedPathsString = getInput("excluded_paths") || "node_modules,bower_components,dist,out,build,eject,.next,.netlify,.yarn,.git,.vscode,package-lock.json,yarn.lock"
  const excludedPaths = excludedPathsString.split(",").map(str => str.trim())

  // Read excluded globs from .gitignore
  const excludedGlobs = fs.readFileSync(`${rootPath}.gitignore`, 'utf8').split('\n').filter(line => line !== '' && !line.startsWith('#'));

  const data = await processDir(rootPath, excludedPaths, excludedGlobs);

  const componentCodeString = ReactDOMServer.renderToStaticMarkup(
    <Tree data={data} maxDepth={+maxDepth} colorEncoding={colorEncoding} customFileColors={customFileColors}/>
  );

  const outputFile = getInput("output_file") || "./diagram.svg"

  fs.writeFileSync(outputFile, componentCodeString)

}

function getInput(name) {
  // Read from command line, e.g. node index.js --root_path=[path]
  const arg = process.argv.find(arg => arg.startsWith(`--${name}=`))
  if (arg) {
    return arg.split("=")[1]
  }
};

main()