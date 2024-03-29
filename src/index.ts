import {Lexer} from './Lexer'
import readline from 'readline';
import { Token, TokenType } from './Token';
import { Parser } from './Parser';
import AstPrinter from '../tool/ASTPrinter';

let hadError = false;
// Parsing error
export function printParseError(token: Token, message: string) {
    if (token.type == TokenType.EOF) {
        report(token.startPosition, " at end", message);
    } else {
        report(token.startPosition, " at '" + token.lexeme + "'", message);
    }
}
export function report(pos: {line: number, col: number}, where: string, message: string) {
    hadError = true;
    console.log(`[line ${pos.line}, col ${pos.col}] Error${where}: ${message}`)
}

function runPrompt() {
    let lex = false;
    if (process.argv.length > 2) {
        lex = !!process.argv[2].valueOf;
    }
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
            run(text.join('\n'), lex);
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

function run(source: string, outputlex?: boolean) {
    hadError = false;
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    if (hadError || !expression) return;

    if(outputlex) {
        // For now, just print the tokens.
        for (const token of tokens) {
            console.log(`${token}`);
        }
    }

    console.log(new AstPrinter().print(expression));
}

runPrompt();
// run('[1 2; 3 4]')