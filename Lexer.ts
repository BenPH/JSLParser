import {Token, TokenType} from './Token'
import {error} from './index'
import {Literal} from './types'

export class Lexer {
    private source: string;
    private readonly tokens: Token[] = [];
    private start = 0;
    private current = 0;
    private line = 1;

    constructor(source: string) {
        this.source = source;
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()) {
          // We are at the beginning of the next lexeme.
          this.start = this.current;
          this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", undefined, this.line));
        return this.tokens;
    }

    private scanToken(): void {
        const c = this.advance();
        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!':
                this.addToken(this.match('=') ? TokenType.NOT_EQUAL : TokenType.NOT);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else if (this.match('*')) {
                    while (this.peek() != '*' && this.lookahead(2) != '/' && !this.isAtEnd()) {
                        this.advance();
                    }
                    if (!this.isAtEnd()) this.advance(2)
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case '"': this.stringOrName(); break;
          default:
            if (this.isDigit(c)) {
                this.number();
            } else if (this.isNameStart(c)){
                this.name();
            } else {
                error(this.line, "Unexpected character '" + c + "'"); break;
            }
        }
    }

    private stringOrName(): void {
        // TODO: allow  \[...]\ escaping
        while (this.peek() != '"' && !this.isAtEnd()) {
          if (this.peek() == '\\' && this.lookahead(2) == '!' && this.lookahead(3) == '"') {
            this.advance(2)
          }
          if (this.peek() == '\n') this.line++;
          this.advance();
        }

        if (this.isAtEnd()) {
          error(this.line, "Unterminated string.");
          return;
        }

        if (this.lookahead(2) == 'n') {
            this.advance(2); // Closing "n
            this.addToken(TokenType.NAME)
        } else {
            // The closing ".
            this.advance();

            // Trim the surrounding quotes.
            // TODO: Replace escaped characters
            const value = this.source.substring(this.start + 1, this.current - 1);
            this.addToken(TokenType.STRING, value);
        }
    }

    private number(): void {
        // TODO: add missing (.) and starting with . numbers
        while (this.isDigit(this.peek())) this.advance();
    
        // Look for a fractional part.
        if (this.peek() == '.' && this.isDigit(this.lookahead(2))) {
          // Consume the "."
          this.advance();

          // TODO: add scientific notation
          while (this.isDigit(this.peek())) this.advance();
        }
    
        this.addToken(TokenType.NUMBER,
            parseFloat(this.source.substring(this.start, this.current)));
    }

    private name(): void {
    while (this.isNameContinue(this.peek())) this.advance();

        this.addToken(TokenType.NAME);
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) != expected) return false;
        this.current++;
        return true;
    }

    private lookahead(n: number): string {
        if (this.current + n - 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + n - 1);
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    private isNameStart(c: string): boolean {
        return (c >= 'a' && c <= 'z') ||
               (c >= 'A' && c <= 'Z') ||
                c == '_';
    }

    private isNameContinue(c: string): boolean {
        // TODO: add other allowed characters
        return this.isNameStart(c) || this.isDigit(c);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private advance(n = 1): string {
        this.current += n
        return this.source.charAt(this.current - n);
    }

    private addToken(type: TokenType, literal?: Literal): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }
}

