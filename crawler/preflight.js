const fs = require("fs");
const path = require("path");

process.env.TZ = "Asia/Taipei";

// create data directory in the parent directory if it doesn't exist
const dataDir = path.resolve(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
