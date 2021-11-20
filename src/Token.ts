import {Literal} from './types'

export enum TokenType {
    INC, DEC,
    POWER,
    NOT,
    MUL, EMUL, DIV, EDIV,
    PLUS, MINUS,
    CONCAT, VCONCAT,
    SEND,
    EQUAL, NOT_EQUAL,
    LESS, LESS_EQUAL,
    GREATER, GREATER_EQUAL,
    AND, OR,
    ASSIGN,
    ADD_TO, SUBTRACT_TO,
    MUL_TO, DIV_TO,
    CONCAT_TO, VCONCAT_TO,
    GLUE,
    COLON, DOUBLE_COLON, TRIPLE_COLON,
    BACK_QUOTE,
    ARROW,
    PAT_CONDITIONAL,
    PAT_IMMEDIATE,
    COMMA,

    OPEN_PAREN, CLOSE_PAREN,
    OPEN_BRACE, CLOSE_BRACE,
    OPEN_BRACKET, CLOSE_BRACKET,

    // Literals
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
        return "type: " + TokenType[this.type] + ", lexeme: " + this.lexeme + ", value: " + this.literal + " @line: " + this.line
    }
}
