import * as ts from "typescript";

const predefined: { [interfaceName: string]: string } = {
    IDate: "date",
    IEmail: "email",
    IForbidden: "forbidden",
    IUrl: "url",
    IUUID: "uuid"
};

interface MaybeIntrinsicType {
    intrinsicName?: string;
}

interface LiteralType {
    value: string | number | ts.PseudoBigInt;
}

/**
 * PARSING LOGIC
 */

function parseType(type: ts.Type, tc: ts.TypeChecker, history?: string[], additional?: boolean): ts.ObjectLiteralExpression {

    const flags = type.flags;

    if (flags & ts.TypeFlags.StringLike ||
        flags & ts.TypeFlags.NumberLike ||
        flags & ts.TypeFlags.BooleanLike ||
        flags === ts.TypeFlags.Any) {
        return parsePrimitive(type, tc);
    }

    if (flags === ts.TypeFlags.Null ||
        flags === ts.TypeFlags.Undefined) {
        return ts.createObjectLiteral();
    }

    if (flags === ts.TypeFlags.Object) {
        let objectType: ts.ObjectType = type as ts.ObjectType;

        if (objectType.objectFlags === ts.ObjectFlags.Interface) {
            const name = type.symbol.name;

            if(predefined[name]){
                return ts.createObjectLiteral([
                    ts.createPropertyAssignment("type", ts.createLiteral(predefined[name]))
                ]);
            }

            if(history && history.indexOf(name) !== -1){
                return ts.createObjectLiteral([
                    ts.createPropertyAssignment("type", ts.createLiteral("any"))
                ]);
            }else if(history){
                history.push(name);
            }

            return parseInterface(type, tc, history, additional);
        }

        if (objectType.objectFlags === ts.ObjectFlags.Reference) {
            return parseArray(type, tc);
        }
    }

    if (flags === ts.TypeFlags.Union) {
        return parseUnion(type, tc, history);
    }

    if (flags === ts.TypeFlags.Intersection) {
        return parseIntersection(type, tc, history);
    }

    if (flags & ts.TypeFlags.EnumLike) {
        return parseEnum(type, tc);
    }

    return ts.createObjectLiteral();
}

function parsePrimitive(type: ts.Type, tc: ts.TypeChecker): ts.ObjectLiteralExpression {
    const typeString = tc.typeToString(type);
    return ts.createObjectLiteral([
        ts.createPropertyAssignment("type", ts.createLiteral(typeString))
    ]);
}

function parseEnum(type: ts.Type, tc: ts.TypeChecker): ts.ObjectLiteralExpression {
    const enumType = type as ts.UnionOrIntersectionType;
    const values = enumType.types.map( enumProperty => {
        return ts.createLiteral((enumProperty as unknown as LiteralType).value);
    });

    return ts.createObjectLiteral([
        ts.createPropertyAssignment("type", ts.createLiteral("enum")),
        ts.createPropertyAssignment("values", ts.createArrayLiteral(values))
    ]);
}

function parseArray(type: ts.Type, tc: ts.TypeChecker): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral([
        ts.createPropertyAssignment("type", ts.createLiteral("array"))
    ]);
}

function parseUnion(type: ts.Type, tc: ts.TypeChecker, history?: string[], additional?: boolean): ts.ObjectLiteralExpression {
    const unionType = type as ts.UnionOrIntersectionType;
    const types = unionType.types.filter(unionProperty => tc.typeToString(unionProperty) !== 'undefined')
        .map( unionProperty => {
            if(unionProperty.flags & ts.TypeFlags.BooleanLiteral){
                return ts.createObjectLiteral([
                    ts.createPropertyAssignment("type", ts.createLiteral("boolean"))
                ]);
            }

            return parseType(unionProperty, tc, history, additional);
        });
    return ts.createArrayLiteral(types) as unknown as ts.ObjectLiteralExpression;
}

function parseIntersection(type: ts.Type, tc: ts.TypeChecker, history?: string[], additional?: boolean): ts.ObjectLiteralExpression {
    const intersectionType = type as ts.UnionOrIntersectionType;
    const types = intersectionType.types.map( intersectionProperty => {
        return parseType(intersectionProperty, tc, history, additional);
    });

    const combinedProperties: ts.ObjectLiteralElementLike[] = [];
    types.forEach( type => {
        type.properties.forEach(property => combinedProperties.push(property));
    });

    return ts.createObjectLiteral(combinedProperties);
}

function parseInterface(type: ts.Type, tc: ts.TypeChecker, history?: string[], additional?: boolean): ts.ObjectLiteralExpression {
    const properties = tc.getPropertiesOfType(type).filter((property) => property.declarations!.length);

    const nested = additional !== undefined && history && history.length > 1;

    const propertiesAssignments = properties.map( property => {
        let parsed = parseType(tc.getTypeOfSymbolAtLocation(property, property.declarations![0]), tc, history, additional);

        const declaration: ts.ParameterDeclaration = property.declarations[0] as ts.ParameterDeclaration;
        if(declaration.questionToken && parsed.properties){

            const combinedProperties: ts.ObjectLiteralElementLike[] = [];
            parsed.properties.forEach( property => combinedProperties.push(property));

            combinedProperties.push(ts.createPropertyAssignment("optional", ts.createLiteral(true)));
            parsed = ts.createObjectLiteral(combinedProperties);
        }

        const docs = property.getJsDocTags();
        if(additional && docs.length && parsed.properties){
            parsed = addProperties(parsed, parseJSDoc(docs));
        }

        return ts.createPropertyAssignment(property.name, parsed);
    })

    const docs = type.symbol.getJsDocTags();
    if(additional && docs.length){
        parseJSDoc(docs).forEach( property => {
            propertiesAssignments.push(property);
        });
    }

    if(nested){
        const neastedPropertiesAssignments = [];
        neastedPropertiesAssignments.push(ts.createPropertyAssignment("type", ts.createLiteral("object")));
        neastedPropertiesAssignments.push(ts.createPropertyAssignment("props", ts.createObjectLiteral(propertiesAssignments)));
        return ts.createObjectLiteral(neastedPropertiesAssignments);
    }

    return ts.createObjectLiteral(propertiesAssignments);
}



/**
 * HELPER FUNCTIONS
 */

function combineObjects(o1: ts.ObjectLiteralExpression, o2: ts.ObjectLiteralExpression): ts.ObjectLiteralExpression{
    const combinedProperties: ts.ObjectLiteralElementLike[] = [];

    o1.properties.forEach( property => combinedProperties.push(property));
    o2.properties.forEach( property => combinedProperties.push(property));

    return ts.createObjectLiteral(combinedProperties);
}

function addProperties(object: ts.ObjectLiteralExpression, combinedProperties: ts.ObjectLiteralElementLike[]): ts.ObjectLiteralExpression{
    object.properties.forEach( property => combinedProperties.push(property));
    return ts.createObjectLiteral(combinedProperties);
}

function addProperty(object: ts.ObjectLiteralExpression, name: string, value: any): ts.ObjectLiteralExpression{
    const combinedProperties: ts.ObjectLiteralElementLike[] = [];

    object.properties.forEach( property => combinedProperties.push(property));
    combinedProperties.push(ts.createPropertyAssignment(name, ts.createLiteral(value)));

    return ts.createObjectLiteral(combinedProperties);
}

function parseJSDoc(docs: ts.JSDocTagInfo[]): ts.PropertyAssignment[]{
    return docs.filter(doc => doc.text).map( doc => {
        let value: any = doc.text;
        if(value === "true"){
            value = true;
        }

        if(value === "false"){
            value = false;
        }

        if(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(value)){
            value = Number(value);
        }
        return ts.createPropertyAssignment(doc.name, ts.createLiteral(value));
    });
}

/**
 * TRANSFORMER LOGIC
 */

function isKeysCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
    if (!ts.isCallExpression(node)) { return false; }

    const signature = typeChecker.getResolvedSignature(node);
    if (typeof signature === "undefined") { return false; }

    const { declaration } = signature;
    return !!declaration
        && !ts.isJSDocSignature(declaration)
        && !!declaration.name
        && declaration.name!.getText() === "schema";
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
    if(node.arguments[0] &&
        (typeArg as MaybeIntrinsicType).intrinsicName === "false"){
        additional = false;
    }

    const type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
    return parseType(type, typeChecker, [], additional);
}

// tslint:disable-next-line:max-line-length
function visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node;

function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node {
    return ts.visitEachChild(visitNode(node, program), (childNode) =>
        visitNodeAndChildren(childNode, program, context), context);
}

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}
