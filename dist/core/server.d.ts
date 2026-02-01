import express from 'express';
import { OpenAPI } from 'openapi-types';
import { Server } from 'http';
export declare function createMockApp(api: OpenAPI.Document, enableDelay?: boolean): express.Express;
export declare function startMockServer(api: OpenAPI.Document, port: number, enableDelay?: boolean): Server;
//# sourceMappingURL=server.d.ts.map