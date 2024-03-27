const { join } = require("node:path");

import { getLang } from "./getLang.js";

export function getIcon(fileExtension) {
  const language = getLang(fileExtension);

  switch (language) {
    case "typescript":
      return join(__dirname, "icons", "typescript.svg");

    case "javascript":
      return join(__dirname, "icons", "javascript.svg");

    default:
      return join(__dirname, "icons", "file.svg");
  }
}
