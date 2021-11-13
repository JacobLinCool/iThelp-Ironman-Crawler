const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const Pool = require("./pool");
const { std_clear } = require("./utils");

async function crawl() {
    if (!fs.existsSync(path.join(__dirname, "../data/list.json"))) {
        console.log("list.json not found.");
        return;
    }
    const list = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/list.json"), "utf8"));
    console.log(`${list.length} articles to crawl.`);

    let total = list.length,
        crawled = 0;

    const pool = new Pool(20);
    for (const link of list) {
        pool.push(() =>
            crawlArticle(link).then((article) => {
                std_clear();
                process.stdout.write(
                    "\033[93m" + `Crawled ${++crawled}/${total} articles. (${((crawled / total) * 100).toFixed(1)}%)` + "\033[m" + ` | ${article.title}`
                );
                return article;
            })
        );
    }
    await pool.go();

    std_clear();
    console.log("\033[92m" + `Crawled ${total}/${total} articles.` + "\033[m");

    fs.writeFileSync(path.resolve(__dirname, "..", "data", "articles.json"), JSON.stringify(pool.results));
}

async function crawlArticle(link) {
    const html = await fetch(link).then((res) => res.text());
    const $ = cheerio.load(html);

    const title = $(".qa-header__title").first().text().trim();
    const content = $(".markdown").first().text().trim();
    const group = $(".group__badge").first().text().trim();
    const tags = $(".tag.qa-header__tagList")
        .map((i, elm) => $(elm).text().trim())
        .get();

    return { title, content, group, tags };
}

module.exports = crawl;
