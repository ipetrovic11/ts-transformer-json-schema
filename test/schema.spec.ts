"use strict";

import { schema } from '../index';
import { IExternal } from './interfaces';
import { IEmail, IDate, IForbidden, IUrl, IUUID } from '../predefined';

describe("Test json schema tranformer", () => {

	describe("Single type tests", () => {

		it("Without interface", () => {
			expect(schema()).toStrictEqual({});
		});

		it("Empty interface", () => {
			interface IEmpty { }

			expect(schema<IEmpty>()).toStrictEqual({});
		});

		it("Interface with string", () => {
			interface IString {
				str: string;
			}

			expect(schema<IString>()).toStrictEqual({ str: { type: "string" } });
		});

		it("Interface with any", () => {
			interface IAny {
				any: any;
			}

			expect(schema<IAny>()).toStrictEqual({ any: { type: "any" } });
		});

		it("Interface with number", () => {
			interface INumber {
				num: number;
			}

			expect(schema<INumber>()).toStrictEqual({ num: { type: "number" } });
		});

		it("Interface with boolean", () => {
			interface IBool {
				bool: boolean;
			}

			expect(schema<IBool>()).toStrictEqual({ bool: { type: "boolean" } });
		});
	});

	describe("Array type tests", () => {

		it("Interface with numbers array", () => {
			interface IArray {
				num_array: number[];
			}

			expect(schema<IArray>()).toStrictEqual({ num_array: { type: "array" } });
		});

		it("Interface with strings array", () => {
			interface IArray {
				str_array: string[];
			}

			expect(schema<IArray>()).toStrictEqual({ str_array: { type: "array" } });
		});

		it("Interface with strings array using Array<T>", () => {
			interface IArray {
				str_array: Array<string>;
			}

			expect(schema<IArray>()).toStrictEqual({ str_array: { type: "array" } });
		});

		it("Interface with strings array using Array<T>", () => {
			interface IArrayMultipleTypes {
				mul_array: Array<string | number>;
			}

			expect(schema<IArrayMultipleTypes>()).toStrictEqual({ mul_array: { type: "array" } });
		});
	});

	describe("Union validator types tests", () => {

		it("Interface with any or string", () => {
			interface IUnion {
				union: any | string;
			}

			expect(schema<IUnion>()).toStrictEqual({
				union: { type: "any" }
			});
		});

		it("Interface with string or number", () => {
			interface IUnion {
				union: string | number;
			}

			expect(schema<IUnion>()).toStrictEqual({
				union: [
					{ type: "string" },
					{ type: "number" }
				]
			});
		});

		it("Interface with string, number or boolean", () => {
			interface IUnion {
				optional: string | number | boolean ;
			}

			expect(schema<IUnion>()).toStrictEqual({
				optional: [
					{ type: "string" }, 
					{ type: "number" }, 
					{ type: "boolean" },
					{ type: "boolean" }
				]
			});
		});

		it("Interface with string or boolean", () => {
			interface IUnion {
				optional: string | boolean ;
			}

			expect(schema<IUnion>()).toStrictEqual({
				optional: [
					{ type: "string" }, 
					{ type: "boolean" },
					{ type: "boolean" }
				]
			});
		});

		it("Interface with string or number[]", () => {
			interface IUnion {
				optional: string | number[] ;
			}

			expect(schema<IUnion>()).toStrictEqual({
				optional: [
					{ type: "string" }, 
					{ type: "array" }
				]
			});
		});
	});

	describe("Intersection validator types tests", () => {

		it("Interface with any or string", () => {

			interface IIntersectionPart1 {
				part1: string;
			}

			interface IIntersectionPart2 {
				part2: number;
			}

			interface IIntersection {
				combined : IIntersectionPart1 & IIntersectionPart2;
			}

			expect(schema<IIntersection>()).toStrictEqual({
				combined: {
					part1: { type: "string" },
					part2: { type: "number" }
				}
			});
		});
	});

	describe("Enumerable validator types test", () => {

		it("Interface with enmerable strings", () => {
			enum UserGroup {
				Admin = 'admin',
				Manager = 'manager',
				Employee = 'employee'
			}

			interface IEnumerable {
				enum: UserGroup;
			}

			expect(schema<IEnumerable>()).toStrictEqual({
				enum: { type: 'enum', values: ['admin', 'manager', 'employee'] }
			});
		});

		it("Interface with enmerable default numbers", () => {
			enum UserGroup {
				Admin,
				Manager,
				Employee
			}

			interface IEnumerable {
				enum_num: UserGroup;
			}

			expect(schema<IEnumerable>()).toStrictEqual({
				enum_num: { type: 'enum', values: [0, 1, 2] }
			});
		});

		it("Interface with enmerable numbers", () => {
			enum UserGroup {
				Admin = 1,
				Manager = 2,
				Employee = 5
			}

			interface IEnumerable {
				enum_num: UserGroup;
			}

			expect(schema<IEnumerable>()).toStrictEqual({
				enum_num: { type: 'enum', values: [1, 2, 5] }
			});
		});

		it("Interface with mixed enmerable", () => {
			enum UserGroup {
				Admin = 1,
				Manager = 2,
				Employee = 'string'
			}

			interface IEnumerable {
				enum_mixed: UserGroup;
			}

			expect(schema<IEnumerable>()).toStrictEqual({
				enum_mixed: { type: 'enum', values: [1, 2, 'string'] }
			});
		});
	});

	describe("Neased validator types test", () => {

		it("Basic nested interfaces", () => {

			interface IInner {
				num: number;
				str: string;
			}

			interface IOuter {
				nested: IInner;
				num: number;
			}

			expect(schema<IOuter>()).toStrictEqual({
					num: { type: 'number'},
					nested: {
						type: "object",
						props: {
								num: { type: 'number'},
								str: { type: 'string'},
						},
					},
			});
		});
	});

	describe("Extended validator types test", () => {

		it("Interface extends interface", () => {

			interface IExtendable {
				num: number;
				str: string;
			}

			interface IExtended extends IExtendable {
				any: any;
			}

			expect(schema<IExtended>()).toStrictEqual({
				num: { type: "number" },
				str: { type: "string" },
				any: { type: "any" }
			});
		});

		it("Interface extends interface and overrides", () => {

			interface IExtendable {
				num: number;
				str: string;
			}

			interface IOverrided extends IExtendable {
				any: any;
				str: any;
			}

			expect(schema<IOverrided>()).toStrictEqual({
				num: { type: "number" },
				str: { type: "any" },
				any: { type: "any" }
			});
		});
	});

	describe("Bulk types tests", () => {

		it("Interface with strings array", () => {
			interface IBulk {
				any: any;
				bool: boolean;
				num: number;
				str: string;
				aString: string[];
				aNumber: number[];
				aBoolean: boolean[];
			}

			expect(schema<IBulk>()).toStrictEqual({
				any: { type: "any" },
				bool: { type: "boolean" },
				num: { type: "number" },
				str: { type: "string" },
				aString: { type: "array" },
				aNumber: { type: "array" },
				aBoolean: { type: "array" }
			});
		});

	});

	describe("Optional types tests", () => {

		it("Optional property any", () => {
			interface IOptional {
				optional?: any;
			}

			expect(schema<IOptional>()).toStrictEqual({
				optional: { type: "any", optional: true }
			});
		});

		it("Optional property union", () => {
			interface IOptional {
				readonly optional?: string | number ;
			}

			expect(schema<IOptional>()).toStrictEqual({
				optional: [{ type: "string" }, { type: "number" }]
			});
		});
	});

	describe("Additional properties as anotation", () => {

		it("Basic types with additional properties as number", () => {
			interface IBasic {
				/**
				 * @min 1
				 * @max 10
				 */
				str: string;

				/**
				 * @min 5
				 * @max 15
				 */
				num: number;
			}
			expect(schema<IBasic>()).toStrictEqual({
				str: { type: "string", min: 1, max: 10 },
				num: { type: "number", min: 5, max: 15 }
			});
		});

		it("Basic types with additional properties as boolean", () => {
			interface IBasic {
				/**
				 * @empty false
				 * @numeric true
				 */
				str: string;

				/**
				 * @positive true
				 * @convert true
				 */
				num: number;
			}
			expect(schema<IBasic>()).toStrictEqual({
				str: { type: "string", empty: false, numeric: true},
				num: { type: "number", positive: true, convert: true }
			});
		});

		it("Basic types with additional properties as regex", () => {
			interface IBasic {
				/**
				 * @pattern ^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$
				 */
				str: string;
			}
			expect(schema<IBasic>()).toStrictEqual({
				str: { type: "string", pattern: "^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$"},
			});
		});

		it("Additional properties nested", () => {
			interface IAdditional {
				/**
				 * @empty false
				 * @numeric true
				 */
				str: string;

				/**
				 * @positive true
				 * @convert true
				 */
				num: number;
			}

			interface IAdditional2 {
				/**
				 * @pattern ^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$
				 */
				str: string;
				additional: IAdditional;
			}
			expect(schema<IAdditional2>()).toStrictEqual({
					str: { type: "string", pattern: "^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$" },
					additional: {
						type: "object",
						props: {
							str: { type: "string", empty: false, numeric: true },
							num: { type: "number", positive: true, convert: true },
						}
					}
			});
		});

		it("Additional properties nested disabled", () => {
			interface IAdditional {
				/**
				 * @empty false
				 * @numeric true
				 */
				str: string;

				/**
				 * @positive true
				 * @convert true
				 */
				num: number;
			}

			interface IAdditional2 {
				/**
				 * @pattern ^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$
				 */
				str: string;
				additional: IAdditional;
			}
			expect(schema<IAdditional2>(false)).toStrictEqual({
					str: { type: "string" },
					additional: {
						type: "object",
						props: {
							str: { type: "string" },
							num: { type: "number" },
						}
					}
			});
		});

		it("Additional properties disabled", () => {
			interface IBasic {
				/**
				 * @pattern ^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$
				 */
				str: string;
			}
			expect(schema<IBasic>(false)).toStrictEqual({
				str: { type: "string" },
			});
		});

		it("Additional properties on interface", () => {
			/**
			 * @$$strict true
			 */
			interface IBasic {
				str: string;
			}
			expect(schema<IBasic>()).toStrictEqual({
				str: { type: "string" },
				$$strict: true
			});
		});

		it("Additional properties from external file", () => {

			expect(schema<IExternal>()).toStrictEqual({
				str: { type: "string", empty: false, numeric: true},
				num: { type: "number", positive: true, convert: true },
				$$strict: true
			});
		});
	});

	describe("Infinite recursion test", () => {

		it("Infinite recursion or 2 interfaces", () => {

			interface IStep1 {
				step2: IStep2;
			}

			interface IStep2 {
				step1: IStep1;
			}

			expect(schema<IStep1>()).toStrictEqual({
					step2: { 
						type: "object",
						props: {
							step1: { type: "any" } }
						}
			});
		});
	});

	describe("Predefined types", () => {

		it("Predefined IEmail", () => {

			interface IPredefined {
				email: IEmail;
			}

			expect(schema<IPredefined>()).toStrictEqual({
				email: { type: "email" }
			});
		});

		it("Predefined IDate", () => {

			interface IPredefined {
				date: IDate;
			}

			expect(schema<IPredefined>()).toStrictEqual({
				date: { type: "date" }
			});
		});

		it("Predefined IForbidden", () => {

			interface IPredefined {
				forbidden: IForbidden;
			}

			expect(schema<IPredefined>()).toStrictEqual({
				forbidden: { type: "forbidden" }
			});
		});

		it("Predefined IUrl", () => {

			interface IPredefined {
				url: IUrl;
			}

			expect(schema<IPredefined>()).toStrictEqual({
				url: { type: "url" }
			});
		});

		it("Predefined IUUID", () => {

			interface IPredefined {
				uuid: IUUID;
			}

			expect(schema<IPredefined>()).toStrictEqual({
				uuid: { type: "uuid" }
			});
		});

		it("Predefined in union", () => {

			interface IPredefined {
				uuid: IUUID;
			}

			interface IUnion {
				target: string | IPredefined
			}

			expect(schema<IUnion>()).toStrictEqual({
				target: [
					{ type: "string" },
					{ uuid: { type: "uuid" } }
				]
			});
		});
	});
});

