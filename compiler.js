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
};

function compile(path, opath) {
  let file = fs.readFileSync(path, "utf-8");
  file += "\n";
  file = file.replace(/\/\/(.*?)\r?\n/gi, "\n");
  let asmcommands = file.split(/\r?\n/);
  let stream = fs.createWriteStream(opath);
  let commands = [];
  let data = [];
  let addrs = [];
  for (let asmcommand of asmcommands) {
    if (!asmcommand) continue;
    let [command, datac] = asmcommand.split(" ");
    if (datac[datac.length - 1] === "h") data.push(parseInt(datac, 16));
    else if (datac[datac.length - 1] === "b") data.push(parseInt(datac, 2));
    else data.push(parseInt(datac));
    commands.push(commandmap[command]);
  }
  for (let i = 0; i < commands.length; i++) {
    addrs.push(commands.length + i);
  }
  for (let i = 0; i < commands.length; i++) {
    stream.write(Buffer.alloc(1, commands[i]));
    stream.write(Buffer.alloc(1, addrs[i]));
  }
  for (let i = 0; i < commands.length; i++) {
    let datastring = data[i].toString(16);
    stream.write(
      Buffer.alloc(2, "0".repeat(4 - datastring.length) + datastring, "hex")
    );
  }
  console.timeEnd("Compiled");
}

module.exports = compile;
