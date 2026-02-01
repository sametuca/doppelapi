"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOpenAPIFile = parseOpenAPIFile;
exports.validateOpenAPIFile = validateOpenAPIFile;
const swagger_parser_1 = __importDefault(require("@apidevtools/swagger-parser"));
async function parseOpenAPIFile(filePath) {
    try {
        console.log(`Parsing OpenAPI file: ${filePath}`);
        const api = await swagger_parser_1.default.dereference(filePath);
        console.log(`✓ API: ${api.info.title} (v${api.info.version})`);
        console.log(`✓ Valid OpenAPI document`);
        return api;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse OpenAPI file: ${error.message}`);
        }
        throw new Error('Failed to parse OpenAPI file: Unknown error');
    }
}
async function validateOpenAPIFile(filePath) {
    try {
        const api = await swagger_parser_1.default.validate(filePath);
        console.log(`✓ Valid OpenAPI document`);
        return api;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Invalid OpenAPI file: ${error.message}`);
        }
        throw new Error('Invalid OpenAPI file: Unknown error');
    }
}
//# sourceMappingURL=parser.js.map