const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });

main();

async function main() {
    require("./preflight");

    let year = null;
    while (true) {
        year = parseInt(await ask("你想要抓哪一年的資料呢？ "));
        if (year >= 2017 && year <= 2021) break;
        console.log("請輸入 2017 ~ 2021 之間的數字。");
    }

    let mode = null;
    while (true) {
        mode = await ask("你想要抓哪一種模式的資料呢？ ");
        if (mode === "list" || mode === "article" || mode === "all") break;
        console.log("請輸入 list 或 article 或 all。");
    }

    if (mode === "all" || mode === "list") {
        await require(`./${year}/list`)();
    }

    if (mode === "all" || mode === "article") {
        await require("./article")(year);
    }

    console.log("所有資料皆已抓取完成。");
    process.exit(0);
}

function ask(question) {
    return new Promise((resolve) => readline.question(question, resolve));
}
