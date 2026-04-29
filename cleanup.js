const fs = require("fs");
fs.rmSync(
  "/Users/shishirshrivastava/Documents/WanderLust/.git/rebase-merge",
  { recursive: true, force: true }
);
console.log("done");
