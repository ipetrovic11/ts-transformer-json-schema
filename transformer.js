"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const predefined = {
    IDate: "date",
    IEmail: "email",
    IForbidden: "forbidden",
    IUrl: "url",
    IUUID: "uuid"
};
function transformer(program) {
    return (context) => (file) => visitNodeAndChildren(file, program, context);
}
exports.default = transformer;
function visitNodeAndChildren(node, program, context) {
    return ts.visitEachChild(visitNode(node, program), (childNode) => visitNodeAndChildren(childNode, program, context), context);
}
function visitNode(node, program) {
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
        typeArg.intrinsicName === "false") {
        additional = false;
    }
    const type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
    return parseType(type, typeChecker, 0, [], additional);
}
function isKeysCallExpression(node, typeChecker) {
    if (!ts.isCallExpression(node)) {
        return false;
    }
    const signature = typeChecker.getResolvedSignature(node);
    if (typeof signature === "undefined") {
        return false;
    }
    const { declaration } = signature;
    return !!declaration
        && !ts.isJSDocSignature(declaration)
        && !!declaration.name
        && declaration.name.getText() === "schema";
}
/**
 * PARSING LOGIC
 */
function parseType(type, tc, depth, history, additional, optional) {
    const flags = type.flags;
    if (flags & ts.TypeFlags.StringLike ||
        flags & ts.TypeFlags.NumberLike ||
        flags & ts.TypeFlags.BooleanLike ||
        flags === ts.TypeFlags.Any) {
        return parsePrimitive(type, tc, ++depth, optional);
    }
    if (flags === ts.TypeFlags.Null ||
        flags === ts.TypeFlags.Undefined ||
        flags === ts.TypeFlags.Never) {
        return ts.createObjectLiteral([
            ts.createPropertyAssignment("type", ts.createLiteral("forbidden"))
        ]);
    }
    if (flags === ts.TypeFlags.Object) {
        const objectType = type;
        const name = objectType.symbol.name;
        if (predefined[name]) {
            return ts.createObjectLiteral([
                ts.createPropertyAssignment("type", ts.createLiteral(predefined[name]))
            ]);
        }
        if (tc.isArrayType(objectType)) {
            return parseArray(objectType, tc, ++depth, history, optional);
        }
        if (tc.getIndexInfoOfType(type, ts.IndexKind.Number) || tc.getIndexInfoOfType(type, ts.IndexKind.String)) {
            return ts.createObjectLiteral([
                ts.createPropertyAssignment("type", ts.createLiteral("object"))
            ]);
        }
        if (history && history.indexOf(name) !== -1) {
            return ts.createObjectLiteral([
                ts.createPropertyAssignment("type", ts.createLiteral("any"))
            ]);
        }
        else if (history && (name !== "__type" && name !== "Array")) {
            history.push(name);
        }
        return parseInterface(type, tc, ++depth, history || [], additional, optional);
    }
    if (flags === ts.TypeFlags.Union) {
        return parseUnion(type, tc, ++depth, history, additional, optional);
    }
    if (flags === ts.TypeFlags.Intersection) {
        return parseIntersection(type, tc, ++depth, history, additional);
    }
    if (flags & ts.TypeFlags.EnumLike) {
        return parseEnum(type, tc, ++depth, optional);
    }
    throw new Error("Unknown type");
}
function parsePrimitive(type, tc, depth, optional) {
    const props = [];
    if (optional) {
        props.push(ts.createPropertyAssignment("optional", ts.createLiteral(true)));
    }
    // Handle literal type
    if (type.flags & ts.TypeFlags.Literal) {
        if (!type.hasOwnProperty('value') && type.hasOwnProperty('intrinsicName')) {
            props.push(ts.createPropertyAssignment("type", ts.createLiteral("enum")));
            props.push(ts.createPropertyAssignment("values", ts.createArrayLiteral([
                ts.createLiteral(type.intrinsicName === "true" ? true : false)
            ])));
            return ts.createObjectLiteral(props);
        }
        props.push(ts.createPropertyAssignment("type", ts.createLiteral("enum")));
        props.push(ts.createPropertyAssignment("values", ts.createArrayLiteral([
            ts.createLiteral(type.value)
        ])));
        return ts.createObjectLiteral(props);
    }
    const type_string = tc.typeToString(type);
    props.push(ts.createPropertyAssignment("type", ts.createLiteral(type_string)));
    return ts.createObjectLiteral(props);
}
function parseEnum(type, tc, depth, optional) {
    const enum_type = type;
    const values = enum_type.types.map(enum_property => {
        return ts.createLiteral(enum_property.value);
    });
    const props = [];
    if (optional) {
        props.push(ts.createPropertyAssignment("optional", ts.createLiteral(true)));
    }
    props.push(ts.createPropertyAssignment("type", ts.createLiteral("enum")));
    props.push(ts.createPropertyAssignment("values", ts.createArrayLiteral(values)));
    return ts.createObjectLiteral(props);
}
function parseArray(type, tc, depth, history, optional) {
    const props = [];
    if (optional) {
        props.push(ts.createPropertyAssignment("optional", ts.createLiteral(true)));
    }
    if (type.typeArguments) {
        props.push(ts.createPropertyAssignment("type", ts.createLiteral("array")));
        props.push(ts.createPropertyAssignment("items", parseType(type.typeArguments[0], tc, depth, history)));
    }
    else {
        props.push(ts.createPropertyAssignment("type", ts.createLiteral("array")));
    }
    return ts.createObjectLiteral(props);
}
function parseUnion(type, tc, depth, history, additional, optional) {
    const union_type = type;
    let unionOptional = false;
    let firstBoolean = true;
    const types = union_type.types.filter(union_property => {
        if (union_property.flags & ts.TypeFlags.BooleanLiteral) {
            if (firstBoolean) {
                firstBoolean = false;
                return true;
            }
            else {
                return false;
            }
        }
        if (tc.typeToString(union_property) !== 'undefined') {
            return true;
        }
        else {
            unionOptional = true;
            return false;
        }
    });
    if (types.length === 1) {
        const union_property = types[0];
        if (union_property.flags & ts.TypeFlags.BooleanLiteral) {
            if (optional || unionOptional) {
                return ts.createObjectLiteral([
                    ts.createPropertyAssignment("type", ts.createLiteral("boolean")),
                    ts.createPropertyAssignment("optional", ts.createLiteral(true))
                ]);
            }
            return ts.createObjectLiteral([
                ts.createPropertyAssignment("type", ts.createLiteral("boolean"))
            ]);
        }
        return parseType(union_property, tc, depth, history, additional, unionOptional || optional);
    }
    /**
     * If all types of union are literals, make an enum
     */
    let literals = types.length ? true : false;
    for (let union_property of types) {
        if (!(union_property.flags & ts.TypeFlags.Literal)) {
            literals = false;
        }
    }
    if (literals) {
        const values = types.map(union_property => {
            if (union_property.flags & ts.TypeFlags.BooleanLiteral) {
                if (tc.typeToString(union_property) == 'false') {
                    return ts.createLiteral(false);
                }
                else {
                    return ts.createLiteral(true);
                }
            }
            return ts.createLiteral(union_property.value);
        });
        const props = [];
        if (optional || unionOptional) {
            props.push(ts.createPropertyAssignment("optional", ts.createLiteral(true)));
        }
        props.push(ts.createPropertyAssignment("type", ts.createLiteral("enum")));
        props.push(ts.createPropertyAssignment("values", ts.createArrayLiteral(values)));
        return ts.createObjectLiteral(props);
    }
    const mapped_types = types.map(union_property => {
        if (union_property.flags & ts.TypeFlags.BooleanLiteral) {
            return ts.createObjectLiteral([
                ts.createPropertyAssignment("type", ts.createLiteral("boolean"))
            ]);
        }
        return parseType(union_property, tc, depth, history, additional);
    });
    if (optional || unionOptional) {
        mapped_types.push(ts.createObjectLiteral([
            ts.createPropertyAssignment("type", ts.createLiteral("forbidden"))
        ]));
    }
    return ts.createArrayLiteral(mapped_types);
}
function parseIntersection(type, tc, depth, history, additional) {
    const intersection_type = type;
    const types = intersection_type.types.map(intersection_property => {
        return parseType(intersection_property, tc, depth, history, additional);
    });
    const combined_properties = [];
    const unique = [];
    types.reverse().forEach(type => {
        type.properties.forEach(property => {
            if (property.name) {
                const indentifier = property.name;
                if (indentifier.escapedText === "props") {
                    const assignment = property;
                    const props = assignment.initializer;
                    props.properties.forEach(prop => {
                        const indentifier = prop.name;
                        if (!unique.includes(indentifier.escapedText.toString())) {
                            unique.push(indentifier.escapedText.toString());
                            combined_properties.push(prop);
                        }
                    });
                }
            }
        });
    });
    let properties_assignments = [];
    if (depth > 1) {
        properties_assignments.push(ts.createPropertyAssignment("type", ts.createLiteral("object")));
        properties_assignments.push(ts.createPropertyAssignment("props", ts.createObjectLiteral(combined_properties)));
    }
    else {
        properties_assignments = combined_properties;
    }
    let docs = [];
    if (type.symbol) {
        docs = docs.concat(type.symbol.getJsDocTags());
    }
    if (type.aliasSymbol) {
        docs = docs.concat(type.aliasSymbol.getJsDocTags());
    }
    if (additional && docs.length) {
        parseJSDoc(docs).forEach(property => {
            properties_assignments.push(property);
        });
    }
    return ts.createObjectLiteral(properties_assignments);
}
function parseInterface(type, tc, depth, history, additional, optional) {
    const properties = tc.getPropertiesOfType(type).filter((property) => {
        return (property.declarations && property.declarations.length) || property.type;
    });
    const properties_assignments = properties.map(property => {
        let parsed;
        let optional;
        if (property.declarations) {
            const declaration = property.declarations[0];
            optional = declaration.questionToken ? true : false;
            parsed = parseType(tc.getTypeOfSymbolAtLocation(property, property.declarations[0]), tc, depth, history, additional, optional);
        }
        else {
            parsed = parseType(property.type, tc, depth, history, additional, optional);
        }
        if (optional && parsed.properties) {
            parsed = addProperty(parsed, "optional", true);
        }
        const docs = property.getJsDocTags();
        if (additional && docs.length && parsed.properties) {
            parsed = addProperties(parsed, parseJSDoc(docs));
        }
        history.pop();
        return ts.createPropertyAssignment(property.name, parsed);
    });
    if (properties_assignments.length === 0) {
        history.pop();
        return ts.createObjectLiteral();
    }
    let neasted_properties_assignments = [];
    if (depth > 1) {
        neasted_properties_assignments.push(ts.createPropertyAssignment("type", ts.createLiteral("object")));
        neasted_properties_assignments.push(ts.createPropertyAssignment("props", ts.createObjectLiteral(properties_assignments)));
    }
    else {
        neasted_properties_assignments = properties_assignments;
    }
    let docs = [];
    if (type.symbol) {
        docs = docs.concat(type.symbol.getJsDocTags());
    }
    if (type.aliasSymbol) {
        docs = docs.concat(type.aliasSymbol.getJsDocTags());
    }
    if (additional && docs.length) {
        parseJSDoc(docs).forEach(property => {
            neasted_properties_assignments.push(property);
        });
    }
    if (optional) {
        neasted_properties_assignments.push(ts.createPropertyAssignment("optional", ts.createLiteral(true)));
    }
    history.pop();
    return ts.createObjectLiteral(neasted_properties_assignments);
}
/**
 * HELPER FUNCTIONS
 */
function combineObjects(o1, o2) {
    const combined_properties = [];
    o1.properties.forEach(property => combined_properties.push(property));
    o2.properties.forEach(property => combined_properties.push(property));
    return ts.createObjectLiteral(combined_properties);
}
function addProperties(object, combined_properties) {
    object.properties.forEach(property => combined_properties.push(property));
    return ts.createObjectLiteral(combined_properties);
}
function addProperty(object, name, value) {
    const combined_properties = [];
    object.properties.forEach(property => combined_properties.push(property));
    combined_properties.push(ts.createPropertyAssignment(name, ts.createLiteral(value)));
    return ts.createObjectLiteral(combined_properties);
}
function parseJSDoc(docs) {
    return docs.filter(doc => doc.text).map(doc => {
        let value = doc.text;
        if (value === "true") {
            value = true;
        }
        if (value === "false") {
            value = false;
        }
        if (/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(value)) {
            value = Number(value);
        }
        return ts.createPropertyAssignment(doc.name, ts.createLiteral(value));
    });
}
