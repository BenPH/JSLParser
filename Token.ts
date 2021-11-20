import {Literal} from './types'

export enum TokenType {
    // Single-character tokens.
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
    COMMA, DOT, MINUS, PLUS, SEMICOLON, DIVIDE, MULTIPLY,

    // One or two character tokens.
    NOT, NOT_EQUAL,
    EQUAL, EQUAL_EQUAL,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,
    ARROW,

    // Literals.
    NAME, STRING, NUMBER,

    EOF
}

export class Token {
    readonly type: TokenType;
    readonly lexeme: string;
    readonly literal: Literal;
    readonly line: number; 

    constructor(type: TokenType , lexeme: string, literal: Literal, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    public toString() {
        return "type: " + TokenType[this.type] + ", lexeme: " + this.lexeme + ", value: " + this.literal
    }
}
