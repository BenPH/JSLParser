import { Token, TokenType } from "./Token";
import {
    Expr,
    Binary,
    Unary,
    Literal,
    Grouping,
    Variable,
    Assign,
    Logical
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
    
    private expression() {
        return this.assignment();
    }

    private assignment(): Expr {
        const expr = this.comparison();

        if (this.match(TokenType.ASSIGN,
                        TokenType.ADD_TO,
                        TokenType.SUBTRACT_TO,
                        TokenType.MUL_TO,
                        TokenType.DIV_TO,
                        TokenType.CONCAT_TO,
                        TokenType.VCONCAT_TO)) {
            const equals = this.previous();
            const value = this.assignment();

            if (expr instanceof Variable) {
                return new Assign(expr, equals, value);
            }

            this.error(equals, "Invalid assignment target.");
        }

        return expr;
    }

    private comparison(): Expr {
        let expr = this.term();
        
        while (this.match(TokenType.NOT_EQUAL,
                            TokenType.EQUAL,
                            TokenType.GREATER,
                            TokenType.GREATER_EQUAL,
                            TokenType.LESS,
                            TokenType.LESS_EQUAL)) {
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
        let expr = this.unary();
        
        while (this.match(TokenType.MUL, TokenType.DIV)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    
    private unary(): Expr {
        if (this.match(TokenType.NOT, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return new Unary(operator, right);
        }
        return this.primary();
    }
    
    private primary(): Expr {
        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal);
        }
        
        if (this.match(TokenType.NAME)) {
            return new Variable(this.previous());
        }
        
        if (this.match(TokenType.OPEN_PAREN)) {
            const expr = this.expression();
            this.consume(TokenType.CLOSE_PAREN, "Expected ')' after expression.");
            return new Grouping(expr);
        }
        
        throw this.error(this.peek(), "Expected an expression.");
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
