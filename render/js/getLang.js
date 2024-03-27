export function getLang(fileExtension) {
  let language = "txt";

  switch (fileExtension) {
    case "js":
      language = "javascript";
      break;

    case "ts":
      language = "typescript";
      break;
  }

  return language;
}
