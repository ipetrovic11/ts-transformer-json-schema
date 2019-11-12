import * as ts from "typescript";
export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile>;
