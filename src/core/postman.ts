import { OpenAPI, OpenAPIV3 } from 'openapi-types';

interface PostmanCollection {
    info: {
        name: string;
        description?: string;
        schema: string;
        version?: string;
    };
    item: PostmanItem[];
}

interface PostmanItem {
    name: string;
    request: {
        method: string;
        header: Array<{ key: string; value: string; type: string }>;
        url: {
            raw: string;
            protocol: string;
            host: string[];
            port: string;
            path: string[];
            query?: Array<{ key: string; value: string }>;
        };
        body?: {
            mode: string;
            raw: string;
            options?: {
                raw: {
                    language: string;
                };
            };
        };
    };
    response: Array<{
        name: string;
        originalRequest: any;
        status: string;
        code: number;
        header: Array<{ key: string; value: string }>;
        body: string;
    }>;
}

export function generatePostmanCollection(
    api: OpenAPI.Document,
    baseUrl: string
): PostmanCollection {
    const collection: PostmanCollection = {
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
        if (!pathItem) return;

        const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

        methods.forEach((method) => {
            const operation = (pathItem as any)[method] as OpenAPIV3.OperationObject | undefined;

            if (operation) {
                const url = new URL(baseUrl);
                const pathSegments = pathName.split('/').filter(Boolean);

                // Convert {param} to :param for Postman
                const postmanPath = pathSegments.map(segment => 
                    segment.startsWith('{') && segment.endsWith('}')
                        ? `:${segment.slice(1, -1)}`
                        : segment
                );

                const item: PostmanItem = {
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

                // Add request body example for POST/PUT/PATCH
                if (['post', 'put', 'patch'].includes(method)) {
                    const requestBody = (operation as any).requestBody as OpenAPIV3.RequestBodyObject | undefined;
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

                // Add example response
                const responses = operation.responses || {};
                const successCode = Object.keys(responses).find(
                    (code) => code.startsWith('2')
                );

                if (successCode) {
                    const response = responses[successCode] as OpenAPIV3.ResponseObject;
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

function generateExampleFromSchema(schema: any): any {
    if (schema.example) {
        return schema.example;
    }

    if (schema.type === 'array') {
        const itemExample = schema.items ? generateExampleFromSchema(schema.items) : {};
        return [itemExample];
    }

    if (schema.type === 'object' || schema.properties) {
        const example: any = {};
        const properties = schema.properties || {};

        Object.entries(properties).forEach(([key, prop]: [string, any]) => {
            if (prop.example !== undefined) {
                example[key] = prop.example;
            } else if (prop['x-faker']) {
                example[key] = `<${prop['x-faker']}>`;
            } else if (prop.format === 'email') {
                example[key] = 'example@email.com';
            } else if (prop.format === 'uuid') {
                example[key] = '123e4567-e89b-12d3-a456-426614174000';
            } else if (prop.format === 'date-time') {
                example[key] = '2024-01-01T00:00:00Z';
            } else if (prop.type === 'string') {
                example[key] = prop.enum?.[0] || 'string';
            } else if (prop.type === 'number' || prop.type === 'integer') {
                example[key] = 0;
            } else if (prop.type === 'boolean') {
                example[key] = false;
            } else if (prop.type === 'array') {
                example[key] = [];
            } else if (prop.type === 'object') {
                example[key] = generateExampleFromSchema(prop);
            } else {
                example[key] = null;
            }
        });

        return example;
    }

    return null;
}
