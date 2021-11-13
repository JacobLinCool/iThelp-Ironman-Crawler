function std_clear() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
}

module.exports = { std_clear };
