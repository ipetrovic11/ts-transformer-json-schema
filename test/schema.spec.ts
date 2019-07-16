"use strict";

import { schema } from '../index';
import { IExternal } from './interfaces';
import { IEmail, IDate, IForbidden, IUrl, IUUID } from '../predefined';

describe("Test json schema tranformer", () => {

	describe("Empty variations", () => {
		it("Without interface", () => {
			expect(schema()).toStrictEqual({});
		});

		it("Empty interface", () => {
			interface IEmpty { }

			expect(schema<IEmpty>()).toStrictEqual({});
		});

		it("Empty type", () => {
			type IEmpty = {};

			expect(schema<IEmpty>()).toStrictEqual({});
		});
	});

	describe("Single type tests", () => {
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

	describe("Optional type tests", () => {
		it("Interface with optional string", () => {
			interface IString {
				str?: string;
			}

			expect(schema<IString>()).toStrictEqual({ str: { type: "string", optional: true } });
		});

		it("Interface with optional any", () => {
			interface IAny {
				any?: any;
			}

			expect(schema<IAny>()).toStrictEqual({ any: { type: "any", optional: true } });
		});

		it("Interface with optional number", () => {
			interface INumber {
				num?: number;
			}

			expect(schema<INumber>()).toStrictEqual({ num: { type: "number", optional: true } });
		});

		it("Interface with optional boolean", () => {
			interface IBool {
				bool?: boolean;
			}

			expect(schema<IBool>()).toStrictEqual({ bool: { type: "boolean", optional: true } });
		});

		it("Interface with all optional", () => {
			interface IOptional {
				limit?: number;
				offset?: number;
			}

			expect(schema<IOptional>()).toStrictEqual({ limit: { type: "number", optional: true }, offset: { type: "number", optional: true } });
		});

		it("Interface with many optional", () => {
			interface IOptional {
				limit?: number;
				offset?: number;
				x: number;
			}

			expect(schema<IOptional>()).toStrictEqual({ x: { type: "number" }, limit: { type: "number", optional: true }, offset: { type: "number", optional: true } });
		});
	});

	describe("Single predefined type tests", () => {
		it("Predefined IEmail", () => {

			interface IPredefined {
				email: IEmail;
			}

			expect(schema<IPredefined>()).toStrictEqual({ email: { type: "email" } });
		});

		it("Predefined IDate", () => {

			interface IPredefined {
				date: IDate;
			}

			expect(schema<IPredefined>()).toStrictEqual({ date: { type: "date" } });
		});

		it("Predefined IForbidden", () => {

			interface IPredefined {
				forbidden: IForbidden;
			}

			expect(schema<IPredefined>()).toStrictEqual({ forbidden: { type: "forbidden" } });
		});

		it("Predefined IUrl", () => {

			interface IPredefined {
				url: IUrl;
			}

			expect(schema<IPredefined>()).toStrictEqual({ url: { type: "url" } });
		});

		it("Predefined IUUID", () => {

			interface IPredefined {
				uuid: IUUID;
			}

			expect(schema<IPredefined>()).toStrictEqual({ uuid: { type: "uuid" } });
		});
	});

	describe("Array type tests", () => {

		it("Array of strings", () => {
			interface IString {
				str: string[];
			}

			expect(schema<IString>()).toStrictEqual({ str: { type: "array", items: { type: "string" } } });
		});

		it("Array of any", () => {
			interface IAny {
				any: any[];
			}

			expect(schema<IAny>()).toStrictEqual({ any: { type: "array", items: { type: "any" } } });
		});

		it("Array of numbers", () => {
			interface INumber {
				num: number[];
			}

			expect(schema<INumber>()).toStrictEqual({ num: { type: "array", items: { type: "number" } } });
		});

		it("Array of booleans", () => {
			interface IBool {
				bool: boolean[];
			}

			expect(schema<IBool>()).toStrictEqual({ bool: { type: "array", items: { type: "boolean" } } });
		});

		it("Array defined with Array", () => {
			interface IString {
				array: Array<number>;
			}

			expect(schema<IString>()).toStrictEqual({ array: { type: "array", items: { type: "number" } } });
		});
	});

	describe("Union type tests", () => {
		it("Union string and any", () => {
			interface IAny {
				any: any | string;
			}

			expect(schema<IAny>()).toStrictEqual({ any: { type: "any" } });
		});

		it("Union string and number", () => {
			interface IUnion {
				union: string | number;
			}

			expect(schema<IUnion>()).toStrictEqual({ union: [{ type: "string" }, { type: "number" }] });
		});

		it("Union string and boolean", () => {
			interface IUnion {
				union: string | boolean;
			}

			expect(schema<IUnion>()).toStrictEqual({ union: [{ type: "string" }, { type: "boolean" }] });
		});

		it("Union string and predefined", () => {
			interface IUnion {
				union: string | IEmail;
			}

			expect(schema<IUnion>()).toStrictEqual({ union: [{ type: "string" }, { type: "email" }] });
		});

		it("Union predefined and predefined", () => {
			interface IUnion {
				union: IEmail | IUUID;
			}

			expect(schema<IUnion>()).toStrictEqual({ union: [{ type: "email" }, { type: "uuid" }] });
		});

		it("Union optional", () => {
			// TODO: Check what should happend in this case
			interface IUnion {
				union?: IEmail | IUUID;
			}

			expect(schema<IUnion>()).toStrictEqual({ union: [{ type: "email" }, { type: "uuid" }] });
		});
	});

	describe("Intersection types tests", () => {

		it("Basic intersection", () => {

			interface IBase1 {
				part1: string;
			}

			interface IBase2 {
				part2: number;
			}

			interface IIntersection {
				combined: IBase1 & IBase2;
			}

			expect(schema<IIntersection>()).toStrictEqual({
				combined: {
					type: 'object', props: {
						part1: { type: "string" },
						part2: { type: "number" }
					}
				}
			});
		});

		it("Interface with primitive and interface", () => {
			// TODO: in this case if there is strict annotation it should be ignored.

			interface IBase1 {
				part1: string;
			}

			interface IIntersection {
				combined: IBase1 & string;
			}

			expect(schema<IIntersection>()).toStrictEqual({
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

			interface IInner {
				num: number;
				str: string;
			}

			interface IOuter {
				neasted: IInner;
				num: number;
			}

			expect(schema<IOuter>()).toStrictEqual({
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

			interface N1 { x: number; }
			interface N2 { n1: N1; }
			interface N3 { n2: N2; }

			expect(schema<N3>()).toStrictEqual({
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
			interface IGeneric<T> {
				generic: T;
			}

			expect(schema<IGeneric<string>>()).toStrictEqual({ generic: { type: "string" } });
		});

		it("Generic string type", () => {
			interface IGeneric<T> {
				generic: T;
			}

			expect(schema<IGeneric<any>>()).toStrictEqual({ generic: { type: "any" } });
		});

		it("Generic boolean type", () => {
			interface IGeneric<T> {
				generic: T;
			}

			expect(schema<IGeneric<boolean>>()).toStrictEqual({ generic: { type: "boolean" } });
		});

		it("Generic predefined type", () => {
			interface IGeneric<T> {
				generic: T;
			}

			expect(schema<IGeneric<IEmail>>()).toStrictEqual({ generic: { type: "email" } });
		});

		it("Generic union type", () => {
			interface IGeneric<T> {
				generic: T;
			}

			expect(schema<IGeneric<string | number>>()).toStrictEqual({ generic: [{ type: "string" }, { type: "number" }] });
		});

		it("Generic interface type", () => {

			interface IBase {
				str: string;
			}

			interface IGeneric<T> {
				generic: T;
			}

			expect(schema<IGeneric<IBase>>()).toStrictEqual({
				generic: {
					type: "object", props: {
						str: { type: "string" }
					}
				}
			});
		});
	});

	describe("Anonimous type tests", () => {

		it("Basic anonimous type", () => {
			type IAnonimous = { str1: string; str2: string };

			expect(schema<IAnonimous>()).toStrictEqual({ str1: { type: "string" }, str2: { type: "string" } });
		});

		it("Union anonimous type", () => {
			type IAnonimous = { str1: string; str2: string } | { str1: string; str3: string };

			expect(schema<IAnonimous>()).toStrictEqual([{ str1: { type: "string" }, str2: { type: "string" } }, { str1: { type: "string" }, str3: { type: "string" } }]);
		});

		it("Generic anonimous type", () => {
			type IAnonimous<T> = { num: T; str2: string } | { str1: string; str3: string };

			expect(schema<IAnonimous<number>>()).toStrictEqual([{ str1: { type: "string" }, str3: { type: "string" } }, { num: { type: "number" }, str2: { type: "string" } }]);
		});
	});

	describe("Infinite recursion test", () => {

		it("Infinite recursion with 2 interfaces", () => {

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
						step1: { type: "any" }
					}
				}
			});
		});

		it("Infinite recursion with 3 interfaces", () => {

			interface IStep1 {
				step2: IStep2;
			}

			interface IStep2 {
				step3: IStep3;
			}

			interface IStep3 {
				step1: IStep1;
			}

			expect(schema<IStep1>()).toStrictEqual({
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
	});

	describe("Enumerable types test", () => {

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

		it("Interface with optional enmerable", () => {
			// TODO: Check what should happend in this case
			enum UserGroup {
				Admin = 1,
				Manager = 2,
				Employee = 'string'
			}

			interface IEnumerable {
				enum_mixed?: UserGroup;
			}

			expect(schema<IEnumerable>()).toStrictEqual({
					enum_mixed: [{ type: "UserGroup.Admin" }, { type: "UserGroup.Manager" }, { type: "UserGroup.Employee" }]
			});
		});
	});

	describe("Extended types test", () => {

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

});
