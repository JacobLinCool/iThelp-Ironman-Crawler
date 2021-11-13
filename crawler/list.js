const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const Pool = require("./pool");
const { std_clear } = require("./utils");

async function crawl() {
    const base_URL = "https://ithelp.ithome.com.tw/2021ironman/";
    const types = ["contest", "self"];

    const results = [];
    for (const type of types) {
        const url = `${base_URL}${type}`;
        results.push(await crawler(url));
    }

    const data = results.reduce((a, b) => a.concat(b), []);

    fs.writeFileSync(path.resolve(__dirname, "..", "data", "list.json"), JSON.stringify(data));
}

async function crawler(start_URL) {
    const results = new Set();

    console.log(`Start Crawling from ${start_URL}`);

    const first_page = await task(start_URL);
    [...first_page.result].forEach((link) => results.add(link));
    let total = first_page.page_count,
        crawled = 1;

    const pool = new Pool(12);
    for (let i = 2; i <= total; i++) {
        pool.push(() =>
            task(start_URL + "?page=" + i).then(({ result, page_count }) => {
                [...result].forEach((link) => results.add(link));
                if (page_count > total) total = page_count;
                std_clear();
                process.stdout.write("\033[93m" + `Crawled ${++crawled}/${total} pages. (${((crawled / total) * 100).toFixed(1)}%)` + "\033[m");
            })
        );
    }
    await pool.go();

    std_clear();
    console.log("\033[92m" + `Crawled ${total}/${total} pages.` + "\033[m");

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
        console.error("Link Extraction Error.", err.message);
    }
}

module.exports = crawl;
