"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
describe("Test json schema tranformer", () => {
    describe("Empty variations", () => {
        it("Without interface", () => {
            expect({}).toStrictEqual({});
        });
        it("Empty interface", () => {
            expect({}).toStrictEqual({});
        });
        it("Empty type", () => {
            expect({}).toStrictEqual({});
        });
    });
    describe("Single type tests", () => {
        it("Interface with string", () => {
            expect({ str: { type: "string" } }).toStrictEqual({ str: { type: "string" } });
        });
        it("Interface with any", () => {
            expect({ any: { type: "any" } }).toStrictEqual({ any: { type: "any" } });
        });
        it("Interface with number", () => {
            expect({ num: { type: "number" } }).toStrictEqual({ num: { type: "number" } });
        });
        it("Interface with boolean", () => {
            expect({ bool: { type: "boolean" } }).toStrictEqual({ bool: { type: "boolean" } });
        });
        it("Interface with literal booleans", () => {
            expect({ boolT: { type: "enum", values: [true] }, boolF: { type: "enum", values: [false] } }).toStrictEqual({
                boolT: { type: "enum", values: [true] },
                boolF: { type: "enum", values: [false] }
            });
        });
    });
    describe("Optional type tests", () => {
        it("Interface with optional string", () => {
            expect({ str: { optional: true, type: "string", optional: true } }).toStrictEqual({ str: { type: "string", optional: true } });
        });
        it("Interface with optional any", () => {
            expect({ any: { optional: true, type: "any", optional: true } }).toStrictEqual({ any: { type: "any", optional: true } });
        });
        it("Interface with optional number", () => {
            expect({ num: { optional: true, type: "number", optional: true } }).toStrictEqual({ num: { type: "number", optional: true } });
        });
        it("Interface with optional boolean", () => {
            expect({ bool: { type: "boolean", optional: true, optional: true } }).toStrictEqual({ bool: { type: "boolean", optional: true } });
        });
        it("Interface with all optional", () => {
            expect({ limit: { optional: true, type: "number", optional: true }, offset: { optional: true, type: "number", optional: true } }).toStrictEqual({ limit: { type: "number", optional: true }, offset: { type: "number", optional: true } });
        });
        it("Interface with many optional", () => {
            expect({ limit: { optional: true, type: "number", optional: true }, offset: { optional: true, type: "number", optional: true }, x: { type: "number" } }).toStrictEqual({ x: { type: "number" }, limit: { type: "number", optional: true }, offset: { type: "number", optional: true } });
        });
    });
    describe("Single predefined type tests", () => {
        it("Predefined IEmail", () => {
            expect({ email: { type: "email" } }).toStrictEqual({ email: { type: "email" } });
        });
        it("Predefined IDate", () => {
            expect({ date: { type: "date" } }).toStrictEqual({ date: { type: "date" } });
        });
        it("Predefined IForbidden", () => {
            expect({ forbidden: { type: "forbidden" } }).toStrictEqual({ forbidden: { type: "forbidden" } });
        });
        it("Predefined IUrl", () => {
            expect({ url: { type: "url" } }).toStrictEqual({ url: { type: "url" } });
        });
        it("Predefined IUUID", () => {
            expect({ uuid: { type: "uuid" } }).toStrictEqual({ uuid: { type: "uuid" } });
        });
    });
    describe("Array type tests", () => {
        it("Array of strings", () => {
            expect({ str: { type: "array", items: { type: "string" } } }).toStrictEqual({ str: { type: "array", items: { type: "string" } } });
        });
        it("Array of any", () => {
            expect({ any: { type: "array", items: { type: "any" } } }).toStrictEqual({ any: { type: "array", items: { type: "any" } } });
        });
        it("Array of numbers", () => {
            expect({ num: { type: "array", items: { type: "number" } } }).toStrictEqual({ num: { type: "array", items: { type: "number" } } });
        });
        it("Array of booleans", () => {
            expect({ bool: { type: "array", items: { type: "boolean" } } }).toStrictEqual({ bool: { type: "array", items: { type: "boolean" } } });
        });
        it("Array defined with Array", () => {
            expect({ array: { type: "array", items: { type: "number" } } }).toStrictEqual({ array: { type: "array", items: { type: "number" } } });
        });
    });
    describe("Union type tests", () => {
        it("Union string and any", () => {
            expect({ any: { type: "any" } }).toStrictEqual({ any: { type: "any" } });
        });
        it("Union string and number", () => {
            expect({ union: [{ type: "string" }, { type: "number" }] }).toStrictEqual({ union: [{ type: "string" }, { type: "number" }] });
        });
        it("Union string and boolean", () => {
            expect({ union: [{ type: "string" }, { type: "boolean" }] }).toStrictEqual({ union: [{ type: "string" }, { type: "boolean" }] });
        });
        it("Union string and predefined", () => {
            expect({ union: [{ type: "string" }, { type: "email" }] }).toStrictEqual({ union: [{ type: "string" }, { type: "email" }] });
        });
        it("Union predefined and predefined", () => {
            expect({ union: [{ type: "email" }, { type: "uuid" }] }).toStrictEqual({ union: [{ type: "email" }, { type: "uuid" }] });
        });
        it("Union optional", () => {
            expect({ union: [{ type: "email" }, { type: "uuid" }, { type: "forbidden" }] }).toStrictEqual({ union: [{ type: "email" }, { type: "uuid" }, { type: "forbidden" }] });
        });
        it("Objects with literal string union", () => {
            expect({ union: [{ type: "object", props: { variant: { type: "enum", values: ["a"] }, a: { type: "number" } } }, { type: "object", props: { variant: { type: "enum", values: ["b"] }, b: { type: "number" } } }] }).toStrictEqual({ union: [
                    { type: "object", props: { variant: { type: "enum", values: ["a"] }, a: { type: "number" } } },
                    { type: "object", props: { variant: { type: "enum", values: ["b"] }, b: { type: "number" } } },
                ] });
        });
        it("Objects with literal number union", () => {
            expect({ union: [{ type: "object", props: { variant: { type: "enum", values: [1] }, a: { type: "number" } } }, { type: "object", props: { variant: { type: "enum", values: [2] }, b: { type: "number" } } }] }).toStrictEqual({ union: [
                    { type: "object", props: { variant: { type: "enum", values: [1] }, a: { type: "number" } } },
                    { type: "object", props: { variant: { type: "enum", values: [2] }, b: { type: "number" } } },
                ] });
        });
    });
    describe("Intersection types tests", () => {
        it("Basic intersection", () => {
            expect({ combined: { type: "object", props: { part2: { type: "number" }, part1: { type: "string" } } } }).toStrictEqual({
                combined: {
                    type: 'object', props: {
                        part1: { type: "string" },
                        part2: { type: "number" }
                    }
                }
            });
        });
        it("Top-level intersection", () => {
            expect({ part2: { type: "number" }, part1: { type: "string" } }).toStrictEqual({
                part1: { type: "string" },
                part2: { type: "number" }
            });
        });
        it("Interface with primitive and interface", () => {
            // TODO: in this case if there is strict annotation it should be ignored.
            expect({ combined: { type: "object", props: { part1: { type: "string" } } } }).toStrictEqual({
                combined: {
                    type: 'object', props: {
                        part1: { type: "string" }
                    }
                }
            });
        });
    });
    describe("Neased types tests", () => {
        it("Basic nested interfaces", () => {
            expect({ neasted: { type: "object", props: { num: { type: "number" }, str: { type: "string" } } }, num: { type: "number" } }).toStrictEqual({
                neasted: {
                    type: "object", props: {
                        num: { type: 'number' },
                        str: { type: 'string' }
                    }
                },
                num: { type: 'number' }
            });
        });
        it("Tripple nested interfaces", () => {
            expect({ n2: { type: "object", props: { n1: { type: "object", props: { x: { type: "number" } } } } } }).toStrictEqual({
                n2: {
                    type: "object", props: {
                        n1: {
                            type: "object", props: {
                                x: { type: "number" }
                            }
                        }
                    }
                }
            });
        });
    });
    describe("Generic type tests", () => {
        it("Generic string type", () => {
            expect({ generic: { type: "string" } }).toStrictEqual({ generic: { type: "string" } });
        });
        it("Generic string type", () => {
            expect({ generic: { type: "any" } }).toStrictEqual({ generic: { type: "any" } });
        });
        it("Generic boolean type", () => {
            expect({ generic: { type: "boolean" } }).toStrictEqual({ generic: { type: "boolean" } });
        });
        it("Generic predefined type", () => {
            expect({ generic: { type: "email" } }).toStrictEqual({ generic: { type: "email" } });
        });
        it("Generic union type", () => {
            expect({ generic: [{ type: "string" }, { type: "number" }] }).toStrictEqual({ generic: [{ type: "string" }, { type: "number" }] });
        });
        it("Generic interface type", () => {
            expect({ generic: { type: "object", props: { str: { type: "string" } } } }).toStrictEqual({
                generic: {
                    type: "object", props: {
                        str: { type: "string" }
                    }
                }
            });
        });
        it("Generic interface type null", () => {
            expect({ forbidden: { type: "forbidden" } }).toStrictEqual({
                forbidden: { type: "forbidden" }
            });
        });
        it("Generic interface type undefined", () => {
            expect({ forbidden: { type: "forbidden" } }).toStrictEqual({
                forbidden: { type: "forbidden" }
            });
        });
        it("Generic interface type never", () => {
            expect({ forbidden: { type: "forbidden" } }).toStrictEqual({
                forbidden: { type: "forbidden" }
            });
        });
    });
    describe("Anonimous type tests", () => {
        it("Basic anonimous type", () => {
            expect({ str1: { type: "string" }, str2: { type: "string" } }).toStrictEqual({ str1: { type: "string" }, str2: { type: "string" } });
        });
        it("Union anonimous type", () => {
            expect([{ type: "object", props: { str1: { type: "string" }, str2: { type: "string" } } }, { type: "object", props: { str1: { type: "string" }, str3: { type: "string" } } }]).toStrictEqual([{ type: "object", props: { str1: { type: "string" }, str2: { type: "string" } } }, { type: "object", props: { str1: { type: "string" }, str3: { type: "string" } } }]);
        });
        it("Generic anonimous type", () => {
            expect([{ type: "object", props: { str1: { type: "string" }, str3: { type: "string" } } }, { type: "object", props: { num: { type: "number" }, str2: { type: "string" } } }]).toStrictEqual([{ type: "object", props: { str1: { type: "string" }, str3: { type: "string" } } }, { type: "object", props: { num: { type: "number" }, str2: { type: "string" } } }]);
        });
    });
    describe("Infinite recursion test", () => {
        it("Infinite recursion with 2 interfaces", () => {
            expect({ step2: { type: "object", props: { step1: { type: "any" } } } }).toStrictEqual({
                step2: {
                    type: "object",
                    props: {
                        step1: { type: "any" }
                    }
                }
            });
        });
        it("Infinite recursion with 3 interfaces", () => {
            expect({ step2: { type: "object", props: { step3: { type: "object", props: { step1: { type: "any" } } } } } }).toStrictEqual({
                step2: {
                    type: "object",
                    props: {
                        step3: {
                            type: "object",
                            props: {
                                step1: { type: "any" }
                            }
                        }
                    }
                }
            });
        });
        it("Recursion on different levels", () => {
            expect({ test: [{ type: "object", props: { type: { type: "string" }, neasted: { type: "object", props: { bool: { type: "boolean" }, boolT: { type: "enum", values: [true] }, num: { type: "number" }, num0: { type: "enum", values: [0] } } } } }, { type: "object", props: { id: { type: "number" }, type: { type: "string" }, neasted: { type: "object", props: { bool: { type: "boolean" }, boolT: { type: "enum", values: [true] }, num: { type: "number" }, num0: { type: "enum", values: [0] } } } } }] }).toStrictEqual({
                test: [{
                        type: "object",
                        props: {
                            type: {
                                type: "string"
                            },
                            neasted: {
                                type: "object",
                                props: {
                                    bool: {
                                        type: "boolean"
                                    },
                                    boolT: {
                                        type: "enum",
                                        values: [true]
                                    },
                                    num: {
                                        type: "number"
                                    },
                                    num0: {
                                        type: "enum",
                                        values: [0]
                                    }
                                }
                            }
                        }
                    }, {
                        type: "object",
                        props: {
                            id: {
                                type: "number"
                            },
                            type: {
                                type: "string"
                            },
                            neasted: {
                                type: "object",
                                props: {
                                    bool: {
                                        type: "boolean"
                                    },
                                    boolT: {
                                        type: "enum",
                                        values: [true]
                                    },
                                    num: {
                                        type: "number"
                                    },
                                    num0: {
                                        type: "enum",
                                        values: [0]
                                    }
                                }
                            }
                        }
                    }]
            });
        });
    });
    describe("Enumerable types test", () => {
        it("Interface with enmerable strings", () => {
            let UserGroup;
            (function (UserGroup) {
                UserGroup["Admin"] = "admin";
                UserGroup["Manager"] = "manager";
                UserGroup["Employee"] = "employee";
            })(UserGroup || (UserGroup = {}));
            expect({ enum: { type: "enum", values: ["admin", "manager", "employee"] } }).toStrictEqual({
                enum: { type: 'enum', values: ['admin', 'manager', 'employee'] }
            });
        });
        it("Interface with enmerable default numbers", () => {
            let UserGroup;
            (function (UserGroup) {
                UserGroup[UserGroup["Admin"] = 0] = "Admin";
                UserGroup[UserGroup["Manager"] = 1] = "Manager";
                UserGroup[UserGroup["Employee"] = 2] = "Employee";
            })(UserGroup || (UserGroup = {}));
            expect({ enum_num: { type: "enum", values: [0, 1, 2] } }).toStrictEqual({
                enum_num: { type: 'enum', values: [0, 1, 2] }
            });
        });
        it("Interface with mixed enmerable", () => {
            let UserGroup;
            (function (UserGroup) {
                UserGroup[UserGroup["Admin"] = 1] = "Admin";
                UserGroup[UserGroup["Manager"] = 2] = "Manager";
                UserGroup["Employee"] = "string";
            })(UserGroup || (UserGroup = {}));
            expect({ enum_mixed: { type: "enum", values: [1, 2, "string"] } }).toStrictEqual({
                enum_mixed: { type: 'enum', values: [1, 2, 'string'] }
            });
        });
        it("Interface with optional enmerable", () => {
            let UserGroup;
            (function (UserGroup) {
                UserGroup[UserGroup["Admin"] = 1] = "Admin";
                UserGroup[UserGroup["Manager"] = 2] = "Manager";
                UserGroup["Employee"] = "string";
            })(UserGroup || (UserGroup = {}));
            expect({ enum_mixed: { optional: true, type: "enum", values: [1, 2, "string"], optional: true } }).toStrictEqual({
                enum_mixed: {
                    "optional": true,
                    "type": "enum",
                    "values": [
                        1,
                        2,
                        "string"
                    ],
                }
            });
        });
        it("Interface with optional union of literals", () => {
            let UserGroup;
            (function (UserGroup) {
                UserGroup[UserGroup["Admin"] = 1] = "Admin";
                UserGroup[UserGroup["Manager"] = 2] = "Manager";
                UserGroup["Employee"] = "string";
            })(UserGroup || (UserGroup = {}));
            expect({ enum_mixed: { optional: true, type: "enum", values: [1, 1, 2, "string"], optional: true } }).toStrictEqual({
                enum_mixed: {
                    "optional": true,
                    "type": "enum",
                    "values": [
                        1,
                        1,
                        2,
                        "string"
                    ],
                }
            });
        });
        it("Interface with optional union of literals and false", () => {
            let UserGroup;
            (function (UserGroup) {
                UserGroup[UserGroup["Admin"] = 1] = "Admin";
                UserGroup[UserGroup["Manager"] = 2] = "Manager";
                UserGroup["Employee"] = "string";
            })(UserGroup || (UserGroup = {}));
            expect({ enum_mixed: { optional: true, type: "enum", values: [false, 1, 2, "string"], optional: true } }).toStrictEqual({
                enum_mixed: {
                    "optional": true,
                    "type": "enum",
                    "values": [
                        false,
                        1,
                        2,
                        "string"
                    ],
                }
            });
        });
        it("Interface with optional union of literals and true", () => {
            let UserGroup;
            (function (UserGroup) {
                UserGroup[UserGroup["Admin"] = 1] = "Admin";
                UserGroup[UserGroup["Manager"] = 2] = "Manager";
                UserGroup["Employee"] = "string";
            })(UserGroup || (UserGroup = {}));
            expect({ enum_mixed: { optional: true, type: "enum", values: [true, 1, 2, "string"], optional: true } }).toStrictEqual({
                enum_mixed: {
                    "optional": true,
                    "type": "enum",
                    "values": [
                        true,
                        1,
                        2,
                        "string"
                    ],
                }
            });
        });
    });
    describe("Extended types test", () => {
        it("Interface extends interface", () => {
            expect({ any: { type: "any" }, num: { type: "number" }, str: { type: "string" } }).toStrictEqual({
                num: { type: "number" },
                str: { type: "string" },
                any: { type: "any" }
            });
        });
        it("Interface extends interface and overrides", () => {
            expect({ any: { type: "any" }, str: { type: "any" }, num: { type: "number" } }).toStrictEqual({
                num: { type: "number" },
                str: { type: "any" },
                any: { type: "any" }
            });
        });
    });
    describe("Additional properties", () => {
        it("Basic types with additional properties as number", () => {
            expect({ str: { min: 1, max: 10, type: "string" }, num: { min: 5, max: 15, type: "number" } }).toStrictEqual({
                str: { type: "string", min: 1, max: 10 },
                num: { type: "number", min: 5, max: 15 }
            });
        });
        it("Basic types with additional properties as boolean", () => {
            expect({ str: { empty: false, numeric: true, type: "string" }, num: { positive: true, convert: true, type: "number" } }).toStrictEqual({
                str: { type: "string", empty: false, numeric: true },
                num: { type: "number", positive: true, convert: true }
            });
        });
        it("Basic types with additional properties as regex", () => {
            expect({ str: { pattern: "^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$", type: "string" } }).toStrictEqual({
                str: { type: "string", pattern: "^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$" },
            });
        });
        it("Additional properties neasted", () => {
            expect({ str: { pattern: "^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$", type: "string" }, additional: { type: "object", props: { str: { empty: false, numeric: true, type: "string" }, num: { positive: true, convert: true, type: "number" } } } }).toStrictEqual({
                str: { type: "string", pattern: "^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$" },
                additional: {
                    type: "object",
                    props: {
                        str: { type: "string", empty: false, numeric: true },
                        num: { type: "number", positive: true, convert: true }
                    }
                }
            });
        });
        it("Additional properties neasted disabled", () => {
            expect({ str: { type: "string" }, additional: { type: "object", props: { str: { type: "string" }, num: { type: "number" } } } }).toStrictEqual({
                str: { type: "string" },
                additional: {
                    type: "object",
                    props: {
                        str: { type: "string" },
                        num: { type: "number" }
                    }
                }
            });
        });
        it("Additional properties disabled", () => {
            expect({ str: { type: "string" } }).toStrictEqual({
                str: { type: "string" },
            });
        });
        it("Additional properties on interface", () => {
            expect({ str: { type: "string" }, $$strict: true }).toStrictEqual({
                str: { type: "string" },
                $$strict: true
            });
        });
        it("Additional properties on type", () => {
            expect({ str: { type: "string" }, $$strict: true }).toStrictEqual({
                str: { type: "string" },
                $$strict: true
            });
        });
        it("Additional properties on index type", () => {
            let Enumerable;
            (function (Enumerable) {
                Enumerable["str"] = "str";
            })(Enumerable || (Enumerable = {}));
            expect({ str: { type: "string" }, $$strict: true }).toStrictEqual({
                str: { type: "string" },
                $$strict: true
            });
        });
        it("Additional properties on intersection of types", () => {
            expect({ str2: { type: "string" }, str: { type: "string" }, $$strict: true }).toStrictEqual({
                str: { type: "string" },
                str2: { type: "string" },
                $$strict: true
            });
        });
        it("Additional properties from external file", () => {
            expect({ str: { empty: false, numeric: true, type: "string" }, num: { positive: true, convert: true, type: "number" }, $$strict: true }).toStrictEqual({
                str: { type: "string", empty: false, numeric: true },
                num: { type: "number", positive: true, convert: true },
                $$strict: true
            });
        });
        it("Additional properties on top level with optional", () => {
            expect({ str: { optional: true, type: "string", optional: true }, $$strict: true }).toStrictEqual({
                str: { type: "string", optional: true },
                $$strict: true
            });
        });
        it("Additional properties combined with optional", () => {
            expect({ str: { empty: false, optional: true, type: "string", optional: true } }).toStrictEqual({
                str: { type: "string", optional: true, empty: false }
            });
        });
    });
    describe("Index interface", () => {
        it("Index interface nested", () => {
            expect({ index: { type: "object" } }).toStrictEqual({ index: { type: "object" } });
        });
        it("Index type using enum", () => {
            let Enumerable;
            (function (Enumerable) {
                Enumerable["a"] = "a";
                Enumerable["b"] = "b";
                Enumerable["c"] = "c";
            })(Enumerable || (Enumerable = {}));
            expect({ a: { type: "string" }, b: { type: "string" }, c: { type: "string" } }).toStrictEqual({ a: { type: "string" }, b: { type: "string" }, c: { type: "string" } });
        });
        it("Index type using enum and optional", () => {
            let Enumerable;
            (function (Enumerable) {
                Enumerable["a"] = "a";
                Enumerable["b"] = "b";
                Enumerable["c"] = "c";
            })(Enumerable || (Enumerable = {}));
            expect({ a: { optional: true, type: "string" }, b: { optional: true, type: "string" }, c: { optional: true, type: "string" } }).toStrictEqual({ a: { type: "string", optional: true }, b: { type: "string", optional: true }, c: { type: "string", optional: true } });
        });
        it("Index type using enum, multiple values and optional", () => {
            let Enumerable;
            (function (Enumerable) {
                Enumerable["a"] = "a";
                Enumerable["b"] = "b";
                Enumerable["c"] = "c";
            })(Enumerable || (Enumerable = {}));
            expect({ a: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], b: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], c: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }] }).toStrictEqual({
                a: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: 'forbidden' }],
                b: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: 'forbidden' }],
                c: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: 'forbidden' }],
            });
        });
    });
    describe("Partial interface", () => {
        it("Basic partial interface", () => {
            expect({ str: { optional: true, type: "string" }, num: { optional: true, type: "number" } }).toStrictEqual({ str: { type: 'string', optional: true }, num: { type: 'number', optional: true } });
        });
        it("Partial interface with enum", () => {
            let UserGroup;
            (function (UserGroup) {
                UserGroup["Admin"] = "admin";
                UserGroup["Manager"] = "manager";
                UserGroup["Employee"] = "employee";
            })(UserGroup || (UserGroup = {}));
            expect({ enum: { optional: true, type: "enum", values: ["admin", "manager", "employee"] } }).toStrictEqual({
                enum: { optional: true, type: 'enum', values: ['admin', 'manager', 'employee'] }
            });
        });
        it("Basic partial interface", () => {
            expect({ str: { optional: true, type: "string" }, status: { type: "object", props: { boolena: { type: "boolean" }, str: { optional: true, type: "string", optional: true } }, optional: true } }).toStrictEqual({
                str: { type: 'string', optional: true },
                status: { type: "object", props: { boolena: { type: "boolean" }, str: { optional: true, type: "string" } }, optional: true }
            });
        });
    });
});
