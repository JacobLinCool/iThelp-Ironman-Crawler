const fs = require("fs");
const path = require("path");

const data = fs.readFileSync(
  path.resolve(__dirname, "..", "data", "articles.json"),
  "utf-8"
);

const text = JSON.parse(data).map((d) => d.content).join("\n\n---\n\n");

fs.writeFileSync(path.resolve(__dirname, "..", "data", "articles.txt"), text);
