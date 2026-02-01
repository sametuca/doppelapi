#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const parser_1 = require("./core/parser");
const interactive_1 = require("./core/interactive");
const program = new commander_1.Command();
program
    .name('doppelapi')
    .description('Turn your OpenAPI file into a smart mock server in seconds.')
    .version('1.0.0');
async function startServer(file, options) {
    try {
        const port = typeof options.port === 'string' ? parseInt(options.port, 10) : options.port;
        let currentServer = null;
        const start = async () => {
            try {
                if (currentServer) {
                    console.log(chalk_1.default.yellow('⟳ Restarting server...'));
                    currentServer.close();
                }
                else {
                    console.log(chalk_1.default.green('Starting application...'));
                    console.log(chalk_1.default.blue(`File: ${file}`));
                    console.log(chalk_1.default.blue(`Port: ${port}`));
                    if (options.delay) {
                        console.log(chalk_1.default.yellow(`Latency: Enabled`));
                    }
                    if (options.chaos) {
                        console.log(chalk_1.default.red(`Chaos: Enabled`));
                    }
                }
                const api = await (0, parser_1.parseOpenAPIFile)(file);
                console.log(chalk_1.default.green('\n✓ API parsed successfully. Starting server...'));
                const { startMockServer } = await Promise.resolve().then(() => __importStar(require('./core/server')));
                currentServer = startMockServer(api, port, options.delay || false, options.chaos || false);
            }
            catch (error) {
                console.error(chalk_1.default.red('Error parsing or starting server:'), error.message);
            }
        };
        await start();
        if (options.watch) {
            const chokidar = await Promise.resolve().then(() => __importStar(require('chokidar')));
            console.log(chalk_1.default.blue(`\nWatching for changes in ${file}...`));
            chokidar.watch(file).on('change', async () => {
                console.log(chalk_1.default.blue(`\nFile changed: ${file}`));
                await start();
            });
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
}
program
    .command('start')
    .description('Start the application with the specified OpenAPI file')
    .argument('<file>', 'Path to the OpenAPI file to process')
    .option('-p, --port <number>', 'Port number to use', '3000')
    .option('-w, --watch', 'Watch for changes in the OpenAPI file', false)
    .option('-d, --delay', 'Enable latency simulation (500-1500ms)', false)
    .option('-c, --chaos', 'Enable chaos mode (10% random failures)', false)
    .action(async (file, options) => {
    await startServer(file, options);
});
if (!process.argv.slice(2).length) {
    (0, interactive_1.runInteractiveMode)().then((config) => {
        startServer(config.file, { port: config.port, watch: config.watch, delay: false, chaos: false });
    });
}
else {
    program.parse(process.argv);
}
//# sourceMappingURL=index.js.map