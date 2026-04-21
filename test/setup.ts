import "jest-openapi";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const jestOpenAPI: (filepathOrObject: string) => void = require("jest-openapi").default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiSpecPath = path.join(__dirname, "..", "src", "docs", "openapi.yaml");

jestOpenAPI(apiSpecPath);
