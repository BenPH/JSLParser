// Generated code

import { Token, Literal as LiteralValue } from "./Token"

export interface ExprVisitor<T> {
    visitAssignExpr(expr: Assign): T
    visitAssociativeArrayExpr(expr: AssociativeArray): T
    visitBinaryExpr(expr: Binary): T
    visitCallExpr(expr: Call): T
    visitGroupingExpr(expr: Grouping): T
    visitIndexExpr(expr: Index): T
    visitListExpr(expr: List): T
    visitLiteralExpr(expr: Literal): T
    visitLogicalExpr(expr: Logical): T
    visitMatrixExpr(expr: Matrix): T
    visitPostUnaryExpr(expr: PostUnary): T
    visitPreUnaryExpr(expr: PreUnary): T
    visitVariableExpr(expr: Variable): T
}

export interface Expr {
    accept<T>(visitor: ExprVisitor<T>): T
}

export class Assign implements Expr {
    constructor(
        readonly variable: Variable,
        readonly operator: Token,
        readonly value: Expr
    ) { }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitAssignExpr(this)
    }
}


export class AssociativeArray implements Expr {
    constructor(readonly contents: Map<Literal, Expr>) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitAssociativeArrayExpr(this)
    }
}

export class Binary implements Expr {
    constructor(
        readonly left: Expr,
        readonly operator: Token,
        readonly right: Expr
    ) { }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitBinaryExpr(this)
    }
}

export class Call implements Expr {
    constructor(
        readonly callee: Expr,
        readonly paren: Token, // Store the closing parenthesis for better errors?
        readonly args: Expr[]
    ) {}

    accept<T>(visitor: ExprVisitor<T>): T {
         return visitor.visitCallExpr(this)
    }
}

export class Grouping implements Expr {
    constructor(readonly expression: Expr) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitGroupingExpr(this)
    }
}

export class Index implements Expr {
    constructor(readonly expression: Expr, readonly indices: Expr[]) {}

    accept<T>(visitor: ExprVisitor<T>): T {
         return visitor.visitIndexExpr(this)
    }
}

export class List implements Expr {
    constructor(readonly contents: Expr[]) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitListExpr(this)
    }
}

export class Literal implements Expr {
    constructor(readonly value: LiteralValue) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLiteralExpr(this)
    }
}

export class LiteralNumeric extends Literal {}
export class LiteralString extends Literal {}

export class Logical implements Expr {
    constructor(
        readonly left: Expr,
        readonly operator: Token,
        readonly right: Expr
    ) { }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLogicalExpr(this)
    }
}

export class Matrix implements Expr {
    constructor(readonly contents: LiteralNumeric[][]) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitMatrixExpr(this)
    }
}

export class PostUnary implements Expr {
    constructor(
        readonly expression: Expr,
        readonly operator: Token
    ) { }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitPostUnaryExpr(this)
    }
}

export class PreUnary implements Expr {
    constructor(
        readonly operator: Token,
        readonly expression: Expr
    ) { }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitPreUnaryExpr(this)
    }
}

export class Variable implements Expr {
    constructor(readonly name: Token) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitVariableExpr(this)
    }
}
