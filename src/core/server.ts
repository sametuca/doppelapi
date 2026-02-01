import express, { Request, Response } from 'express';
import { OpenAPI, OpenAPIV3 } from 'openapi-types';
import { Server } from 'http';
import jsf from 'json-schema-faker';
import { faker } from '@faker-js/faker';
import chalk from 'chalk';

// Register faker with json-schema-faker for x-faker support
jsf.extend('faker', () => faker);

// Configure json-schema-faker options
jsf.option({
    alwaysFakeOptionals: true,
    failOnInvalidTypes: false,
    failOnInvalidFormat: false,
    useDefaultValue: true,
    useExamplesValue: true,
});

export function createMockApp(api: OpenAPI.Document): express.Express {
    const app = express();
    app.use(express.json());

    // Log requests
    app.use((req, _res, next) => {
        console.log(`${chalk.gray(new Date().toISOString())} | ${req.method} ${req.url}`);
        next();
    });

    const paths = api.paths || {};

    Object.entries(paths).forEach(([pathName, pathItem]) => {
        if (!pathItem) return;

        // Convert OpenAPI path parameters {param} to Express :param
        const expressPath = pathName.replace(/\{([^}]+)\}/g, ':$1');

        const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const;

        methods.forEach((method) => {
            // We need to assume it's V3 mainly, but access generically
            const operation = (pathItem as any)[method] as OpenAPIV3.OperationObject | undefined;

            if (operation) {
                // Removed verbose log: console.log(`Registering route: ...`);

                app[method](expressPath, async (_req: Request, res: Response) => {
                    try {
                        // Find a successful response (200, 201, or default)
                        const responses = operation.responses || {};
                        const successCode = Object.keys(responses).find(
                            (code) => code.startsWith('2') || code === 'default'
                        );

                        if (!successCode) {
                            res.status(500).json({ error: 'No success response defined in schema' });
                            return;
                        }

                        const response = responses[successCode] as OpenAPIV3.ResponseObject;

                        // Check for content/application/json
                        const content = response.content?.['application/json'];

                        if (content && content.schema) {
                            // Generate fake data
                            const fakeData = await jsf.resolve(content.schema);
                            res.status(parseInt(successCode) || 200).json(fakeData);
                        } else {
                            // No content defined, just send status
                            res.status(parseInt(successCode) || 200).send();
                        }
                    } catch (error) {
                        console.error('Error generating mock data:', error);
                        res.status(500).json({ error: 'Failed to generate mock data' });
                    }
                });
            }
        });
    });

    return app;
}

export function startMockServer(api: OpenAPI.Document, port: number): Server {
    const app = createMockApp(api);

    const server = app.listen(port, () => {
        console.log(chalk.green(`\n🚀 MockDraft server running at http://localhost:${port}`));
        console.log(chalk.dim(`   Serving mock API for: ${api.info.title} v${api.info.version}`));
        console.log(chalk.bold('\n🔗 Available Endpoints:'));

        const paths = api.paths || {};
        Object.entries(paths).forEach(([pathName, pathItem]) => {
            if (!pathItem) return;
            const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

            methods.forEach((method) => {
                if ((pathItem as any)[method]) {
                    const methodStr = method.toUpperCase().padEnd(6);
                    let color = chalk.white;
                    if (method === 'get') color = chalk.blue;
                    if (method === 'post') color = chalk.green;
                    if (method === 'put') color = chalk.yellow;
                    if (method === 'delete') color = chalk.red;

                    console.log(`   ${color(methodStr)} http://localhost:${port}${pathName}`);
                }
            });
        });
        console.log(''); // Empty line
    });

    return server;
}
