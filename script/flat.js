const fs = require("fs");
const path = require("path");
const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });

const data_root = path.resolve(__dirname, "..", "data");

const folders = fs.readdirSync(data_root).filter((folder) => folder.match(/^\d{4}$/));

main();

async function main() {
    let folder = null;
    while (true) {
        console.log("Please select a folder to convert json to txt: ");
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
    const source_path = path.resolve(folder_path, "article.json");

    if (fs.existsSync(source_path)) {
        const source = JSON.parse(fs.readFileSync(source_path));

        let text = "";
        for (let i = 0; i < source.length; i++) {
            let content = source[i].content;

            content = content
                .replace(/[<>]/g, "") // remove html tags
                .replace(/&/g, "") // remove reference escapes
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x26]/g, "") // remove ansi escapes
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .join(" ");

            text += `${content}\n\n`;
        }

        console.log(`${comma(text.length)} characters.`);

        const target_path = path.resolve(folder_path, "article.txt");
        fs.writeFileSync(target_path, text);

        console.log("Converted.", target_path);
    } else {
        console.log(`Source file not found.`);
    }

    process.exit(0);
}

function ask(question = "") {
    return new Promise((resolve) => readline.question(question, resolve));
}

function comma(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
