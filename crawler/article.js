const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const Pool = require("./pool");
const { std_clear } = require("./utils");

async function crawl(year) {
    const list_path = path.resolve(__dirname, "..", "data", year.toString(), "list.json");
    const article_path = path.resolve(__dirname, "..", "data", year.toString(), "article.json");

    if (!fs.existsSync(list_path)) {
        console.log("list.json not found.");
        return;
    }

    if (!fs.existsSync(path.dirname(list_path))) {
        fs.mkdirSync(path.dirname(list_path), { recursive: true });
    }

    const list = JSON.parse(fs.readFileSync(list_path, "utf8"));
    console.log(`${list.length} articles to crawl.`);

    const StartTime = Date.now();

    let total = list.length,
        crawled = 0;

    const pool = new Pool(20);
    for (const link of list) {
        pool.push(() =>
            crawlArticle(link).then((article) => {
                std_clear();
                process.stdout.write(
                    "\u001b[93m" + `Crawled ${++crawled}/${total} articles. (${((crawled / total) * 100).toFixed(1)}%)` + "\u001b[m" + ` | ${article.title}`
                );
                return article;
            })
        );
    }
    await pool.go();

    std_clear();
    console.log("\u001b[92m" + `Crawled ${total}/${total} articles. (${((Date.now() - StartTime) / 1000).toFixed(0)}s)` + "\u001b[m");

    fs.writeFileSync(article_path, JSON.stringify(pool.results));
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
