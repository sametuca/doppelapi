"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePostmanCollection = generatePostmanCollection;
function generatePostmanCollection(api, baseUrl) {
    const collection = {
        info: {
            name: api.info.title || 'API Collection',
            description: api.info.description || 'Generated from OpenAPI spec',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
            version: api.info.version || '1.0.0',
        },
        item: [],
    };
    const paths = api.paths || {};
    Object.entries(paths).forEach(([pathName, pathItem]) => {
        if (!pathItem)
            return;
        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        methods.forEach((method) => {
            const operation = pathItem[method];
            if (operation) {
                const url = new URL(baseUrl);
                const pathSegments = pathName.split('/').filter(Boolean);
                const postmanPath = pathSegments.map(segment => segment.startsWith('{') && segment.endsWith('}')
                    ? `:${segment.slice(1, -1)}`
                    : segment);
                const item = {
                    name: operation.summary || `${method.toUpperCase()} ${pathName}`,
                    request: {
                        method: method.toUpperCase(),
                        header: [
                            {
                                key: 'Content-Type',
                                value: 'application/json',
                                type: 'text',
                            },
                        ],
                        url: {
                            raw: `${baseUrl}${pathName}`,
                            protocol: url.protocol.replace(':', ''),
                            host: [url.hostname],
                            port: url.port || (url.protocol === 'https:' ? '443' : '80'),
                            path: postmanPath,
                        },
                    },
                    response: [],
                };
                if (['post', 'put', 'patch'].includes(method)) {
                    const requestBody = operation.requestBody;
                    if (requestBody?.content?.['application/json']?.schema) {
                        const schema = requestBody.content['application/json'].schema;
                        const exampleBody = generateExampleFromSchema(schema);
                        item.request.body = {
                            mode: 'raw',
                            raw: JSON.stringify(exampleBody, null, 2),
                            options: {
                                raw: {
                                    language: 'json',
                                },
                            },
                        };
                    }
                }
                const responses = operation.responses || {};
                const successCode = Object.keys(responses).find((code) => code.startsWith('2'));
                if (successCode) {
                    const response = responses[successCode];
                    const content = response.content?.['application/json'];
                    if (content?.schema) {
                        const exampleResponse = generateExampleFromSchema(content.schema);
                        item.response.push({
                            name: 'Example Response',
                            originalRequest: item.request,
                            status: response.description || 'OK',
                            code: parseInt(successCode),
                            header: [
                                {
                                    key: 'Content-Type',
                                    value: 'application/json',
                                },
                            ],
                            body: JSON.stringify(exampleResponse, null, 2),
                        });
                    }
                }
                collection.item.push(item);
            }
        });
    });
    return collection;
}
function generateExampleFromSchema(schema) {
    if (schema.example) {
        return schema.example;
    }
    if (schema.type === 'array') {
        const itemExample = schema.items ? generateExampleFromSchema(schema.items) : {};
        return [itemExample];
    }
    if (schema.type === 'object' || schema.properties) {
        const example = {};
        const properties = schema.properties || {};
        Object.entries(properties).forEach(([key, prop]) => {
            if (prop.example !== undefined) {
                example[key] = prop.example;
            }
            else if (prop['x-faker']) {
                example[key] = `<${prop['x-faker']}>`;
            }
            else if (prop.format === 'email') {
                example[key] = 'example@email.com';
            }
            else if (prop.format === 'uuid') {
                example[key] = '123e4567-e89b-12d3-a456-426614174000';
            }
            else if (prop.format === 'date-time') {
                example[key] = '2024-01-01T00:00:00Z';
            }
            else if (prop.type === 'string') {
                example[key] = prop.enum?.[0] || 'string';
            }
            else if (prop.type === 'number' || prop.type === 'integer') {
                example[key] = 0;
            }
            else if (prop.type === 'boolean') {
                example[key] = false;
            }
            else if (prop.type === 'array') {
                example[key] = [];
            }
            else if (prop.type === 'object') {
                example[key] = generateExampleFromSchema(prop);
            }
            else {
                example[key] = null;
            }
        });
        return example;
    }
    return null;
}
//# sourceMappingURL=postman.js.map