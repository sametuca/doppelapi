import express from 'express';
import { OpenAPI } from 'openapi-types';
import { Server } from 'http';
export declare function createMockApp(api: OpenAPI.Document): express.Express;
export declare function startMockServer(api: OpenAPI.Document, port: number): Server;
//# sourceMappingURL=server.d.ts.map