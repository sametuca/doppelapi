import inquirer from 'inquirer';
import fs from 'fs';

import chalk from 'chalk';

export async function runInteractiveMode() {
    console.log(chalk.bold.cyan('\n👋 Welcome to DoppelAPI!'));
    console.log(chalk.dim('Let\'s get your mock server up and running.\n'));

    // 1. Find OpenAPI files
    const files = fs.readdirSync(process.cwd()).filter(file =>
        file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')
    );

    if (files.length === 0) {
        console.log(chalk.yellow('No OpenAPI files (.yaml, .yml, .json) found in current directory.'));
        const { manualFile } = await inquirer.prompt([
            {
                type: 'input',
                name: 'manualFile',
                message: 'Please enter the path to your OpenAPI file:',
                validate: (input) => fs.existsSync(input) || 'File does not exist, please try again.'
            }
        ]);
        return promptRest(manualFile);
    }

    // 2. Select File
    const choices = [
        ...files,
        new inquirer.Separator(),
        { name: 'Enter custom path manually...', value: 'REQ_MANUAL_PATH' }
    ];

    const { selectedFile } = await inquirer.prompt([
        {
            type: 'rawlist',
            name: 'selectedFile',
            message: 'Select an OpenAPI file (or choose custom path):',
            choices: choices,
            pageSize: 10
        }
    ] as any);

    if (selectedFile === 'REQ_MANUAL_PATH') {
        const { manualPath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'manualPath',
                message: 'Enter the full path to your OpenAPI file:',
                validate: (input) => {
                    if (fs.existsSync(input)) return true;
                    return 'File not found. Please check the path and try again.';
                }
            }
        ]);
        return promptRest(manualPath.trim());
    }

    return promptRest(selectedFile);
}

async function promptRest(file: string) {
    const answers = await inquirer.prompt([
        {
            type: 'number',
            name: 'port',
            message: 'Which port should the server run on?',
            default: 3000,
        },
        {
            type: 'confirm',
            name: 'watch',
            message: 'Enable Hot Reload (watch for changes)?',
            default: true
        }
    ]);

    return {
        file,
        port: answers.port,
        watch: answers.watch
    };
}
