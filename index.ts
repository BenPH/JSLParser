import {Lexer} from './Lexer'
import readline from 'readline';

export function error(line: number, message: string) {
    console.log("[line " + line + "] Error: " + message)
}

function runPrompt() {
    let text: string[] = [];
    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });

    rl.on('line', (line) => {
        if (line.endsWith('\\')) {
            text.push(line.slice(0, -1));
        } else {
            text.push(line)
            run(text.join('\n'));
            text = [];
            rl.prompt();
        }
    }).on('close', () => {
        console.log("\nSession Terminated");
        process.exit(0);
    });

    rl.setPrompt('JSL>');
    rl.prompt();
}

function run(source: string) {
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();

    // For now, just print the tokens.
    for (const token of tokens) {
        console.log(`${token}`);
    }
}

runPrompt();