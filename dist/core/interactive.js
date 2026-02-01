"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInteractiveMode = runInteractiveMode;
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
async function runInteractiveMode() {
    console.log(chalk_1.default.bold.cyan('\n👋 Welcome to DoppelAPI!'));
    console.log(chalk_1.default.dim('Let\'s get your mock server up and running.\n'));
    const files = fs_1.default.readdirSync(process.cwd()).filter(file => file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json'));
    if (files.length === 0) {
        console.log(chalk_1.default.yellow('No OpenAPI files (.yaml, .yml, .json) found in current directory.'));
        const { manualFile } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'manualFile',
                message: 'Please enter the path to your OpenAPI file:',
                validate: (input) => fs_1.default.existsSync(input) || 'File does not exist, please try again.'
            }
        ]);
        return promptRest(manualFile);
    }
    const choices = [
        ...files,
        new inquirer_1.default.Separator(),
        { name: 'Enter custom path manually...', value: 'REQ_MANUAL_PATH' }
    ];
    const { selectedFile } = await inquirer_1.default.prompt([
        {
            type: 'rawlist',
            name: 'selectedFile',
            message: 'Select an OpenAPI file (or choose custom path):',
            choices: choices,
            pageSize: 10
        }
    ]);
    if (selectedFile === 'REQ_MANUAL_PATH') {
        const { manualPath } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'manualPath',
                message: 'Enter the full path to your OpenAPI file:',
                validate: (input) => {
                    if (fs_1.default.existsSync(input))
                        return true;
                    return 'File not found. Please check the path and try again.';
                }
            }
        ]);
        return promptRest(manualPath.trim());
    }
    return promptRest(selectedFile);
}
async function promptRest(file) {
    const answers = await inquirer_1.default.prompt([
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
//# sourceMappingURL=interactive.js.map