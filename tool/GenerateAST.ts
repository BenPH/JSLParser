// import * as fs from "fs"
// import * as path from "path"

// function main(args: string[]): void {
//   const baseName = args[2]
//   const outPath = args[3]

//   fs.writeFile(
//     path.resolve(outPath, baseName.toLowerCase() + ".ts"),
//     defineAst(baseName, nodeDefs[baseName], imports[baseName]),
//     error => {
//       if (error) {
//         console.log(error)
//         process.exit(1)
//       }
//     }
//   )
// }

// enum Types {
//   Expr = "Expr",
//   Stmt = "Stmt",
//   Token = "Token",
//   Literal = "LiteralValue",
//   Variable = "Variable",
//   Block = "Block"
// }

// type NodesDef = Array<[string, ...Array<[Types | string, string]>]>

// const exprNodesDef: NodesDef = [
//   [
//     "Binary",
//     [Types.Expr, "left"],
//     [Types.Token, "operator"],
//     [Types.Expr, "right"]
//   ],
//   [
//     "Logical",
//     [Types.Expr, "left"],
//     [Types.Token, "operator"],
//     [Types.Expr, "right"]
//   ],
//   [
//     "Ternary",
//     [Types.Expr, "condition"],
//     [Types.Expr, "left"],
//     [Types.Expr, "right"]
//   ],
//   ["Grouping", [Types.Expr, "expression"]],
//   ["Literal", [Types.Literal, "value"]],
//   ["Unary", [Types.Token, "operator"], [Types.Expr, "right"]],
//   ["Variable", [Types.Token, "name"]],
//   ["Assign", [Types.Variable, "variable"], [Types.Expr, "value"]],
//   [
//     "Call",
//     [Types.Expr, "callee"],
//     [Types.Token, "paren"],
//     [`${Types.Expr}[]`, "args"]
//   ]
// ]

// const stmtNodesDef: NodesDef = [
//   ["Expression", [Types.Expr, "expression"]],
//   ["Print", [Types.Expr, "expression"]],
//   ["Var", [Types.Variable, "variable"], [Types.Expr, "initializer?"]],
//   ["Block", [`${Types.Stmt}[]`, "statements"]],
//   [
//     "If",
//     [Types.Expr, "condition"],
//     [Types.Stmt, "thenBranch"],
//     [Types.Stmt, "elseBranch?"]
//   ],
//   ["While", [Types.Expr, "condition"], [Types.Stmt, "body"]],
//   ["Break"],
//   [
//     "Function",
//     [Types.Token, "name"],
//     [`${Types.Token}[]`, "params"],
//     [Types.Block, "body"]
//   ],
//   ["Return", [Types.Token, "keyword"], [Types.Expr, "value?"]]
// ]

// const nodeDefs: Record<string, NodesDef> = {
//   [Types.Expr]: exprNodesDef,
//   [Types.Stmt]: stmtNodesDef
// }

// const imports: Record<string, string> = {
//   [Types.Expr]: 'import { Token, Literal as LiteralValue } from "./token"',
//   [Types.Stmt]: `
//   import { Expr, Variable } from "./expr"
//   import { Token } from "./token"
// `
// }

// function defineAst(
//   baseName: string,
//   nodesDef: NodesDef,
//   imports: string
// ): string {
//   const base = `\
// export interface ${baseName} {
//   accept<T>(visitor: Visitor<T>): T
// }
// `

//   const visitor = `\
// export interface Visitor<T> {
//   ${nodesDef
//     .map(
//       ([name]) =>
//         `visit${name}${baseName}(${baseName.toLowerCase()}: ${name}): T`
//     )
//     .join("\n")}
// }
// `

//   const nodes = nodesDef
//     .map(
//       ([name, ...args]) => `\
// export class ${name} implements ${baseName} {
//   constructor(
//     ${args.map(([type, name]) => `readonly ${name}: ${type}`).join(", \n")}
//   ) {}
//   accept<T>(visitor: Visitor<T>): T {
//     return visitor.visit${name}${baseName}(this)
//   }
// }
// `
//     )
//     .join("\n")

//   return `\
// // Generated code
// ${imports}
// ${visitor}
// ${base}
// ${nodes}
// `
// }

// main(process.argv)