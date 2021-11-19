import {Lexer} from './Lexer'
import readline from 'readline';

export function error(line: number, message: string) {
    console.log("[line " + line + "] Error: " + message)
}

const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const runPrompt = () => {
    prompt.question("JSL> ", (answer) => {
      if (answer == 'exit') //we need some base case, for recursion
        return prompt.close(); //closing RL and returning from function.
      run(answer);
      runPrompt(); //Calling this function again to ask new question
    });
};

function run(source: string) {
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();

    // For now, just print the tokens.
    for (const token of tokens) {
        console.log(`${token}`);
    }
}

runPrompt();