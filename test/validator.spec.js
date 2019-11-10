"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validator = require('fastest-validator');
const v = new Validator();
const index_1 = require("../index");
describe("Test validator directly with json schema transformer", () => {
    describe("Union optional", () => {
        it("Should succeed with email", () => {
            expect(v.validate({ union: "john@acme.com" }, { union: [{ type: "email" }, { type: "uuid" }, { type: "forbidden" }] })).toBe(true);
        });
        it("Should succeed with email", () => {
            expect(v.validate({ union: "083c5eb4-87cc-42f4-9b9d-691af310a423" }, { union: [{ type: "email" }, { type: "uuid" }, { type: "forbidden" }] })).toBe(true);
        });
        it("Should succeed empty", () => {
            expect(v.validate({}, { union: [{ type: "email" }, { type: "uuid" }, { type: "forbidden" }] })).toBe(true);
        });
        it("Should fail with number", () => {
            expect(v.validate({ union: 1 }, { union: [{ type: "email" }, { type: "uuid" }, { type: "forbidden" }] })).toBeInstanceOf(Array);
        });
        it("Should fail with object", () => {
            expect(v.validate({ union: { email: "john@acme.com" } }, { union: [{ type: "email" }, { type: "uuid" }, { type: "forbidden" }] })).toBeInstanceOf(Array);
        });
    });
    describe("Index interface", () => {
        it("Should succeed with object with string prop", () => {
            expect(v.validate({ index: { a: "string" } }, { index: { type: "object" } })).toBe(true);
        });
        it("Should succeed with object with number prop", () => {
            expect(v.validate({ index: { a: 1 } }, { index: { type: "object" } })).toBe(true);
        });
        it("Should succeed with object with object prop", () => {
            expect(v.validate({ index: { a: {} } }, { index: { type: "object" } })).toBe(true);
        });
        it("Should fail with null", () => {
            expect(v.validate({ index: null }, { index: { type: "object" } })).toBeInstanceOf(Array);
        });
        it("Should fail with string", () => {
            expect(v.validate({ index: "string" }, { index: { type: "object" } })).toBeInstanceOf(Array);
        });
        it("Should fail with array", () => {
            expect(v.validate({ index: [] }, { index: { type: "object" } })).toBeInstanceOf(Array);
        });
        it("Should fail without index prop", () => {
            expect(v.validate({ a: {} }, { index: { type: "object" } })).toBeInstanceOf(Array);
        });
        it("Should succeed with valid index type prop", () => {
            let Enumerable;
            (function (Enumerable) {
                Enumerable["a"] = "a";
                Enumerable["b"] = "b";
                Enumerable["c"] = "c";
            })(Enumerable || (Enumerable = {}));
            expect(v.validate({ a: ['str', 'str'] }, { a: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], b: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], c: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }] })).toBe(true);
        });
        it("Should succeed with valid index type prop", () => {
            let Enumerable;
            (function (Enumerable) {
                Enumerable["a"] = "a";
                Enumerable["b"] = "b";
                Enumerable["c"] = "c";
            })(Enumerable || (Enumerable = {}));
            expect(v.validate({ a: 'str' }, { a: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], b: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], c: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }] })).toBe(true);
        });
        it("Should succeed without any prop", () => {
            let Enumerable;
            (function (Enumerable) {
                Enumerable["a"] = "a";
                Enumerable["b"] = "b";
                Enumerable["c"] = "c";
            })(Enumerable || (Enumerable = {}));
            expect(v.validate({}, { a: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], b: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], c: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }] })).toBe(true);
        });
        it("Should fail with invalid index type prop", () => {
            let Enumerable;
            (function (Enumerable) {
                Enumerable["a"] = "a";
                Enumerable["b"] = "b";
                Enumerable["c"] = "c";
            })(Enumerable || (Enumerable = {}));
            expect(v.validate({ a: {} }, { a: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], b: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }], c: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "forbidden" }] })).toBeInstanceOf(Array);
        });
    });
});
