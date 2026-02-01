#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { parseOpenAPIFile } from './core/parser';
import { runInteractiveMode } from './core/interactive';

const program = new Command();

program
  .name('mockdraft')
  .description('Turn your OpenAPI file into a smart mock server in seconds.')
  .version('1.0.0');

// Shared logic to start the server
async function startServer(file: string, options: { port: string | number; watch: boolean; delay?: boolean; chaos?: boolean }) {
  try {
    const port = typeof options.port === 'string' ? parseInt(options.port, 10) : options.port;
    let currentServer: any = null;

    const start = async () => {
      try {
        if (currentServer) {
          console.log(chalk.yellow('⟳ Restarting server...'));
          currentServer.close();
        } else {
          console.log(chalk.green('Starting application...'));
          console.log(chalk.blue(`File: ${file}`));
          console.log(chalk.blue(`Port: ${port}`));
          if (options.delay) {
            console.log(chalk.yellow(`Latency: Enabled`));
          }
          if (options.chaos) {
            console.log(chalk.red(`Chaos: Enabled`));
          }
        }

        const api = await parseOpenAPIFile(file);
        console.log(chalk.green('\n✓ API parsed successfully. Starting server...'));

        const { startMockServer } = await import('./core/server');
        currentServer = startMockServer(api, port, options.delay || false, options.chaos || false);
      } catch (error) {
        console.error(chalk.red('Error parsing or starting server:'), (error as Error).message);
      }
    };

    await start();

    if (options.watch) {
      const chokidar = await import('chokidar');
      console.log(chalk.blue(`\n👀 Watching for changes in ${file}...`));

      chokidar.watch(file).on('change', async () => {
        console.log(chalk.blue(`\n📝 File changed: ${file}`));
        await start();
      });
    }

  } catch (error) {
    console.error(chalk.red('Error:'), (error as Error).message);
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
  .action(async (file: string, options: { port: string; watch: boolean; delay: boolean }) => {
    await startServer(file, options);
  });

// Handle default case (no args) -> Interactive Mode
if (!process.argv.slice(2).length) {
  runInteractiveMode().then((config) => {
    startServer(config.file, { port: config.port, watch: config.watch, delay: false });
  });
} else {
  program.parse(process.argv);
}
