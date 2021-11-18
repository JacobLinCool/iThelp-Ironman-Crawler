const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "data", "articles.json"), "utf-8"))
    .slice(30, 50)
    .map((x) => {
        return {
            title: x.title,
            content: x.content.substr(0, 100) + "...",
            group: x.group,
            tags: x.tags,
        };
    });

console.log(data);
