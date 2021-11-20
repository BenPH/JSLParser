// Generated code

import { Token, Literal as LiteralValue } from "./Token"

export interface ExprVisitor<T> {
    visitAssignExpr(expr: Assign): T
    visitBinaryExpr(expr: Binary): T
    // visitCallExpr(expr: Call): T
    // visitGetExpr(expr: Get): T
    visitGroupingExpr(expr: Grouping): T
    visitLiteralExpr(expr: Literal): T
    visitLogicalExpr(expr: Logical): T
    visitUnaryExpr(expr: Unary): T
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

export class Grouping implements Expr {
    constructor(readonly expression: Expr) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitGroupingExpr(this)
    }
}

export class Literal implements Expr {
    constructor(readonly value: LiteralValue) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLiteralExpr(this)
    }
}

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

export class Unary implements Expr {
    constructor(
        readonly operator: Token,
        readonly expression: Expr
    ) { }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitUnaryExpr(this)
    }
}

export class Variable implements Expr {
    constructor(readonly name: Token) {}

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitVariableExpr(this)
    }
}
