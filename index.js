#!/usr/bin/env node
const { Command } = require("commander");
const compiler = require("./compiler");

const program = new Command();
program.version(require("./package.json").version);

console.time("Compiled");
program
  .command("compile <filepath>")
  .description("compiles your assembly code to bytecode")
  .option("-o, --output <path>", "Output file", "assembly.neo")
  .action((filepath, options) => {
    compiler(filepath, options.output);
  });

program.parse(process.argv);
