import { OpenAPI } from 'openapi-types';
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
        header: Array<{
            key: string;
            value: string;
            type: string;
        }>;
        url: {
            raw: string;
            protocol: string;
            host: string[];
            port: string;
            path: string[];
            query?: Array<{
                key: string;
                value: string;
            }>;
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
        header: Array<{
            key: string;
            value: string;
        }>;
        body: string;
    }>;
}
export declare function generatePostmanCollection(api: OpenAPI.Document, baseUrl: string): PostmanCollection;
export {};
//# sourceMappingURL=postman.d.ts.map