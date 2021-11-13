const crawlList = require("./list");
const crawlArticle = require("./article");

main();

async function main() {
    require("./preflight");

    if (process.argv.length < 3) process.argv.push("all");

    if (process.argv.includes("list") || process.argv.includes("all")) {
        await crawlList();
    }

    if (process.argv.includes("article") || process.argv.includes("all")) {
        await crawlArticle();
    }
}
