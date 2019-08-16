import * as ts from 'typescript';

interface ArrayTypeChecker extends ts.TypeChecker {
  isArrayType(a: ts.Type): boolean;

  isArrayLikeType(a: ts.Type): boolean;
}

const predefined: { [interfaceName: string]: string } = {
  IDate: 'date',
  IEmail: 'email',
  IForbidden: 'forbidden',
  IUUID: 'uuid',
  IUrl: 'url'
};

interface MaybeIntrinsicType {
  intrinsicName?: string;
}

interface LiteralType {
  value: string | number | ts.PseudoBigInt;
}

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}

/**
 * TRANSFORMER LOGIC
 */

// tslint:disable-next-line:max-line-length
function visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node;

function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node {
  return ts.visitEachChild(visitNode(node, program), (childNode) =>
    visitNodeAndChildren(childNode, program, context), context);
}

function visitNode(node: ts.Node, program: ts.Program): ts.Node {
  const typeChecker = program.getTypeChecker();

  if (!isKeysCallExpression(node, typeChecker)) {
    return node;
  }
  if (!node.typeArguments) {
    return ts.createObjectLiteral();
  }

  let additional = true;
  const typeArg = typeChecker.getTypeAtLocation(node.arguments[0]);
  if (node.arguments[0] &&
    (typeArg as MaybeIntrinsicType).intrinsicName === 'false') {
    additional = false;
  }

  const type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
  return parseType(type, typeChecker, 0, [], additional);
}

function isKeysCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) {
    return false;
  }

  const signature = typeChecker.getResolvedSignature(node);
  if (typeof signature === 'undefined') {
    return false;
  }

  const {declaration} = signature;
  return !!declaration
    && !ts.isJSDocSignature(declaration)
    && !!declaration.name
    && declaration.name!.getText() === 'schema';
}

/**
 * PARSING LOGIC
 */

function parseType(type: ts.Type, tc: ts.TypeChecker, depth: number, history?: string[],
                   additional?: boolean, optional?: boolean): ts.ObjectLiteralExpression {

  const flags = type.flags;

  // tslint:disable:no-bitwise
  if (flags & ts.TypeFlags.StringLike ||
    flags & ts.TypeFlags.NumberLike ||
    flags & ts.TypeFlags.BooleanLike ||
    flags === ts.TypeFlags.Any) {
    return parsePrimitive(type, tc);
  }
  // tslint:enable:no-bitwise
  if (flags === ts.TypeFlags.Null ||
    flags === ts.TypeFlags.Undefined) {
    return ts.createObjectLiteral();
  }

  if (flags === ts.TypeFlags.Object) {
    const objectType: ts.ObjectType = type as ts.ObjectType;
    const name = objectType.symbol.name;

    if (predefined[name]) {
      return ts.createObjectLiteral([
        ts.createPropertyAssignment('type', ts.createLiteral(predefined[name]))
      ]);
    }

    if ((tc as ArrayTypeChecker).isArrayType(objectType)) {
      return parseArray(objectType as ts.TypeReference, tc, ++depth);
    }

    if (tc.getIndexInfoOfType(type, ts.IndexKind.Number) || tc.getIndexInfoOfType(type, ts.IndexKind.String)) {
      return ts.createObjectLiteral([
        ts.createPropertyAssignment('type', ts.createLiteral('object'))
      ]);
    }

    if (history && history.indexOf(name) !== -1) {
      return ts.createObjectLiteral([
        ts.createPropertyAssignment('type', ts.createLiteral('any'))
      ]);
    } else if (history && (name !== '__type' && name !== 'Array')) {
      history.push(name);
    }

    return parseInterface(type, tc, ++depth, history, additional);
  }

  if (flags === ts.TypeFlags.Union) {
    return parseUnion(type, tc, ++depth, history, additional, optional);
  }

  if (flags === ts.TypeFlags.Intersection) {
    return parseIntersection(type, tc, ++depth, history);
  }
// tslint:disable:no-bitwise
  if (flags & ts.TypeFlags.EnumLike) {
    return parseEnum(type);
  }

  throw new Error('Unknown type');
}

function parsePrimitive(type: ts.Type, tc: ts.TypeChecker): ts.ObjectLiteralExpression {

  // Handle literal type
  if (type.flags & ts.TypeFlags.Literal) {
    return ts.createObjectLiteral([
      ts.createPropertyAssignment('type', ts.createLiteral('enum')),
      ts.createPropertyAssignment('values', ts.createArrayLiteral([
        ts.createLiteral((type as unknown as LiteralType).value)
      ]))
    ]);
  }

  const typeString = tc.typeToString(type);
  return ts.createObjectLiteral([
    ts.createPropertyAssignment('type', ts.createLiteral(typeString))
  ]);
}

function parseEnum(type: ts.Type): ts.ObjectLiteralExpression {
  const enumType = type as ts.UnionOrIntersectionType;
  const values = enumType.types.map((enumProperty) => {
    return ts.createLiteral((enumProperty as unknown as LiteralType).value);
  });

  return ts.createObjectLiteral([
    ts.createPropertyAssignment('type', ts.createLiteral('enum')),
    ts.createPropertyAssignment('values', ts.createArrayLiteral(values))
  ]);
}

function parseArray(type: ts.TypeReference,
                    tc: ts.TypeChecker, depth: number, history?: string[]): ts.ObjectLiteralExpression {
  if (type.typeArguments) {
    return ts.createObjectLiteral([
      ts.createPropertyAssignment('type', ts.createLiteral('array')),
      ts.createPropertyAssignment('items', parseType(type.typeArguments[0], tc, depth, history))
    ]);
  }
  return ts.createObjectLiteral([
    ts.createPropertyAssignment('type', ts.createLiteral('array'))
  ]);
}

function parseUnion(type: ts.Type, tc: ts.TypeChecker, depth: number, history?: string[],
                    additional?: boolean, optional?: boolean): ts.ObjectLiteralExpression {
  const unionType = type as ts.UnionOrIntersectionType;

  let firstBoolean = true;
  const types = unionType.types.filter((unionProperty) => {
    if (unionProperty.flags & ts.TypeFlags.BooleanLiteral) {
      if (firstBoolean) {
        firstBoolean = false;
        return true;
      } else {
        return false;
      }
    }

    return tc.typeToString(unionProperty) !== 'undefined';
  });

  if (types.length === 1) {
    const unionProperty = types[0];
    if (unionProperty.flags & ts.TypeFlags.BooleanLiteral) {
      return ts.createObjectLiteral([
        ts.createPropertyAssignment('type', ts.createLiteral('boolean'))
      ]);
    }

    return parseType(unionProperty, tc, depth, history, additional);
  }

  /**
   * If all types of union are literals, make an enum
   */
  let literals = !!types.length;
  for (const unionProperty of types) {
    if (!(unionProperty.flags & ts.TypeFlags.Literal)) {
      literals = false;
    }
  }
  if (literals) {
    const values = types.map((unionProperty) => {
      if (unionProperty.flags & ts.TypeFlags.BooleanLiteral) {
        if (tc.typeToString(unionProperty) === 'false') {
          return ts.createLiteral(false);
        } else {
          return ts.createLiteral(true);
        }
      }
      return ts.createLiteral((unionProperty as unknown as LiteralType).value);
    });
    return ts.createObjectLiteral([
      ts.createPropertyAssignment('type', ts.createLiteral('enum')),
      ts.createPropertyAssignment('values', ts.createArrayLiteral(values))
    ]);
  }

  const mappedTypes = types.map((mappedPproperty) => {
    if (mappedPproperty.flags & ts.TypeFlags.BooleanLiteral) {
      return ts.createObjectLiteral([
        ts.createPropertyAssignment('type', ts.createLiteral('boolean'))
      ]);
    }

    return parseType(mappedPproperty, tc, depth, history, additional);
  });

  if (optional) {
    mappedTypes.push(ts.createObjectLiteral([
      ts.createPropertyAssignment('type', ts.createLiteral('forbidden'))
    ]));
  }

  return ts.createArrayLiteral(mappedTypes) as unknown as ts.ObjectLiteralExpression;
}

function parseIntersection(type: ts.Type, tc: ts.TypeChecker, depth: number, history?: string[],
                           additional?: boolean): ts.ObjectLiteralExpression {
  const intersectionType = type as ts.UnionOrIntersectionType;
  const types = intersectionType.types.map((intersectionProperty) => {
    return parseType(intersectionProperty, tc, depth, history, additional);
  });

  const combinedProperties: ts.ObjectLiteralElementLike[] = [];
  types.forEach((combinedProp) => {
    combinedProp.properties.forEach((property) => {
      if (property.name) {
        const indentifier = property.name as ts.Identifier;
        if (indentifier.escapedText === 'props') {
          const assignment = property as ts.PropertyAssignment;
          const props = assignment.initializer as unknown as ts.ObjectLiteralExpressionBase<ts.PropertyAssignment>;
          props.properties.forEach((prop) => {
            combinedProperties.push(prop);
          });
        }
      }
    });
  });

  let propertiesAssignments = [];
  if (depth > 1) {
    propertiesAssignments.push(ts.createPropertyAssignment('type', ts.createLiteral('object')));
    propertiesAssignments.push(ts.createPropertyAssignment('props', ts.createObjectLiteral(combinedProperties)));
  } else {
    propertiesAssignments = combinedProperties;
  }

  return ts.createObjectLiteral(propertiesAssignments);
}

function parseInterface(type: ts.Type, tc: ts.TypeChecker, depth: number, history?: string[],
                        additional?: boolean): ts.ObjectLiteralExpression {
  const properties = tc.getPropertiesOfType(type).filter((property) => property.declarations!.length);

  const propertiesAssignments = properties.map((property) => {
    const declaration: ts.ParameterDeclaration = property.declarations[0] as ts.ParameterDeclaration;

    const optional = !!declaration.questionToken;
    let parsed = parseType(tc.getTypeOfSymbolAtLocation(property,
      property.declarations![0]), tc, depth, history, additional, optional);

    if (optional && parsed.properties) {
      parsed = addProperty(parsed, 'optional', true);
    }

    const jsDocs = property.getJsDocTags();
    if (additional && jsDocs.length && parsed.properties) {
      parsed = addProperties(parsed, parseJSDoc(jsDocs));
    }

    return ts.createPropertyAssignment(property.name, parsed);
  });

  if (propertiesAssignments.length === 0) {
    return ts.createObjectLiteral();
  }

  let nestedPropertiesAssignments = [];

  if (depth > 1) {
    nestedPropertiesAssignments.push(ts.createPropertyAssignment('type', ts.createLiteral('object')));
    nestedPropertiesAssignments.push(ts.createPropertyAssignment(
      'props', ts.createObjectLiteral(propertiesAssignments)));
  } else {
    nestedPropertiesAssignments = propertiesAssignments;
  }

  const docs = type.symbol.getJsDocTags();
  if (additional && docs.length) {
    parseJSDoc(docs).forEach((property) => {
      nestedPropertiesAssignments.push(property);
    });
  }

  return ts.createObjectLiteral(nestedPropertiesAssignments);

}

function addProperties(object: ts.ObjectLiteralExpression,
                       combinedProperties: ts.ObjectLiteralElementLike[]):
  ts.ObjectLiteralExpression {
  object.properties.forEach((property) => combinedProperties.push(property));
  return ts.createObjectLiteral(combinedProperties);
}

function addProperty(object: ts.ObjectLiteralExpression, name: string, value: any): ts.ObjectLiteralExpression {
  const combinedProperties: ts.ObjectLiteralElementLike[] = [];

  object.properties.forEach((property) => combinedProperties.push(property));
  combinedProperties.push(ts.createPropertyAssignment(name, ts.createLiteral(value)));

  return ts.createObjectLiteral(combinedProperties);
}

function parseJSDoc(docs: ts.JSDocTagInfo[]): ts.PropertyAssignment[] {
  return docs.filter((doc) => doc.text).map((doc) => {
    let value: any = doc.text;
    if (value === 'true') {
      value = true;
    }

    if (value === 'false') {
      value = false;
    }

    if (/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(value)) {
      value = Number(value);
    }

    return ts.createPropertyAssignment(doc.name, ts.createLiteral(value));
  });
}
