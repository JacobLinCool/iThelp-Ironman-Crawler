const fs = require("fs");
const path = require("path");

const articles = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "articles.json")));
console.log("Articles Length:", articles.length);

const languages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "languages.json"))).reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});
const language_list = Object.keys(languages);

const tools = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "tools.json"))).reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});
const tool_list = Object.keys(tools);

const pairs = {};

let text_length = 0;

articles.forEach((article, idx) => {
    const content = article.content.toLowerCase();

    text_length += content.length;

    const lang = [];
    for (let i = 0; i < language_list.length; i++) {
        if (content.includes(language_list[i])) {
            lang.push(language_list[i]);
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
        console.log("Analyzed", idx, "articles");
    }
});

console.log("Analyzed", articles.length, "articles");

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

console.log("Text Length:", text_length);
