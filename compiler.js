const fs = require("fs");

let commandmap = {
  load: 1,
  jump: 2,
  sum: 3,
  sub: 4,
  mul: 5,
  div: 6,
  inv: 7,
  and: 8,
  or: 9,
  xor: 10,
  write: 11,
  change: 12,
  shr: 13,
  shl: 14,
  end: 15,
};

let variables = {};

function convertNums(strnum) {
  if (strnum[strnum.length - 1] === "h") return parseInt(strnum, 16);
  else if (strnum[strnum.length - 1] === "b") return parseInt(strnum, 2);
  else if (strnum[strnum.length - 1] === "#") return variables[strnum];
  else return parseInt(strnum);
}

function filtNone(arr) {
  return arr.filter((v) => v);
}

function compile(path, opath) {
  let file = fs.readFileSync(path, "utf-8");
  file += "\n";
  file = file.replace(/\/\/(.*?)\r?\n/gi, "\n");
  let asmcommands = file.split(/\r?\n/);
  asmcommands = filtNone(asmcommands);
  let stream = fs.createWriteStream(opath);
  let commands = [];
  let data = [];
  let addrs = [];
  let memoryaddr = 0;
  let totalsets = 0;
  for (let i = 0; i < asmcommands.length; i++) {
    let [command] = asmcommands[i].split(" ");
    if (command === "set") totalsets += 1;
  }
  for (let i = 0; i < asmcommands.length; i++) {
    if (asmcommands[i] === "end") {
      commands.push(15);
      addrs.push(0);
      continue;
    }
    let [command, ...args] = asmcommands[i].split(" ");
    args = filtNone(args);

    if (command !== "set") {
      commands.push(commandmap[command]);
      if (args[0].endsWith("#")) {
        addrs.push(convertNums(args[0]));
        totalsets += 1;
      } else {
        data.push(convertNums(args[0]));
        addrs.push(asmcommands.length + memoryaddr - totalsets);
      }
    } else {
      variables[args[0]] = asmcommands.length + memoryaddr - totalsets;
      data.push(convertNums(args[1]));
    }
    memoryaddr += 1;
  }

  for (let i = 0; i < commands.length; i++) {
    stream.write(Buffer.alloc(1, commands[i]));
    stream.write(Buffer.alloc(1, addrs[i]));
  }
  for (let i = 0; i < data.length; i++) {
    let datastring = data[i].toString(16);
    stream.write(
      Buffer.alloc(2, "0".repeat(4 - datastring.length) + datastring, "hex")
    );
  }
  console.timeEnd("Compiled");
}

module.exports = compile;

// [ 1, 3, 5, 4, 6 ]
// [ 2, 3, 2, 2, 4 ]
// [ 5, 6, 7, 8, 9 ]
