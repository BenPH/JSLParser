import { Expr, ExprVisitor, Literal, PostUnary, PreUnary, Binary, Grouping, Variable, Assign, Logical, List, Matrix, AssociativeArray } from '../src/expr';

export default class AstPrinter implements ExprVisitor<string> {
//   visitGetterExpr(expr: Getter): string {
//     return this.parenthesize(`get ${expr.name.lexeme}`, [ expr.object ]);
//   }
//   visitSetterExpr(expr: Setter): string {
//     return this.parenthesize(`set ${expr.name.lexeme}`, [ expr.object, expr.expr ]);
//   }
//   visitCallExpr(expr: Call): string {
//     return this.parenthesize('call', [ expr.callee, ...expr.args ]);
//   }

  visitLogicalExpr(expr: Logical): string {
    return this.parenthesize(expr.operator.lexeme, [ expr.left, expr.right ]);
  }

  visitAssignExpr(expr: Assign): string {
    return this.parenthesize(`${expr.operator.lexeme} ${expr.variable.name.lexeme}`, [ expr.value ]);
  }

  visitAssociativeArrayExpr(expr: AssociativeArray): string {
    let str = '[';
    expr.contents.forEach((val, key) => str += key.accept<string>(this) + ' => ' + val.accept<string>(this) + ', ');
    str = str.replace(/, $/, "");
    str += ']';
    if (str == '[]') str = '[=>]'
    return str;
  }

  visitVariableExpr(expr: Variable): string {
    return expr.name.lexeme;
  }

  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, [ expr.left, expr.right ]);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize('group', [ expr.expression ]);
  }

  visitListExpr(expr: List): string {
    return this.parenthesize('list', [ ...expr.contents ]);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) {
      return 'null';
    }

    return String(expr.value);
  }

  visitMatrixExpr(expr: Matrix): string {
    return '[' + expr.contents.map((row)=>row.map((n)=>n.accept<string>(this)).join(' ')).join(', ') + ']';
  }

  visitPostUnaryExpr(expr: PostUnary): string {
    return this.parenthesize(expr.operator.lexeme, [ expr.expression ]);
  }

  visitPreUnaryExpr(expr: PreUnary): string {
    return this.parenthesize(expr.operator.lexeme, [ expr.expression ]);
  }

  parenthesize(name: string, exprs: Expr[]): string {
    let printedExprs: string;
    if (!exprs.length)
      printedExprs = '()'
    else
      printedExprs = exprs.map((e) => e.accept<string>(this)).join(' ');

    return `(${name} ${printedExprs})`;
  }
}