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
const chalk_1 = __importDefault(require("chalk"));
const cors_1 = __importDefault(require("cors"));
json_schema_faker_1.default.extend('faker', () => faker_1.faker);
json_schema_faker_1.default.option({
    alwaysFakeOptionals: true,
    failOnInvalidTypes: false,
    failOnInvalidFormat: false,
    useDefaultValue: true,
    useExamplesValue: true,
});
function delayMiddleware(minMs = 500, maxMs = 1500) {
    return (req, _res, next) => {
        const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        console.log(chalk_1.default.yellow(`⏱️  Delaying ${req.method} ${req.url} by ${delay}ms`));
        setTimeout(() => next(), delay);
    };
}
function chaosMiddleware(failureRate = 0.1) {
    return (req, res, next) => {
        const random = Math.random();
        if (random < failureRate) {
            console.log(chalk_1.default.red(`💥 Chaos: ${req.method} ${req.url} - Returning 500 error (${Math.round(failureRate * 100)}% chance)`));
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Simulated server failure (chaos mode)',
                timestamp: new Date().toISOString()
            });
            return;
        }
        next();
    };
}
function createMockApp(api, enableDelay = false, enableChaos = false) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    if (enableDelay) {
        app.use(delayMiddleware());
    }
    if (enableChaos) {
        app.use(chaosMiddleware());
    }
    app.use((req, _res, next) => {
        console.log(`${chalk_1.default.gray(new Date().toISOString())} | ${req.method} ${req.url}`);
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
function startMockServer(api, port, enableDelay = false, enableChaos = false) {
    const app = createMockApp(api, enableDelay, enableChaos);
    const server = app.listen(port, () => {
        console.log(chalk_1.default.green(`\n🚀 MockDraft server running at http://localhost:${port}`));
        console.log(chalk_1.default.dim(`   Serving mock API for: ${api.info.title} v${api.info.version}`));
        if (enableDelay) {
            console.log(chalk_1.default.yellow(`   ⏱️  Latency simulation: ENABLED (500-1500ms)`));
        }
        if (enableChaos) {
            console.log(chalk_1.default.red(`   💥 Chaos mode: ENABLED (10% random failures)`));
        }
        console.log(chalk_1.default.bold('\n🔗 Available Endpoints:'));
        const paths = api.paths || {};
        Object.entries(paths).forEach(([pathName, pathItem]) => {
            if (!pathItem)
                return;
            const methods = ['get', 'post', 'put', 'delete', 'patch'];
            methods.forEach((method) => {
                if (pathItem[method]) {
                    const methodStr = method.toUpperCase().padEnd(6);
                    let color = chalk_1.default.white;
                    if (method === 'get')
                        color = chalk_1.default.blue;
                    if (method === 'post')
                        color = chalk_1.default.green;
                    if (method === 'put')
                        color = chalk_1.default.yellow;
                    if (method === 'delete')
                        color = chalk_1.default.red;
                    console.log(`   ${color(methodStr)} http://localhost:${port}${pathName}`);
                }
            });
        });
        console.log('');
    });
    return server;
}
//# sourceMappingURL=server.js.map