const fs = require("fs");
const path = require("path");
const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });

const data_root = path.resolve(__dirname, "..", "data");

const folders = fs.readdirSync(data_root).filter((folder) => folder.match(/^\d{4}$/));

main();

async function main() {
    let folder = null;
    while (true) {
        console.log("Please select a folder to analyze: ");
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
    const article_path = path.resolve(folder_path, "article.json");
    const tools_path = path.resolve(data_root, "tools.json");

    const articles = JSON.parse(fs.readFileSync(article_path, "utf8"));
    const tool_list = JSON.parse(fs.readFileSync(tools_path, "utf8"));

    console.log("Articles Length:", comma(articles.length));

    const language_list = require(path.resolve(__dirname, "..", "data", "languages.js"));

    const languages = Object.values(language_list)
        .map((x) => x.name)
        .reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});
    const tools = tool_list.reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});

    const pairs = {};

    let text_length = 0;

    articles.forEach((article, idx) => {
        const content = article.content.toLowerCase();

        text_length += content.length;

        const lang = [];
        for (const language of Object.keys(language_list)) {
            if (language_list[language].regex.test(content)) {
                lang.push(language_list[language].name);
            }
        }

        const tool = [];
        for (let i = 0; i < tool_list.length; i++) {
            if (content.includes(tool_list[i])) {
                tool.push(tool_list[i]);
            }
        }

        for (let i = 0; i < lang.length; i++) {
            languages[lang[i]]++;
        }

        for (let i = 0; i < tool.length; i++) {
            tools[tool[i]]++;
        }

        for (let i = 0; i < lang.length; i++) {
            for (let j = 0; j < tool.length; j++) {
                const pair = `${lang[i]}-${tool[j]}`;

                if (!pairs[pair]) {
                    pairs[pair] = 0;
                }

                pairs[pair]++;
            }
        }

        if (idx % 1000 === 0) {
            console.log("Analyzed", comma(idx), "articles");
        }
    });

    console.log("Analyzed", comma(articles.length), "articles");

    const sorted_languages = Object.keys(languages)
        .sort((a, b) => languages[b] - languages[a])
        .map((key) => ({ name: key, count: languages[key] }));

    console.log("Languages:", sorted_languages);

    const sorted_tools = Object.keys(tools)
        .sort((a, b) => tools[b] - tools[a])
        .map((key) => ({ name: key, count: tools[key] }));

    console.log("Tools:", sorted_tools);

    const sorted_pairs = Object.keys(pairs)
        .sort((a, b) => pairs[b] - pairs[a])
        .map((key) => ({ name: key, count: pairs[key] }));

    console.log("Pairs:", sorted_pairs);

    console.log("Text Length:", comma(text_length));

    process.exit(0);
}

function ask(question = "") {
    return new Promise((resolve) => readline.question(question, resolve));
}

function comma(n) {
    return "\u001b[93m" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "\u001b[0m";
}
