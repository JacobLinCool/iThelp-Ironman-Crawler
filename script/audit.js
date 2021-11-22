const fs = require("fs");
const path = require("path");
const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });

const data_root = path.resolve(__dirname, "..", "data");

const folders = fs.readdirSync(data_root).filter((folder) => folder.match(/^\d{4}$/));

main();

async function main() {
    let folder = null;
    while (true) {
        console.log("Please select a folder to audit: ");
        for (const folder of folders) {
            console.log(`${folder}`);
        }

        folder = await ask(">> ");
        if (folders.includes(folder)) {
            break;
        }

        console.log("Invalid folder name.");
    }

    const folder_path = path.resolve(data_root, folder);
    const list_path = path.resolve(folder_path, "list.json");
    const article_path = path.resolve(folder_path, "article.json");

    console.log("===\nLIST FILE");
    if (fs.existsSync(list_path)) {
        const list = JSON.parse(fs.readFileSync(list_path));
        console.log(`LINKS: ${comma(list.length)}`);
        console.log(`FILE SIZE: ${(fs.statSync(list_path).size / 1024).toFixed(2)} KB`);
    } else {
        console.log(`List file not found.`);
    }

    console.log("===\nARTICLE FILE");
    if (fs.existsSync(article_path)) {
        const article = JSON.parse(fs.readFileSync(article_path));
        console.log(`ARTICLES: ${comma(article.length)}`);
        console.log(`CHARACTERS: ${comma(article.reduce((a, b) => a + b.content.length, 0))}`);
        console.log(`FILE SIZE: ${(fs.statSync(article_path).size / 1024).toFixed(2)} KB`);
    } else {
        console.log(`Article file not found.`);
    }

    process.exit(0);
}

function ask(question = "") {
    return new Promise((resolve) => readline.question(question, resolve));
}

function comma(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
