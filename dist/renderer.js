// node_modules/warodel/utils/c-data-view.mjs
var CDataView = class extends DataView {
  /**
   * @param {ArrayBufferLike} buffer
   * @param {number?} byteOffset
   * @param {number?} byteLength
   */
  constructor(buffer, byteOffset, byteLength) {
    super(buffer, byteOffset, byteLength);
    this.cursor = 0;
  }
  /**
   * deprecated
   * @type {number}
   */
  cursor;
  /** @returns {number} */
  get uint8() {
    this.cursor += 1;
    return this.getUint8(this.cursor - 1);
  }
  /** @param {number} v */
  set uint8(v) {
    this.setUint8(this.cursor, v);
    this.cursor += 1;
  }
  /** @returns {number} */
  get uint16() {
    this.cursor += 2;
    return this.getUint32(this.cursor - 2, true);
  }
  /** @param {number} v */
  set uint16(v) {
    this.setUint16(this.cursor, v, true);
    this.cursor += 2;
  }
  /** @returns {number} */
  get uint32() {
    this.cursor += 4;
    return this.getUint32(this.cursor - 4, true);
  }
  /** @returns {number} */
  get uint32BE() {
    this.cursor += 4;
    return this.getUint32(this.cursor - 4, false);
  }
  /** @param {number} v */
  set uint32(v) {
    this.setUint32(this.cursor, v, true);
    this.cursor += 4;
  }
  /** @param {number} v */
  set uint32BE(v) {
    this.setUint32(this.cursor, v, false);
    this.cursor += 4;
  }
  /** @returns {number} */
  get float32() {
    this.cursor += 4;
    return this.getFloat32(this.cursor - 4, true);
  }
  /** @param {number} v */
  set float32(v) {
    this.setFloat32(this.cursor, v, true);
    this.cursor += 4;
  }
  /** @returns {string} */
  get string() {
    const list = [];
    while (this.cursor < this.byteLength) {
      const b = super.getUint8(this.cursor);
      this.cursor += 1;
      if (b === 0)
        break;
      list.push(b);
    }
    return new TextDecoder("utf-8").decode(new Uint8Array(list).buffer);
  }
  /** @param {string} s */
  set string(s) {
    const list = new TextEncoder().encode(s);
    for (let i = 0; i < list.length; i++) {
      this.uint8 = list[i];
    }
    this.uint8 = 0;
  }
  /**
   * @param {number} length
   * @return {string}
   */
  getStringFixed(length) {
    let value = "";
    for (let i = 0; i < length; i++) {
      const b = this.uint8;
      if (b === 0) {
        this.cursor += length - i - 1;
        break;
      }
      value += String.fromCharCode(b);
    }
    return value;
  }
  /**
   * @param {string} value
   * @param {number} length
   */
  setStringFixed(value, length) {
    const str = value.padEnd(length, "\0");
    for (let i = 0; i < length; i++) {
      this.uint8 = str.charCodeAt(i);
    }
  }
  /** @returns {number} */
  get sizeOffset() {
    this.cursor += 4;
    return this.cursor - 4;
  }
  /** @param {number} o */
  set sizeOffsetInclusive(o) {
    super.setUint32(o, this.cursor - o, true);
  }
  /** @param {number} o */
  set sizeOffsetExclusive(o) {
    super.setUint32(o, this.cursor - o - 4, true);
  }
};

// node_modules/warodel/utils/c-data-view-fake.mjs
var CDataViewFake = class {
  cursor = 0;
  setUint8(_, __) {
  }
  set uint8(_) {
    this.cursor += 1;
  }
  setUint16(_, __, ___) {
  }
  set uint16(_) {
    this.cursor += 2;
  }
  setUint32(_, __, ___) {
  }
  set uint32(_) {
    this.cursor += 4;
  }
  set uint32BE(_) {
    this.cursor += 4;
  }
  setFloat32(_, __, ___) {
  }
  set float32(_) {
    this.cursor += 4;
  }
  set string(s) {
    this.cursor += new TextEncoder().encode(s).length + 1;
  }
  getStringFixed(_) {
  }
  setStringFixed(_, length) {
    this.cursor += length;
  }
  get sizeOffset() {
    this.cursor += 4;
    return this.cursor - 4;
  }
  set sizeOffsetInclusive(_) {
  }
  set sizeOffsetExclusive(_) {
  }
};

// node_modules/warodel/utils/bufffer-to-buffer.mjs
var bufffer_to_buffer_default = (buffer) => {
  if (buffer instanceof ArrayBuffer)
    return buffer;
  const ab = new ArrayBuffer(buffer.length);
  buffer.copy(new Uint8Array(ab));
  return ab;
};

// node_modules/warodel/rawcode/convert.mjs
var Dec2RawBE = (number) => {
  const n = BigInt(number);
  return String.fromCharCode(Number(n >> 24n & 255n), Number(n >> 16n & 255n), Number(n >> 8n & 255n), Number(n & 255n));
};
var Raw2Dec = (string) => Number(BigInt(string.charCodeAt(3)) | BigInt(string.charCodeAt(2)) << 8n | BigInt(string.charCodeAt(1)) << 16n | BigInt(string.charCodeAt(0)) << 24n);

// node_modules/warodel/w3abdhqtu/abstract/W3ABDHQTUItemDataValue.mjs
var W3ABDHQTUItemDataValue = class {
  /** @param {boolean} adq */
  constructor(adq) {
    this.#adq = adq;
  }
  /** @type {boolean} */
  #adq;
  list = [];
  /** @type {('integer'|'real'|'unreal'|'string')}*/
  #typeString;
  /** @param {('integer'|'real'|'unreal'|'string')} type */
  set typeString(type) {
    switch (type) {
      case "integer":
        this.type = 0;
        break;
      case "real":
        this.type = 1;
        break;
      case "unreal":
        this.type = 2;
        break;
      case "string":
        this.type = 3;
        break;
      default:
        throw new Error(`Missing string type: ${type}`);
    }
    this.#typeString = type;
  }
  /** @param {CDataView} view */
  read(view) {
    this.id = view.uint32BE;
    this.type = view.uint32;
    if (this.#adq) {
      this.level = view.uint32;
      this.data = view.uint32;
    }
    switch (this.type) {
      case 0:
        this.value = view.uint32;
        this.#typeString = "integer";
        break;
      case 1:
        this.#typeString = "real";
        this.value = view.float32;
        break;
      case 2:
        this.#typeString = "unreal";
        this.value = view.float32;
        break;
      case 3:
        this.#typeString = "string";
        this.value = view.string;
        break;
      default:
        throw new Error(`Unknown variable type: ${this.type}`);
    }
    this.end = view.uint32BE;
  }
  /** @param {CDataView} view */
  write(view) {
    if (this.id === void 0)
      throw new Error("\u26A0\uFE0Fid undefined");
    if (this.type === void 0)
      throw new Error("\u26A0\uFE0Ftype undefined");
    if (this.value === void 0)
      throw new Error("\u26A0\uFE0Fvalue undefined");
    if (this.#adq) {
      if (this.level === void 0)
        throw new Error("\u26A0\uFE0Flevel undefined");
      if (this.data === void 0)
        throw new Error("\u26A0\uFE0Fdata undefined");
    }
    view.uint32BE = this.id;
    view.uint32 = this.type;
    if (this.#adq) {
      view.uint32 = this.level;
      view.uint32 = this.data;
    }
    switch (this.type) {
      case 0:
        view.uint32 = this.value;
        break;
      case 1:
      case 2:
        view.float32 = this.value;
        break;
      case 3:
        view.string = this.value;
        break;
      default:
        throw new Error(`Unknown variable type: ${this.type}`);
    }
    view.uint32BE = this.end;
  }
  /**
   * @param {string} rawId
   * @param {Object.<string, any>} attrMap
   * @param {Object.<string, W3ABDHQTUTOMLMapProperty>} typeMap
   */
  fromMap(rawId, attrMap, typeMap) {
    this.id = Raw2Dec(String(rawId));
    if (typeMap[rawId] === void 0)
      this.typeString = attrMap[`${rawId}Type`];
    else
      this.type = typeMap[rawId].type;
    switch (this.type) {
      case 0:
        this.#typeString = "integer";
        break;
      case 1:
        this.#typeString = "real";
        break;
      case 2:
        this.#typeString = "unreal";
        break;
      case 3:
        this.#typeString = "string";
        break;
      default:
        throw new Error(`Unknown variable type: ${this.type}`);
    }
    let end = attrMap[`${rawId}End`];
    if (end === void 0)
      this.end = 0;
    else {
      if (this.level === void 0)
        throw new Error("Missing level data");
      if (end instanceof Array)
        end = end[this.level - 1];
      this.end = typeof end === "string" ? Raw2Dec(String(end)) : 0;
    }
  }
  toJSON() {
    return {
      id: Dec2RawBE(this.id),
      type: this.#typeString,
      level: this.level,
      data: this.data,
      value: this.value,
      end: this.end > 0 ? Dec2RawBE(this.end) : void 0
    };
  }
};

// node_modules/warodel/w3abdhqtu/abstract/W3ABDHQTUItemData.mjs
var W3ABDHQTUItemData = class {
  /**
   * @param {boolean} adq
   * @param {number} formatVersion
   */
  constructor(adq, formatVersion) {
    this.#adq = adq;
    this.#formatVersion = formatVersion;
  }
  /** @type {boolean} */
  #adq;
  /** @type {number} */
  #formatVersion;
  /** @type {W3ABDHQTUItemDataValue[]} */
  list = [];
  /** @param {CDataView} view */
  read(view) {
    if (this.#formatVersion >= 3)
      this.flag = view.uint32;
    for (let i = view.uint32; i > 0; i--) {
      const v = new W3ABDHQTUItemDataValue(this.#adq);
      v.read(view);
      this.list.push(v);
    }
  }
  /** @param {CDataView} view */
  write(view) {
    if (this.#formatVersion >= 3) {
      if (this.flag === void 0)
        throw new Error("\u26A0\uFE0Fflag undefined");
      view.uint32 = this.flag;
    }
    view.uint32 = this.list.length;
    for (const i of this.list)
      i.write(view);
  }
  toJSON() {
    return {
      flag: this.flag,
      list: this.list
    };
  }
};

// node_modules/warodel/w3abdhqtu/abstract/W3ABDHQTUItem.mjs
var W3ABDHQTUItem = class {
  /**
   * @param {boolean} adq
   * @param {number} formatVersion
   */
  constructor(adq, formatVersion) {
    this.#adq = adq;
    this.#formatVersion = formatVersion;
  }
  /** @type {boolean} */
  #adq;
  /** @type {number} */
  #formatVersion;
  /** @type {W3ABDHQTUItemData[]} */
  list = [];
  /** @param {CDataView} view */
  read(view) {
    this.defaultId = view.uint32BE;
    this.customId = view.uint32BE;
    for (let i = this.#formatVersion >= 3 ? view.uint32 : 1; i > 0; i--) {
      const d2 = new W3ABDHQTUItemData(this.#adq, this.#formatVersion);
      d2.read(view);
      this.list.push(d2);
    }
  }
  /** @param {CDataView} view */
  write(view) {
    view.uint32BE = this.defaultId;
    view.uint32BE = this.customId;
    view.uint32 = this.list.length;
    for (const i of this.list)
      i.write(view);
  }
  toJSON() {
    return {
      defaultId: Dec2RawBE(this.defaultId),
      //defaultIdDec: this.defaultId,
      customId: this.customId > 0 ? Dec2RawBE(this.customId) : void 0,
      //customIdDec: this.customId > 0 ? this.customId : undefined,
      list: this.list
    };
  }
};

// node_modules/@ltd/j-toml/index.mjs
var SyntaxError$1 = SyntaxError;
var RangeError$1 = RangeError;
var TypeError$1 = TypeError;
var Error$1 = { if: Error }.if;
var undefined$1 = void 0;
var BigInt$1 = typeof BigInt === "undefined" ? undefined$1 : BigInt;
var RegExp$1 = RegExp;
var WeakMap$1 = WeakMap;
var get = WeakMap.prototype.get;
var set = WeakMap.prototype.set;
var create$1 = Object.create;
var isSafeInteger = Number.isSafeInteger;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var freeze = Object.freeze;
var isPrototypeOf = Object.prototype.isPrototypeOf;
var NULL = (
  /* j-globals: null.prototype (internal) */
  Object.seal ? /* @__PURE__ */ Object.preventExtensions(/* @__PURE__ */ Object.create(null)) : null
);
var bind = Function.prototype.bind;
var test = RegExp.prototype.test;
var exec = RegExp.prototype.exec;
var apply$1 = Reflect.apply;
var Proxy$1 = Proxy;
var Object_defineProperty = Object.defineProperty;
var assign$1 = Object.assign;
var Object$1 = Object;
var floor = Math.floor;
var isArray$1 = Array.isArray;
var Infinity = 1 / 0;
var fromCharCode = String.fromCharCode;
var Array$1 = Array;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
var apply = Function.prototype.apply;
var isEnum = /* @__PURE__ */ propertyIsEnumerable.call.bind(propertyIsEnumerable);
var hasOwn = (
  /* j-globals: Object.hasOwn (polyfill) */
  Object$1.hasOwn || /* @__PURE__ */ function() {
    return hasOwnProperty.bind ? hasOwnProperty.call.bind(hasOwnProperty) : function hasOwn2(object, key) {
      return hasOwnProperty.call(object, key);
    };
  }()
);
var create = Object$1.create;
function Descriptor(source) {
  var target = create(NULL);
  if (hasOwn(source, "value")) {
    target.value = source.value;
  }
  if (hasOwn(source, "writable")) {
    target.writable = source.writable;
  }
  if (hasOwn(source, "get")) {
    target.get = source.get;
  }
  if (hasOwn(source, "set")) {
    target.set = source.set;
  }
  if (hasOwn(source, "enumerable")) {
    target.enumerable = source.enumerable;
  }
  if (hasOwn(source, "configurable")) {
    target.configurable = source.configurable;
  }
  return target;
}
var Test = bind ? /* @__PURE__ */ bind.bind(test) : function(re) {
  return function(string) {
    return test.call(re, string);
  };
};
var Exec = bind ? /* @__PURE__ */ bind.bind(exec) : function(re) {
  return function(string) {
    return exec.call(re, string);
  };
};
function __PURE__(re) {
  var test2 = re.test = Test(re);
  var exec2 = re.exec = Exec(re);
  var source = test2.source = exec2.source = re.source;
  test2.unicode = exec2.unicode = re.unicode;
  test2.ignoreCase = exec2.ignoreCase = re.ignoreCase;
  test2.multiline = exec2.multiline = source.indexOf("^") < 0 && source.indexOf("$") < 0 ? null : re.multiline;
  test2.dotAll = exec2.dotAll = source.indexOf(".") < 0 ? null : re.dotAll;
  return re;
}
function theRegExp(re) {
  return /* @__PURE__ */ __PURE__(re);
}
var NT = /[\n\t]+/g;
var ESCAPE = /\\./g;
function graveAccentReplacer($$) {
  return $$ === "\\`" ? "`" : $$;
}
var includes = "".includes ? function(that, searchString) {
  return that.includes(searchString);
} : function(that, searchString) {
  return that.indexOf(searchString) > -1;
};
function RE(template) {
  var U = this.U;
  var I = this.I;
  var M = this.M;
  var S = this.S;
  var raw = template.raw;
  var source = raw[0].replace(NT, "");
  var index = 1;
  var length = arguments.length;
  while (index !== length) {
    var value = arguments[index];
    if (typeof value === "string") {
      source += value;
    } else {
      var value_source = value.source;
      if (typeof value_source !== "string") {
        throw TypeError$1("source");
      }
      if (value.unicode === U) {
        throw SyntaxError$1("unicode");
      }
      if (value.ignoreCase === I) {
        throw SyntaxError$1("ignoreCase");
      }
      if (value.multiline === M && (includes(value_source, "^") || includes(value_source, "$"))) {
        throw SyntaxError$1("multiline");
      }
      if (value.dotAll === S && includes(value_source, ".")) {
        throw SyntaxError$1("dotAll");
      }
      source += value_source;
    }
    source += raw[index++].replace(NT, "");
  }
  var re = RegExp$1(U ? source = source.replace(ESCAPE, graveAccentReplacer) : source, this.flags);
  var test2 = re.test = Test(re);
  var exec2 = re.exec = Exec(re);
  test2.source = exec2.source = source;
  test2.unicode = exec2.unicode = !U;
  test2.ignoreCase = exec2.ignoreCase = !I;
  test2.multiline = exec2.multiline = includes(source, "^") || includes(source, "$") ? !M : null;
  test2.dotAll = exec2.dotAll = includes(source, ".") ? !S : null;
  return re;
}
var RE_bind = bind && /* @__PURE__ */ bind.bind(RE);
function Context(flags) {
  return {
    U: !includes(flags, "u"),
    I: !includes(flags, "i"),
    M: !includes(flags, "m"),
    S: !includes(flags, "s"),
    flags
  };
}
var CONTEXT = /* @__PURE__ */ Context("");
var newRegExp = Proxy$1 ? /* @__PURE__ */ new Proxy$1(RE, {
  apply: function(RE2, thisArg, args) {
    return apply$1(RE2, CONTEXT, args);
  },
  get: function(RE2, flags) {
    return RE_bind(Context(flags));
  },
  defineProperty: function() {
    return false;
  },
  preventExtensions: function() {
    return false;
  }
}) : /* @__PURE__ */ function() {
  RE.apply = RE.apply;
  var newRegExp2 = function() {
    return RE.apply(CONTEXT, arguments);
  };
  var d2 = 1;
  var g = d2 * 2;
  var i = g * 2;
  var m = i * 2;
  var s = i * 2;
  var u = s * 2;
  var y = u * 2;
  var flags = y * 2 - 1;
  while (flags--) {
    (function(context) {
      newRegExp2[context.flags] = function() {
        return RE.apply(context, arguments);
      };
    })(Context(
      (flags & d2 ? "" : "d") + (flags & g ? "" : "g") + (flags & i ? "" : "i") + (flags & m ? "" : "m") + (flags & s ? "" : "s") + (flags & u ? "" : "u") + (flags & y ? "" : "y")
    ));
  }
  return freeze ? freeze(newRegExp2) : newRegExp2;
}();
var clearRegExp = "$_" in RegExp$1 ? /* @__PURE__ */ function() {
  var REGEXP = /^/;
  REGEXP.test = REGEXP.test;
  return function clearRegExp3(value) {
    REGEXP.test("");
    return value;
  };
}() : function clearRegExp2(value) {
  return value;
};
var clearRegExp$1 = clearRegExp;
var NEED_TO_ESCAPE_IN_REGEXP = /^[$()*+\-.?[\\\]^{|]/;
var SURROGATE_PAIR = /^[\uD800-\uDBFF][\uDC00-\uDFFF]/;
var GROUP = /* @__PURE__ */ create$1(NULL);
function groupify(branches, uFlag, noEscape) {
  var group = create$1(NULL);
  var appendBranch = uFlag ? appendPointBranch : appendCodeBranch;
  for (var length = branches.length, index = 0; index < length; ++index) {
    appendBranch(group, branches[index]);
  }
  return sourcify(group, !noEscape);
}
function appendPointBranch(group, branch) {
  if (branch) {
    var character = SURROGATE_PAIR.test(branch) ? branch.slice(0, 2) : branch.charAt(0);
    appendPointBranch(group[character] || (group[character] = create$1(NULL)), branch.slice(character.length));
  } else {
    group[""] = GROUP;
  }
}
function appendCodeBranch(group, branch) {
  if (branch) {
    var character = branch.charAt(0);
    appendCodeBranch(group[character] || (group[character] = create$1(NULL)), branch.slice(1));
  } else {
    group[""] = GROUP;
  }
}
function sourcify(group, needEscape) {
  var branches = [];
  var singleCharactersBranch = [];
  var noEmptyBranch = true;
  for (var character in group) {
    if (character) {
      var sub_branches = sourcify(group[character], needEscape);
      if (needEscape && NEED_TO_ESCAPE_IN_REGEXP.test(character)) {
        character = "\\" + character;
      }
      sub_branches ? branches.push(character + sub_branches) : singleCharactersBranch.push(character);
    } else {
      noEmptyBranch = false;
    }
  }
  singleCharactersBranch.length && branches.unshift(singleCharactersBranch.length === 1 ? singleCharactersBranch[0] : "[" + singleCharactersBranch.join("") + "]");
  return branches.length === 0 ? "" : (branches.length === 1 && (singleCharactersBranch.length || noEmptyBranch) ? branches[0] : "(?:" + branches.join("|") + ")") + (noEmptyBranch ? "" : "?");
}
var WeakSet$1 = WeakSet;
var has = WeakSet.prototype.has;
var add = WeakSet.prototype.add;
var del = WeakSet.prototype["delete"];
var keys = Object.keys;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var Null$1 = (
  /* j-globals: null (internal) */
  /* @__PURE__ */ function() {
    var assign2 = Object.assign || function assign3(target, source) {
      var keys$1, index, key;
      for (keys$1 = keys(source), index = 0; index < keys$1.length; ++index) {
        key = keys$1[index];
        target[key] = source[key];
      }
      if (getOwnPropertySymbols) {
        for (keys$1 = getOwnPropertySymbols(source), index = 0; index < keys$1.length; ++index) {
          key = keys$1[index];
          if (isEnum(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    function Nullify(constructor) {
      delete constructor.prototype.constructor;
      freeze(constructor.prototype);
      return constructor;
    }
    function Null2(origin) {
      return origin === undefined$1 ? this : typeof origin === "function" ? /* @__PURE__ */ Nullify(origin) : /* @__PURE__ */ assign2(/* @__PURE__ */ create(NULL), origin);
    }
    delete Null2.name;
    Null2.prototype = null;
    freeze(Null2);
    return Null2;
  }()
);
var is = Object.is;
var Object_defineProperties = Object.defineProperties;
var fromEntries = Object.fromEntries;
var Reflect_construct = Reflect.construct;
var Reflect_defineProperty = Reflect.defineProperty;
var Reflect_deleteProperty = Reflect.deleteProperty;
var ownKeys = Reflect.ownKeys;
var Keeper = () => [];
var newWeakMap = () => {
  const weakMap = new WeakMap$1();
  weakMap.has = weakMap.has;
  weakMap.get = weakMap.get;
  weakMap.set = weakMap.set;
  return weakMap;
};
var target2keeper = /* @__PURE__ */ newWeakMap();
var proxy2target = /* @__PURE__ */ newWeakMap();
var target2proxy = /* @__PURE__ */ newWeakMap();
var handlers = /* @__PURE__ */ assign$1(create$1(NULL), {
  defineProperty: (target, key, descriptor) => {
    if (hasOwn(target, key)) {
      return Reflect_defineProperty(target, key, assign$1(create$1(NULL), descriptor));
    }
    if (Reflect_defineProperty(target, key, assign$1(create$1(NULL), descriptor))) {
      const keeper = target2keeper.get(target);
      keeper[keeper.length] = key;
      return true;
    }
    return false;
  },
  deleteProperty: (target, key) => {
    if (Reflect_deleteProperty(target, key)) {
      const keeper = target2keeper.get(target);
      const index = keeper.indexOf(key);
      index < 0 || --keeper.copyWithin(index, index + 1).length;
      return true;
    }
    return false;
  },
  ownKeys: (target) => target2keeper.get(target),
  construct: (target, args, newTarget) => orderify(Reflect_construct(target, args, newTarget)),
  apply: (target, thisArg, args) => orderify(apply$1(target, thisArg, args))
});
var newProxy = (target, keeper) => {
  target2keeper.set(target, keeper);
  const proxy = new Proxy$1(target, handlers);
  proxy2target.set(proxy, target);
  return proxy;
};
var orderify = (object) => {
  if (proxy2target.has(object)) {
    return object;
  }
  let proxy = target2proxy.get(object);
  if (proxy) {
    return proxy;
  }
  proxy = newProxy(object, assign$1(Keeper(), ownKeys(object)));
  target2proxy.set(object, proxy);
  return proxy;
};
var Null = /* @__PURE__ */ function() {
  function throwConstructing() {
    throw TypeError$1(`Super constructor Null cannot be invoked with 'new'`);
  }
  function throwApplying() {
    throw TypeError$1(`Super constructor Null cannot be invoked without 'new'`);
  }
  const Nullify = (constructor) => {
    delete constructor.prototype.constructor;
    freeze(constructor.prototype);
    return constructor;
  };
  function Null2(constructor) {
    return new.target ? new.target === Null2 ? /* @__PURE__ */ throwConstructing() : /* @__PURE__ */ newProxy(this, Keeper()) : typeof constructor === "function" ? /* @__PURE__ */ Nullify(constructor) : /* @__PURE__ */ throwApplying();
  }
  Null2.prototype = null;
  Object_defineProperty(Null2, "name", assign$1(create$1(NULL), { value: "", configurable: false }));
  freeze(Null2);
  return Null2;
}();
var map_has = WeakMap.prototype.has;
var map_del = WeakMap.prototype["delete"];
var INLINES = new WeakMap$1();
var SECTIONS = new WeakSet$1();
var isInline = /* @__PURE__ */ map_has.bind(INLINES);
var ofInline = /* @__PURE__ */ get.bind(INLINES);
var beInline = /* @__PURE__ */ set.bind(INLINES);
var isSection = /* @__PURE__ */ has.bind(SECTIONS);
var beSection = /* @__PURE__ */ add.bind(SECTIONS);
var INLINE = true;
var tables = new WeakSet$1();
var tables_add = /* @__PURE__ */ add.bind(tables);
var isTable = /* @__PURE__ */ has.bind(tables);
var implicitTables = new WeakSet$1();
var implicitTables_add = /* @__PURE__ */ add.bind(implicitTables);
var implicitTables_del = /* @__PURE__ */ del.bind(implicitTables);
var directlyIfNot = (table) => {
  if (implicitTables_del(table)) {
    beSection(table);
    return true;
  }
  return false;
};
var DIRECTLY = true;
var IMPLICITLY = false;
var pairs = new WeakSet$1();
var pairs_add = /* @__PURE__ */ add.bind(pairs);
var fromPair = /* @__PURE__ */ has.bind(pairs);
var PAIR = true;
var PlainTable = /* @__PURE__ */ Null$1(class Table extends Null$1 {
  constructor(isDirect, isInline$fromPair) {
    super();
    tables_add(this);
    isDirect ? isInline$fromPair ? beInline(this, true) : beSection(this) : (isInline$fromPair ? pairs_add : implicitTables_add)(this);
    return this;
  }
});
var OrderedTable = /* @__PURE__ */ Null$1(class Table2 extends Null {
  constructor(isDirect, isInline$fromPair) {
    super();
    tables_add(this);
    isDirect ? isInline$fromPair ? beInline(this, true) : beSection(this) : (isInline$fromPair ? pairs_add : implicitTables_add)(this);
    return this;
  }
});
var NONE = [];
var sourcePath = "";
var sourceLines = NONE;
var lastLineIndex = -1;
var lineIndex = -1;
var throws = (error) => {
  throw error;
};
var EOL = /\r?\n/;
var todo = (source, path) => {
  if (typeof path !== "string") {
    throw TypeError$1(`TOML.parse({ path })`);
  }
  sourcePath = path;
  sourceLines = source.split(EOL);
  lastLineIndex = sourceLines.length - 1;
  lineIndex = -1;
};
var next = () => sourceLines[++lineIndex];
var rest = () => lineIndex !== lastLineIndex;
var mark = class {
  lineIndex = lineIndex;
  type;
  restColumn;
  constructor(type, restColumn) {
    this.type = type;
    this.restColumn = restColumn;
    return this;
  }
  must() {
    lineIndex === lastLineIndex && throws(SyntaxError$1(`${this.type} is not close until the end of the file` + where(", which started from ", this.lineIndex, sourceLines[this.lineIndex].length - this.restColumn + 1)));
    return sourceLines[++lineIndex];
  }
  nowrap(argsMode) {
    throw throws(Error$1(`TOML.parse(${argsMode ? `${argsMode}multilineStringJoiner` : `,{ joiner }`}) must be passed, while the source including multi-line string` + where(", which started from ", this.lineIndex, sourceLines[this.lineIndex].length - this.restColumn + 1)));
  }
};
var where = (pre, rowIndex = lineIndex, columnNumber = 0) => sourceLines === NONE ? "" : sourcePath ? `
    at (${sourcePath}:${rowIndex + 1}:${columnNumber})` : `${pre}line ${rowIndex + 1}: ${sourceLines[rowIndex]}`;
var done = () => {
  sourcePath = "";
  sourceLines = NONE;
};
var Whitespace = /[ \t]/;
var PRE_WHITESPACE = /* @__PURE__ */ newRegExp`
	^${Whitespace}+`.valueOf();
var { exec: VALUE_REST_exec } = /* @__PURE__ */ newRegExp.s`
	^
	(
		(?:\d\d\d\d-\d\d-\d\d \d)?
		[\w\-+.:]+
	)
	${Whitespace}*
	(.*)
	$`.valueOf();
var { exec: LITERAL_STRING_exec } = /* @__PURE__ */ newRegExp.s`
	^
	'([^']*)'
	${Whitespace}*
	(.*)`.valueOf();
var { exec: MULTI_LINE_LITERAL_STRING_0_1_2 } = /* @__PURE__ */ newRegExp.s`
	^
	(.*?)
	'''('{0,2})
	${Whitespace}*
	(.*)`.valueOf();
var { exec: MULTI_LINE_LITERAL_STRING_0 } = /* @__PURE__ */ newRegExp.s`
	^
	(.*?)
	'''()
	${Whitespace}*
	(.*)`.valueOf();
var __MULTI_LINE_LITERAL_STRING_exec = MULTI_LINE_LITERAL_STRING_0;
var SYM_WHITESPACE = /* @__PURE__ */ newRegExp.s`
	^
	.
	${Whitespace}*`.valueOf();
var Tag = /[^\x00-\x1F"#'()<>[\\\]`{}\x7F]+/;
var { exec: KEY_VALUE_PAIR_exec } = /* @__PURE__ */ newRegExp.s`
	^
	${Whitespace}*
	=
	${Whitespace}*
	(?:
		<(${Tag})>
		${Whitespace}*
	)?
	(.*)
	$`.valueOf();
var { exec: _VALUE_PAIR_exec } = /* @__PURE__ */ newRegExp.s`
	^
	<(${Tag})>
	${Whitespace}*
	(.*)
	$`.valueOf();
var { exec: TAG_REST_exec } = /* @__PURE__ */ newRegExp.s`
	^
	<(${Tag})>
	${Whitespace}*
	(.*)
	$`.valueOf();
var MULTI_LINE_BASIC_STRING = theRegExp(/[^\\"]+|\\.?|"(?!"")"?/sy);
var MULTI_LINE_BASIC_STRING_exec_0_length = (_) => {
  let lastIndex = (
    /*MULTI_LINE_BASIC_STRING.lastIndex = */
    0
  );
  while (MULTI_LINE_BASIC_STRING.test(_)) {
    lastIndex = MULTI_LINE_BASIC_STRING.lastIndex;
  }
  return lastIndex;
};
var ESCAPED_EXCLUDE_CONTROL_CHARACTER_TAB______ = /[^\\\x00-\x08\x0B-\x1F\x7F]+|\\(?:[btnfr"\\]|[\t ]*\n[\t\n ]*|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/g;
var ESCAPED_EXCLUDE_CONTROL_CHARACTER__________ = /[^\\\x00-\x09\x0B-\x1F\x7F]+|\\(?:[btnfr"\\]|[\t ]*\n[\t\n ]*|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/g;
var ESCAPED_EXCLUDE_CONTROL_CHARACTER_DEL______ = /[^\\\x00-\x09\x0B-\x1F]+|\\(?:[btnfr"\\]|[\t ]*\n[\t\n ]*|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/g;
var ESCAPED_EXCLUDE_CONTROL_CHARACTER_DEL_SLASH = /[^\\\x00-\x09\x0B-\x1F]+|\\(?:[btnfr"\\/]|[\t ]*\n[\t\n ]*|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/g;
var __ESCAPED_EXCLUDE_CONTROL_CHARACTER = ESCAPED_EXCLUDE_CONTROL_CHARACTER_TAB______;
var ESCAPED_EXCLUDE_CONTROL_CHARACTER_test = (_) => !_.replace(__ESCAPED_EXCLUDE_CONTROL_CHARACTER, "");
var BASIC_STRING_TAB______ = theRegExp(/[^\\"\x00-\x08\x0B-\x1F\x7F]+|\\(?:[btnfr"\\]|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/y);
var BASIC_STRING__________ = theRegExp(/[^\\"\x00-\x08\x0B-\x1F\x7F]+|\\(?:[btnfr"\\]|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/y);
var BASIC_STRING_DEL______ = theRegExp(/[^\\"\x00-\x08\x0B-\x1F]+|\\(?:[btnfr"\\]|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/y);
var BASIC_STRING_DEL_SLASH = theRegExp(/[^\\"\x00-\x08\x0B-\x1F]+|\\(?:[btnfr"\\/]|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/y);
var __BASIC_STRING = BASIC_STRING_DEL_SLASH;
var BASIC_STRING_exec_1_endIndex = (line) => {
  let lastIndex = __BASIC_STRING.lastIndex = 1;
  while (__BASIC_STRING.test(line)) {
    lastIndex = __BASIC_STRING.lastIndex;
  }
  lastIndex !== line.length && line[lastIndex] === '"' || throws(SyntaxError$1(`Bad basic string` + where(" at ")));
  return lastIndex;
};
var { test: IS_DOT_KEY } = theRegExp(/^[ \t]*\./);
var DOT_KEY = /^[ \t]*\.[ \t]*/;
var { exec: BARE_KEY_STRICT } = theRegExp(/^[\w-]+/);
var { exec: BARE_KEY_FREE } = theRegExp(/^[^ \t#=[\]'".]+(?:[ \t]+[^ \t#=[\]'".]+)*/);
var __BARE_KEY_exec = BARE_KEY_FREE;
var { exec: LITERAL_KEY____ } = theRegExp(/^'[^'\x00-\x08\x0B-\x1F\x7F]*'/);
var { exec: LITERAL_KEY_DEL } = theRegExp(/^'[^'\x00-\x08\x0B-\x1F]*'/);
var __LITERAL_KEY_exec = LITERAL_KEY_DEL;
var supportArrayOfTables = true;
var TABLE_DEFINITION_exec_groups = (lineRest, parseKeys2) => {
  const asArrayItem = lineRest[1] === "[";
  if (asArrayItem) {
    supportArrayOfTables || throws(SyntaxError$1(`Array of Tables is not allowed before TOML v0.2` + where(", which at ")));
    lineRest = lineRest.slice(2);
  } else {
    lineRest = lineRest.slice(1);
  }
  lineRest = lineRest.replace(PRE_WHITESPACE, "");
  const { leadingKeys, finalKey } = { lineRest } = parseKeys2(lineRest);
  lineRest = lineRest.replace(PRE_WHITESPACE, "");
  lineRest && lineRest[0] === "]" || throws(SyntaxError$1(`Table header is not closed` + where(", which is found at ")));
  (lineRest.length > 1 ? lineRest[1] === "]" === asArrayItem : !asArrayItem) || throws(SyntaxError$1(`Square brackets of Table definition statement not match` + where(" at ")));
  lineRest = lineRest.slice(asArrayItem ? 2 : 1).replace(PRE_WHITESPACE, "");
  let tag;
  if (lineRest && lineRest[0] === "<") {
    ({ 1: tag, 2: lineRest } = TAG_REST_exec(lineRest) || throws(SyntaxError$1(`Bad tag` + where(" at "))));
  } else {
    tag = "";
  }
  return { leadingKeys, finalKey, asArrayItem, tag, lineRest };
};
var KEY_VALUE_PAIR_exec_groups = ({ leadingKeys, finalKey, lineRest }) => {
  const { 1: tag = "" } = { 2: lineRest } = KEY_VALUE_PAIR_exec(lineRest) || throws(SyntaxError$1(`Keys must equal something` + where(", but missing at ")));
  tag || lineRest && lineRest[0] !== "#" || throws(SyntaxError$1(`Value can not be missing after euqal sign` + where(", which is found at ")));
  return { leadingKeys, finalKey, tag, lineRest };
};
var { test: CONTROL_CHARACTER_EXCLUDE_TAB____ } = theRegExp(/[\x00-\x08\x0B-\x1F\x7F]/);
var { test: CONTROL_CHARACTER_EXCLUDE_TAB_DEL } = theRegExp(/[\x00-\x08\x0B-\x1F]/);
var __CONTROL_CHARACTER_EXCLUDE_test = CONTROL_CHARACTER_EXCLUDE_TAB____;
var switchRegExp = (specificationVersion) => {
  switch (specificationVersion) {
    case 1:
      __MULTI_LINE_LITERAL_STRING_exec = MULTI_LINE_LITERAL_STRING_0_1_2;
      __LITERAL_KEY_exec = LITERAL_KEY____;
      __CONTROL_CHARACTER_EXCLUDE_test = CONTROL_CHARACTER_EXCLUDE_TAB____;
      __ESCAPED_EXCLUDE_CONTROL_CHARACTER = ESCAPED_EXCLUDE_CONTROL_CHARACTER_TAB______;
      __BASIC_STRING = BASIC_STRING_TAB______;
      __BARE_KEY_exec = BARE_KEY_STRICT;
      supportArrayOfTables = true;
      break;
    case 0.5:
      __MULTI_LINE_LITERAL_STRING_exec = MULTI_LINE_LITERAL_STRING_0;
      __LITERAL_KEY_exec = LITERAL_KEY____;
      __CONTROL_CHARACTER_EXCLUDE_test = CONTROL_CHARACTER_EXCLUDE_TAB____;
      __ESCAPED_EXCLUDE_CONTROL_CHARACTER = ESCAPED_EXCLUDE_CONTROL_CHARACTER__________;
      __BASIC_STRING = BASIC_STRING__________;
      __BARE_KEY_exec = BARE_KEY_STRICT;
      supportArrayOfTables = true;
      break;
    case 0.4:
      __MULTI_LINE_LITERAL_STRING_exec = MULTI_LINE_LITERAL_STRING_0;
      __LITERAL_KEY_exec = LITERAL_KEY_DEL;
      __CONTROL_CHARACTER_EXCLUDE_test = CONTROL_CHARACTER_EXCLUDE_TAB_DEL;
      __ESCAPED_EXCLUDE_CONTROL_CHARACTER = ESCAPED_EXCLUDE_CONTROL_CHARACTER_DEL______;
      __BASIC_STRING = BASIC_STRING_DEL______;
      __BARE_KEY_exec = BARE_KEY_STRICT;
      supportArrayOfTables = true;
      break;
    default:
      __MULTI_LINE_LITERAL_STRING_exec = MULTI_LINE_LITERAL_STRING_0;
      __LITERAL_KEY_exec = LITERAL_KEY_DEL;
      __CONTROL_CHARACTER_EXCLUDE_test = CONTROL_CHARACTER_EXCLUDE_TAB_DEL;
      __ESCAPED_EXCLUDE_CONTROL_CHARACTER = ESCAPED_EXCLUDE_CONTROL_CHARACTER_DEL_SLASH;
      __BASIC_STRING = BASIC_STRING_DEL_SLASH;
      __BARE_KEY_exec = BARE_KEY_FREE;
      supportArrayOfTables = false;
  }
};
var NUM = /* @__PURE__ */ newRegExp`
	(?:
		0
		(?:
			b[01][_01]*
		|
			o[0-7][_0-7]*
		|
			x[\dA-Fa-f][_\dA-Fa-f]*
		|
			(?:\.\d[_\d]*)?(?:[Ee]-?\d[_\d]*)?
		)
	|
		[1-9][_\d]*
		(?:\.\d[_\d]*)?(?:[Ee]-?\d[_\d]*)?
	|
		inf
	|
		nan
	)
`.valueOf();
var { test: IS_AMAZING } = /* @__PURE__ */ newRegExp`
	^(?:
		-?${NUM}
		(?:-${NUM})*
	|
		true
	|
		false
	)$
`.valueOf();
var { test: BAD_DXOB } = /* @__PURE__ */ newRegExp`_(?![\dA-Fa-f])`.valueOf();
var isAmazing = (keys2) => IS_AMAZING(keys2) && !BAD_DXOB(keys2);
var mustScalar = true;
var ARGS_MODE = "";
var useWhatToJoinMultilineString = null;
var usingBigInt = true;
var IntegerMinNumber = 0;
var IntegerMaxNumber = 0;
var ANY = {
  test: () => true
};
var Keys = class KeysRegExp extends RegExp$1 {
  constructor(keys2) {
    super(`^${groupify(keys2)}$`);
    let maxLength = -1;
    for (let index = keys2.length; index; ) {
      const { length } = keys2[--index];
      if (length > maxLength) {
        maxLength = length;
      }
    }
    this.lastIndex = maxLength + 1;
    return this;
  }
  test(key) {
    return key.length < this.lastIndex && super.test(key);
  }
};
var isKeys = /* @__PURE__ */ isPrototypeOf.bind(/* @__PURE__ */ freeze(Keys.prototype));
var KEYS$1 = ANY;
var preserveLiteral;
var zeroDatetime;
var inlineTable;
var moreDatetime;
var disallowEmptyKey;
var sError;
var sFloat;
var Table3;
var allowLonger;
var enableNull;
var allowInlineTableMultilineAndTrailingCommaEvenNoComma;
var preserveComment;
var disableDigit;
var arrayTypes = new WeakMap$1();
var arrayTypes_get = /* @__PURE__ */ get.bind(arrayTypes);
var arrayTypes_set = /* @__PURE__ */ set.bind(arrayTypes);
var As = () => {
  const as = (array) => {
    const got = arrayTypes_get(array);
    got ? got === as || throws(TypeError$1(`Types in Array must be same` + where(". Check "))) : arrayTypes_set(array, as);
    return array;
  };
  return as;
};
var AS_TYPED = {
  asNulls: As(),
  asStrings: As(),
  asTables: As(),
  asArrays: As(),
  asBooleans: As(),
  asFloats: As(),
  asIntegers: As(),
  asOffsetDateTimes: As(),
  asLocalDateTimes: As(),
  asLocalDates: As(),
  asLocalTimes: As()
};
var asMixed = (array) => array;
var asNulls;
var asStrings;
var asTables;
var asArrays;
var asBooleans;
var asFloats;
var asIntegers;
var asOffsetDateTimes;
var asLocalDateTimes;
var asLocalDates;
var asLocalTimes;
var processor = null;
var each = null;
var collect_on = (tag, array, table, key) => {
  const _each = create$1(NULL);
  _each._linked = each;
  _each.tag = tag;
  if (table) {
    _each.table = table;
    _each.key = key;
  }
  if (array) {
    _each.array = array;
    _each.index = array.length;
  }
  each = _each;
};
var collect_off = () => {
  throw throws(SyntaxError$1(`xOptions.tag is not enabled, but found tag syntax` + where(" at ")));
};
var collect = collect_off;
var Process = () => {
  if (each) {
    const _processor = processor;
    let _each = each;
    each = null;
    return () => {
      const processor2 = _processor;
      let each2 = _each;
      _each = null;
      do {
        processor2(each2);
      } while (each2 = each2._linked);
    };
  }
  return null;
};
var clear = () => {
  KEYS$1 = ANY;
  useWhatToJoinMultilineString = processor = each = null;
  zeroDatetime = false;
};
var use = (specificationVersion, multilineStringJoiner, useBigInt, keys2, xOptions, argsMode) => {
  ARGS_MODE = argsMode;
  let mixed;
  switch (specificationVersion) {
    case 1:
      mustScalar = mixed = moreDatetime = sFloat = inlineTable = true;
      zeroDatetime = disallowEmptyKey = false;
      break;
    case 0.5:
      mustScalar = moreDatetime = sFloat = inlineTable = true;
      mixed = zeroDatetime = disallowEmptyKey = false;
      break;
    case 0.4:
      mustScalar = disallowEmptyKey = inlineTable = true;
      mixed = zeroDatetime = moreDatetime = sFloat = false;
      break;
    case 0.3:
      mustScalar = disallowEmptyKey = true;
      mixed = zeroDatetime = moreDatetime = sFloat = inlineTable = false;
      break;
    case 0.2:
      zeroDatetime = disallowEmptyKey = true;
      mustScalar = mixed = moreDatetime = sFloat = inlineTable = false;
      break;
    case 0.1:
      zeroDatetime = disallowEmptyKey = true;
      mustScalar = mixed = moreDatetime = sFloat = inlineTable = false;
      break;
    default:
      throw RangeError$1(`TOML.parse(,specificationVersion)`);
  }
  switchRegExp(specificationVersion);
  if (typeof multilineStringJoiner === "string") {
    useWhatToJoinMultilineString = multilineStringJoiner;
  } else if (multilineStringJoiner === undefined$1) {
    useWhatToJoinMultilineString = null;
  } else {
    throw TypeError$1(`TOML.parse(${ARGS_MODE ? `${ARGS_MODE}multilineStringJoiner` : `,{ joiner }`})`);
  }
  if (useBigInt === undefined$1 || useBigInt === true) {
    usingBigInt = true;
  } else if (useBigInt === false) {
    usingBigInt = false;
  } else {
    if (typeof useBigInt !== "number") {
      throw TypeError$1(`TOML.parse(${ARGS_MODE ? `${ARGS_MODE},useBigInt` : `,{ bigint }`})`);
    }
    if (!isSafeInteger(useBigInt)) {
      throw RangeError$1(`TOML.parse(${ARGS_MODE ? `${ARGS_MODE},useBigInt` : `,{ bigint }`})`);
    }
    usingBigInt = null;
    useBigInt >= 0 ? IntegerMinNumber = -(IntegerMaxNumber = useBigInt) : IntegerMaxNumber = -(IntegerMinNumber = useBigInt) - 1;
  }
  if (!BigInt$1 && usingBigInt !== false) {
    throw Error$1(`Can't work without TOML.parse(${ARGS_MODE ? `${ARGS_MODE},useBigInt` : `,{ bigint }`}) being set to false, because the host doesn't have BigInt support`);
  }
  if (keys2 == null) {
    KEYS$1 = ANY;
  } else {
    if (!isKeys(keys2)) {
      throw TypeError$1(`TOML.parse(,{ keys })`);
    }
    KEYS$1 = keys2;
  }
  if (xOptions == null) {
    Table3 = PlainTable;
    sError = allowLonger = enableNull = allowInlineTableMultilineAndTrailingCommaEvenNoComma = false;
    collect = collect_off;
  } else if (typeof xOptions !== "object") {
    throw TypeError$1(`TOML.parse(${ARGS_MODE ? `${ARGS_MODE},,xOptions` : `,{ x }`})`);
  } else {
    const { order, longer, exact, null: _null, multi, comment, string, literal, tag, ...unknown } = xOptions;
    const unknownNames = getOwnPropertyNames(unknown);
    if (unknownNames.length) {
      throw TypeError$1(`TOML.parse(${ARGS_MODE ? `${ARGS_MODE},,{ ${unknownNames.join(", ")} }` : `,{ x: { ${unknownNames.join(", ")} } }`})`);
    }
    Table3 = order ? OrderedTable : PlainTable;
    allowLonger = !longer;
    sError = !!exact;
    enableNull = !!_null;
    allowInlineTableMultilineAndTrailingCommaEvenNoComma = !!multi;
    preserveComment = !!comment;
    disableDigit = !!string;
    preserveLiteral = !!literal;
    if (tag) {
      if (typeof tag !== "function") {
        throw TypeError$1(`TOML.parse(${ARGS_MODE ? `${ARGS_MODE},,{ tag }` : `,{ x: { tag } }`})`);
      }
      if (!mixed) {
        throw TypeError$1(`TOML.parse(${ARGS_MODE ? `${ARGS_MODE},,xOptions` : `,{ x }`}) xOptions.tag needs at least TOML 1.0 to support mixed type array`);
      }
      processor = tag;
      collect = collect_on;
    } else {
      collect = collect_off;
    }
  }
  mixed ? asNulls = asStrings = asTables = asArrays = asBooleans = asFloats = asIntegers = asOffsetDateTimes = asLocalDateTimes = asLocalDates = asLocalTimes = asMixed : { asNulls, asStrings, asTables, asArrays, asBooleans, asFloats, asIntegers, asOffsetDateTimes, asLocalDateTimes, asLocalDates, asLocalTimes } = AS_TYPED;
};
var isView = ArrayBuffer.isView;
var isArrayBuffer = (
  /* j-globals: class.isArrayBuffer (internal) */
  /* @__PURE__ */ function() {
    if (typeof ArrayBuffer === "function") {
      var byteLength_apply = apply.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get);
      return function isArrayBuffer2(value) {
        try {
          byteLength_apply(value);
        } catch (error) {
          return false;
        }
        return true;
      };
    }
    return function isArrayBuffer2() {
      return false;
    };
  }()
);
var TextDecoder$1 = TextDecoder;
var Symbol$1 = Symbol;
var previous = Symbol$1("previous");
var x = (rootStack) => {
  let stack = rootStack;
  let result = stack.next();
  if (!result.done) {
    result.value[previous] = stack;
    result = (stack = result.value).next();
    for (; ; ) {
      if (result.done) {
        if (stack === rootStack) {
          break;
        }
        stack = stack[previous];
        result = stack.next(result.value);
      } else {
        result.value[previous] = stack;
        result = (stack = result.value).next();
      }
    }
  }
  return result.value;
};
var _literal = Symbol$1("_literal");
var LiteralObject = (literal, value) => {
  const object = Object$1(value);
  object[_literal] = literal;
  return object;
};
var arrays = new WeakSet$1();
var arrays_add = /* @__PURE__ */ add.bind(arrays);
var isArray = /* @__PURE__ */ has.bind(arrays);
var OF_TABLES = false;
var STATICALLY = true;
var staticalArrays = new WeakSet$1();
var staticalArrays_add = /* @__PURE__ */ add.bind(staticalArrays);
var isStatic = /* @__PURE__ */ has.bind(staticalArrays);
var newArray = (isStatic2) => {
  const array = [];
  arrays_add(array);
  isStatic2 && staticalArrays_add(array);
  return array;
};
var NativeDate = Date;
var parse$2 = Date.parse;
var preventExtensions = Object.preventExtensions;
var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
var defineProperties = (
  /* j-globals: null.defineProperties (internal) */
  function defineProperties2(object, descriptorMap) {
    var created = create$1(NULL);
    var names = keys(descriptorMap);
    for (var length = names.length, index = 0; index < length; ++index) {
      var name = names[index];
      created[name] = Descriptor(descriptorMap[name]);
    }
    if (getOwnPropertySymbols) {
      var symbols = getOwnPropertySymbols(descriptorMap);
      for (length = symbols.length, index = 0; index < length; ++index) {
        var symbol = symbols[index];
        if (isEnum(descriptorMap, symbol)) {
          created[symbol] = Descriptor(descriptorMap[symbol]);
        }
      }
    }
    return Object_defineProperties(object, created);
  }
);
var fpc = (c) => {
  freeze(freeze(c).prototype);
  return c;
};
var _29_ = /(?:0[1-9]|1\d|2\d)/;
var _30_ = /(?:0[1-9]|[12]\d|30)/;
var _31_ = /(?:0[1-9]|[12]\d|3[01])/;
var _23_ = /(?:[01]\d|2[0-3])/;
var _59_ = /[0-5]\d/;
var YMD = /* @__PURE__ */ newRegExp`
	\d\d\d\d-
	(?:
		0
		(?:
			[13578]-${_31_}
			|
			[469]-${_30_}
			|
			2-${_29_}
		)
		|
		1
		(?:
			[02]-${_31_}
			|
			1-${_30_}
		)
	)
`.valueOf();
var HMS = /* @__PURE__ */ newRegExp`
	${_23_}:${_59_}:${_59_}
`.valueOf();
var OFFSET$ = /(?:[Zz]|[+-]\d\d:\d\d)$/;
var { exec: Z_exec } = theRegExp(/(([+-])\d\d):(\d\d)$/);
var { exec: OFFSET_DATETIME_exec } = /* @__PURE__ */ newRegExp`
	^
	${YMD}
	[Tt ]
	${HMS}
	(?:\.\d{1,3}(\d*?)0*)?
	(?:[Zz]|[+-]${_23_}:${_59_})
	$`.valueOf();
var { exec: OFFSET_DATETIME_ZERO_exec } = /* @__PURE__ */ newRegExp`
	^
	${YMD}
	[Tt ]
	${HMS}
	()
	[Zz]
	$`.valueOf();
var { test: IS_LOCAL_DATETIME } = /* @__PURE__ */ newRegExp`
	^
	${YMD}
	[Tt ]
	${HMS}
	(?:\.\d+)?
	$`.valueOf();
var { test: IS_LOCAL_DATE } = /* @__PURE__ */ newRegExp`
	^
	${YMD}
	$`.valueOf();
var { test: IS_LOCAL_TIME } = /* @__PURE__ */ newRegExp`
	^
	${HMS}
	(?:\.\d+)?
	$`.valueOf();
var T = /[ t]/;
var DELIMITER_DOT = /[-T:.]/g;
var DOT_ZERO = /\.?0+$/;
var ZERO = /\.(\d*?)0+$/;
var zeroReplacer = (match, p1) => p1;
var Datetime = /* @__PURE__ */ (() => {
  const Datetime2 = function() {
    return this;
  };
  const descriptors = Null$1(null);
  {
    const descriptor = Null$1(null);
    for (const key of ownKeys(NativeDate.prototype)) {
      key === "constructor" || key === "toJSON" || (descriptors[key] = descriptor);
    }
  }
  Datetime2.prototype = preventExtensions(create$1(NativeDate.prototype, descriptors));
  return freeze(Datetime2);
})();
var Value = (ISOString) => ISOString.replace(ZERO, zeroReplacer).replace(DELIMITER_DOT, "");
var d = /./gs;
var d2u = (d2) => "\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009"[d2];
var ValueOFFSET = (time, more) => time < 0 ? ("" + (time + 6216730554e4)).replace(d, d2u).padStart(14, "\u2000") + more.replace(d, d2u) + time : more ? (time + ".").padStart(16, "0") + more : ("" + time).padStart(15, "0");
var validateLeap = (literal) => {
  if (literal.startsWith("02-29", 5)) {
    const year = +literal.slice(0, 4);
    return year & 3 ? false : year % 100 ? true : year % 400 ? false : year % 3200 ? true : false;
  }
  return true;
};
var { test: VALIDATE_LEAP } = /* @__PURE__ */ newRegExp.s`^.....(?:06.30|12.31).23:59:59`.valueOf();
var DATE$1 = /* @__PURE__ */ defineProperties(new NativeDate(0), /* @__PURE__ */ getOwnPropertyDescriptors(NativeDate.prototype));
var OffsetDateTime_ISOString = Symbol$1("OffsetDateTime_ISOString");
var OffsetDateTime_value = Symbol$1("OffsetDateTime_value");
var OffsetDateTime_use = (that, $ = 0) => {
  DATE$1.setTime(+that[OffsetDateTime_value] + $);
  return DATE$1;
};
var OffsetDateTime = /* @__PURE__ */ fpc(class OffsetDateTime2 extends Datetime {
  [OffsetDateTime_ISOString];
  [OffsetDateTime_value];
  get [Symbol$1.toStringTag]() {
    return "OffsetDateTime";
  }
  valueOf() {
    return this[OffsetDateTime_value];
  }
  toISOString() {
    return this[OffsetDateTime_ISOString];
  }
  constructor(literal) {
    validateLeap(literal) || throws(SyntaxError$1(`Invalid Offset Date-Time ${literal}` + where(" at ")));
    const with60 = literal.startsWith("60", 17);
    let without60 = with60 ? literal.slice(0, 17) + "59" + literal.slice(19) : literal;
    const { 1: more = "" } = (zeroDatetime ? OFFSET_DATETIME_ZERO_exec(without60) : OFFSET_DATETIME_exec(without60)) || throws(SyntaxError$1(`Invalid Offset Date-Time ${literal}` + where(" at ")));
    const time = parse$2(without60 = without60.replace(T, "T").replace("z", "Z"));
    if (with60) {
      DATE$1.setTime(time);
      VALIDATE_LEAP(DATE$1.toISOString()) || throws(SyntaxError$1(`Invalid Offset Date-Time ${literal}` + where(" at ")));
    }
    super();
    this[OffsetDateTime_ISOString] = without60;
    this[OffsetDateTime_value] = ValueOFFSET(time, more);
    return this;
  }
  getUTCFullYear() {
    return OffsetDateTime_use(this).getUTCFullYear();
  }
  ///get year () :FullYear { return OffsetDateTime_get(this, 0, 4); }
  ///set year (value :FullYear) { OffsetDateTime_set(this, 0, 4, value, true); }
  getUTCMonth() {
    return OffsetDateTime_use(this).getUTCMonth();
  }
  ///get month () { return OffsetDateTime_get(this, 5, 7); }
  ///set month (value) { OffsetDateTime_set(this, 5, 7, value, true); }
  getUTCDate() {
    return OffsetDateTime_use(this).getUTCDate();
  }
  ///get day () :Date { return OffsetDateTime_get(this, 8, 10); }
  ///set day (value :Date) { OffsetDateTime_set(this, 8, 10, value, true); }
  getUTCHours() {
    return OffsetDateTime_use(this).getUTCHours();
  }
  ///get hour () :Hours { return OffsetDateTime_get(this, 11, 13); }
  ///set hour (value :Hours) { OffsetDateTime_set(this, 11, 13, value, true); }
  getUTCMinutes() {
    return OffsetDateTime_use(this).getUTCMinutes();
  }
  ///get minute () :Minutes { return OffsetDateTime_get(this, 14, 16); }
  ///set minute (value :Minutes) { OffsetDateTime_set(this, 14, 16, value, true); }
  getUTCSeconds() {
    return OffsetDateTime_use(this).getUTCSeconds();
  }
  ///get second () :Seconds { return OffsetDateTime_get(this, 17, 19); }
  ///set second (value :Seconds) { OffsetDateTime_set(this, 17, 19, value, true); }
  getUTCMilliseconds() {
    return OffsetDateTime_use(this).getUTCMilliseconds();
  }
  ///
  ///get millisecond () :Milliseconds { return this[OffsetDateTime_value]%1000; }///
  /*set millisecond (value :Milliseconds) {
  	this[OffsetDateTime_ISOString] = this[OffsetDateTime_ISOString].slice(0, 19) + ( value ? ( '.' + ( '' + value ).padStart(3, '0') ).replace(DOT_ZERO, '') : '' ) + this[OffsetDateTime_ISOString].slice(this[OffsetDateTime_ISOString].search(OFFSET$));
  	OffsetDateTime_set(this, 0, 0, 0, false);
  }*/
  //
  ///get microsecond () :Milliseconds
  ///set microsecond (value :Milliseconds)
  ///get nanosecond () :Milliseconds
  ///set nanosecond (value :Milliseconds)
  getUTCDay() {
    return OffsetDateTime_use(this).getUTCDay();
  }
  ///get dayOfWeek () { return OffsetDateTime_use(this, this.getTimezoneOffset()*60000).getUTCDay() || 7; }
  getTimezoneOffset() {
    const z = Z_exec(this[OffsetDateTime_ISOString]);
    return z ? +z[1] * 60 + +(z[2] + z[3]) : 0;
  }
  ///get offset () { return this[OffsetDateTime_ISOString].endsWith('Z') ? 'Z' : this[OffsetDateTime_ISOString].slice(-6); }
  /*set offset (value) {
  	this[OffsetDateTime_ISOString] = this[OffsetDateTime_ISOString].slice(0, this[OffsetDateTime_ISOString].endsWith('Z') ? -1 : -6) + value;
  	OffsetDateTime_set(this, 0, 0, 0, true);
  }*/
  //
  getTime() {
    return floor(+this[OffsetDateTime_value]);
  }
  ///
  /*setTime (this :OffsetDateTime, value :Time) :void {
  	value = DATE.setTime(value);
  	const z = Z_exec(this[OffsetDateTime_ISOString]);
  	DATE.setTime(value + ( z ? +z[1]*60 + +( z[2] + z[3] ) : 0 )*60000);
  	this[OffsetDateTime_ISOString] = z ? DATE.toISOString().slice(0, -1) + z[0] : DATE.toISOString();
  	this[OffsetDateTime_value] = ValueOFFSET(value, '');
  	///return value;
  }*/
});
var LocalDateTime_ISOString = Symbol$1("LocalDateTime_ISOString");
var LocalDateTime_value = Symbol$1("LocalDateTime_value");
var LocalDateTime_get = (that, start, end) => +that[LocalDateTime_ISOString].slice(start, end);
var LocalDateTime_set = (that, start, end, value) => {
  const string = "" + value;
  const size = end - start;
  if (string.length > size) {
    throw RangeError$1();
  }
  that[LocalDateTime_value] = Value(
    that[LocalDateTime_ISOString] = that[LocalDateTime_ISOString].slice(0, start) + string.padStart(size, "0") + that[LocalDateTime_ISOString].slice(end)
  );
};
var LocalDateTime = /* @__PURE__ */ fpc(class LocalDateTime2 extends Datetime {
  [LocalDateTime_ISOString];
  [LocalDateTime_value];
  get [Symbol$1.toStringTag]() {
    return "LocalDateTime";
  }
  valueOf() {
    return this[LocalDateTime_value];
  }
  toISOString() {
    return this[LocalDateTime_ISOString];
  }
  constructor(literal) {
    IS_LOCAL_DATETIME(literal) && validateLeap(literal) || throws(SyntaxError$1(`Invalid Local Date-Time ${literal}` + where(" at ")));
    super();
    this[LocalDateTime_value] = Value(
      this[LocalDateTime_ISOString] = literal.replace(T, "T")
    );
    return this;
  }
  getFullYear() {
    return LocalDateTime_get(this, 0, 4);
  }
  setFullYear(value) {
    LocalDateTime_set(this, 0, 4, value);
  }
  getMonth() {
    return LocalDateTime_get(this, 5, 7) - 1;
  }
  setMonth(value) {
    LocalDateTime_set(this, 5, 7, value + 1);
  }
  getDate() {
    return LocalDateTime_get(this, 8, 10);
  }
  setDate(value) {
    LocalDateTime_set(this, 8, 10, value);
  }
  getHours() {
    return LocalDateTime_get(this, 11, 13);
  }
  setHours(value) {
    LocalDateTime_set(this, 11, 13, value);
  }
  getMinutes() {
    return LocalDateTime_get(this, 14, 16);
  }
  setMinutes(value) {
    LocalDateTime_set(this, 14, 16, value);
  }
  getSeconds() {
    return LocalDateTime_get(this, 17, 19);
  }
  setSeconds(value) {
    LocalDateTime_set(this, 17, 19, value);
  }
  getMilliseconds() {
    return +this[LocalDateTime_value].slice(14, 17).padEnd(3, "0");
  }
  ///
  setMilliseconds(value) {
    this[LocalDateTime_value] = Value(
      this[LocalDateTime_ISOString] = this[LocalDateTime_ISOString].slice(0, 19) + (value ? ("." + ("" + value).padStart(3, "0")).replace(DOT_ZERO, "") : "")
    );
  }
});
var LocalDate_ISOString = Symbol$1("LocalDate_ISOString");
var LocalDate_value = Symbol$1("LocalDate_value");
var LocalDate_get = (that, start, end) => +that[LocalDate_ISOString].slice(start, end);
var LocalDate_set = (that, start, end, value) => {
  const string = "" + value;
  const size = end - start;
  if (string.length > size) {
    throw RangeError$1();
  }
  that[LocalDate_value] = Value(
    that[LocalDate_ISOString] = that[LocalDate_ISOString].slice(0, start) + string.padStart(size, "0") + that[LocalDate_ISOString].slice(end)
  );
};
var LocalDate = /* @__PURE__ */ fpc(class LocalDate2 extends Datetime {
  [LocalDate_ISOString];
  [LocalDate_value];
  get [Symbol$1.toStringTag]() {
    return "LocalDate";
  }
  valueOf() {
    return this[LocalDate_value];
  }
  toISOString() {
    return this[LocalDate_ISOString];
  }
  constructor(literal) {
    IS_LOCAL_DATE(literal) && validateLeap(literal) || throws(SyntaxError$1(`Invalid Local Date ${literal}` + where(" at ")));
    super();
    this[LocalDate_value] = Value(
      this[LocalDate_ISOString] = literal
    );
    return this;
  }
  getFullYear() {
    return LocalDate_get(this, 0, 4);
  }
  setFullYear(value) {
    LocalDate_set(this, 0, 4, value);
  }
  getMonth() {
    return LocalDate_get(this, 5, 7) - 1;
  }
  setMonth(value) {
    LocalDate_set(this, 5, 7, value + 1);
  }
  getDate() {
    return LocalDate_get(this, 8, 10);
  }
  setDate(value) {
    LocalDate_set(this, 8, 10, value);
  }
});
var LocalTime_ISOString = Symbol$1("LocalTime_ISOString");
var LocalTime_value = Symbol$1("LocalTime_value");
var LocalTime_get = (that, start, end) => +that[LocalTime_ISOString].slice(start, end);
var LocalTime_set = (that, start, end, value) => {
  const string = "" + value;
  const size = end - start;
  if (string.length > size) {
    throw RangeError$1();
  }
  that[LocalTime_value] = Value(
    that[LocalTime_ISOString] = that[LocalTime_ISOString].slice(0, start) + string.padStart(2, "0") + that[LocalTime_ISOString].slice(end)
  );
};
var LocalTime = /* @__PURE__ */ fpc(class LocalTime2 extends Datetime {
  [LocalTime_ISOString];
  [LocalTime_value];
  get [Symbol$1.toStringTag]() {
    return "LocalTime";
  }
  valueOf() {
    return this[LocalTime_value];
  }
  toISOString() {
    return this[LocalTime_ISOString];
  }
  constructor(literal) {
    IS_LOCAL_TIME(literal) || throws(SyntaxError$1(`Invalid Local Time ${literal}` + where(" at ")));
    super();
    this[LocalTime_value] = Value(
      this[LocalTime_ISOString] = literal
    );
    return this;
  }
  getHours() {
    return LocalTime_get(this, 0, 2);
  }
  setHours(value) {
    LocalTime_set(this, 0, 2, value);
  }
  getMinutes() {
    return LocalTime_get(this, 3, 5);
  }
  setMinutes(value) {
    LocalTime_set(this, 3, 5, value);
  }
  getSeconds() {
    return LocalTime_get(this, 6, 8);
  }
  setSeconds(value) {
    LocalTime_set(this, 6, 8, value);
  }
  getMilliseconds() {
    return +this[LocalTime_value].slice(6, 9).padEnd(3, "0");
  }
  ///
  setMilliseconds(value) {
    this[LocalTime_value] = Value(
      this[LocalTime_ISOString] = this[LocalTime_ISOString].slice(0, 8) + (value ? ("." + ("" + value).padStart(3, "0")).replace(DOT_ZERO, "") : "")
    );
  }
});
var parseInt$1 = parseInt;
var fromCodePoint = String.fromCodePoint;
var ESCAPED_IN_SINGLE_LINE = /[^\\]+|\\(?:[\\"btnfr/]|u.{4}|U.{8})/gs;
var ESCAPED_IN_MULTI_LINE = /[^\n\\]+|\n|\\(?:[\t ]*\n[\t\n ]*|[\\"btnfr/]|u.{4}|U.{8})/gs;
var BasicString = (literal) => {
  if (!literal) {
    return "";
  }
  const parts = literal.match(ESCAPED_IN_SINGLE_LINE);
  const { length } = parts;
  let index = 0;
  do {
    const part = parts[index];
    if (part[0] === "\\") {
      switch (part[1]) {
        case "\\":
          parts[index] = "\\";
          break;
        case '"':
          parts[index] = '"';
          break;
        case "b":
          parts[index] = "\b";
          break;
        case "t":
          parts[index] = "	";
          break;
        case "n":
          parts[index] = "\n";
          break;
        case "f":
          parts[index] = "\f";
          break;
        case "r":
          parts[index] = "\r";
          break;
        case "u":
          const charCode = parseInt$1(part.slice(2), 16);
          mustScalar && 55295 < charCode && charCode < 57344 && throws(RangeError$1(`Invalid Unicode Scalar ${part}` + where(" at ")));
          parts[index] = fromCharCode(charCode);
          break;
        case "U":
          const codePoint = parseInt$1(part.slice(2), 16);
          (mustScalar && 55295 < codePoint && codePoint < 57344 || 1114111 < codePoint) && throws(RangeError$1(`Invalid Unicode Scalar ${part}` + where(" at ")));
          parts[index] = fromCodePoint(codePoint);
          break;
        case "/":
          parts[index] = "/";
          break;
      }
    }
  } while (++index !== length);
  return parts.join("");
};
var MultilineBasicString = (literal, useWhatToJoinMultilineString2, n) => {
  if (!literal) {
    return "";
  }
  const parts = literal.match(ESCAPED_IN_MULTI_LINE);
  const { length } = parts;
  let index = 0;
  do {
    const part = parts[index];
    if (part === "\n") {
      ++n;
      parts[index] = useWhatToJoinMultilineString2;
    } else if (part[0] === "\\") {
      switch (part[1]) {
        case "\n":
        case " ":
        case "	":
          for (let i = 0; i = part.indexOf("\n", i) + 1; ) {
            ++n;
          }
          parts[index] = "";
          break;
        case "\\":
          parts[index] = "\\";
          break;
        case '"':
          parts[index] = '"';
          break;
        case "b":
          parts[index] = "\b";
          break;
        case "t":
          parts[index] = "	";
          break;
        case "n":
          parts[index] = "\n";
          break;
        case "f":
          parts[index] = "\f";
          break;
        case "r":
          parts[index] = "\r";
          break;
        case "u":
          const charCode = parseInt$1(part.slice(2), 16);
          mustScalar && 55295 < charCode && charCode < 57344 && throws(RangeError$1(`Invalid Unicode Scalar ${part}` + where(" at ", lineIndex + n)));
          parts[index] = fromCharCode(charCode);
          break;
        case "U":
          const codePoint = parseInt$1(part.slice(2), 16);
          (mustScalar && 55295 < codePoint && codePoint < 57344 || 1114111 < codePoint) && throws(RangeError$1(`Invalid Unicode Scalar ${part}` + where(" at ", lineIndex + n)));
          parts[index] = fromCodePoint(codePoint);
          break;
        case "/":
          parts[index] = "/";
          break;
      }
    }
  } while (++index !== length);
  return parts.join("");
};
var INTEGER_D = /[-+]?(?:0|[1-9][_\d]*)/;
var { test: BAD_D } = /* @__PURE__ */ newRegExp`_(?!\d)`.valueOf();
var { test: IS_D_INTEGER } = /* @__PURE__ */ newRegExp`^${INTEGER_D}$`.valueOf();
var { test: IS_XOB_INTEGER } = theRegExp(/^0(?:x[\dA-Fa-f][_\dA-Fa-f]*|o[0-7][_0-7]*|b[01][_01]*)$/);
var { test: BAD_XOB } = /* @__PURE__ */ newRegExp`_(?![\dA-Fa-f])`.valueOf();
var UNDERSCORES$1 = /_/g;
var UNDERSCORES_SIGN = /_|^[-+]/g;
var IS_INTEGER = (literal) => (IS_D_INTEGER(literal) || /*options.xob && */
IS_XOB_INTEGER(literal)) && !BAD_XOB(literal);
var MIN = BigInt$1 && -/* @__PURE__ */ BigInt$1("0x8000000000000000");
var MAX = BigInt$1 && /* @__PURE__ */ BigInt$1("0x7FFFFFFFFFFFFFFF");
var BigIntInteger = (literal) => {
  IS_INTEGER(literal) || throws(SyntaxError$1(`Invalid Integer ${literal}` + where(" at ")));
  const bigInt = literal[0] === "-" ? -BigInt$1(literal.replace(UNDERSCORES_SIGN, "")) : BigInt$1(literal.replace(UNDERSCORES_SIGN, ""));
  allowLonger || MIN <= bigInt && bigInt <= MAX || throws(RangeError$1(`Integer expect 64 bit range (-9,223,372,036,854,775,808 to 9,223,372,036,854,775,807), not includes ${literal}` + where(" meet at ")));
  return bigInt;
};
var NumberInteger = (literal) => {
  IS_INTEGER(literal) || throws(SyntaxError$1(`Invalid Integer ${literal}` + where(" at ")));
  const number = parseInt$1(literal.replace(UNDERSCORES$1, ""));
  isSafeInteger(number) || throws(RangeError$1(`Integer did not use BitInt must fit Number.isSafeInteger, not includes ${literal}` + where(" meet at ")));
  return number;
};
var Integer = (literal) => {
  if (usingBigInt === true) {
    return BigIntInteger(literal);
  }
  if (usingBigInt === false) {
    return NumberInteger(literal);
  }
  IS_INTEGER(literal) || throws(SyntaxError$1(`Invalid Integer ${literal}` + where(" at ")));
  const number = parseInt$1(literal.replace(UNDERSCORES$1, ""));
  if (IntegerMinNumber <= number && number <= IntegerMaxNumber) {
    return number;
  }
  const bigInt = literal[0] === "-" ? -BigInt$1(literal.replace(UNDERSCORES_SIGN, "")) : BigInt$1(literal.replace(UNDERSCORES_SIGN, ""));
  allowLonger || MIN <= bigInt && bigInt <= MAX || throws(RangeError$1(`Integer expect 64 bit range (-9,223,372,036,854,775,808 to 9,223,372,036,854,775,807), not includes ${literal}` + where(" meet at ")));
  return bigInt;
};
var isFinite$1 = isFinite;
var NaN$1 = 0 / 0;
var _NaN = -NaN$1;
var _Infinity$1 = -Infinity;
var { test: IS_FLOAT } = /* @__PURE__ */ newRegExp`
	^
	${INTEGER_D}
	(?:
		\.\d[_\d]*
		(?:[eE][-+]?\d[_\d]*)?
	|
		[eE][-+]?\d[_\d]*
	)
	$`.valueOf();
var UNDERSCORES = /_/g;
var { test: IS_ZERO } = theRegExp(/^[-+]?0(?:\.0+)?(?:[eE][-+]?0+)?$/);
var { exec: NORMALIZED } = theRegExp(/^[-0]?(\d*)(?:\.(\d+))?(?:e\+?(-?\d+))?$/);
var { exec: ORIGINAL } = theRegExp(/^[-+]?0?(\d*)(?:\.(\d*?)0*)?(?:[eE]\+?(-?\d+))?$/);
var Float = (literal) => {
  if (!IS_FLOAT(literal) || BAD_D(literal)) {
    if (sFloat) {
      if (literal === "inf" || literal === "+inf") {
        return Infinity;
      }
      if (literal === "-inf") {
        return _Infinity$1;
      }
      if (literal === "nan" || literal === "+nan") {
        return NaN$1;
      }
      if (literal === "-nan") {
        return _NaN;
      }
    } else if (!sError) {
      if (literal === "inf" || literal === "+inf") {
        return Infinity;
      }
      if (literal === "-inf") {
        return _Infinity$1;
      }
    }
    throw throws(SyntaxError$1(`Invalid Float ${literal}` + where(" at ")));
  }
  const withoutUnderscores = literal.replace(UNDERSCORES, "");
  const number = +withoutUnderscores;
  if (sError) {
    isFinite$1(number) || throws(RangeError$1(`Float ${literal} has been as big as inf` + where(" at ")));
    number || IS_ZERO(withoutUnderscores) || throws(RangeError$1(`Float ${literal} has been as little as ${literal[0] === "-" ? "-" : ""}0` + where(" at ")));
    const { 1: normalized_integer, 2: normalized_fractional = "", 3: normalized_exponent = "" } = NORMALIZED(number);
    const { 1: original_integer, 2: original_fractional = "", 3: original_exponent = "" } = ORIGINAL(withoutUnderscores);
    original_integer + original_fractional === normalized_integer + normalized_fractional && original_exponent - original_fractional.length === normalized_exponent - normalized_fractional.length || throws(RangeError$1(`Float ${literal} has lost its exact and been ${number}` + where(" at ")));
  }
  return number;
};
var prepareTable = (table, keys2) => {
  const { length } = keys2;
  let index = 0;
  while (index < length) {
    const key = keys2[index++];
    if (key in table) {
      table = table[key];
      if (isTable(table)) {
        isInline(table) && throws(Error$1(`Trying to define Table under Inline Table` + where(" at ")));
      } else if (isArray(table)) {
        isStatic(table) && throws(Error$1(`Trying to append value to Static Array` + where(" at ")));
        table = table[table.length - 1];
      } else {
        throw throws(Error$1(`Trying to define Table under non-Table value` + where(" at ")));
      }
    } else {
      table = table[key] = new Table3(IMPLICITLY);
      while (index < length) {
        table = table[keys2[index++]] = new Table3(IMPLICITLY);
      }
      return table;
    }
  }
  return table;
};
var appendTable = (table, finalKey, asArrayItem, tag) => {
  let lastTable;
  if (asArrayItem) {
    let arrayOfTables;
    if (finalKey in table) {
      isArray(arrayOfTables = table[finalKey]) && !isStatic(arrayOfTables) || throws(Error$1(`Trying to push Table to non-ArrayOfTables value` + where(" at ")));
    } else {
      arrayOfTables = table[finalKey] = newArray(OF_TABLES);
    }
    tag && collect(tag, arrayOfTables, table, finalKey);
    arrayOfTables[arrayOfTables.length] = lastTable = new Table3(DIRECTLY);
  } else {
    if (finalKey in table) {
      lastTable = table[finalKey];
      fromPair(lastTable) && throws(Error$1(`A table defined implicitly via key/value pair can not be accessed to via []` + where(", which at ")));
      directlyIfNot(lastTable) || throws(Error$1(`Duplicate Table definition` + where(" at ")));
    } else {
      table[finalKey] = lastTable = new Table3(DIRECTLY);
    }
    tag && collect(tag, null, table, finalKey);
  }
  return lastTable;
};
var prepareInlineTable = (table, keys2) => {
  const { length } = keys2;
  let index = 0;
  while (index < length) {
    const key = keys2[index++];
    if (key in table) {
      table = table[key];
      isTable(table) || throws(Error$1(`Trying to assign property through non-Table value` + where(" at ")));
      isInline(table) && throws(Error$1(`Trying to assign property through static Inline Table` + where(" at ")));
      fromPair(table) || throws(Error$1(`A table defined implicitly via [] can not be accessed to via key/value pair` + where(", which at ")));
    } else {
      table = table[key] = new Table3(IMPLICITLY, PAIR);
      while (index < length) {
        table = table[keys2[index++]] = new Table3(IMPLICITLY, PAIR);
      }
      return table;
    }
  }
  return table;
};
var checkLiteralString = (literal) => {
  __CONTROL_CHARACTER_EXCLUDE_test(literal) && throws(SyntaxError$1(`Control characters other than Tab are not permitted in a Literal String` + where(", which was found at ")));
  return literal;
};
var assignLiteralString = (table, finalKey, literal) => {
  if (!literal.startsWith(`'''`)) {
    const $2 = LITERAL_STRING_exec(literal) || throws(SyntaxError$1(`Bad literal string` + where(" at ")));
    const value = checkLiteralString($2[1]);
    table[finalKey] = preserveLiteral ? LiteralObject(literal.slice(0, value.length + 2), value) : value;
    return $2[2];
  }
  const $ = __MULTI_LINE_LITERAL_STRING_exec(literal.slice(3));
  if ($) {
    const value = checkLiteralString($[1]) + $[2];
    table[finalKey] = preserveLiteral ? LiteralObject(literal.slice(0, value.length + 6), value) : value;
    return $[3];
  }
  const start = new mark("Multi-line Literal String", literal.length);
  const leadingNewline = !(literal = literal.slice(3));
  if (leadingNewline) {
    literal = start.must();
    const $2 = __MULTI_LINE_LITERAL_STRING_exec(literal);
    if ($2) {
      const value = checkLiteralString($2[1]) + $2[2];
      table[finalKey] = preserveLiteral ? LiteralObject([`'''`, literal.slice(0, value.length + 3)], value) : value;
      return $2[3];
    }
  }
  useWhatToJoinMultilineString === null && start.nowrap(ARGS_MODE);
  for (const lines = [checkLiteralString(literal)]; ; ) {
    const line = start.must();
    const $2 = __MULTI_LINE_LITERAL_STRING_exec(line);
    if ($2) {
      lines[lines.length] = checkLiteralString($2[1]) + $2[2];
      const value = lines.join(useWhatToJoinMultilineString);
      if (preserveLiteral) {
        lines[lines.length - 1] += `'''`;
        leadingNewline ? lines.unshift(`'''`) : lines[0] = `'''${literal}`;
        table[finalKey] = LiteralObject(lines, value);
      } else {
        table[finalKey] = value;
      }
      return $2[3];
    }
    lines[lines.length] = checkLiteralString(line);
  }
};
var assignBasicString = (table, finalKey, literal) => {
  if (!literal.startsWith('"""')) {
    const index = BASIC_STRING_exec_1_endIndex(literal);
    const value = BasicString(literal.slice(1, index));
    table[finalKey] = preserveLiteral ? LiteralObject(literal.slice(0, index + 1), value) : value;
    return literal.slice(index + 1).replace(PRE_WHITESPACE, "");
  }
  let length = 3 + MULTI_LINE_BASIC_STRING_exec_0_length(literal.slice(3));
  if (literal.length !== length) {
    const $ = literal.slice(3, length);
    ESCAPED_EXCLUDE_CONTROL_CHARACTER_test($) || throws(SyntaxError$1(`Bad multi-line basic string` + where(" at ")));
    const value = BasicString($) + (literal.startsWith('"', length += 3) ? literal.startsWith('"', ++length) ? (++length, '""') : '"' : "");
    table[finalKey] = preserveLiteral ? LiteralObject(literal.slice(0, length), value) : value;
    return literal.slice(length).replace(PRE_WHITESPACE, "");
  }
  const start = new mark("Multi-line Basic String", length);
  const skipped = (literal = literal.slice(3)) ? 0 : 1;
  if (skipped) {
    literal = start.must();
    let length2 = MULTI_LINE_BASIC_STRING_exec_0_length(literal);
    if (literal.length !== length2) {
      const $ = literal.slice(0, length2);
      ESCAPED_EXCLUDE_CONTROL_CHARACTER_test($) || throws(SyntaxError$1(`Bad multi-line basic string` + where(" at ")));
      const value = MultilineBasicString($, useWhatToJoinMultilineString, skipped) + (literal.startsWith('"', length2 += 3) ? literal.startsWith('"', ++length2) ? (++length2, '""') : '"' : "");
      table[finalKey] = preserveLiteral ? LiteralObject(['"""', literal.slice(0, length2)], value) : value;
      return literal.slice(length2).replace(PRE_WHITESPACE, "");
    }
  }
  useWhatToJoinMultilineString === null && start.nowrap(ARGS_MODE);
  ESCAPED_EXCLUDE_CONTROL_CHARACTER_test(literal + "\n") || throws(SyntaxError$1(`Bad multi-line basic string` + where(" at ")));
  for (const lines = [literal]; ; ) {
    const line = start.must();
    let length2 = MULTI_LINE_BASIC_STRING_exec_0_length(line);
    if (line.length !== length2) {
      const $ = line.slice(0, length2);
      ESCAPED_EXCLUDE_CONTROL_CHARACTER_test($) || throws(SyntaxError$1(`Bad multi-line basic string` + where(" at ")));
      const value = MultilineBasicString(lines.join("\n") + "\n" + $, useWhatToJoinMultilineString, skipped) + (line.startsWith('"', length2 += 3) ? line.startsWith('"', ++length2) ? (++length2, '""') : '"' : "");
      if (preserveLiteral) {
        skipped ? lines.unshift('"""') : lines[0] = `"""${literal}`;
        lines[lines.length] = `${$}"""`;
        table[finalKey] = LiteralObject(lines, value);
      } else {
        table[finalKey] = value;
      }
      return line.slice(length2).replace(PRE_WHITESPACE, "");
    }
    ESCAPED_EXCLUDE_CONTROL_CHARACTER_test(line + "\n") || throws(SyntaxError$1(`Bad multi-line basic string` + where(" at ")));
    lines[lines.length] = line;
  }
};
var KEYS = /* @__PURE__ */ Null$1(null);
var commentFor = (key) => KEYS[key] || (KEYS[key] = Symbol$1(key));
var commentForThis = Symbol$1("this");
var { test: includesNewline } = theRegExp(/\r?\n/g);
var getCOMMENT = (table, keyComment) => {
  if (keyComment in table) {
    const comment = table[keyComment];
    if (typeof comment !== "string") {
      throw TypeError$1(`the value of comment must be a string, while "${comment === null ? "null" : typeof comment}" type is found`);
    }
    if (includesNewline(comment)) {
      throw SyntaxError$1(`the value of comment must be a string and can not include newline`);
    }
    return ` #${comment}`;
  }
  return "";
};
var getComment = (table, key) => key in KEYS ? getCOMMENT(table, KEYS[key]) : "";
var { test: IS_OFFSET$ } = theRegExp(OFFSET$);
var { test: IS_EMPTY } = theRegExp(/^\[[\t ]*]/);
var parseKeys = (rest2) => {
  let lineRest = rest2;
  const leadingKeys = [];
  let lastIndex = -1;
  for (; ; ) {
    lineRest || throws(SyntaxError$1(`Empty bare key` + where(" at ")));
    if (lineRest[0] === '"') {
      const index = BASIC_STRING_exec_1_endIndex(lineRest);
      KEYS$1.test(leadingKeys[++lastIndex] = BasicString(lineRest.slice(1, index))) || throws(Error$1(`Key not allowed` + where(" at ")));
      lineRest = lineRest.slice(index + 1);
    } else {
      const isQuoted = lineRest[0] === "'";
      const key = ((isQuoted ? __LITERAL_KEY_exec : __BARE_KEY_exec)(lineRest) || throws(SyntaxError$1(`Bad ${isQuoted ? "literal string" : "bare"} key` + where(" at "))))[0];
      lineRest = lineRest.slice(key.length);
      KEYS$1.test(leadingKeys[++lastIndex] = isQuoted ? key.slice(1, -1) : key) || throws(Error$1(`Key not allowed` + where(" at ")));
    }
    if (IS_DOT_KEY(lineRest)) {
      lineRest = lineRest.replace(DOT_KEY, "");
    } else {
      break;
    }
  }
  if (disableDigit) {
    const keys2 = rest2.slice(0, -lineRest.length);
    (isAmazing(keys2) || enableNull && keys2 === "null") && throws(SyntaxError$1(`Bad bare key disabled by xOptions.string` + where(" at ")));
  }
  if (disallowEmptyKey) {
    let index = lastIndex;
    do {
      leadingKeys[index] || throws(SyntaxError$1(`Empty key is not allowed before TOML v0.5` + where(", which at ")));
    } while (index--);
  }
  const finalKey = leadingKeys[lastIndex];
  leadingKeys.length = lastIndex;
  return { leadingKeys, finalKey, lineRest };
};
var push = (lastArray, lineRest) => {
  if (lineRest[0] === "<") {
    const { 1: tag } = { 2: lineRest } = _VALUE_PAIR_exec(lineRest) || throws(SyntaxError$1(`Bad tag ` + where(" at ")));
    collect(tag, lastArray, null);
    switch (lineRest && lineRest[0]) {
      case ",":
      case "]":
      case "":
      case "#":
        lastArray[lastArray.length] = undefined$1;
        return lineRest;
    }
  }
  switch (lineRest[0]) {
    case "'":
      return assignLiteralString(asStrings(lastArray), lastArray.length, lineRest);
    case '"':
      return assignBasicString(asStrings(lastArray), lastArray.length, lineRest);
    case "{":
      inlineTable || throws(SyntaxError$1(`Inline Table is not allowed before TOML v0.4` + where(", which at ")));
      return equalInlineTable(asTables(lastArray), lastArray.length, lineRest);
    case "[":
      return equalStaticArray(asArrays(lastArray), lastArray.length, lineRest);
  }
  const { 1: literal } = { 2: lineRest } = VALUE_REST_exec(lineRest) || throws(SyntaxError$1(`Bad atom value` + where(" at ")));
  if (literal === "true") {
    asBooleans(lastArray)[lastArray.length] = true;
  } else if (literal === "false") {
    asBooleans(lastArray)[lastArray.length] = false;
  } else if (enableNull && literal === "null") {
    asNulls(lastArray)[lastArray.length] = null;
  } else if (literal.includes(":")) {
    if (literal.includes("-")) {
      if (IS_OFFSET$(literal)) {
        asOffsetDateTimes(lastArray)[lastArray.length] = new OffsetDateTime(literal);
      } else {
        moreDatetime || throws(SyntaxError$1(`Local Date-Time is not allowed before TOML v0.5` + where(", which at ")));
        asLocalDateTimes(lastArray)[lastArray.length] = new LocalDateTime(literal);
      }
    } else {
      moreDatetime || throws(SyntaxError$1(`Local Time is not allowed before TOML v0.5` + where(", which at ")));
      asLocalTimes(lastArray)[lastArray.length] = new LocalTime(literal);
    }
  } else if (literal.indexOf("-") !== literal.lastIndexOf("-") && literal[0] !== "-") {
    moreDatetime || throws(SyntaxError$1(`Local Date is not allowed before TOML v0.5` + where(", which at ")));
    asLocalDates(lastArray)[lastArray.length] = new LocalDate(literal);
  } else {
    literal.includes(".") || literal.includes("n") || (literal.includes("e") || literal.includes("E")) && !literal.startsWith("0x") ? asFloats(lastArray)[lastArray.length] = preserveLiteral ? LiteralObject(literal, Float(literal)) : Float(literal) : asIntegers(lastArray)[lastArray.length] = preserveLiteral ? LiteralObject(literal, Integer(literal)) : Integer(literal);
  }
  return lineRest;
};
var equalStaticArray = function* (table, finalKey, lineRest) {
  const staticArray = table[finalKey] = newArray(STATICALLY);
  if (IS_EMPTY(lineRest)) {
    beInline(staticArray, lineRest[1] === "]" ? 0 : 3);
    return lineRest.slice(lineRest.indexOf("]")).replace(SYM_WHITESPACE, "");
  }
  const start = new mark("Static Array", lineRest.length);
  let inline = lineRest.startsWith("[ ") || lineRest.startsWith("[	") ? 3 : 0;
  lineRest = lineRest.replace(SYM_WHITESPACE, "");
  while (!lineRest || lineRest[0] === "#") {
    inline = null;
    lineRest = start.must().replace(PRE_WHITESPACE, "");
  }
  if (lineRest[0] === "]") {
    inline === null || beInline(staticArray, inline);
    return lineRest.replace(SYM_WHITESPACE, "");
  }
  for (; ; ) {
    const rest2 = push(staticArray, lineRest);
    lineRest = typeof rest2 === "string" ? rest2 : yield rest2;
    while (!lineRest || lineRest[0] === "#") {
      inline = null;
      lineRest = start.must().replace(PRE_WHITESPACE, "");
    }
    if (lineRest[0] === ",") {
      lineRest = lineRest.replace(SYM_WHITESPACE, "");
      while (!lineRest || lineRest[0] === "#") {
        inline = null;
        lineRest = start.must().replace(PRE_WHITESPACE, "");
      }
      if (lineRest[0] === "]") {
        break;
      }
    } else {
      if (lineRest[0] === "]") {
        break;
      }
      throw throws(SyntaxError$1(`Unexpect character in static array item value` + where(", which is found at ")));
    }
  }
  inline === null || beInline(staticArray, inline);
  return lineRest.replace(SYM_WHITESPACE, "");
};
var equalInlineTable = function* (table, finalKey, lineRest) {
  const inlineTable2 = table[finalKey] = new Table3(DIRECTLY, INLINE);
  if (allowInlineTableMultilineAndTrailingCommaEvenNoComma) {
    const start = new mark("Inline Table", lineRest.length);
    lineRest = lineRest.replace(SYM_WHITESPACE, "");
    let inline = true;
    for (; ; ) {
      while (!lineRest || lineRest[0] === "#") {
        inline = false;
        lineRest = start.must().replace(PRE_WHITESPACE, "");
      }
      if (lineRest[0] === "}") {
        break;
      }
      const forComment = ForComment(inlineTable2, lineRest);
      const rest2 = assign(forComment);
      lineRest = typeof rest2 === "string" ? rest2 : yield rest2;
      if (lineRest) {
        if (lineRest[0] === "#") {
          if (preserveComment) {
            forComment.table[commentFor(forComment.finalKey)] = lineRest.slice(1);
          }
          inline = false;
          do {
            lineRest = start.must().replace(PRE_WHITESPACE, "");
          } while (!lineRest || lineRest[0] === "#");
        }
      } else {
        inline = false;
        do {
          lineRest = start.must().replace(PRE_WHITESPACE, "");
        } while (!lineRest || lineRest[0] === "#");
      }
      if (lineRest[0] === ",") {
        lineRest = lineRest.replace(SYM_WHITESPACE, "");
      }
    }
    inline || beInline(inlineTable2, false);
  } else {
    lineRest = lineRest.replace(SYM_WHITESPACE, "") || throws(SyntaxError$1(`Inline Table is intended to appear on a single line` + where(", which broken at ")));
    if (lineRest[0] !== "}") {
      for (; ; ) {
        lineRest[0] === "#" && throws(SyntaxError$1(`Inline Table is intended to appear on a single line` + where(", which broken at ")));
        const rest2 = assign(ForComment(inlineTable2, lineRest));
        lineRest = (typeof rest2 === "string" ? rest2 : yield rest2) || throws(SyntaxError$1(`Inline Table is intended to appear on a single line` + where(", which broken at ")));
        if (lineRest[0] === "}") {
          break;
        }
        if (lineRest[0] === ",") {
          lineRest = lineRest.replace(SYM_WHITESPACE, "") || throws(SyntaxError$1(`Inline Table is intended to appear on a single line` + where(", which broken at ")));
          lineRest[0] === "}" && throws(SyntaxError$1(`The last property of an Inline Table can not have a trailing comma` + where(", which was found at ")));
        }
      }
    }
  }
  return lineRest.replace(SYM_WHITESPACE, "");
};
var ForComment = (lastInlineTable, lineRest) => {
  const { leadingKeys, finalKey, tag } = { lineRest } = KEY_VALUE_PAIR_exec_groups(parseKeys(lineRest));
  return { table: prepareInlineTable(lastInlineTable, leadingKeys), finalKey, tag, lineRest };
};
var assign = ({ finalKey, tag, lineRest, table }) => {
  finalKey in table && throws(Error$1(`Duplicate property definition` + where(" at ")));
  if (tag) {
    collect(tag, null, table, finalKey);
    switch (lineRest && lineRest[0]) {
      case ",":
      case "}":
      case "":
      case "#":
        table[finalKey] = undefined$1;
        return lineRest;
    }
  }
  switch (lineRest && lineRest[0]) {
    case "'":
      return assignLiteralString(table, finalKey, lineRest);
    case '"':
      return assignBasicString(table, finalKey, lineRest);
    case "{":
      inlineTable || throws(SyntaxError$1(`Inline Table is not allowed before TOML v0.4` + where(", which at ")));
      return equalInlineTable(table, finalKey, lineRest);
    case "[":
      return equalStaticArray(table, finalKey, lineRest);
  }
  const { 1: literal } = { 2: lineRest } = VALUE_REST_exec(lineRest) || throws(SyntaxError$1(`Bad atom value` + where(" at ")));
  if (literal === "true") {
    table[finalKey] = true;
  } else if (literal === "false") {
    table[finalKey] = false;
  } else if (enableNull && literal === "null") {
    table[finalKey] = null;
  } else if (literal.includes(":")) {
    if (literal.includes("-")) {
      if (IS_OFFSET$(literal)) {
        table[finalKey] = new OffsetDateTime(literal);
      } else {
        moreDatetime || throws(SyntaxError$1(`Local Date-Time is not allowed before TOML v0.5` + where(", which at ")));
        table[finalKey] = new LocalDateTime(literal);
      }
    } else {
      moreDatetime || throws(SyntaxError$1(`Local Time is not allowed before TOML v0.5` + where(", which at ")));
      table[finalKey] = new LocalTime(literal);
    }
  } else if (literal.indexOf("-") !== literal.lastIndexOf("-") && literal[0] !== "-") {
    moreDatetime || throws(SyntaxError$1(`Local Date is not allowed before TOML v0.5` + where(", which at ")));
    table[finalKey] = new LocalDate(literal);
  } else {
    table[finalKey] = literal.includes(".") || literal.includes("n") || (literal.includes("e") || literal.includes("E")) && !literal.startsWith("0x") ? preserveLiteral ? LiteralObject(literal, Float(literal)) : Float(literal) : preserveLiteral ? LiteralObject(literal, Integer(literal)) : Integer(literal);
  }
  return lineRest;
};
var Root = () => {
  const rootTable = new Table3();
  let lastSectionTable = rootTable;
  while (rest()) {
    const line = next().replace(PRE_WHITESPACE, "");
    if (line) {
      if (line[0] === "[") {
        const { leadingKeys, finalKey, asArrayItem, tag, lineRest } = TABLE_DEFINITION_exec_groups(line, parseKeys);
        const table = prepareTable(rootTable, leadingKeys);
        if (lineRest) {
          lineRest[0] === "#" || throws(SyntaxError$1(`Unexpect charachtor after table header` + where(" at ")));
        }
        lastSectionTable = appendTable(table, finalKey, asArrayItem, tag);
        preserveComment && lineRest && (lastSectionTable[commentForThis] = asArrayItem ? lineRest.slice(1) : table[commentFor(finalKey)] = lineRest.slice(1));
      } else if (line[0] === "#") {
        __CONTROL_CHARACTER_EXCLUDE_test(line) && throws(SyntaxError$1(`Control characters other than Tab are not permitted in comments` + where(", which was found at ")));
      } else {
        const forComment = ForComment(lastSectionTable, line);
        let rest2 = assign(forComment);
        typeof rest2 === "string" || (rest2 = x(rest2));
        if (rest2) {
          rest2[0] === "#" || throws(SyntaxError$1(`Unexpect charachtor after key/value pair` + where(" at ")));
          if (preserveComment) {
            forComment.table[commentFor(forComment.finalKey)] = rest2.slice(1);
          }
        }
      }
    }
  }
  return rootTable;
};
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
var DATE = Date.prototype;
var valueOf$2 = String.prototype.valueOf;
var isString = (
  /* j-globals: class.isString (internal) */
  /* @__PURE__ */ function() {
    if (apply.bind) {
      var valueOf_apply = apply.bind(valueOf$2);
      return function isString2(value) {
        try {
          valueOf_apply(value);
        } catch (error) {
          return false;
        }
        return true;
      };
    }
    return function isString2(value) {
      try {
        valueOf$2.apply(value);
      } catch (error) {
        return false;
      }
      return true;
    };
  }()
);
var valueOf$1 = Number.prototype.valueOf;
var isNumber = (
  /* j-globals: class.isNumber (internal) */
  /* @__PURE__ */ function() {
    if (apply.bind) {
      var valueOf_apply = apply.bind(valueOf$1);
      return function isNumber2(value) {
        try {
          valueOf_apply(value);
        } catch (error) {
          return false;
        }
        return true;
      };
    }
    return function isNumber2(value) {
      try {
        valueOf$1.apply(value);
      } catch (error) {
        return false;
      }
      return true;
    };
  }()
);
var isBigInt = (
  /* j-globals: class.isBigInt (internal) */
  /* @__PURE__ */ function() {
    if (typeof BigInt === "function") {
      var valueOf_apply = apply.bind(BigInt.prototype.valueOf);
      return function isBigInt2(value) {
        try {
          valueOf_apply(value);
        } catch (error) {
          return false;
        }
        return true;
      };
    }
    return function isBigInt2() {
      return false;
    };
  }()
);
var valueOf = BigInt.prototype.valueOf;
var isBoolean = (
  /* j-globals: class.isBoolean (internal) */
  /* @__PURE__ */ function() {
    if (apply.bind) {
      var valueOf_apply = apply.bind(valueOf);
      return function isBoolean2(value) {
        try {
          valueOf_apply(value);
        } catch (error) {
          return false;
        }
        return true;
      };
    }
    return function isBoolean2(value) {
      try {
        valueOf.apply(value);
      } catch (error) {
        return false;
      }
      return true;
    };
  }()
);
var ESCAPED = /* @__PURE__ */ Null$1({
  .../* @__PURE__ */ fromEntries(/* @__PURE__ */ [...Array$1(32)].map((_, charCode) => [fromCharCode(charCode), "\\u" + charCode.toString(16).toUpperCase().padStart(4, "0")])),
  "\b": "\\b",
  "	": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
  '"': '\\"',
  '"""': '""\\"',
  "\\": "\\\\",
  "\x7F": "\\u007F"
});
var { test: NEED_BASIC } = theRegExp(/[\x00-\x08\x0A-\x1F'\x7F]/);
var BY_ESCAPE = /[^\x00-\x08\x0A-\x1F"\\\x7F]+|./gs;
var { test: NEED_ESCAPE } = theRegExp(/^[\x00-\x08\x0A-\x1F"\\\x7F]/);
var singlelineString = (value) => {
  if (NEED_BASIC(value)) {
    const parts = value.match(BY_ESCAPE);
    let index = parts.length;
    do {
      if (NEED_ESCAPE(parts[--index])) {
        parts[index] = ESCAPED[parts[index]];
      }
    } while (index);
    return `"${parts.join("")}"`;
  }
  return `'${value}'`;
};
var { test: NEED_MULTILINE_BASIC } = theRegExp(/[\x00-\x08\x0A-\x1F\x7F]|'''/);
var { test: multilineNeedBasic } = theRegExp(/[\x00-\x08\x0B-\x1F\x7F]|'''/);
var { test: REAL_MULTILINE_ESCAPE } = theRegExp(/[\x00-\x08\x0A-\x1F\\\x7F]|"""/);
var { test: NEED_MULTILINE_ESCAPE } = theRegExp(/^(?:[\x00-\x08\x0A-\x1F\\\x7F]|""")/);
var Float64Array$1 = Float64Array;
var Uint8Array$1 = Uint8Array;
var _Infinity = -Infinity;
var { test: INTEGER_LIKE } = theRegExp(/^-?\d+$/);
var ensureFloat = (literal) => INTEGER_LIKE(literal) ? literal + ".0" : literal;
var float64Array = new Float64Array$1([NaN$1]);
var uint8Array = new Uint8Array$1(float64Array.buffer);
var NaN_7 = uint8Array[7];
var float = NaN_7 === new Uint8Array$1(new Float64Array$1([-NaN$1]).buffer)[7] ? (value) => value ? value === Infinity ? "inf" : value === _Infinity ? "-inf" : ensureFloat("" + value) : value === value ? is(value, 0) ? "0.0" : "-0.0" : "nan" : (value) => value ? value === Infinity ? "inf" : value === _Infinity ? "-inf" : ensureFloat("" + value) : value === value ? is(value, 0) ? "0.0" : "-0.0" : (float64Array[0] = value, uint8Array[7]) === NaN_7 ? "nan" : "-nan";
var isDate = /* @__PURE__ */ isPrototypeOf.bind(DATE);
var { test: BARE } = theRegExp(/^[\w-]+$/);
var $Key$ = (key) => BARE(key) ? key : singlelineString(key);
var FIRST = /[^.]+/;
var literalString = (value) => `'${value}'`;
var $Keys = (keys2) => isAmazing(keys2) ? keys2.replace(FIRST, literalString) : keys2 === "null" ? `'null'` : keys2;
var TOMLSection = class extends Array$1 {
  document;
  constructor(document2) {
    super();
    this.document = document2;
    return this;
  }
  [Symbol$1.toPrimitive]() {
    return this.join(this.document.newline);
  }
  appendNewline() {
    this[this.length] = "";
  }
  set appendLine(source) {
    this[this.length] = source;
  }
  set appendInline(source) {
    this[this.length - 1] += source;
  }
  set appendInlineIf(source) {
    source && (this[this.length - 1] += source);
  }
  ///
  *assignBlock(documentKeys_, sectionKeys_, table, tableKeys) {
    const { document: document2 } = this;
    const { newlineUnderHeader, newlineUnderSectionButPair } = document2;
    const newlineAfterDotted = sectionKeys_ ? document2.newlineUnderPairButDotted : false;
    const newlineAfterPair = sectionKeys_ ? document2.newlineUnderDotted : document2.newlineUnderPair;
    for (const tableKey of tableKeys) {
      const value = table[tableKey];
      const $key$ = $Key$(tableKey);
      const documentKeys = documentKeys_ + $key$;
      if (isArray$1(value)) {
        const { length } = value;
        if (length) {
          let firstItem = value[0];
          if (isSection(firstItem)) {
            const tableHeader = `[[${documentKeys}]]`;
            const documentKeys_2 = documentKeys + ".";
            let index = 0;
            let table2 = firstItem;
            for (; ; ) {
              const section = document2.appendSection();
              section[0] = tableHeader + getCOMMENT(table2, commentForThis);
              if (newlineUnderHeader) {
                section[1] = "";
                yield section.assignBlock(documentKeys_2, ``, table2, getOwnPropertyNames(table2));
                newlineUnderSectionButPair && section.length !== 2 && section.appendNewline();
              } else {
                yield section.assignBlock(documentKeys_2, ``, table2, getOwnPropertyNames(table2));
                newlineUnderSectionButPair && section.appendNewline();
              }
              if (++index === length) {
                break;
              }
              table2 = value[index];
              if (!isSection(table2)) {
                throw TypeError$1(`the first table item marked by Section() means the parent array is an array of tables, which can not include other types or table not marked by Section() any more in the rest items`);
              }
            }
            continue;
          } else {
            let index = 1;
            while (index !== length) {
              if (isSection(value[index++])) {
                throw TypeError$1(`if an array is not array of tables, it can not include any table that marked by Section()`);
              }
            }
          }
        }
      } else {
        if (isSection(value)) {
          const section = document2.appendSection();
          section[0] = `[${documentKeys}]${document2.preferCommentForThis ? getCOMMENT(value, commentForThis) || getComment(table, tableKey) : getComment(table, tableKey) || getCOMMENT(value, commentForThis)}`;
          if (newlineUnderHeader) {
            section[1] = "";
            yield section.assignBlock(documentKeys + ".", ``, value, getOwnPropertyNames(value));
            newlineUnderSectionButPair && section.length !== 2 && section.appendNewline();
          } else {
            yield section.assignBlock(documentKeys + ".", ``, value, getOwnPropertyNames(value));
            newlineUnderSectionButPair && section.appendNewline();
          }
          continue;
        }
      }
      const sectionKeys = sectionKeys_ + $key$;
      this.appendLine = $Keys(sectionKeys) + " = ";
      const valueKeysIfValueIsDottedTable = this.value("", value, true);
      if (valueKeysIfValueIsDottedTable) {
        --this.length;
        yield this.assignBlock(documentKeys + ".", sectionKeys + ".", value, valueKeysIfValueIsDottedTable);
        newlineAfterDotted && this.appendNewline();
      } else {
        this.appendInlineIf = getComment(table, tableKey);
        newlineAfterPair && this.appendNewline();
      }
    }
  }
  value(indent, value, returnValueKeysIfValueIsDottedTable) {
    switch (typeof value) {
      case "object":
        if (value === null) {
          if (this.document.nullDisabled) {
            throw TypeError$1(`toml can not stringify "null" type value without truthy options.xNull`);
          }
          this.appendInline = "null";
          break;
        }
        const inlineMode = ofInline(value);
        if (isArray$1(value)) {
          if (inlineMode === undefined$1) {
            this.staticArray(indent, value);
          } else {
            const { $singlelineArray = inlineMode } = this.document;
            this.singlelineArray(indent, value, $singlelineArray);
          }
          break;
        }
        if (inlineMode !== undefined$1) {
          inlineMode || this.document.multilineTableDisabled ? this.inlineTable(indent, value) : this.multilineTable(indent, value, this.document.multilineTableComma);
          break;
        }
        if (isDate(value)) {
          this.appendInline = value.toISOString().replace("T", this.document.T).replace("Z", this.document.Z);
          break;
        }
        if (_literal in value) {
          const literal = value[_literal];
          if (typeof literal === "string") {
            this.appendInline = literal;
          } else if (isArray$1(literal)) {
            const { length } = literal;
            if (length) {
              this.appendInline = literal[0];
              let index = 1;
              while (index !== length) {
                this.appendLine = literal[index++];
              }
            } else {
              throw TypeError$1(`literal value is broken`);
            }
          } else {
            throw TypeError$1(`literal value is broken`);
          }
          break;
        }
        if (isString(value)) {
          throw TypeError$1(`TOML.stringify refuse to handle [object String]`);
        }
        if (isNumber(value)) {
          throw TypeError$1(`TOML.stringify refuse to handle [object Number]`);
        }
        if (isBigInt(value)) {
          throw TypeError$1(`TOML.stringify refuse to handle [object BigInt]`);
        }
        if (isBoolean(value)) {
          throw TypeError$1(`TOML.stringify refuse to handle [object Boolean]`);
        }
        if (returnValueKeysIfValueIsDottedTable) {
          const keys2 = getOwnPropertyNames(value);
          if (keys2.length) {
            return keys2;
          }
          this.appendInline = "{ }";
        } else {
          this.inlineTable(indent, value);
        }
        break;
      case "bigint":
        this.appendInline = "" + value;
        break;
      case "number":
        this.appendInline = this.document.asInteger(value) ? is(value, -0) ? "-0" : "" + value : float(value);
        break;
      case "string":
        this.appendInline = singlelineString(value);
        break;
      case "boolean":
        this.appendInline = value ? "true" : "false";
        break;
      default:
        throw TypeError$1(`toml can not stringify "${typeof value}" type value`);
    }
    return null;
  }
  singlelineArray(indent, staticArray, inlineMode) {
    const { length } = staticArray;
    if (length) {
      this.appendInline = inlineMode & 2 ? "[ " : "[";
      this.value(indent, staticArray[0], false);
      let index = 1;
      while (index !== length) {
        this.appendInline = ", ";
        this.value(indent, staticArray[index++], false);
      }
      this.appendInline = inlineMode & 2 ? " ]" : "]";
    } else {
      this.appendInline = inlineMode & 1 ? "[ ]" : "[]";
    }
  }
  staticArray(indent, staticArray) {
    this.appendInline = "[";
    const indent_ = indent + this.document.indent;
    const { length } = staticArray;
    let index = 0;
    while (index !== length) {
      this.appendLine = indent_;
      this.value(indent_, staticArray[index++], false);
      this.appendInline = ",";
    }
    this.appendLine = indent + "]";
  }
  inlineTable(indent, inlineTable2) {
    const keys2 = getOwnPropertyNames(inlineTable2);
    if (keys2.length) {
      this.appendInline = "{ ";
      this.assignInline(indent, inlineTable2, ``, keys2);
      this[this.length - 1] = this[this.length - 1].slice(0, -2) + " }";
    } else {
      this.appendInline = "{ }";
    }
  }
  multilineTable(indent, inlineTable2, comma) {
    this.appendInline = "{";
    this.assignMultiline(indent, inlineTable2, ``, getOwnPropertyNames(inlineTable2), comma);
    this.appendLine = indent + "}";
  }
  assignInline(indent, inlineTable2, keys_, keys2) {
    for (const key of keys2) {
      const value = inlineTable2[key];
      const keys3 = keys_ + $Key$(key);
      const before_value = this.appendInline = $Keys(keys3) + " = ";
      const valueKeysIfValueIsDottedTable = this.value(indent, value, true);
      if (valueKeysIfValueIsDottedTable) {
        this[this.length - 1] = this[this.length - 1].slice(0, -before_value.length);
        this.assignInline(indent, value, keys3 + ".", valueKeysIfValueIsDottedTable);
      } else {
        this.appendInline = ", ";
      }
    }
  }
  assignMultiline(indent, inlineTable2, keys_, keys2, comma) {
    const indent_ = indent + this.document.indent;
    for (const key of keys2) {
      const value = inlineTable2[key];
      const keys3 = keys_ + $Key$(key);
      this.appendLine = indent_ + $Keys(keys3) + " = ";
      const valueKeysIfValueIsDottedTable = this.value(indent_, value, true);
      if (valueKeysIfValueIsDottedTable) {
        --this.length;
        this.assignMultiline(indent, value, keys3 + ".", valueKeysIfValueIsDottedTable, comma);
      } else {
        comma ? this.appendInline = "," + getComment(inlineTable2, key) : this.appendInlineIf = getComment(inlineTable2, key);
      }
    }
  }
};
var { test: IS_INDENT } = theRegExp(/^[\t ]*$/);
var linesFromStringify = new WeakSet$1();
var isLinesFromStringify = /* @__PURE__ */ has.bind(linesFromStringify);
var textDecoder = /* @__PURE__ */ new TextDecoder$1("utf-8", Null$1({ fatal: true, ignoreBOM: false }));
var binary2string = (arrayBufferLike) => {
  if (isView(arrayBufferLike) ? arrayBufferLike.length !== arrayBufferLike.byteLength : !isArrayBuffer(arrayBufferLike)) {
    throw TypeError$1(`only Uint8Array or ArrayBuffer is acceptable`);
  }
  try {
    return textDecoder.decode(arrayBufferLike);
  } catch {
    throw Error$1(`A TOML doc must be a (ful-scalar) valid UTF-8 file, without any unknown code point.`);
  }
};
var isBinaryLike = (value) => "byteLength" in value;
var { test: includesNonScalar } = theRegExp(/[\uD800-\uDFFF]/u);
var assertFulScalar = (string) => {
  if (clearRegExp$1(includesNonScalar(string))) {
    throw Error$1(`A TOML doc must be a (ful-scalar) valid UTF-8 file, without any uncoupled UCS-4 character code.`);
  }
};
var holding = false;
var parse = (source, specificationVersion, multilineStringJoiner, bigint, x2, argsMode) => {
  let sourcePath2 = "";
  if (typeof source === "object" && source) {
    if (isArray$1(source)) {
      throw TypeError$1(isLinesFromStringify(source) ? `TOML.parse(array from TOML.stringify(,{newline?}))` : `TOML.parse(array)`);
    } else if (isBinaryLike(source)) {
      source = binary2string(source);
    } else {
      sourcePath2 = source.path;
      if (typeof sourcePath2 !== "string") {
        throw TypeError$1(`TOML.parse(source.path)`);
      }
      const { data, require: req = typeof require === "function" ? require : undefined$1 } = source;
      if (req) {
        const { resolve } = req;
        if (resolve != null) {
          const { paths } = resolve;
          if (paths != null) {
            const ret = apply$1(paths, resolve, [""]);
            if (ret != null) {
              const val = ret[0];
              if (val != null) {
                const dirname_ = val.replace(/node_modules$/, "");
                if (dirname_) {
                  sourcePath2 = req("path").resolve(dirname_, sourcePath2);
                  if (typeof sourcePath2 !== "string") {
                    throw TypeError$1(`TOML.parse(source.require('path').resolve)`);
                  }
                }
              }
            }
          }
        }
        if (data === undefined$1) {
          const data2 = req("fs").readFileSync(sourcePath2);
          if (typeof data2 === "object" && data2 && isBinaryLike(data2)) {
            source = binary2string(data2);
          } else {
            throw TypeError$1(`TOML.parse(source.require('fs').readFileSync)`);
          }
        } else if (typeof data === "string") {
          assertFulScalar(source = data);
        } else if (typeof data === "object" && data && isBinaryLike(data)) {
          source = binary2string(data);
        } else {
          throw TypeError$1(`TOML.parse(source.data)`);
        }
      } else {
        if (data === undefined$1) {
          throw TypeError$1(`TOML.parse(source.data|source.require)`);
        } else if (typeof data === "string") {
          assertFulScalar(source = data);
        } else if (typeof data === "object" && data && isBinaryLike(data)) {
          source = binary2string(data);
        } else {
          throw TypeError$1(`TOML.parse(source.data)`);
        }
      }
    }
  } else if (typeof source === "string") {
    assertFulScalar(source);
  } else {
    throw TypeError$1(`TOML.parse(source)`);
  }
  let joiner;
  let keys2;
  if (typeof multilineStringJoiner === "object" && multilineStringJoiner) {
    if (bigint !== undefined$1 || x2 !== undefined$1) {
      throw TypeError$1(`options mode ? args mode`);
    }
    joiner = multilineStringJoiner.joiner;
    bigint = multilineStringJoiner.bigint;
    keys2 = multilineStringJoiner.keys;
    x2 = multilineStringJoiner.x;
    argsMode = "";
  } else {
    joiner = multilineStringJoiner;
  }
  let rootTable;
  let process;
  if (holding) {
    throw Error$1(`parsing during parsing.`);
  }
  holding = true;
  try {
    use(specificationVersion, joiner, bigint, keys2, x2, argsMode);
    todo(source, sourcePath2);
    source && source[0] === "\uFEFF" && throws(TypeError$1(`TOML content (string) should not start with BOM (U+FEFF)` + where(" at ")));
    rootTable = Root();
    process = Process();
  } finally {
    done();
    clear();
    holding = false;
    clearRegExp$1();
  }
  process && process();
  return rootTable;
};
var parse$1 = /* @__PURE__ */ assign$1(
  (source, specificationVersion, multilineStringJoiner, useBigInt, xOptions) => typeof specificationVersion === "number" ? parse(source, specificationVersion, multilineStringJoiner, useBigInt, xOptions, ",,") : parse(source, 1, specificationVersion, multilineStringJoiner, useBigInt, ","),
  {
    "1.0": (source, multilineStringJoiner, useBigInt, xOptions) => parse(source, 0.1, multilineStringJoiner, useBigInt, xOptions, ","),
    1: (source, multilineStringJoiner, useBigInt, xOptions) => parse(source, 1, multilineStringJoiner, useBigInt, xOptions, ","),
    0.5: (source, multilineStringJoiner, useBigInt, xOptions) => parse(source, 0.5, multilineStringJoiner, useBigInt, xOptions, ","),
    0.4: (source, multilineStringJoiner, useBigInt, xOptions) => parse(source, 0.4, multilineStringJoiner, useBigInt, xOptions, ","),
    0.3: (source, multilineStringJoiner, useBigInt, xOptions) => parse(source, 0.3, multilineStringJoiner, useBigInt, xOptions, ","),
    0.2: (source, multilineStringJoiner, useBigInt, xOptions) => parse(source, 0.2, multilineStringJoiner, useBigInt, xOptions, ","),
    0.1: (source, multilineStringJoiner, useBigInt, xOptions) => parse(source, 0.1, multilineStringJoiner, useBigInt, xOptions, ",")
  }
);

// node_modules/warodel/w3abdhqtu/abstract/W3ABDHQTU.mjs
var W3ABDHQTU = class {
  /**
   * @param {Buffer|ArrayBuffer} buffer
   * @param {boolean} adq
   */
  constructor(buffer, adq) {
    this.#buffer = bufffer_to_buffer_default(buffer);
    this.#adq = adq;
  }
  /** @type {ArrayBuffer} */
  #buffer;
  /** @type {boolean} */
  #adq;
  /** @type {Error[]} */
  errors = [];
  /** @type {W3ABDHQTUItem[]} */
  list = [];
  /** @type {W3ABDHQTUItem[]} */
  #original = [];
  /** @type {W3ABDHQTUItem[]} */
  #mofified = [];
  #read() {
    const view = new CDataView(this.#buffer);
    this.formatVersion = view.uint32;
    if ([1, 2, 3].indexOf(this.formatVersion) < 0) {
      throw new Error(`This format is unsupported: ${this.formatVersion}`);
    }
    for (let i = 0; i < 2; i++) {
      for (let i2 = view.uint32; i2 > 0; i2--) {
        const data = new W3ABDHQTUItem(this.#adq, this.formatVersion);
        data.read(view);
        this.list.push(data);
      }
    }
    if (view.cursor !== view.byteLength) {
      throw new Error(`Read not complete: ${view.cursor} !== ${view.byteLength}`);
    }
  }
  read() {
    try {
      this.#read();
    } catch (e) {
      this.errors.push(e);
    }
  }
  /** @param {CDataView} view */
  #write(view) {
    view.uint32 = this.formatVersion;
    view.uint32 = this.#original.length;
    for (const i of this.#original)
      i.write(view);
    view.uint32 = this.#mofified.length;
    for (const i of this.#mofified)
      i.write(view);
  }
  write() {
    this.#original = [];
    this.#mofified = [];
    for (const i of this.list) {
      if (i.customId > 0)
        this.#mofified.push(i);
      else
        this.#original.push(i);
    }
    const dvf = new CDataViewFake();
    this.#write(dvf);
    const ab = new ArrayBuffer(dvf.cursor);
    const dv = new CDataView(ab);
    this.#write(dv);
    return ab;
  }
  toJSON() {
    return {
      formatVersion: this.formatVersion,
      list: this.list
    };
  }
  /**
   * @template T
   * @param {T} self
   * @param {string} json
   * @param {boolean} adq
   * @return {T}
   */
  static _fromJSON(self, json, adq) {
    const o = JSON.parse(json);
    self.formatVersion = o.formatVersion;
    for (const i of o.list) {
      const item = new W3ABDHQTUItem(adq, self.formatVersion);
      self.list.push(item);
      item.defaultId = Raw2Dec(String(i.defaultId));
      item.customId = i.customId === void 0 ? 0 : Raw2Dec(String(i.customId));
      for (const id of i.list) {
        const itemData = new W3ABDHQTUItemData(adq, self.formatVersion);
        item.list.push(itemData);
        itemData.flag = id.flag === void 0 ? 0 : Number(id.flag);
        for (const idv of id.list) {
          const itemDataValue = new W3ABDHQTUItemDataValue(adq);
          itemData.list.push(itemDataValue);
          itemDataValue.id = Raw2Dec(String(idv.id));
          if (adq) {
            itemDataValue.level = idv.level;
            itemDataValue.data = idv.data;
          }
          itemDataValue.typeString = idv.type;
          itemDataValue.value = idv.value;
          itemDataValue.end = idv.end === void 0 ? 0 : Raw2Dec(String(idv.end));
        }
      }
    }
    return self;
  }
  /**
   * @param {Object.<string, W3ABDHQTUTOMLMapProperty>} map
   * @param {boolean} endblock
   * @param {boolean} forceType
   * @return {string}
   */
  _toTOML(map2, { endblock = false, forceType = false } = {}) {
    let out = `[Settings]
version = ${this.formatVersion} # binary format version
`;
    const _numberFormat = (prop, num) => Number.isInteger(num) ? num : parseFloat(num.toFixed(4)).toString();
    const _stringFormat = (prop, str, singleline = false) => {
      const brace = singleline ? '"' : '"""';
      return `${brace}${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}${brace}`;
    };
    const _value = (prop, value, isString2, singleline = false) => {
      const format = isString2 ? _stringFormat : _numberFormat;
      const tdef = isString2 ? "string" : "number";
      if ((prop.level ?? 0) === 0)
        return format(prop, value[0], singleline) + "\n";
      let out2 = `[
`;
      for (let i = 0; i < value.length; i++) {
        const empty = typeof value[i] !== tdef;
        const comma = i < value.length - 1 ? "," : "";
        out2 += empty ? `[]${comma} # use default value` : format(prop, value[i], singleline) + comma;
        out2 += "\n";
      }
      return `${out2}]
`;
    };
    const _write = (prop, value, data, end) => {
      const name = `${Dec2RawBE(prop.id)}`;
      if (!(value instanceof Array))
        value = [value];
      if (!(data instanceof Array))
        data = [data];
      if (!(end instanceof Array))
        end = [end];
      let endLength = 0;
      if (endblock) {
        for (let i = 0; i < end.length; i++) {
          if (end[i] === void 0 || end[i] === 0) {
            end[i] = [];
            continue;
          }
          endLength++;
          end[i] = Dec2RawBE(end[i]);
        }
      }
      let showType = true;
      if (map2[name] !== void 0) {
        showType = false;
        out += `# ${map2[name].name}
`;
      }
      if (showType || forceType) {
        switch (prop.type) {
          case 0:
            out += `${name}Type = "integer"
`;
            break;
          case 1:
            out += `${name}Type = "real"
`;
            break;
          case 2:
            out += `${name}Type = "unreal"
`;
            break;
          case 3:
            out += `${name}Type = "string"
`;
            break;
          default:
            throw new Error(`Unknown variable type: ${prop.type}`);
        }
      }
      out += `${name} = ${_value(prop, value, prop.type === 3, map2[name]?.singleline ?? false)}`;
      if (value.length === 1 && prop.level > 0)
        out += `${name}Level = ${prop.level}
`;
      if (map2[name]?.data === void 0) {
        let skip = true;
        for (const d2 of data) {
          if (d2 !== 0 && typeof d2 === "number") {
            skip = false;
            break;
          }
        }
        if (!skip)
          out += `${name}Data = ${_value(prop, data, false)}`;
      }
      if (endblock && endLength > 0)
        out += `${name}End = ${_value(prop, end, true, true)}`;
    };
    for (const item of this.list) {
      const _raw = (id) => {
        return `# ${id} 0x${id.toString(16)}`;
      };
      const pId = item.customId > 0 ? item.customId : item.defaultId;
      out += `
[${Dec2RawBE(pId)}] ${_raw(pId)}
`;
      if (item.customId > 0)
        out += `parent = "${Dec2RawBE(item.defaultId)}" ${_raw(item.defaultId)}
`;
      if (this.#adq) {
        for (const data of item.list) {
          if (this.formatVersion >= 3 && data.flag > 0)
            out += `flags = ${data.flag}
`;
          let level = 0;
          for (const prop of data.list) {
            if (prop.id === 1634493814) {
              level = prop.value;
              break;
            }
          }
          const map3 = /* @__PURE__ */ new Map();
          for (const prop of data.list) {
            if (!map3.has(prop.id))
              map3.set(prop.id, []);
            map3.get(prop.id).push(prop);
          }
          map3.forEach((list) => {
            const propFirst = list[0];
            if (propFirst.level === 0) {
              _write(propFirst, propFirst.value, propFirst.data, propFirst.end);
              return;
            }
            const value = new Array(level);
            const data2 = new Array(level);
            const end = new Array(level);
            for (const prop of list) {
              if (prop.level === 0) {
                for (const p of list) {
                  if (p.level > 0)
                    throw new Error(`${Dec2RawBE(pId)}:${Dec2RawBE(p.id)} - property with 0 level has other levels`);
                }
                _write(propFirst, propFirst.value, propFirst.data, prop.end);
                return;
              }
              const lvl = prop.level - 1;
              value[lvl] = prop.value;
              data2[lvl] = prop.data;
              end[lvl] = prop.end;
            }
            _write(propFirst, value, data2, end);
          });
        }
      } else {
        for (const data of item.list) {
          if (this.formatVersion >= 3 && data.flag > 0)
            out += `flags = ${data.flag}
`;
          for (const prop of data.list) {
            _write(prop, prop.value, prop.data, prop.end);
          }
        }
      }
    }
    return out;
  }
  /**
   * @template T
   * @param {T} self
   * @param {string} toml
   * @param {boolean} adq
   * @param {Object.<string, W3ABDHQTUTOMLMapProperty>} map
   * @return {T}
   */
  static _fromTOML(self, toml, adq, map2) {
    const o = parse$1(toml, {
      joiner: "\n",
      bigint: false
    });
    self.formatVersion = Number(o.Settings.version);
    delete o.Settings;
    for (const [itemRawId, propMap] of Object.entries(o)) {
      const item = new W3ABDHQTUItem(adq, self.formatVersion);
      self.list.push(item);
      if (propMap.parent === void 0) {
        item.defaultId = Raw2Dec(itemRawId);
      } else {
        item.defaultId = Raw2Dec(propMap.parent);
        item.customId = Raw2Dec(itemRawId);
      }
      delete propMap.parent;
      if (propMap.length === 0)
        continue;
      const itemData = new W3ABDHQTUItemData(adq, self.formatVersion);
      item.list.push(itemData);
      if (self.formatVersion >= 3)
        itemData.flag = 0;
      for (const [attrRawId, attrValue] of Object.entries(propMap)) {
        if (attrRawId.length !== 4)
          continue;
        if (map2[attrRawId]?.level ?? false) {
          let level = propMap["alev"];
          if (level instanceof Array)
            level = level[0];
          if (attrValue.length !== level)
            throw new Error(`\u26A0\uFE0F${itemRawId} : missilng level data for '${attrRawId}'`);
        }
        if (attrValue instanceof Array) {
          for (let i = 0; i < attrValue.length; i++) {
            if (typeof attrValue[i] === "object")
              continue;
            const itemDataValue2 = new W3ABDHQTUItemDataValue(adq);
            itemData.list.push(itemDataValue2);
            if (adq) {
              itemDataValue2.level = i + 1;
              if (map2[attrRawId]?.data !== void 0) {
                itemDataValue2.data = map2[attrRawId]?.data;
              } else {
                const data = propMap[`${attrRawId}Data`];
                if (data === void 0)
                  itemDataValue2.data = 0;
                if (data instanceof Array)
                  itemDataValue2.data = data[i];
              }
            }
            itemDataValue2.fromMap(attrRawId, propMap, map2);
            itemDataValue2.value = attrValue[i];
          }
          continue;
        }
        const itemDataValue = new W3ABDHQTUItemDataValue(adq);
        itemData.list.push(itemDataValue);
        if (adq) {
          itemDataValue.level = propMap[`${attrRawId}Level`] ?? 0;
          itemDataValue.data = propMap[`${attrRawId}Data`] ?? 0;
        }
        itemDataValue.fromMap(attrRawId, propMap, map2);
        itemDataValue.value = attrValue;
      }
    }
    return self;
  }
};

// node_modules/warodel/w3abdhqtu/maps/w3a/W3ATOMLMap.mjs
var map = {
  anam: { type: 3, data: 0, name: `(string) Name: Name` },
  ansf: { type: 3, data: 0, name: `(string) EditorSuffix: Editor Suffix` },
  aher: { type: 0, data: 0, name: `(bool) hero: Hero Ability`, singleline: true },
  aite: { type: 0, data: 0, name: `(bool) item: Item Ability`, singleline: true },
  arac: { type: 3, data: 0, name: `(unitRace) race: Race`, singleline: true },
  abpx: { type: 0, data: 0, name: `(int) Buttonpos: Button Position - Normal (X)`, singleline: true },
  abpy: { type: 0, data: 0, name: `(int) Buttonpos: Button Position - Normal (Y)`, singleline: true },
  aubx: { type: 0, data: 0, name: `(int) UnButtonpos: Button Position - Turn Off (X)`, singleline: true },
  auby: { type: 0, data: 0, name: `(int) UnButtonpos: Button Position - Turn Off (Y)`, singleline: true },
  arpx: { type: 0, data: 0, name: `(int) Researchbuttonpos: Button Position - Research (X)`, singleline: true },
  arpy: { type: 0, data: 0, name: `(int) Researchbuttonpos: Button Position - Research (Y)`, singleline: true },
  aart: { type: 3, data: 0, name: `(icon) Art: Icon - Normal`, singleline: true },
  auar: { type: 3, data: 0, name: `(icon) Unart: Icon - Turn Off`, singleline: true },
  arar: { type: 3, data: 0, name: `(icon) ResearchArt: Icon - Research`, singleline: true },
  acat: { type: 3, data: 0, name: `(modelList) CasterArt: Caster`, singleline: true },
  atat: { type: 3, data: 0, name: `(modelList) TargetArt: Target`, singleline: true },
  asat: { type: 3, data: 0, name: `(modelList) SpecialArt: Special`, singleline: true },
  aeat: { type: 3, data: 0, name: `(modelList) EffectArt: Effect`, singleline: true },
  aaea: { type: 3, data: 0, name: `(modelList) Areaeffectart: Area Effect`, singleline: true },
  alig: { type: 3, data: 0, name: `(lightningList) LightningEffect: Lightning Effects`, singleline: true },
  amat: { type: 3, data: 0, name: `(modelList) Missileart: Missile Art`, singleline: true },
  amsp: { type: 0, data: 0, name: `(int) Missilespeed: Missile Speed`, singleline: true },
  amac: { type: 2, data: 0, name: `(unreal) Missilearc: Missile Arc`, singleline: true },
  amho: { type: 0, data: 0, name: `(bool) MissileHoming: Missile Homing Enabled`, singleline: true },
  atac: { type: 0, data: 0, name: `(int) Targetattachcount: Target Attachments`, singleline: true },
  ata0: { type: 3, data: 0, name: `(stringList) Targetattach: Target Attachment Point 1`, singleline: true },
  ata1: { type: 3, data: 0, name: `(stringList) Targetattach1: Target Attachment Point 2`, singleline: true },
  ata2: { type: 3, data: 0, name: `(stringList) Targetattach2: Target Attachment Point 3`, singleline: true },
  ata3: { type: 3, data: 0, name: `(stringList) Targetattach3: Target Attachment Point 4`, singleline: true },
  ata4: { type: 3, data: 0, name: `(stringList) Targetattach4: Target Attachment Point 5`, singleline: true },
  ata5: { type: 3, data: 0, name: `(stringList) Targetattach5: Target Attachment Point 6`, singleline: true },
  acac: { type: 0, data: 0, name: `(int) Casterattachcount: Caster Attachments`, singleline: true },
  acap: { type: 3, data: 0, name: `(stringList) Casterattach: Caster Attachment Point 1`, singleline: true },
  aca1: { type: 3, data: 0, name: `(stringList) Casterattach1: Caster Attachment Point 2`, singleline: true },
  aspt: { type: 3, data: 0, name: `(stringList) Specialattach: Special Attachment Point`, singleline: true },
  aani: { type: 3, data: 0, name: `(stringList) Animnames: Animation Names`, singleline: true },
  atp1: { type: 3, data: 0, name: `(string) Tip [multilevel]: Tooltip - Normal`, level: true },
  aut1: { type: 3, data: 0, name: `(string) Untip [multilevel]: Tooltip - Turn Off`, level: true },
  aub1: { type: 3, data: 0, name: `(string) Ubertip [multilevel]: Tooltip - Normal - Extended`, level: true },
  auu1: { type: 3, data: 0, name: `(string) Unubertip [multilevel]: Tooltip - Turn Off - Extended`, level: true },
  aret: { type: 3, data: 0, name: `(string) Researchtip: Tooltip - Learn` },
  arut: { type: 3, data: 0, name: `(string) Researchubertip: Tooltip - Learn - Extended` },
  arhk: { type: 3, data: 0, name: `(char) Researchhotkey: Hotkey - Learn`, singleline: true },
  ahky: { type: 3, data: 0, name: `(char) Hotkey: Hotkey - Normal`, singleline: true },
  auhk: { type: 3, data: 0, name: `(char) Unhotkey: Hotkey - Turn Off`, singleline: true },
  areq: { type: 3, data: 0, name: `(techList) Requires: Requirements`, singleline: true },
  arqa: { type: 3, data: 0, name: `(intList) Requiresamount: Requirements - Levels`, singleline: true },
  achd: { type: 0, data: 0, name: `(bool) checkDep: Check Dependencies`, singleline: true },
  apri: { type: 0, data: 0, name: `(int) priority: Priority for Spell Steal`, singleline: true },
  aord: { type: 3, data: 0, name: `(orderString) Order: Order String - Use/Turn On`, singleline: true },
  aoru: { type: 3, data: 0, name: `(orderString) Unorder: Order String - Turn Off`, singleline: true },
  aoro: { type: 3, data: 0, name: `(orderString) Orderon: Order String - Activate`, singleline: true },
  aorf: { type: 3, data: 0, name: `(orderString) Orderoff: Order String - Deactivate`, singleline: true },
  aefs: { type: 3, data: 0, name: `(soundLabel) Effectsound: Effect Sound`, singleline: true },
  aefl: { type: 3, data: 0, name: `(soundLabel) Effectsoundlooped: Effect Sound (Looping)`, singleline: true },
  alev: { type: 0, data: 0, name: `(int) levels: Levels`, singleline: true },
  arlv: { type: 0, data: 0, name: `(int) reqLevel: Required Level`, singleline: true },
  alsk: { type: 0, data: 0, name: `(int) levelSkip: Level Skip Requirement`, singleline: true },
  atar: { type: 3, data: 0, name: `(targetList) targs [multilevel]: Targets Allowed`, level: true, singleline: true },
  acas: { type: 2, data: 0, name: `(unreal) Cast [multilevel]: Casting Time`, level: true, singleline: true },
  adur: { type: 2, data: 0, name: `(unreal) Dur [multilevel]: Duration - Normal`, level: true, singleline: true },
  ahdu: { type: 2, data: 0, name: `(unreal) HeroDur [multilevel]: Duration - Hero`, level: true, singleline: true },
  acdn: { type: 2, data: 0, name: `(unreal) Cool [multilevel]: Cooldown`, level: true, singleline: true },
  amcs: { type: 0, data: 0, name: `(int) Cost [multilevel]: Mana Cost`, level: true, singleline: true },
  aare: { type: 2, data: 0, name: `(unreal) Area [multilevel]: Area of Effect`, level: true, singleline: true },
  aran: { type: 2, data: 0, name: `(unreal) Rng [multilevel]: Cast Range`, level: true, singleline: true },
  abuf: { type: 3, data: 0, name: `(buffList) BuffID [multilevel]: Buffs`, level: true, singleline: true },
  aeff: { type: 3, data: 0, name: `(effectList) EfctID [multilevel]: Effects`, level: true, singleline: true },
  Hbz1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Waves`, level: true, singleline: true },
  Hbz2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Hbz3: { type: 0, data: 3, name: `(int) Data [multilevel]: Number of Shards`, level: true, singleline: true },
  Hbz4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Building Reduction`, level: true, singleline: true },
  Hbz5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  Hbz6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Maximum Damage per Wave`, level: true, singleline: true },
  Hab1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Mana Regeneration Increase`, level: true, singleline: true },
  Hab2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Percent Bonus`, level: true, singleline: true },
  Hmt1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Units Teleported`, level: true, singleline: true },
  Hmt2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Casting Delay`, level: true, singleline: true },
  Hmt3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Use Teleport Clustering`, level: true, singleline: true },
  Hwe1: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Summoned Unit Type`, level: true, singleline: true },
  Hwe2: { type: 0, data: 1, name: `(int) Data [multilevel]: Summoned Unit Count`, level: true, singleline: true },
  Oww1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  Oww2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Magic Damage Reduction`, level: true, singleline: true },
  Ocr1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Chance to Critical Strike`, level: true, singleline: true },
  Ocr2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Multiplier`, level: true, singleline: true },
  Ocr3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  Ocr4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Chance to Evade`, level: true, singleline: true },
  Ocr5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Never Miss`, level: true, singleline: true },
  Ocr6: { type: 0, data: 6, name: `(bool) Data [multilevel]: Exclude Item Damage`, level: true, singleline: true },
  Omi1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Images`, level: true, singleline: true },
  Omi2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Dealt (%)`, level: true, singleline: true },
  Omi3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Taken (%)`, level: true, singleline: true },
  Omi4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Animation Delay`, level: true, singleline: true },
  Owk1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Transition Time`, level: true, singleline: true },
  Owk2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Movement Speed Increase (%)`, level: true, singleline: true },
  Owk3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Backstab Damage`, level: true, singleline: true },
  Owk4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Backstab Damage`, level: true, singleline: true },
  Owk5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Start Cooldown when Decloak`, level: true, singleline: true },
  Uan1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Corpses Raised`, level: true, singleline: true },
  Uan3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Inherit Upgrades`, level: true, singleline: true },
  Udc1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Amount Healed/Damaged`, level: true, singleline: true },
  Udp1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Life Converted to Mana`, level: true, singleline: true },
  Udp2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Life Converted to Life`, level: true, singleline: true },
  Udp3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Mana Conversion As Percent`, level: true, singleline: true },
  Udp4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Life Conversion As Percent`, level: true, singleline: true },
  Udp5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Leave Target Alive`, level: true, singleline: true },
  Uau1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Speed Increase (%)`, level: true, singleline: true },
  Uau2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Life Regeneration Increase (%)`, level: true, singleline: true },
  Uau3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Percent Bonus`, level: true, singleline: true },
  Eev1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Chance to Evade`, level: true, singleline: true },
  Eim1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage per Interval`, level: true, singleline: true },
  Eim2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Mana Drained per Second`, level: true, singleline: true },
  Eim3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Buffer Mana Required`, level: true, singleline: true },
  Emb1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Max Mana Drained`, level: true, singleline: true },
  Emb2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Bolt Delay`, level: true, singleline: true },
  Emb3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Bolt Lifetime`, level: true, singleline: true },
  Eme1: { type: 0, data: 1, name: `(unitCode) Data [multilevel]: Normal Form Unit`, level: true, singleline: true },
  Eme2: { type: 0, data: 2, name: `(morphFlags) Data [multilevel]: Morphing Flags`, level: true, singleline: true },
  Eme3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Altitude Adjustment Duration`, level: true, singleline: true },
  Eme4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Landing Delay Time`, level: true, singleline: true },
  Eme5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Alternate Form Hit Point Bonus`, level: true, singleline: true },
  Ncr5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Move Speed Bonus (Info Panel Only)`, level: true, singleline: true },
  Ncr6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Attack Speed Bonus (Info Panel Only)`, level: true, singleline: true },
  Nrg5: { type: 0, data: 5, name: `(int) Data [multilevel]: Strength Bonus`, level: true, singleline: true },
  Nrg6: { type: 0, data: 6, name: `(int) Data [multilevel]: Defense Bonus`, level: true, singleline: true },
  ave5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Life Regeneration Rate (per second)`, level: true, singleline: true },
  Emeu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Alternate Form Unit`, level: true, singleline: true },
  Usl1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Stun Duration`, level: true, singleline: true },
  Uav1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Attack Damage Stolen (%)`, level: true, singleline: true },
  Ucs1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Ucs2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Max Damage`, level: true, singleline: true },
  Ucs3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Distance`, level: true, singleline: true },
  Ucs4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Final Area`, level: true, singleline: true },
  Uin1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Uin2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Duration`, level: true, singleline: true },
  Uin3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Impact Delay`, level: true, singleline: true },
  Uin4: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Summoned Unit`, level: true, singleline: true },
  Ocl1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage per Target`, level: true, singleline: true },
  Ocl2: { type: 0, data: 2, name: `(int) Data [multilevel]: Number of Targets Hit`, level: true, singleline: true },
  Ocl3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Reduction per Target`, level: true, singleline: true },
  Oeq1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Effect Delay`, level: true, singleline: true },
  Oeq2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage per Second to Buildings`, level: true, singleline: true },
  Oeq3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Units Slowed (%)`, level: true, singleline: true },
  Oeq4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Final Area`, level: true, singleline: true },
  Ofs1: { type: 0, data: 1, name: `(detectionType) Data [multilevel]: Detection Type`, level: true, singleline: true },
  Osf1: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Summoned Unit`, level: true, singleline: true },
  Osf2: { type: 0, data: 2, name: `(int) Data [multilevel]: Number of Summoned Units`, level: true, singleline: true },
  Eer1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage per Second`, level: true, singleline: true },
  Efn1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Summoned Units`, level: true, singleline: true },
  Efnu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Summoned Unit Type`, level: true, singleline: true },
  Eah1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Dealt to Attackers`, level: true, singleline: true },
  Eah2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Damage is Percent Received`, level: true, singleline: true },
  Etq1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Life Healed`, level: true, singleline: true },
  Etq2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Heal Interval`, level: true, singleline: true },
  Etq3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Building Reduction`, level: true, singleline: true },
  Etq4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Initial Immunity Duration`, level: true, singleline: true },
  Udd1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Max Life Drained per Second (%)`, level: true, singleline: true },
  Udd2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Building Reduction`, level: true, singleline: true },
  Ufa1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Armor Duration`, level: true, singleline: true },
  Ufa2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Armor Bonus`, level: true, singleline: true },
  Ufn1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Area of Effect Damage`, level: true, singleline: true },
  Ufn2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Specific Target Damage`, level: true, singleline: true },
  Ufn5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: \u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0443\u0440\u043E\u043D`, level: true, singleline: true },
  Hfa1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  Esf1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Dealt`, level: true, singleline: true },
  Esf2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Interval`, level: true, singleline: true },
  Esf3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Building Reduction`, level: true, singleline: true },
  Ear1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Bonus (%)`, level: true, singleline: true },
  Ear2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Melee Bonus`, level: true, singleline: true },
  Ear3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Ranged Bonus`, level: true, singleline: true },
  Ear4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Flat Bonus`, level: true, singleline: true },
  Hav1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Defense Bonus`, level: true, singleline: true },
  Hav2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Hit Point Bonus`, level: true, singleline: true },
  Hav3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  Hav4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Magic Damage Reduction`, level: true, singleline: true },
  Hbh1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Chance to Bash`, level: true, singleline: true },
  Hbh2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Multiplier`, level: true, singleline: true },
  Hbh3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  Hbh4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Chance to Miss`, level: true, singleline: true },
  Hbh5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Never Miss`, level: true, singleline: true },
  Htb1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Htc1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: AOE Damage`, level: true, singleline: true },
  Htc2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Specific Target Damage`, level: true, singleline: true },
  Htc3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Movement Speed Reduction (%)`, level: true, singleline: true },
  Htc4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Attack Speed Reduction (%)`, level: true, singleline: true },
  Htc5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: \u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0443\u0440\u043E\u043D`, level: true, singleline: true },
  Had1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Armor Bonus`, level: true, singleline: true },
  Had2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Percent Bonus`, level: true, singleline: true },
  Hds1: { type: 0, data: 1, name: `(bool) Data [multilevel]: Can Deactivate`, level: true, singleline: true },
  Hhb1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Amount Healed/Damaged`, level: true, singleline: true },
  Hre1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Corpses Raised`, level: true, singleline: true },
  Hre2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Raised Units Are Invulnerable`, level: true, singleline: true },
  Hca1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Extra Damage`, level: true, singleline: true },
  Hca2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Movement Speed Factor`, level: true, singleline: true },
  Hca3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Attack Speed Factor`, level: true, singleline: true },
  Hca4: { type: 0, data: 4, name: `(stackFlags) Data [multilevel]: Stack Flags`, level: true, singleline: true },
  Oae1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Speed Increase (%)`, level: true, singleline: true },
  Oae2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Attack Speed Increase (%)`, level: true, singleline: true },
  Ore1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Reincarnation Delay`, level: true, singleline: true },
  Osh1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Osh2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Maximum Damage`, level: true, singleline: true },
  Osh3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Distance`, level: true, singleline: true },
  Osh4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Final Area`, level: true, singleline: true },
  Nfd1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Graphic Delay`, level: true, singleline: true },
  Nfd2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Graphic Duration`, level: true, singleline: true },
  Nfd3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Ndp1: { type: 3, data: 1, name: `(unitList) Data [multilevel]: Spawned Units`, level: true, singleline: true },
  Ndp2: { type: 0, data: 2, name: `(int) Data [multilevel]: Minimum Number of Units`, level: true, singleline: true },
  Ndp3: { type: 0, data: 3, name: `(int) Data [multilevel]: Maximum Number of Units`, level: true, singleline: true },
  Nrc1: { type: 3, data: 1, name: `(abilCode) Data [multilevel]: Ability for Unit Creation`, level: true, singleline: true },
  Nrc2: { type: 0, data: 2, name: `(int) Data [multilevel]: Number of Units Created`, level: true, singleline: true },
  Ams1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Summoned Unit Damage`, level: true, singleline: true },
  Ams2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Magic Damage Reduction`, level: true, singleline: true },
  Ams3: { type: 0, data: 3, name: `(int) Data [multilevel]: Shield Life`, level: true, singleline: true },
  Ams4: { type: 0, data: 4, name: `(int) Data [multilevel]: Mana Loss`, level: true, singleline: true },
  Apl1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Aura Duration`, level: true, singleline: true },
  Apl2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage per Second`, level: true, singleline: true },
  Apl3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Duration of Plague Ward`, level: true, singleline: true },
  Aplu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Plague Ward Unit Type`, level: true, singleline: true },
  Oar1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Amount of Hit Points Regenerated`, level: true, singleline: true },
  Oar2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Percentage`, level: true, singleline: true },
  Akb1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Attack Damage Increase`, level: true, singleline: true },
  Adm1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Mana Loss`, level: true, singleline: true },
  Adm2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Summoned Unit Damage`, level: true, singleline: true },
  Btl1: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Allowed Unit Type`, level: true, singleline: true },
  Btl2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Summon Busy Units`, level: true, singleline: true },
  Bli1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Expansion Amount`, level: true, singleline: true },
  Bli2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Creates Blight`, level: true, singleline: true },
  Bgm1: { type: 0, data: 1, name: `(int) Data [multilevel]: Gold per Interval`, level: true, singleline: true },
  Bgm2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Interval Duration`, level: true, singleline: true },
  Bgm3: { type: 0, data: 3, name: `(int) Data [multilevel]: Max Number of Miners`, level: true, singleline: true },
  Bgm4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Radius of Mining Ring`, level: true, singleline: true },
  Blo1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Attack Speed Increase (%)`, level: true, singleline: true },
  Blo2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Movement Speed Increase (%)`, level: true, singleline: true },
  Blo3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Scaling Factor`, level: true, singleline: true },
  Can1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Hit Points per Second`, level: true, singleline: true },
  Can2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Max Hit Points`, level: true, singleline: true },
  Car1: { type: 0, data: 1, name: `(int) Data [multilevel]: Cargo Capacity`, level: true, singleline: true },
  Dev2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage per Second`, level: true, singleline: true },
  Dev3: { type: 0, data: 3, name: `(int) Data [multilevel]: Maximum Creep Level`, level: true, singleline: true },
  Chd1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Update Frequency`, level: true, singleline: true },
  Chd2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Attack Update Frequency`, level: true, singleline: true },
  Chd3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Summoned Unit Damage`, level: true, singleline: true },
  Cha1: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: New Unit Type`, level: true, singleline: true },
  Cri1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Speed Reduction (%)`, level: true, singleline: true },
  Cri2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Attack Speed Reduction (%)`, level: true, singleline: true },
  Cri3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Reduction`, level: true, singleline: true },
  Crs: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Chance to Miss`, level: true, singleline: true },
  Dda1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Full Damage Radius`, level: true, singleline: true },
  Dda2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Full Damage Amount`, level: true, singleline: true },
  Dda3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Partial Damage Radius`, level: true, singleline: true },
  Dda4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Partial Damage Amount`, level: true, singleline: true },
  Sds1: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Building Damage Factor`, level: true, singleline: true },
  Sds6: { type: 0, data: 6, name: `(bool) Data [multilevel]: Explodes on Death`, level: true, singleline: true },
  Uco5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Max Damage`, level: true, singleline: true },
  Uco6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Move Speed Bonus`, level: true, singleline: true },
  Def1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Taken (%)`, level: true, singleline: true },
  Def2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Dealt (%)`, level: true, singleline: true },
  Def3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Movement Speed Factor`, level: true, singleline: true },
  Def4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Attack Speed Factor`, level: true, singleline: true },
  Def5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Magic Damage Reduction`, level: true, singleline: true },
  Def6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Chance to Deflect`, level: true, singleline: true },
  Def7: { type: 2, data: 7, name: `(unreal) Data [multilevel]: Deflect Damage Taken (Piercing)`, level: true, singleline: true },
  Def8: { type: 2, data: 8, name: `(unreal) Data [multilevel]: Deflect Damage Taken (Spells)`, level: true, singleline: true },
  Dev1: { type: 0, data: 1, name: `(int) Data [multilevel]: Max Creep Level`, level: true, singleline: true },
  Eat1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Rip Delay`, level: true, singleline: true },
  Eat2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Eat Delay`, level: true, singleline: true },
  Eat3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Hit Points Gained`, level: true, singleline: true },
  Ens1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Air Unit Lower Duration`, level: true, singleline: true },
  Ens2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Air Unit Height`, level: true, singleline: true },
  Ens3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Melee Attack Range`, level: true, singleline: true },
  ent1: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Resulting Unit Type`, level: true, singleline: true },
  Egm1: { type: 0, data: 1, name: `(int) Data [multilevel]: Gold per Interval`, level: true, singleline: true },
  Egm2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Interval Duration`, level: true, singleline: true },
  Fae1: { type: 0, data: 1, name: `(int) Data [multilevel]: Defense Reduction`, level: true, singleline: true },
  Fae2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Always Autocast`, level: true, singleline: true },
  Fla1: { type: 0, data: 1, name: `(detectionType) Data [multilevel]: Detection Type`, level: true, singleline: true },
  Fla2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Effect Delay`, level: true, singleline: true },
  Fla3: { type: 0, data: 3, name: `(int) Data [multilevel]: Flare Count`, level: true, singleline: true },
  Gld1: { type: 0, data: 1, name: `(int) Data [multilevel]: Max Gold`, level: true, singleline: true },
  Gld2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Mining Duration`, level: true, singleline: true },
  Gld3: { type: 0, data: 3, name: `(int) Data [multilevel]: Mining Capacity`, level: true, singleline: true },
  Gyd1: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Number of Corpses`, level: true, singleline: true },
  Gyd2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Radius of Gravestones`, level: true, singleline: true },
  Gyd3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Radius of Corpses`, level: true, singleline: true },
  Gydu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Corpse Unit Type`, level: true, singleline: true },
  Har1: { type: 0, data: 1, name: `(int) Data [multilevel]: Damage to Tree`, level: true, singleline: true },
  Har2: { type: 0, data: 2, name: `(int) Data [multilevel]: Lumber Capacity`, level: true, singleline: true },
  Har3: { type: 0, data: 3, name: `(int) Data [multilevel]: Gold Capacity`, level: true, singleline: true },
  Hea1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Hit Points Gained`, level: true, singleline: true },
  Inf1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Increase (%)`, level: true, singleline: true },
  Inf2: { type: 0, data: 2, name: `(int) Data [multilevel]: Defense Increase`, level: true, singleline: true },
  Inf3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Autocast Range`, level: true, singleline: true },
  Inf4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Life Regen Rate`, level: true, singleline: true },
  Lit1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Graphic Delay`, level: true, singleline: true },
  Lit2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Graphic Duration`, level: true, singleline: true },
  Lsh1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage per Second`, level: true, singleline: true },
  Loa1: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Allowed Unit Type`, level: true, singleline: true },
  Mbt1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Mana Gained`, level: true, singleline: true },
  Mbt2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Hit Points Gained`, level: true, singleline: true },
  Mbt3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Autocast Requirement`, level: true, singleline: true },
  Mbt4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Water Height`, level: true, singleline: true },
  Mbt5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Regenerate Only At Night`, level: true, singleline: true },
  Mil1: { type: 0, data: 1, name: `(unitCode) Data [multilevel]: Normal Form Unit`, level: true, singleline: true },
  Mil2: { type: 0, data: 2, name: `(unitCode) Data [multilevel]: Alternate Form Unit`, level: true, singleline: true },
  Min1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Activation Delay`, level: true, singleline: true },
  Min2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Invisibility Transition Time`, level: true, singleline: true },
  Neu1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Activation Radius`, level: true, singleline: true },
  Neu2: { type: 0, data: 2, name: `(interactionFlags) Data [multilevel]: Interaction Type`, level: true, singleline: true },
  Neu3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Show Select Unit Button`, level: true, singleline: true },
  Neu4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Show Unit Indicator`, level: true, singleline: true },
  Ndt1: { type: 0, data: 1, name: `(int) Data [multilevel]: Gold Cost`, level: true, singleline: true },
  Ndt2: { type: 0, data: 2, name: `(int) Data [multilevel]: Lumber Cost`, level: true, singleline: true },
  Ndt3: { type: 0, data: 3, name: `(detectionType) Data [multilevel]: Detection Type`, level: true, singleline: true },
  Ans5: { type: 3, data: 5, name: `(orderString) Data [multilevel]: Base Order ID`, level: true, singleline: true },
  Ans6: { type: 0, data: 6, name: `(bool) Data [multilevel]: Charge Owning Player`, level: true, singleline: true },
  Arm1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Amount Regenerated`, level: true, singleline: true },
  Arm2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Percentage`, level: true, singleline: true },
  Poi1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage per Second`, level: true, singleline: true },
  Poi2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Movement Speed Factor`, level: true, singleline: true },
  Poi3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Attack Speed Factor`, level: true, singleline: true },
  Poi4: { type: 0, data: 4, name: `(stackFlags) Data [multilevel]: Stacking Type`, level: true, singleline: true },
  Poa1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Extra Damage`, level: true, singleline: true },
  Poa2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage per Second`, level: true, singleline: true },
  Poa3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Movement Speed Factor`, level: true, singleline: true },
  Poa4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Attack Speed Factor`, level: true, singleline: true },
  Poa5: { type: 0, data: 5, name: `(stackFlags) Data [multilevel]: Stacking Type`, level: true, singleline: true },
  Ply1: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Creep Level`, level: true, singleline: true },
  Ply2: { type: 3, data: 2, name: `(unitList) Data [multilevel]: Morph Units - Ground`, level: true, singleline: true },
  Ply3: { type: 3, data: 3, name: `(unitList) Data [multilevel]: Morph Units - Air`, level: true, singleline: true },
  Ply4: { type: 3, data: 4, name: `(unitList) Data [multilevel]: Morph Units - Amphibious`, level: true, singleline: true },
  Ply5: { type: 3, data: 5, name: `(unitList) Data [multilevel]: Morph Units - Water`, level: true, singleline: true },
  Pos1: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Creep Level`, level: true, singleline: true },
  Pos2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Amplification`, level: true, singleline: true },
  Pos3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Target Is Invulnerable`, level: true, singleline: true },
  Pos4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Target Is Magic Immune`, level: true, singleline: true },
  War1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Chance to Stomp (%)`, level: true, singleline: true },
  War2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Dealt`, level: true, singleline: true },
  War3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Full Damage Radius`, level: true, singleline: true },
  War4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Half Damage Radius`, level: true, singleline: true },
  Prg1: { type: 0, data: 1, name: `(int) Data [multilevel]: Movement Update Frequency`, level: true, singleline: true },
  Prg2: { type: 0, data: 2, name: `(int) Data [multilevel]: Attack Update Frequency`, level: true, singleline: true },
  Prg3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Summoned Unit Damage`, level: true, singleline: true },
  Prg4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Unit Pause Duration`, level: true, singleline: true },
  Prg5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Hero Pause Duration`, level: true, singleline: true },
  Prg6: { type: 0, data: 6, name: `(int) Data [multilevel]: Mana Loss`, level: true, singleline: true },
  Rai1: { type: 0, data: 1, name: `(int) Data [multilevel]: Units Summoned (Type One)`, level: true, singleline: true },
  Rai2: { type: 0, data: 2, name: `(int) Data [multilevel]: Units Summoned (Type Two)`, level: true, singleline: true },
  Rai3: { type: 0, data: 3, name: `(unitCode) Data [multilevel]: Unit Type One`, level: true, singleline: true },
  Rai4: { type: 0, data: 4, name: `(unitCode) Data [multilevel]: Unit Type Two`, level: true, singleline: true },
  Raiu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Unit Type For Limit Check`, level: true, singleline: true },
  Ucb5: { type: 0, data: 5, name: `(int) Data [multilevel]: Max Units Summoned`, level: true, singleline: true },
  Ucb6: { type: 0, data: 6, name: `(bool) Data [multilevel]: Kill On Caster Death`, level: true, singleline: true },
  Rej1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Hit Points Gained`, level: true, singleline: true },
  Rej2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Mana Points Gained`, level: true, singleline: true },
  Rej3: { type: 0, data: 3, name: `(fullFlags) Data [multilevel]: Allow When Full`, level: true, singleline: true },
  Rej4: { type: 0, data: 4, name: `(bool) Data [multilevel]: No Target Required`, level: true, singleline: true },
  Rpb3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Minimum Life Required`, level: true, singleline: true },
  Rpb4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Minimum Mana Required`, level: true, singleline: true },
  Rpb5: { type: 0, data: 5, name: `(int) Data [multilevel]: Maximum Units Charged To Caster`, level: true, singleline: true },
  Rpb6: { type: 0, data: 0, name: `(int) Cast [multilevel]: Maximum Units Affected`, level: true, singleline: true },
  Rep1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Repair Cost Ratio`, level: true, singleline: true },
  Rep2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Repair Time Ratio`, level: true, singleline: true },
  Rep3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Powerbuild Cost`, level: true, singleline: true },
  Rep4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Powerbuild Rate`, level: true, singleline: true },
  Rep5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Naval Range Bonus`, level: true, singleline: true },
  Rtn1: { type: 0, data: 1, name: `(bool) Data [multilevel]: Accepts Gold`, level: true, singleline: true },
  Rtn2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Accepts Lumber`, level: true, singleline: true },
  Roa1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Increase (%)`, level: true, singleline: true },
  Roa2: { type: 0, data: 2, name: `(int) Data [multilevel]: Defense Increase`, level: true, singleline: true },
  Roa3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Life Regeneration Rate`, level: true, singleline: true },
  Roa4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Mana Regen`, level: true, singleline: true },
  Roa5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Prefer Hostiles`, level: true, singleline: true },
  Roa6: { type: 0, data: 6, name: `(bool) Data [multilevel]: Prefer Friendlies`, level: true, singleline: true },
  Roa7: { type: 0, data: 7, name: `(int) Data [multilevel]: Max Units`, level: true, singleline: true },
  Nbr1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Increase`, level: true, singleline: true },
  Roo1: { type: 0, data: 1, name: `(attackBits) Data [multilevel]: Rooted Weapons`, level: true, singleline: true },
  Roo2: { type: 0, data: 2, name: `(attackBits) Data [multilevel]: Uprooted Weapons`, level: true, singleline: true },
  Roo3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Rooted Turning`, level: true, singleline: true },
  Roo4: { type: 0, data: 4, name: `(defenseTypeInt) Data [multilevel]: Uprooted Defense Type`, level: true, singleline: true },
  Sal1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Salvage Cost Ratio`, level: true, singleline: true },
  Sal2: { type: 0, data: 2, name: `(int) Data [multilevel]: Accumulation Step`, level: true, singleline: true },
  Esn1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: In Flight Sight Radius`, level: true, singleline: true },
  Esn2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Hovering Sight Radius`, level: true, singleline: true },
  Esn3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Hovering Height`, level: true, singleline: true },
  Esn4: { type: 0, data: 4, name: `(int) Data [multilevel]: Number of Owls`, level: true, singleline: true },
  Esn5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Duration of Owls`, level: true, singleline: true },
  Shm1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Fade Duration`, level: true, singleline: true },
  Shm2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Day/Night Duration`, level: true, singleline: true },
  Shm3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Action Duration`, level: true, singleline: true },
  Shm4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Permanent Cloak`, level: true, singleline: true },
  Slo1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Speed Factor`, level: true, singleline: true },
  Slo2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Attack Speed Factor`, level: true, singleline: true },
  Slo3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Always Autocast`, level: true, singleline: true },
  Spo1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  Spo2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Movement Speed Factor`, level: true, singleline: true },
  Spo3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Attack Speed Factor`, level: true, singleline: true },
  Spo4: { type: 0, data: 4, name: `(stackFlags) Data [multilevel]: Stacking Type`, level: true, singleline: true },
  Sod1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Units`, level: true, singleline: true },
  Sod2: { type: 0, data: 2, name: `(unitCode) Data [multilevel]: Unit Type`, level: true, singleline: true },
  Spa1: { type: 0, data: 1, name: `(int) Data [multilevel]: Spider Capacity`, level: true, singleline: true },
  Sta1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Activation Delay`, level: true, singleline: true },
  Sta2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Detection Radius`, level: true, singleline: true },
  Sta3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Detonation Radius`, level: true, singleline: true },
  Sta4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Stun Duration`, level: true, singleline: true },
  Sta5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Detonation Delay`, level: true, singleline: true },
  Stau: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Ward Unit Type`, level: true, singleline: true },
  Uhf1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Attack Speed Bonus (%)`, level: true, singleline: true },
  Uhf2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage per Second`, level: true, singleline: true },
  Wha1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Lumber per Interval`, level: true, singleline: true },
  Wha2: { type: 0, data: 2, name: `(int) Data [multilevel]: Intervals Before Changing Trees`, level: true, singleline: true },
  Wha3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Art Attachment Height`, level: true, singleline: true },
  Wrp1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Teleport Area Width`, level: true, singleline: true },
  Wrp2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Teleport Area Height`, level: true, singleline: true },
  Iagi: { type: 0, data: 1, name: `(int) Data [multilevel]: Agility Bonus`, level: true, singleline: true },
  Iint: { type: 0, data: 2, name: `(int) Data [multilevel]: Intelligence Bonus`, level: true, singleline: true },
  Istr: { type: 0, data: 3, name: `(int) Data [multilevel]: Strength Bonus`, level: true, singleline: true },
  Ihid: { type: 0, data: 4, name: `(bool) Data [multilevel]: Hide Button`, level: true, singleline: true },
  Iatt: { type: 0, data: 1, name: `(int) Data [multilevel]: Attack Bonus`, level: true, singleline: true },
  Idef: { type: 0, data: 1, name: `(int) Data [multilevel]: Defense Bonus`, level: true, singleline: true },
  Isn1: { type: 0, data: 1, name: `(int) Data [multilevel]: Summon 1 - Amount`, level: true, singleline: true },
  Ist1: { type: 0, data: 3, name: `(unitCode) Data [multilevel]: Summon 1 - Unit Type`, level: true, singleline: true },
  Isn2: { type: 0, data: 2, name: `(int) Data [multilevel]: Summon 2 - Amount`, level: true, singleline: true },
  Ist2: { type: 0, data: 4, name: `(unitCode) Data [multilevel]: Summon 2 - Unit Type`, level: true, singleline: true },
  Ixpg: { type: 0, data: 1, name: `(int) Data [multilevel]: Experience Gained`, level: true, singleline: true },
  Ihpg: { type: 0, data: 1, name: `(int) Data [multilevel]: Hit Points Gained`, level: true, singleline: true },
  Impg: { type: 0, data: 1, name: `(int) Data [multilevel]: Mana Points Gained`, level: true, singleline: true },
  Ihp2: { type: 0, data: 2, name: `(int) Data [multilevel]: Hit Points Gained`, level: true, singleline: true },
  Imp2: { type: 0, data: 3, name: `(int) Data [multilevel]: Mana Points Gained`, level: true, singleline: true },
  Ivam: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Life Stolen Per Attack`, level: true, singleline: true },
  Idic: { type: 0, data: 1, name: `(int) Data [multilevel]: Damage Bonus Dice`, level: true, singleline: true },
  Iarp: { type: 0, data: 2, name: `(int) Data [multilevel]: Armor Penalty`, level: true, singleline: true },
  Idam: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  Iob5: { type: 0, data: 5, name: `(int) Data [multilevel]: Enabled Attack Index`, level: true, singleline: true },
  Iob2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Chance To Hit Units (%)`, level: true, singleline: true },
  Iob3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Chance To Hit Heros (%)`, level: true, singleline: true },
  Iob4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Chance To Hit Summons (%)`, level: true, singleline: true },
  Iobu: { type: 3, data: 0, name: `(abilCode) UnitID [multilevel]: Effect Ability`, level: true, singleline: true },
  Ilev: { type: 0, data: 1, name: `(int) Data [multilevel]: Levels Gained`, level: true, singleline: true },
  Ilif: { type: 0, data: 1, name: `(int) Data [multilevel]: Max Life Gained`, level: true, singleline: true },
  Iman: { type: 0, data: 1, name: `(int) Data [multilevel]: Max Mana Gained`, level: true, singleline: true },
  Igol: { type: 0, data: 1, name: `(int) Data [multilevel]: Gold Given`, level: true, singleline: true },
  Ilum: { type: 0, data: 1, name: `(int) Data [multilevel]: Lumber Given`, level: true, singleline: true },
  Ifa1: { type: 0, data: 1, name: `(detectionType) Data [multilevel]: Detection Type`, level: true, singleline: true },
  Idel: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Delay For Target Effect`, level: true, singleline: true },
  Icre: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Creep Level`, level: true, singleline: true },
  Imvb: { type: 0, data: 1, name: `(int) Data [multilevel]: Movement Speed Bonus`, level: true, singleline: true },
  Ihpr: { type: 0, data: 1, name: `(int) Data [multilevel]: Hit Points Regenerated Per Second`, level: true, singleline: true },
  Isib: { type: 0, data: 1, name: `(int) Data [multilevel]: Sight Range Bonus`, level: true, singleline: true },
  Icfd: { type: 0, data: 1, name: `(int) Data [multilevel]: Damage Per Duration`, level: true, singleline: true },
  Icfm: { type: 0, data: 2, name: `(int) Data [multilevel]: Mana Used Per Second`, level: true, singleline: true },
  Icfx: { type: 0, data: 3, name: `(int) Data [multilevel]: Extra Mana Required`, level: true, singleline: true },
  Idet: { type: 0, data: 1, name: `(detectionType) Data [multilevel]: Detection Radius`, level: true, singleline: true },
  Idim: { type: 0, data: 1, name: `(int) Data [multilevel]: Mana Loss Per Unit`, level: true, singleline: true },
  Idid: { type: 0, data: 2, name: `(int) Data [multilevel]: Damage To Summoned Units`, level: true, singleline: true },
  Iild: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Dealt (% of normal)`, level: true, singleline: true },
  Iilw: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Received Multiplier`, level: true, singleline: true },
  Irec: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Number of Units`, level: true, singleline: true },
  Imrp: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Mana Regeneration Bonus (as fraction of normal)`, level: true, singleline: true },
  Ircd: { type: 0, data: 1, name: `(int) Data [multilevel]: Delay After Death (seconds)`, level: true, singleline: true },
  irc2: { type: 0, data: 2, name: `(int) Data [multilevel]: Restored Life`, level: true, singleline: true },
  irc3: { type: 0, data: 3, name: `(int) Data [multilevel]: Restored Mana (-1 for current)`, level: true, singleline: true },
  Ihps: { type: 0, data: 1, name: `(int) Data [multilevel]: Hit Points Restored`, level: true, singleline: true },
  Imps: { type: 0, data: 2, name: `(int) Data [multilevel]: Mana Points Restored`, level: true, singleline: true },
  Ispi: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Speed Increase`, level: true, singleline: true },
  Itpm: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Number of Units`, level: true, singleline: true },
  Itp2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Use Teleport Clustering`, level: true, singleline: true },
  Idps: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  Cad1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Corpses Raised`, level: true, singleline: true },
  Cac1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Attack Damage Increase`, level: true, singleline: true },
  Cor1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  Isx1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Attack Speed Increase`, level: true, singleline: true },
  Wrs1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Wrs2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Terrain Deformation Amplitude`, level: true, singleline: true },
  Wrs3: { type: 0, data: 3, name: `(int) Data [multilevel]: Terrain Deformation Duration (ms)`, level: true, singleline: true },
  Ctc1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Ctc2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Extra Damage To Target`, level: true, singleline: true },
  Ctc3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Movement Speed Reduction`, level: true, singleline: true },
  Ctc4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Attack Speed Reduction`, level: true, singleline: true },
  Ctb1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage`, level: true, singleline: true },
  Ibl1: { type: 3, data: 0, name: `(unitList) UnitID [multilevel]: Unit Created (per player race)`, level: true, singleline: true },
  Uds1: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Units`, level: true, singleline: true },
  Uds2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Casting Delay (seconds)`, level: true, singleline: true },
  Ndc1: { type: 3, data: 1, name: `(unitRace) Data [multilevel]: Race to Convert`, level: true, singleline: true },
  Ndc2: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Conversion Unit`, level: true, singleline: true },
  Nsl1: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Unit to Preserve`, level: true, singleline: true },
  Chl1: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Unit Type Allowed`, level: true, singleline: true },
  Det1: { type: 0, data: 1, name: `(detectionType) Data [multilevel]: Detection Type`, level: true, singleline: true },
  Dtn1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Mana Loss (per unit)`, level: true, singleline: true },
  Dtn2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage to Summoned Units`, level: true, singleline: true },
  Eth1: { type: 0, data: 1, name: `(bool) Data [multilevel]: Immune to Morph Effects`, level: true, singleline: true },
  Eth2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Does Not Block Buildings`, level: true, singleline: true },
  Gho1: { type: 0, data: 1, name: `(bool) Data [multilevel]: Auto-Acquire Attack Targets`, level: true, singleline: true },
  Gho2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Immune to Morph Effects`, level: true, singleline: true },
  Gho3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Does Not Block Buildings`, level: true, singleline: true },
  Ivs1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Transition Time (seconds)`, level: true, singleline: true },
  Nmr1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Mana Drained per Second`, level: true, singleline: true },
  Nsp1: { type: 0, data: 1, name: `(int) Data [multilevel]: Gold Cost per Structure`, level: true, singleline: true },
  Nsp2: { type: 0, data: 2, name: `(int) Data [multilevel]: Lumber Cost per Use`, level: true, singleline: true },
  Nsp3: { type: 0, data: 3, name: `(detectionType) Data [multilevel]: Detection Type`, level: true, singleline: true },
  Ssk1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Chance to Reduce Damage (%)`, level: true, singleline: true },
  Ssk2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Minimum Damage`, level: true, singleline: true },
  Ssk3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Ignored Damage`, level: true, singleline: true },
  Ssk4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Include Ranged Damage`, level: true, singleline: true },
  Ssk5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Include Melee Damage`, level: true, singleline: true },
  Hfs1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Full Damage Dealt`, level: true, singleline: true },
  Hfs2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Full Damage Interval`, level: true, singleline: true },
  Hfs3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Half Damage Dealt`, level: true, singleline: true },
  Hfs4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Half Damage Interval`, level: true, singleline: true },
  Hfs5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Building Reduction`, level: true, singleline: true },
  Hfs6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Maximum Damage`, level: true, singleline: true },
  Nms1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Mana per Hit Point`, level: true, singleline: true },
  Nms2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Absorbed (%)`, level: true, singleline: true },
  Uim1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Wave Distance`, level: true, singleline: true },
  Uim2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Wave Time (seconds)`, level: true, singleline: true },
  Uim3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Dealt`, level: true, singleline: true },
  Uim4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Air Time (seconds)`, level: true, singleline: true },
  Uim5: { type: 0, data: 5, name: `(bool) Data [multilevel]: \u041D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043F\u0440\u0435\u0440\u0432\u0430\u043D\u043E`, level: true, singleline: true },
  Uim6: { type: 0, data: 6, name: `(bool) Data [multilevel]: Airborne Targets Vulnerable`, level: true, singleline: true },
  Uls1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Swarm Units`, level: true, singleline: true },
  Uls2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Unit Release Interval (seconds)`, level: true, singleline: true },
  Uls3: { type: 0, data: 3, name: `(int) Data [multilevel]: Max Swarm Units Per Target`, level: true, singleline: true },
  Uls4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Damage Return Factor`, level: true, singleline: true },
  Uls5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Damage Return Threshold`, level: true, singleline: true },
  Ulsu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Swarm Unit Type`, level: true, singleline: true },
  Uts1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Returned Damage Factor`, level: true, singleline: true },
  Uts2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Received Damage Factor`, level: true, singleline: true },
  Uts3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Defense Bonus`, level: true, singleline: true },
  Nba1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  Nba2: { type: 0, data: 2, name: `(int) Data [multilevel]: Number of Summoned Units`, level: true, singleline: true },
  Nba3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Summoned Unit Duration (seconds)`, level: true, singleline: true },
  Nbau: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Summoned Unit Type`, level: true, singleline: true },
  Nch1: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Creep Level`, level: true, singleline: true },
  Cmg2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Mana per Summoned Hitpoint`, level: true, singleline: true },
  Cmg3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Charge for Current Life`, level: true, singleline: true },
  Ndr1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Hit Points Drained`, level: true, singleline: true },
  Ndr2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Mana Points Drained`, level: true, singleline: true },
  Ndr3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Drain Interval (seconds)`, level: true, singleline: true },
  Ndr4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Life Transferred Per Second`, level: true, singleline: true },
  Ndr5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Mana Transferred Per Second`, level: true, singleline: true },
  Ndr6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Bonus Life Factor`, level: true, singleline: true },
  Ndr7: { type: 2, data: 7, name: `(unreal) Data [multilevel]: Bonus Life Decay`, level: true, singleline: true },
  Ndr8: { type: 2, data: 8, name: `(unreal) Data [multilevel]: Bonus Mana Factor`, level: true, singleline: true },
  Ndr9: { type: 2, data: 9, name: `(unreal) Data [multilevel]: Bonus Mana Decay`, level: true, singleline: true },
  NdrA: { type: 0, data: 10, name: `(bool) Data [multilevel]: Use Black Arrow Effect`, level: true, singleline: true },
  Nsi1: { type: 0, data: 1, name: `(silenceFlags) Data [multilevel]: Attacks Prevented`, level: true, singleline: true },
  Nsi2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Chance To Miss (%)`, level: true, singleline: true },
  Nsi3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Movement Speed Modifier`, level: true, singleline: true },
  Nsi4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Attack Speed Modifier`, level: true, singleline: true },
  Ntou: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Summoned Unit Type`, level: true, singleline: true },
  Tdg1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  Tdg2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Medium Damage Radius`, level: true, singleline: true },
  Tdg3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Medium Damage Per Second`, level: true, singleline: true },
  Tdg4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Small Damage Radius`, level: true, singleline: true },
  Tdg5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Small Damage Per Second`, level: true, singleline: true },
  Tsp1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Air Time (seconds)`, level: true, singleline: true },
  Tsp2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Minimum Hit Interval (seconds)`, level: true, singleline: true },
  Nbf5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  Ebl1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Maximum Range`, level: true, singleline: true },
  Ebl2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Minimum Range`, level: true, singleline: true },
  Efk1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Per Target`, level: true, singleline: true },
  Efk2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Maximum Total Damage`, level: true, singleline: true },
  Efk3: { type: 0, data: 3, name: `(int) Data [multilevel]: Maximum Number of Targets`, level: true, singleline: true },
  Efk4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Maximum Speed Adjustment`, level: true, singleline: true },
  Esh1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Decaying Damage`, level: true, singleline: true },
  Esh2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Movement Speed Factor`, level: true, singleline: true },
  Esh3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Attack Speed Factor`, level: true, singleline: true },
  Esh4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Decay Power`, level: true, singleline: true },
  Esh5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Initial Damage`, level: true, singleline: true },
  Esv1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Summoned Units`, level: true, singleline: true },
  Esvu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Summoned Unit Type`, level: true, singleline: true },
  abs1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Maximum Life Absorbed`, level: true, singleline: true },
  abs2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Maximum Mana Absorbed`, level: true, singleline: true },
  bsk1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Speed Increase`, level: true, singleline: true },
  bsk2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Attack Speed Increase`, level: true, singleline: true },
  bsk3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Taken Increase`, level: true, singleline: true },
  coau: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Resulting Unit Type`, level: true, singleline: true },
  coa1: { type: 0, data: 1, name: `(unitCode) Data [multilevel]: Partner Unit Type`, level: true, singleline: true },
  coa2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Move To Partner`, level: true, singleline: true },
  cyc1: { type: 0, data: 1, name: `(bool) Data [multilevel]: Can Be Dispelled`, level: true, singleline: true },
  dcp1: { type: 0, data: 1, name: `(unitCode) Data [multilevel]: Partner Unit Type One`, level: true, singleline: true },
  dcp2: { type: 0, data: 2, name: `(unitCode) Data [multilevel]: Partner Unit Type Two`, level: true, singleline: true },
  dvm1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Life Per Unit`, level: true, singleline: true },
  dvm2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Mana Per Unit`, level: true, singleline: true },
  dvm3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Life Per Buff`, level: true, singleline: true },
  dvm4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Mana Per Buff`, level: true, singleline: true },
  dvm5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Summoned Unit Damage`, level: true, singleline: true },
  dvm6: { type: 0, data: 6, name: `(bool) Data [multilevel]: Ignore Friendly Buffs`, level: true, singleline: true },
  exh1: { type: 0, data: 1, name: `(int) Data [multilevel]: Maximum Number of Corpses`, level: true, singleline: true },
  exhu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Unit Type`, level: true, singleline: true },
  fak1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  fak2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Medium Damage Factor`, level: true, singleline: true },
  fak3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Small Damage Factor`, level: true, singleline: true },
  fak4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Full Damage Radius`, level: true, singleline: true },
  fak5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Half Damage Radius`, level: true, singleline: true },
  hwdu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Ward Unit Type`, level: true, singleline: true },
  inv1: { type: 0, data: 1, name: `(int) Data [multilevel]: Item Capacity`, level: true, singleline: true },
  inv2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Drop Items On Death`, level: true, singleline: true },
  inv3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Can Use Items`, level: true, singleline: true },
  inv4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Can Get Items`, level: true, singleline: true },
  inv5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Can Drop Items`, level: true, singleline: true },
  liq1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Extra Damage Per Second`, level: true, singleline: true },
  liq2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Movement Speed Reduction`, level: true, singleline: true },
  liq3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Attack Speed Reduction`, level: true, singleline: true },
  liq4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Repairs Allowed`, level: true, singleline: true },
  mim1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Magic Damage Factor`, level: true, singleline: true },
  mfl1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Unit - Damage Per Mana Point`, level: true, singleline: true },
  mfl2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Hero - Damage Per Mana Point`, level: true, singleline: true },
  mfl3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Unit - Maximum Damage`, level: true, singleline: true },
  mfl4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Hero - Maximum Damage`, level: true, singleline: true },
  mfl5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Damage Cooldown`, level: true, singleline: true },
  mfl6: { type: 0, data: 6, name: `(bool) Data [multilevel]: Caster Only Splash`, level: true, singleline: true },
  tpi1: { type: 0, data: 1, name: `(unitCode) Data [multilevel]: Required Unit Type`, level: true, singleline: true },
  tpi2: { type: 0, data: 2, name: `(unitCode) Data [multilevel]: Converted Unit Type`, level: true, singleline: true },
  spl1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Distributed Damage Factor`, level: true, singleline: true },
  spl2: { type: 0, data: 2, name: `(int) Data [multilevel]: Maximum Number of Targets`, level: true, singleline: true },
  irl1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Life Regenerated`, level: true, singleline: true },
  irl2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Mana Regenerated`, level: true, singleline: true },
  irl3: { type: 0, data: 3, name: `(fullFlags) Data [multilevel]: Allow When Full`, level: true, singleline: true },
  irl4: { type: 0, data: 4, name: `(bool) Data [multilevel]: No Target Required`, level: true, singleline: true },
  irl5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Dispel On Attack`, level: true, singleline: true },
  idc1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Mana Loss Per Unit`, level: true, singleline: true },
  idc2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Summoned Unit Damage`, level: true, singleline: true },
  idc3: { type: 0, data: 3, name: `(int) Data [multilevel]: Maximum Dispelled Units`, level: true, singleline: true },
  imo1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Lures`, level: true, singleline: true },
  imo2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Activation Delay`, level: true, singleline: true },
  imo3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Lure Interval (seconds)`, level: true, singleline: true },
  imou: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Lure Unit Type`, level: true, singleline: true },
  ict1: { type: 0, data: 1, name: `(int) Data [multilevel]: New Time of Day - Hour`, level: true, singleline: true },
  ict2: { type: 0, data: 2, name: `(int) Data [multilevel]: New Time of Day - Minute`, level: true, singleline: true },
  isr1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  isr2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Reduction`, level: true, singleline: true },
  ipv1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  ipv2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Life Steal Amount`, level: true, singleline: true },
  ipv3: { type: 0, data: 3, name: `(bool) Data [multilevel]: Amount Is Raw Value`, level: true, singleline: true },
  mec1: { type: 0, data: 1, name: `(int) Data [multilevel]: Number of Units Created`, level: true, singleline: true },
  spb1: { type: 3, data: 1, name: `(abilityList) Data [multilevel]: Spell List`, level: true, singleline: true },
  spb2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Shared Spell Cooldown`, level: true, singleline: true },
  spb3: { type: 0, data: 3, name: `(int) Data [multilevel]: Minimum Spells`, level: true, singleline: true },
  spb4: { type: 0, data: 4, name: `(int) Data [multilevel]: Maximum Spells`, level: true, singleline: true },
  spb5: { type: 3, data: 5, name: `(orderString) Data [multilevel]: Base Order ID`, level: true, singleline: true },
  ast1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Life Restored Factor`, level: true, singleline: true },
  ast2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Mana Restored Factor`, level: true, singleline: true },
  gra1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Attach Delay`, level: true, singleline: true },
  gra2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Remove Delay`, level: true, singleline: true },
  gra3: { type: 0, data: 3, name: `(int) Data [multilevel]: Disabled Attack Index`, level: true, singleline: true },
  gra4: { type: 0, data: 4, name: `(int) Data [multilevel]: Enabled Attack Index`, level: true, singleline: true },
  gra5: { type: 0, data: 5, name: `(int) Data [multilevel]: Maximum Attacks`, level: true, singleline: true },
  ipmu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Unit Type`, level: true, singleline: true },
  Npr1: { type: 0, data: 1, name: `(pickFlags) Data [multilevel]: Building Types Allowed`, level: true, singleline: true },
  Nsa1: { type: 0, data: 1, name: `(pickFlags) Data [multilevel]: Building Types Allowed`, level: true, singleline: true },
  Nsa2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Hero Regeneration Delay`, level: true, singleline: true },
  Nsa3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Unit Regeneration Delay`, level: true, singleline: true },
  Nsa4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Magic Damage Reduction`, level: true, singleline: true },
  Nsa5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Hit Points Per Second`, level: true, singleline: true },
  Iaa1: { type: 0, data: 1, name: `(int) Data [multilevel]: Attack Modification`, level: true, singleline: true },
  Ixs1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage To Summoned Units`, level: true, singleline: true },
  Ixs2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Magic Damage Reduction`, level: true, singleline: true },
  Nef1: { type: 3, data: 1, name: `(unitList) Data [multilevel]: Summoned Unit Types`, level: true, singleline: true },
  Npa5: { type: 0, data: 5, name: `(int) Data [multilevel]: Summoned Unit Count`, level: true, singleline: true },
  Npa6: { type: 2, data: 0, name: `(unreal) Cast [multilevel]: Summoned Unit Duration`, level: true, singleline: true },
  Igl1: { type: 0, data: 1, name: `(int) Data [multilevel]: Upgrade Levels`, level: true, singleline: true },
  Iglu: { type: 0, data: 0, name: `(upgradeCode) UnitID [multilevel]: Upgrade Type`, level: true, singleline: true },
  Nse1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Shield Cooldown Time`, level: true, singleline: true },
  Ndo1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  Ndo2: { type: 0, data: 2, name: `(int) Data [multilevel]: Number of Summoned Units`, level: true, singleline: true },
  Ndo3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Summoned Unit Duration (seconds)`, level: true, singleline: true },
  Ndo4: { type: 0, data: 4, name: `(int) Data [multilevel]: Maximum Creep Level`, level: true, singleline: true },
  Ndo5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Movement Speed Factor`, level: true, singleline: true },
  Ndou: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Summoned Unit Type`, level: true, singleline: true },
  flk1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Medium Damage Radius`, level: true, singleline: true },
  flk2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Small Damage Radius`, level: true, singleline: true },
  flk3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Full Damage Amount`, level: true, singleline: true },
  flk4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Medium Damage Amount`, level: true, singleline: true },
  flk5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Small Damage Amount`, level: true, singleline: true },
  Hbn1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Speed Reduction (%)`, level: true, singleline: true },
  Hbn2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Attack Speed Reduction (%)`, level: true, singleline: true },
  fbk1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Max Mana Drained - Units`, level: true, singleline: true },
  fbk2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Ratio - Units (%)`, level: true, singleline: true },
  fbk3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Max Mana Drained - Heros`, level: true, singleline: true },
  fbk4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Damage Ratio - Heros (%)`, level: true, singleline: true },
  fbk5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Summoned Damage`, level: true, singleline: true },
  nca1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Distributed Damage Factor`, level: true, singleline: true },
  pxf1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Initial Damage`, level: true, singleline: true },
  pxf2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  mls1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Per Second`, level: true, singleline: true },
  sla1: { type: 0, data: 1, name: `(bool) Data [multilevel]: Sleep Once`, level: true, singleline: true },
  Nst1: { type: 0, data: 1, name: `(int) Data [multilevel]: Beasts Per Second`, level: true, singleline: true },
  Nst2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Beast Collision Radius`, level: true, singleline: true },
  Nst3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Amount`, level: true, singleline: true },
  Nst4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Damage Radius`, level: true, singleline: true },
  Nst5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Damage Delay`, level: true, singleline: true },
  sla2: { type: 0, data: 2, name: `(bool) Data [multilevel]: Allow On Any Player Slot`, level: true, singleline: true },
  Ncl1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Follow Through Time`, level: true, singleline: true },
  Ncl2: { type: 0, data: 2, name: `(channelType) Data [multilevel]: Target Type`, level: true, singleline: true },
  Ncl3: { type: 0, data: 3, name: `(channelFlags) Data [multilevel]: Options`, level: true, singleline: true },
  Ncl4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Art Duration`, level: true, singleline: true },
  Ncl5: { type: 0, data: 5, name: `(bool) Data [multilevel]: Disable Other Abilities`, level: true, singleline: true },
  Ncl6: { type: 3, data: 6, name: `(orderString) Data [multilevel]: Base Order ID`, level: true, singleline: true },
  Nab1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Movement Speed Reduction (%)`, level: true, singleline: true },
  Nab2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Attack Speed Reduction (%)`, level: true, singleline: true },
  Nab3: { type: 0, data: 3, name: `(int) Data [multilevel]: Armor Penalty`, level: true, singleline: true },
  Nab4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Primary Damage`, level: true, singleline: true },
  Nab5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Secondary Damage`, level: true, singleline: true },
  Nab6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Damage Interval`, level: true, singleline: true },
  Nhs6: { type: 0, data: 6, name: `(int) Data [multilevel]: Wave Count`, level: true, singleline: true },
  Ntm1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Gold Cost Factor`, level: true, singleline: true },
  Ntm2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Lumber Cost Factor`, level: true, singleline: true },
  Ntm3: { type: 0, data: 3, name: `(int) Data [multilevel]: Max Creep Level`, level: true, singleline: true },
  Ntm4: { type: 0, data: 4, name: `(bool) Data [multilevel]: Allow Bounty`, level: true, singleline: true },
  Neg1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Move Speed Bonus`, level: true, singleline: true },
  Neg2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Bonus`, level: true, singleline: true },
  Neg3: { type: 3, data: 3, name: `(heroAbilityList) Data [multilevel]: Ability Upgrade 1`, level: true, singleline: true },
  Neg4: { type: 3, data: 4, name: `(heroAbilityList) Data [multilevel]: Ability Upgrade 2`, level: true, singleline: true },
  Neg5: { type: 3, data: 5, name: `(heroAbilityList) Data [multilevel]: Ability Upgrade 3`, level: true, singleline: true },
  Neg6: { type: 3, data: 6, name: `(heroAbilityList) Data [multilevel]: Ability Upgrade 4`, level: true, singleline: true },
  Ncs1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Amount`, level: true, singleline: true },
  Ncs2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Interval`, level: true, singleline: true },
  Ncs3: { type: 0, data: 3, name: `(int) Data [multilevel]: Missile Count`, level: true, singleline: true },
  Ncs4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Max Damage`, level: true, singleline: true },
  Ncs5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Building Damage Factor`, level: true, singleline: true },
  Ncs6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Effect Duration`, level: true, singleline: true },
  Nsy1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Spawn Interval`, level: true, singleline: true },
  Nsy2: { type: 0, data: 2, name: `(unitCode) Data [multilevel]: Spawn Unit ID`, level: true, singleline: true },
  Nsy3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Spawn Unit Duration`, level: true, singleline: true },
  Nsy4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Spawn Unit Offset`, level: true, singleline: true },
  Nsy5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Leash Range`, level: true, singleline: true },
  Nsyu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Factory Unit ID`, level: true, singleline: true },
  Nfy1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Spawn Interval`, level: true, singleline: true },
  Nfy2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Leash Range`, level: true, singleline: true },
  Nfyu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Spawn Unit ID`, level: true, singleline: true },
  Nde1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Chance to Demolish`, level: true, singleline: true },
  Nde2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Multiplier (Buildings)`, level: true, singleline: true },
  Nde3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Multiplier (Units)`, level: true, singleline: true },
  Nde4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Damage Multiplier (Heroes)`, level: true, singleline: true },
  Nic1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Bonus Damage Multiplier`, level: true, singleline: true },
  Nic2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Death Damage Full Amount`, level: true, singleline: true },
  Nic3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Death Damage Full Area`, level: true, singleline: true },
  Nic4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Death Damage Half Amount`, level: true, singleline: true },
  Nic5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Death Damage Half Area`, level: true, singleline: true },
  Nic6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Death Damage Delay`, level: true, singleline: true },
  Nso1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Damage Amount`, level: true, singleline: true },
  Nso2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Damage Period`, level: true, singleline: true },
  Nso3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Damage Penalty`, level: true, singleline: true },
  Nso4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Movement Speed Reduction (%)`, level: true, singleline: true },
  Nso5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Attack Speed Reduction (%)`, level: true, singleline: true },
  Nlm2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Split Delay`, level: true, singleline: true },
  Nlm3: { type: 0, data: 3, name: `(int) Data [multilevel]: Split Attack Count`, level: true, singleline: true },
  Nlm4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Max Hitpoint Factor`, level: true, singleline: true },
  Nlm5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Life Duration Split Bonus`, level: true, singleline: true },
  Nlm6: { type: 0, data: 6, name: `(int) Data [multilevel]: Generation Count`, level: true, singleline: true },
  Nvc1: { type: 0, data: 1, name: `(int) Data [multilevel]: Rock Ring Count`, level: true, singleline: true },
  Nvc2: { type: 0, data: 2, name: `(int) Data [multilevel]: Wave Count`, level: true, singleline: true },
  Nvc3: { type: 2, data: 3, name: `(unreal) Data [multilevel]: Wave Interval`, level: true, singleline: true },
  Nvc4: { type: 2, data: 4, name: `(unreal) Data [multilevel]: Building Damage Factor`, level: true, singleline: true },
  Nvc5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Full Damage Amount`, level: true, singleline: true },
  Nvc6: { type: 2, data: 6, name: `(unreal) Data [multilevel]: Half Damage Factor`, level: true, singleline: true },
  Nvcu: { type: 0, data: 0, name: `(unitCode) UnitID [multilevel]: Destructible ID`, level: true, singleline: true },
  Tau1: { type: 0, data: 1, name: `(int) Data [multilevel]: Prefer Hostiles`, level: true, singleline: true },
  Tau2: { type: 0, data: 2, name: `(int) Data [multilevel]: Prefer Friendlies`, level: true, singleline: true },
  Tau3: { type: 0, data: 3, name: `(int) Data [multilevel]: Max Units`, level: true, singleline: true },
  Tau4: { type: 0, data: 4, name: `(int) Data [multilevel]: Number of Pulses`, level: true, singleline: true },
  Tau5: { type: 2, data: 5, name: `(unreal) Data [multilevel]: Interval between Pulses`, level: true, singleline: true },
  Idg1: { type: 0, data: 2, name: `(bool) Data [multilevel]: Requires Undead Target`, level: true, singleline: true },
  Idg2: { type: 0, data: 3, name: `(bool) Data [multilevel]: Affects Initial Target`, level: true, singleline: true },
  Idg3: { type: 3, data: 8, name: `(targetList) Data [multilevel]: Targets Allowed for Heal`, level: true, singleline: true },
  Uuf1: { type: 0, data: 3, name: `(bool) Data [multilevel]: Requires Undead Target`, level: true, singleline: true },
  Uuf2: { type: 0, data: 4, name: `(bool) Data [multilevel]: Leave Target Alive`, level: true, singleline: true },
  Uuf3: { type: 3, data: 8, name: `(targetList) Data [multilevel]: Targets Allowed for Buff`, level: true, singleline: true },
  Hsb1: { type: 2, data: 1, name: `(unreal) Data [multilevel]: Bonus Damage (Flat)`, level: true, singleline: true },
  Hsb2: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Bonus Damage (Percent)`, level: true, singleline: true },
  Hsb3: { type: 0, data: 3, name: `(defenseTypeInt) Data [multilevel]: Defense Type Affected`, level: true, singleline: true },
  Iofr: { type: 2, data: 2, name: `(unreal) Data [multilevel]: Healing Multiplier`, level: true, singleline: true },
  AIvu: { type: 0, data: 1, name: `(bool) Data [multilevel]: Is Magic Immune`, level: true, singleline: true },
  Akb2: { type: 0, data: 5, name: `(bool) Data [multilevel]: Play Channel Animation`, level: true, singleline: true },
  ausk: { type: 3, data: 0, name: `(unitSkinList) UnitSkinID: Unit Skin List`, singleline: true },
  Aat1: { type: 0, data: 1, name: `(bool) Data [multilevel]: \u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E`, level: true, singleline: true }
};
var W3ATOMLMap_default = map;

// node_modules/warodel/w3abdhqtu/W3A.mjs
var W3A = class _W3A extends W3ABDHQTU {
  /** @param {Buffer|ArrayBuffer} buffer */
  constructor(buffer) {
    super(buffer, true);
  }
  /**
   * @param {string} json
   * @return {W3A}
   */
  static fromJSON(json) {
    return super._fromJSON(new _W3A(new ArrayBuffer(0)), json, true);
  }
  /**
   * @param {string} ini
   * @return {W3A}
   */
  static fromTOML(ini) {
    return super._fromTOML(new _W3A(new ArrayBuffer(0)), ini, true, W3ATOMLMap_default);
  }
  /** @return {string} */
  toTOML() {
    return super._toTOML(W3ATOMLMap_default, { endblock: false });
  }
};

// renderer.js
var electron = window.electron;
var dialog = window.dialog;
var fs = window.fs;
var buttonSelect = document.querySelector(".button-select");
var buttonClear = document.querySelector(".button-clear");
var filesContainer = document.querySelector(".files");
buttonSelect.addEventListener("click", async () => {
  const paths = await electron.showOpenDialogSync({
    title: "Select game data file",
    buttonLabel: "Open",
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Game data", extensions: ["w3a", "w3u", "toml"] }
    ]
  });
  console.log(paths);
  if (paths === void 0)
    return;
  const w3a = new W3A(new ArrayBuffer(0));
});
buttonClear.addEventListener("click", async () => {
  const s = await fs.readFileSync("/Users/nazarpunk/Downloads/wa.toml", { encoding: "utf8" });
  console.log("1", s);
});
/*! Bundled license information:

@ltd/j-toml/index.mjs:
  (*!@preserve@license
   * 模块名称：j-regexp
   * 模块功能：可读性更好的正则表达式创建方式。从属于“简计划”。
     　　　　　More readable way for creating RegExp. Belong to "Plan J".
   * 模块版本：8.2.0
   * 许可条款：LGPL-3.0
   * 所属作者：龙腾道 <LongTengDao@LongTengDao.com> (www.LongTengDao.com)
   * 问题反馈：https://GitHub.com/LongTengDao/j-regexp/issues
   * 项目主页：https://GitHub.com/LongTengDao/j-regexp/
   *)
  (*!@preserve@license
   * 模块名称：j-orderify
   * 模块功能：返回一个能保证给定对象的属性按此后添加顺序排列的 proxy，即使键名是 symbol，或整数 string。从属于“简计划”。
     　　　　　Return a proxy for given object, which can guarantee own keys are in setting order, even if the key name is symbol or int string. Belong to "Plan J".
   * 模块版本：7.0.1
   * 许可条款：LGPL-3.0
   * 所属作者：龙腾道 <LongTengDao@LongTengDao.com> (www.LongTengDao.com)
   * 问题反馈：https://GitHub.com/LongTengDao/j-orderify/issues
   * 项目主页：https://GitHub.com/LongTengDao/j-orderify/
   *)
*/
