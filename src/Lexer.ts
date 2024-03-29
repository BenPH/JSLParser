import {Literal, Token, TokenType} from './Token'
import {report} from './index'

export class Lexer {
    private source: string;
    private readonly tokens: Token[] = [];
    private start = 0;
    private current = 0;
    private line = 1;
    private col = 1;
    private tokenStart = {line: this.line, col: this.col}

    constructor(source: string) {
        this.source = source;
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()) {
          // We are at the beginning of the next lexeme.
          this.start = this.current;
          // Track the start of this token's position
          this.tokenStart = {line: this.line, col: this.col};
          this.scanToken();
        }

        this.tokens.push(
            new Token(TokenType.EOF, "", undefined, {line: this.line, col: this.col})
        );
        return this.tokens;
    }

    private scanToken(): void {
        const c = this.advance();
        switch (c) {
            case '(': this.addToken(TokenType.OPEN_PAREN); break;
            case ')': this.addToken(TokenType.CLOSE_PAREN); break;
            case '{': this.addToken(TokenType.OPEN_BRACE); break;
            case '}': this.addToken(TokenType.CLOSE_BRACE); break;
            case '[': this.addToken(TokenType.OPEN_BRACKET); break;
            case ']': this.addToken(TokenType.CLOSE_BRACKET); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '^': this.addToken(TokenType.POWER); break;
            case '`': this.addToken(TokenType.BACK_QUOTE); break;
            case '&': this.addToken(TokenType.AND); break;
            case '|': {
                const next = this.peek();
                switch (next) {
                    case '|': this.advance(); this.addToken(this.match('=') ? TokenType.CONCAT_TO : TokenType.CONCAT); break;
                    case '/': this.advance(); this.addToken(this.match('=') ? TokenType.VCONCAT_TO : TokenType.VCONCAT); break;
                    default: this.addToken(TokenType.OR); break;
                }
                break;
            }
            case ':': {
                const next = this.peek();
                switch (next) {
                    case '/': this.advance(); this.addToken(TokenType.EDIV); break;
                    case '*': this.advance(); this.addToken(TokenType.EMUL); break;
                    case ':': this.advance(); this.addToken(this.match(':') ? TokenType.TRIPLE_COLON : TokenType.DOUBLE_COLON); break;
                    default: this.addToken(TokenType.COLON); break;
                }
                break;
            }
            case '+': {
                const next = this.peek();
                switch(next) {
                    case '+': this.advance(); this.addToken(TokenType.INC); break;
                    case '=': this.advance(); this.addToken(TokenType.ADD_TO); break;
                    default: this.addToken(TokenType.PLUS); break;
                }
                break;
            }
            case '-': {
                const next = this.peek();
                switch(next) {
                    case '-': this.advance(); this.addToken(TokenType.DEC); break;
                    case '=': this.advance(); this.addToken(TokenType.SUBTRACT_TO); break;
                    default: this.addToken(TokenType.MINUS); break;
                }
                break;
            }
            case '*':
                this.addToken(this.match('=') ? TokenType.MUL_TO : TokenType.MUL);
                break;
            case '!':
                this.addToken(this.match('=') ? TokenType.NOT_EQUAL : TokenType.NOT);
                break;
            case '=':{
                const next = this.peek();
                switch(next) {
                    case '=': this.advance(); this.addToken(TokenType.EQUAL); break;
                    case '>': this.advance(); this.addToken(TokenType.ARROW); break;
                    default: this.addToken(TokenType.ASSIGN); break;
                }
                break;
            }
            case '<': {
                const next = this.peek();
                switch(next) {
                    case '=': this.advance(); this.addToken(TokenType.LESS_EQUAL); break;
                    case '<': this.advance(); this.addToken(TokenType.SEND); break;
                    default: this.addToken(TokenType.LESS); break;
                }
                break;
            }
            case '>': {
                const next = this.peek();
                switch(next) {
                    case '=': this.advance(); this.addToken(TokenType.GREATER_EQUAL); break;
                    case '>': this.advance(); this.addToken(TokenType.PAT_IMMEDIATE); break;
                    case '?': this.advance(); this.addToken(TokenType.PAT_CONDITIONAL); break;
                    default: this.addToken(TokenType.GREATER); break;
                }
                break;
            }
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else if (this.match('*')) {
                    this.blockComment();
                } else {
                    this.addToken(TokenType.DIV);
                }
                break;
            case '"': this.stringOrName(); break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;
            case '\n':
                this.nextline();
                break;
            case '.': this.decimal(); break; // TODO: Require at least one digit after . before E
            default:
                if (this.isDigit(c)) {
                    this._tryDate() ? this.addToken(TokenType.NUMBER) : this.number();
                } else if (this.isNameStart(c)){
                    this.name();
                } else {
                    report(this.tokenStart, "", "Unexpected character '" + c + "'");
                }
                break;
        }
    }

    private stringOrName(): void {
        while (this.peek() != '"' && !this.isAtEnd()) {
          if (this.peek() == '\\' && this.lookahead(1) == '!' && this.lookahead(2) == '"') {
                this.advance(2);
          } else if (this.peek() == '\\' && this.lookahead(1) == '[') {
                this.advance(2);
                this._rawString();
          }
          if (this.peek() == '\n')
            this.nextline();
          this.advance();
        }

        if (this.isAtEnd()) {
          report(this.tokenStart, "", "Unterminated string.");
          return;
        }

        if (this.lookahead(1) == 'n') {
            this.advance(2); // Closing "n
            const name_id = this.source.substring(this.start, this.current).replace(/\s+/g, '');
            this.addToken(TokenType.NAME, name_id)
        } else {
            // The closing ".
            this.advance();

            const value = this.source.substring(this.start, this.current);
            this.addToken(TokenType.STRING, value);
        }
    }

    private _rawString(): void {
        while (!(this.peek() == ']' && this.lookahead(1) == '\\') && !this.isAtEnd()) {
            if (this.peek() == '\n')
                this.nextline();
            this.advance();
        }
        if (!this.isAtEnd()) this.advance();
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek() == '.') {
            this.advance();
            this.decimal();
        } else {
            if(this.peek().toLowerCase() == 'e') {
                this._exponent();
            } 
            this.addToken(TokenType.NUMBER,
                parseFloat(this.source.substring(this.start, this.current)));
        }
    }

    private decimal(): void {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek().toLowerCase() == 'e') {
            this._exponent();
        }
        this.addToken(TokenType.NUMBER,
            parseFloat(this.source.substring(this.start, this.current)));
    }

    private _exponent(): void {
        this.advance()
        if((this.peek() == '+' || this.peek() == '-'))
            this.advance();
        if(!this.isDigit(this.peek())) {
            report(this.tokenStart, "", "Invalid numeric literal '" + this.source.substring(this.start, this.current) + "'");
            return;
        }
        while (this.isDigit(this.peek())) this.advance();
    }

    private _tryDate(): boolean {
        const re = /^\d+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\d+(:\d+:\d+(:\d+)?)?/gi

        if (re.test(this.source.substring(this.start))) {
            this.advance(re.lastIndex-1);
            return true;
        }
        return false;
    }

    private name(): void {
        while (this.isNameContinue(this.peek())) this.advance();

        const name_id = this.source.substring(this.start, this.current).toLowerCase().replace(/\s+/g, '');
        this.addToken(TokenType.NAME, name_id);
    }

    private blockComment(): void {
        while (!(this.peek() == '*' && this.lookahead(1) == '/') && !this.isAtEnd()) {
            if (this.peek() == '/' && this.lookahead(1) == '*') {
                this.advance(2);
                this.blockComment();
            } else {
                if (this.peek() == '\n')
                    this.nextline();
                this.advance();
            }
        }
        if (!this.isAtEnd()) this.advance(2)
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) != expected) return false;
        this.current++;
        this.col++;
        return true;
    }

    private peek(): string {
        return this.source.charAt(this.current);
    }

    private lookahead(n: number): string {
        if (this.current + n >= this.source.length) return '\0';
        return this.source.charAt(this.current + n);
    }

    private isNameStart(c: string): boolean {
        return (c >= 'a' && c <= 'z') ||
               (c >= 'A' && c <= 'Z') ||
                c == '_';
    }

    private isNameContinue(c: string): boolean {
        if (c == '\n') {
            this.nextline();
            return true
        }
        return /[A-Za-z0-9_'#$%.?\s]/.test(c);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private advance(n = 1): string {
        this.current += n;
        this.col += n;
        return this.source.charAt(this.current - n);
    }

    private nextline(): void {
        this.line++;
        this.col = 1;
    }

    private addToken(type: TokenType, literal?: Literal): void {
        // Trim the end of whitespace for identifiers. No other token should have whitespace.
        const text = this.source.substring(this.start, this.current).trimEnd();
        this.tokens.push(new Token(type, text, literal, this.tokenStart));
    }
}
