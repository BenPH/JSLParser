import { Token, TokenType } from "./Token";
import {
    Expr,
    Binary,
    PreUnary,
    Literal,
    Grouping,
    Variable,
    Assign,
    Logical,
    PostUnary,
    LiteralNumeric,
    LiteralString,
    List
} from './expr';
import {printParseError} from './index'

export class ParseError extends Error {
    constructor(public token: Token, public message: string) {
        super(message)
    }
}

export class Parser {
    private tokens: Token[];
    private current = 0;
    public parseError?: ParseError;
    
    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }
    
    parse() {
        try {
            return this.expression();
        } catch (e) {
            return null;
        }
    }

    // Productions are ordered from low to high precedence
    private expression() {
        return this.glue();
    }

    private glue() {
        // Consume GLUE 
        // while (this.match(TokenType.GLUE)) continue;

        let expr = this.assignment();
        while (this.match(TokenType.GLUE)) {
            const operator = this.previous();
            const right = this.glue();
            expr = new Binary(expr, operator, right);
        } // TODO: Allow trailing glue
        return expr;
    }

    private assignment(): Expr {
        const expr = this.logical();

        if (this.match(TokenType.ASSIGN,
                        TokenType.ADD_TO,
                        TokenType.SUBTRACT_TO,
                        TokenType.MUL_TO,
                        TokenType.DIV_TO,
                        TokenType.CONCAT_TO,
                        TokenType.VCONCAT_TO)) {
            const operator = this.previous();
            const value = this.assignment();

            return new Binary(expr, operator, value);
        }

        return expr;
    }

    private logical(): Expr {
        let expr = this.comparison();
        
        while (this.match(TokenType.AND, TokenType.OR)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new Binary(expr, operator, right);
        }
        
        return expr;
    }

    private comparison(): Expr {
        let expr = this.miscBinary();
        
        while (this.match(TokenType.NOT_EQUAL,
                            TokenType.EQUAL,
                            TokenType.GREATER,
                            TokenType.GREATER_EQUAL,
                            TokenType.LESS,
                            TokenType.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.miscBinary();
            expr = new Binary(expr, operator, right);
        }
        
        return expr;
    }

    // ||, |/, ::, <<
    private miscBinary(): Expr {
        let expr = this.term();
        
        while (this.match(TokenType.CONCAT, TokenType.VCONCAT,
                            TokenType.DOUBLE_COLON, TokenType.SEND)) {
            const operator = this.previous();
            const right = this.term();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }

    private term(): Expr {
        let expr = this.factor();
        
        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    
    private factor(): Expr {
        let expr = this.preUnary();
        
        while (this.match(TokenType.MUL, TokenType.EMUL,
                            TokenType.DIV, TokenType.EDIV)) {
            const operator = this.previous();
            const right = this.preUnary();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }

    private preUnary(): Expr {
        if (this.match(TokenType.NOT, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.preUnary();
            return new PreUnary(operator, right);
        }
        return this.power();
    }

    // Right-associative. Also includes >> and >?.
    private power(): Expr {
        const expr = this.postUnary();
        
        if (this.match(TokenType.POWER, TokenType.PAT_IMMEDIATE, TokenType.PAT_CONDITIONAL)) {
            const operator = this.previous();
            const right = this.power();
            return new Binary(expr, operator, right);
        }
        return expr;
    }

    private postUnary(): Expr {
        let expr = this.scopedUnary();
        while (this.match(TokenType.INC, TokenType.DEC, TokenType.BACK_QUOTE)) {
            const operator = this.previous();
            expr = new PostUnary(expr, operator);
        }
        return expr;
    }

    private scopedUnary(): Expr {
        if (this.match(TokenType.COLON, TokenType.DOUBLE_COLON, TokenType.TRIPLE_COLON)) {
            const operator = this.previous();
            const right = this.scopedBinary();
            return new PreUnary(operator, right);
        }
        return this.scopedBinary();
    }

    private scopedBinary(): Expr {
        let expr = this.primary();
        while (this.match(TokenType.COLON)) {
            const operator = this.previous();
            const right = this.primary();
            if (expr instanceof LiteralNumeric || right instanceof LiteralNumeric) {
                throw this.error(operator, "The ':' operator does not accept numeric values")
            }
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }

    private primary(): Expr {
        if (this.match(TokenType.NUMBER)) {
            return new LiteralNumeric(this.previous().literal);
        }

        if (this.match(TokenType.STRING)) {
            return new LiteralString(this.previous().literal);
        }
        
        if (this.match(TokenType.NAME)) {
            return new Variable(this.previous());
        }
        
        if (this.match(TokenType.OPEN_BRACE)) {
            return new List(this.listContents());
        }

        if (this.match(TokenType.OPEN_PAREN)) {
            const expr = this.expression();
            this.consume(TokenType.CLOSE_PAREN, "Expected ')' after expression.");
            return new Grouping(expr);
        }
        
        throw this.error(this.peek(), "Expected an expression.");
    }

    private listContents(): Expr[] {
        const contents: Expr[] = []
        while(this.match(TokenType.COMMA)) continue; // allow multiple commas at start
        while(!this.check(TokenType.CLOSE_BRACE) && !this.isAtEnd()) {
            const expr = this.expression();
            contents.push(expr);
            if(this.match(TokenType.CLOSE_BRACE))
                return contents;
            this.consume(TokenType.COMMA, "Expected a ',' or '}'.")
            while(this.check(TokenType.COMMA)) this.advance(); // allow multiple commas inbetween
        }
        if(this.previous().type == TokenType.COMMA)
            this.error(this.previous(), "Unexpected ',' at end of list.");
        this.consume(TokenType.CLOSE_BRACE, "Expected a '}'.");
        return contents;
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    
    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        
        throw this.error(this.peek(), message)
    }
    
    private error(token: Token, message: string): ParseError {
        printParseError(token, message);
        
        this.parseError = new ParseError(token, message);
        
        return this.parseError;
    }
    
    private synchronize(): void {
        this.advance();
        
        while (!this.isAtEnd()) {
            if (this.previous().type == TokenType.GLUE) return;
            //   switch (peek().type) {
            //     case CLASS:
            //     case FUN:
            //     case VAR:
            //     case FOR:
            //     case IF:
            //     case WHILE:
            //     case PRINT:
            //     case RETURN:
            //       return;
            //   }
            this.advance();
        }
    }
    
    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
    }
    
    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }
    
    private isAtEnd(): boolean {
        return this.peek().type == TokenType.EOF;
    }
    
    private peek(): Token {
        return this.tokens[this.current];
    }
    
    private previous(): Token {
        return this.tokens[this.current-1];
    }
}
