"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockApp = createMockApp;
exports.startMockServer = startMockServer;
const express_1 = __importDefault(require("express"));
const json_schema_faker_1 = __importDefault(require("json-schema-faker"));
const faker_1 = require("@faker-js/faker");
json_schema_faker_1.default.extend('faker', () => faker_1.faker);
json_schema_faker_1.default.option({
    alwaysFakeOptionals: true,
    failOnInvalidTypes: false,
    failOnInvalidFormat: false,
    useDefaultValue: true,
    useExamplesValue: true,
});
function createMockApp(api) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((req, _res, next) => {
        console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
        next();
    });
    const paths = api.paths || {};
    Object.entries(paths).forEach(([pathName, pathItem]) => {
        if (!pathItem)
            return;
        const expressPath = pathName.replace(/\{([^}]+)\}/g, ':$1');
        const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
        methods.forEach((method) => {
            const operation = pathItem[method];
            if (operation) {
                console.log(`Registering route: ${method.toUpperCase().padEnd(6)} ${expressPath}`);
                app[method](expressPath, async (_req, res) => {
                    try {
                        const responses = operation.responses || {};
                        const successCode = Object.keys(responses).find((code) => code.startsWith('2') || code === 'default');
                        if (!successCode) {
                            res.status(500).json({ error: 'No success response defined in schema' });
                            return;
                        }
                        const response = responses[successCode];
                        const content = response.content?.['application/json'];
                        if (content && content.schema) {
                            const fakeData = await json_schema_faker_1.default.resolve(content.schema);
                            res.status(parseInt(successCode) || 200).json(fakeData);
                        }
                        else {
                            res.status(parseInt(successCode) || 200).send();
                        }
                    }
                    catch (error) {
                        console.error('Error generating mock data:', error);
                        res.status(500).json({ error: 'Failed to generate mock data' });
                    }
                });
            }
        });
    });
    return app;
}
function startMockServer(api, port) {
    const app = createMockApp(api);
    const server = app.listen(port, () => {
        console.log(`\n🚀 MockDraft server running at http://localhost:${port}`);
        console.log(`   Serving mock API for: ${api.info.title} v${api.info.version}`);
    });
    return server;
}
//# sourceMappingURL=server.js.map