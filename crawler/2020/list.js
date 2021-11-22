const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const Pool = require("../pool");
const { std_clear } = require("../utils");

const list_path = path.resolve(__dirname, "..", "..", "data", "2020", "list.json");

async function crawl() {
    if (!fs.existsSync(path.dirname(list_path))) {
        fs.mkdirSync(path.dirname(list_path), { recursive: true });
    }

    const base_URL = "https://ithelp.ithome.com.tw/2020-12th-ironman/";
    const types = ["contest", "self"];

    const results = [];
    for (const type of types) {
        const url = `${base_URL}${type}`;
        results.push(await crawler(url));
    }

    const data = results.reduce((a, b) => a.concat(b), []);

    fs.writeFileSync(list_path, JSON.stringify(data));
}

async function crawler(start_URL) {
    const results = new Set();

    console.log(`Start Crawling from ${start_URL}`);

    const first_page = await task(start_URL);
    [...first_page.result].forEach((link) => results.add(link));
    let total = first_page.page_count,
        crawled = 1;

    const StartTime = Date.now();

    const pool = new Pool(12);
    for (let i = 2; i <= total; i++) {
        pool.push(() =>
            task(start_URL + "?page=" + i).then(({ result, page_count }) => {
                [...result].forEach((link) => results.add(link));
                if (page_count > total) total = page_count;
                std_clear();
                process.stdout.write("\u001b[93m" + `Crawled ${++crawled}/${total} pages. (${((crawled / total) * 100).toFixed(1)}%)` + "\u001b[m");
            })
        );
    }
    await pool.go();

    std_clear();
    console.log("\u001b[92m" + `Crawled ${total}/${total} pages. (${((Date.now() - StartTime) / 1000).toFixed(0)}s)` + "\u001b[m");

    return [...results];
}

async function task(url) {
    const result = new Set();
    const html = await fetch(url).then((res) => res.text());

    const $ = cheerio.load(html);

    const page_count = +$(".pagination > li:nth-last-child(2)").text();

    const articles = $(".ir-list").toArray();
    for (const article of articles) {
        const link = extract_link($(article));
        result.add(link);
    }

    return { result, page_count };
}

function extract_link(article) {
    try {
        const link = article.find(".ir-list__title > a").attr("href") || "";
        return link;
    } catch (err) {
        console.error("\u001b[92m" + "Link Extraction Error." + "\u001b[m", err.message);
    }
}

module.exports = crawl;
