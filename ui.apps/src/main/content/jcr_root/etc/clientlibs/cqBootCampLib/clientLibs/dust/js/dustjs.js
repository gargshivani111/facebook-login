/*! Dust - Asynchronous Templating - v2.6.1
 * http://linkedin.github.io/dustjs/
 * Copyright (c) 2015 Aleksander Williams; Released under the MIT License */
!function (root) {
    function Context(a, b, c, d) {
        this.stack = a, this.global = b, this.blocks = c, this.templateName = d
    }

    function Stack(a, b, c, d) {
        this.tail = b, this.isObject = a && "object" == typeof a, this.head = a, this.index = c, this.of = d
    }

    function Stub(a) {
        this.head = new Chunk(this), this.callback = a, this.out = ""
    }

    function Stream() {
        this.head = new Chunk(this)
    }

    function Chunk(a, b, c) {
        this.root = a, this.next = b, this.data = [], this.flushable = !1, this.taps = c
    }

    function Tap(a, b) {
        this.head = a, this.tail = b
    }

    var dust = {version: "2.6.1"}, NONE = "NONE", ERROR = "ERROR", WARN = "WARN", INFO = "INFO", DEBUG = "DEBUG", loggingLevels = [DEBUG, INFO, WARN, ERROR, NONE], EMPTY_FUNC = function () {
    }, logger = {}, originalLog, loggerContext;
    dust.debugLevel = NONE, dust.config = {whitespace: !1, amd: !1}, dust._aliases = {write: "w", end: "e", map: "m", render: "r", reference: "f", section: "s", exists: "x", notexists: "nx", block: "b", partial: "p", helper: "h"}, root && root.console && root.console.log && (loggerContext = root.console, originalLog = root.console.log), logger.log = loggerContext ? function () {
        logger.log = "function" == typeof originalLog ? function () {
            originalLog.apply(loggerContext, arguments)
        } : function () {
            var a = Array.prototype.slice.apply(arguments).join(" ");
            originalLog(a)
        }, logger.log.apply(this, arguments)
    } : function () {
    }, dust.log = function (a, b) {
        b = b || INFO, dust.debugLevel !== NONE && dust.indexInArray(loggingLevels, b) >= dust.indexInArray(loggingLevels, dust.debugLevel) && (dust.logQueue || (dust.logQueue = []), dust.logQueue.push({message: a, type: b}), logger.log("[DUST:" + b + "]", a))
    }, dust.helpers = {}, dust.cache = {}, dust.register = function (a, b) {
        a && (dust.cache[a] = b)
    }, dust.render = function (a, b, c) {
        var d = new Stub(c).head;
        try {
            dust.load(a, d, Context.wrap(b, a)).end()
        } catch (e) {
            d.setError(e)
        }
    }, dust.stream = function (a, b) {
        var c = new Stream, d = c.head;
        return dust.nextTick(function () {
            try {
                dust.load(a, c.head, Context.wrap(b, a)).end()
            } catch (e) {
                d.setError(e)
            }
        }), c
    }, dust.renderSource = function (a, b, c) {
        return dust.compileFn(a)(b, c)
    }, dust.compileFn = function (a, b) {
        b = b || null;
        var c = dust.loadSource(dust.compile(a, b));
        return function (a, d) {
            var e = d ? new Stub(d) : new Stream;
            return dust.nextTick(function () {
                "function" == typeof c ? c(e.head, Context.wrap(a, b)).end() : dust.log(new Error("Template [" + b + "] cannot be resolved to a Dust function"), ERROR)
            }), e
        }
    }, dust.load = function (a, b, c) {
        var d = dust.cache[a];
        return d ? d(b, c) : dust.onLoad ? b.map(function (b) {
            dust.onLoad(a, function (d, e) {
                return d ? b.setError(d) : (dust.cache[a] || dust.loadSource(dust.compile(e, a)), void dust.cache[a](b, c).end())
            })
        }) : b.setError(new Error("Template Not Found: " + a))
    }, dust.loadSource = function (source, path) {
        return eval(source)
    }, dust.isArray = Array.isArray ? Array.isArray : function (a) {
        return"[object Array]" === Object.prototype.toString.call(a)
    }, dust.indexInArray = function (a, b, c) {
        if (c = +c || 0, Array.prototype.indexOf)return a.indexOf(b, c);
        if (void 0 === a || null === a)throw new TypeError('cannot call method "indexOf" of null');
        var d = a.length;
        for (Math.abs(c) === 1 / 0 && (c = 0), 0 > c && (c += d, 0 > c && (c = 0)); d > c; c++)if (a[c] === b)return c;
        return-1
    }, dust.nextTick = function () {
        return function (a) {
            setTimeout(a, 0)
        }
    }(), dust.isEmpty = function (a) {
        return dust.isArray(a) && !a.length ? !0 : 0 === a ? !1 : !a
    }, dust.filter = function (a, b, c) {
        if (c)for (var d = 0, e = c.length; e > d; d++) {
            var f = c[d];
            "s" === f ? b = null : "function" == typeof dust.filters[f] ? a = dust.filters[f](a) : dust.log("Invalid filter [" + f + "]", WARN)
        }
        return b && (a = dust.filters[b](a)), a
    }, dust.filters = {h: function (a) {
        return dust.escapeHtml(a)
    }, j: function (a) {
        return dust.escapeJs(a)
    }, u: encodeURI, uc: encodeURIComponent, js: function (a) {
        return dust.escapeJSON(a)
    }, jp: function (a) {
        return JSON ? JSON.parse(a) : (dust.log("JSON is undefined.  JSON parse has not been used on [" + a + "]", WARN), a)
    }}, dust.makeBase = function (a) {
        return new Context(new Stack, a)
    }, Context.wrap = function (a, b) {
        return a instanceof Context ? a : new Context(new Stack(a), {}, null, b)
    }, Context.prototype.get = function (a, b) {
        return"string" == typeof a && ("." === a[0] && (b = !0, a = a.substr(1)), a = a.split(".")), this._get(b, a)
    }, Context.prototype._get = function (a, b) {
        var c, d, e, f, g, h = this.stack, i = 1;
        if (d = b[0], e = b.length, a && 0 === e)f = h, h = h.head; else {
            if (a)h && (h = h.head ? h.head[d] : void 0); else {
                for (; h && (!h.isObject || (f = h.head, c = h.head[d], void 0 === c));)h = h.tail;
                h = void 0 !== c ? c : this.global ? this.global[d] : void 0
            }
            for (; h && e > i;)f = h, h = h[b[i]], i++
        }
        return"function" == typeof h ? (g = function () {
            try {
                return h.apply(f, arguments)
            } catch (a) {
                throw dust.log(a, ERROR), a
            }
        }, g.__dustBody = !!h.__dustBody, g) : (void 0 === h && dust.log("Cannot find the value for reference [{" + b.join(".") + "}] in template [" + this.getTemplateName() + "]"), h)
    }, Context.prototype.getPath = function (a, b) {
        return this._get(a, b)
    }, Context.prototype.push = function (a, b, c) {
        return new Context(new Stack(a, this.stack, b, c), this.global, this.blocks, this.getTemplateName())
    }, Context.prototype.rebase = function (a) {
        return new Context(new Stack(a), this.global, this.blocks, this.getTemplateName())
    }, Context.prototype.current = function () {
        return this.stack.head
    }, Context.prototype.getBlock = function (a) {
        if ("function" == typeof a) {
            var b = new Chunk;
            a = a(b, this).data.join("")
        }
        var c = this.blocks;
        if (!c)return void dust.log("No blocks for context[{" + a + "}] in template [" + this.getTemplateName() + "]", DEBUG);
        for (var d, e = c.length; e--;)if (d = c[e][a])return d
    }, Context.prototype.shiftBlocks = function (a) {
        var b, c = this.blocks;
        return a ? (b = c ? c.concat([a]) : [a], new Context(this.stack, this.global, b, this.getTemplateName())) : this
    }, Context.prototype.getTemplateName = function () {
        return this.templateName
    }, Stub.prototype.flush = function () {
        for (var a = this.head; a;) {
            if (!a.flushable)return a.error ? (this.callback(a.error), dust.log("Chunk error [" + a.error + "] thrown. Ceasing to render this template.", WARN), void(this.flush = EMPTY_FUNC)) : void 0;
            this.out += a.data.join(""), a = a.next, this.head = a
        }
        this.callback(null, this.out)
    }, Stream.prototype.flush = function () {
        for (var a = this.head; a;) {
            if (!a.flushable)return a.error ? (this.emit("error", a.error), dust.log("Chunk error [" + a.error + "] thrown. Ceasing to render this template.", WARN), void(this.flush = EMPTY_FUNC)) : void 0;
            this.emit("data", a.data.join("")), a = a.next, this.head = a
        }
        this.emit("end")
    }, Stream.prototype.emit = function (a, b) {
        if (!this.events)return dust.log("No events to emit", INFO), !1;
        var c = this.events[a];
        if (!c)return dust.log("Event type [" + a + "] does not exist", WARN), !1;
        if ("function" == typeof c)c(b); else if (dust.isArray(c))for (var d = c.slice(0), e = 0, f = d.length; f > e; e++)d[e](b); else dust.log("Event Handler [" + c + "] is not of a type that is handled by emit", WARN)
    }, Stream.prototype.on = function (a, b) {
        return this.events || (this.events = {}), this.events[a] ? "function" == typeof this.events[a] ? this.events[a] = [this.events[a], b] : this.events[a].push(b) : b ? this.events[a] = b : dust.log("Callback for type [" + a + "] does not exist. Listener not registered.", WARN), this
    }, Stream.prototype.pipe = function (a) {
        return this.on("data",function (b) {
            try {
                a.write(b, "utf8")
            } catch (c) {
                dust.log(c, ERROR)
            }
        }).on("end",function () {
                try {
                    return a.end()
                } catch (b) {
                    dust.log(b, ERROR)
                }
            }).on("error", function (b) {
                a.error(b)
            }), this
    }, Chunk.prototype.write = function (a) {
        var b = this.taps;
        return b && (a = b.go(a)), this.data.push(a), this
    }, Chunk.prototype.end = function (a) {
        return a && this.write(a), this.flushable = !0, this.root.flush(), this
    }, Chunk.prototype.map = function (a) {
        var b = new Chunk(this.root, this.next, this.taps), c = new Chunk(this.root, b, this.taps);
        this.next = c, this.flushable = !0;
        try {
            a(c)
        } catch (d) {
            dust.log(d, ERROR), c.setError(d)
        }
        return b
    }, Chunk.prototype.tap = function (a) {
        var b = this.taps;
        return this.taps = b ? b.push(a) : new Tap(a), this
    }, Chunk.prototype.untap = function () {
        return this.taps = this.taps.tail, this
    }, Chunk.prototype.render = function (a, b) {
        return a(this, b)
    }, Chunk.prototype.reference = function (a, b, c, d) {
        return"function" == typeof a && (a = a.apply(b.current(), [this, b, null, {auto: c, filters: d}]), a instanceof Chunk) ? a : dust.isEmpty(a) ? this : this.write(dust.filter(a, c, d))
    }, Chunk.prototype.section = function (a, b, c, d) {
        if ("function" == typeof a && !a.__dustBody) {
            try {
                a = a.apply(b.current(), [this, b, c, d])
            } catch (e) {
                return dust.log(e, ERROR), this.setError(e)
            }
            if (a instanceof Chunk)return a
        }
        var f = c.block, g = c["else"];
        if (d && (b = b.push(d)), dust.isArray(a)) {
            if (f) {
                var h = a.length, i = this;
                if (h > 0) {
                    b.stack.head && (b.stack.head.$len = h);
                    for (var j = 0; h > j; j++)b.stack.head && (b.stack.head.$idx = j), i = f(i, b.push(a[j], j, h));
                    return b.stack.head && (b.stack.head.$idx = void 0, b.stack.head.$len = void 0), i
                }
                if (g)return g(this, b)
            }
        } else if (a === !0) {
            if (f)return f(this, b)
        } else if (a || 0 === a) {
            if (f)return f(this, b.push(a))
        } else if (g)return g(this, b);
        return dust.log("Not rendering section (#) block in template [" + b.getTemplateName() + "], because above key was not found", DEBUG), this
    }, Chunk.prototype.exists = function (a, b, c) {
        var d = c.block, e = c["else"];
        if (dust.isEmpty(a)) {
            if (e)return e(this, b)
        } else if (d)return d(this, b);
        return dust.log("Not rendering exists (?) block in template [" + b.getTemplateName() + "], because above key was not found", DEBUG), this
    }, Chunk.prototype.notexists = function (a, b, c) {
        var d = c.block, e = c["else"];
        if (dust.isEmpty(a)) {
            if (d)return d(this, b)
        } else if (e)return e(this, b);
        return dust.log("Not rendering not exists (^) block check in template [" + b.getTemplateName() + "], because above key was found", DEBUG), this
    }, Chunk.prototype.block = function (a, b, c) {
        var d = c.block;
        return a && (d = a), d ? d(this, b) : this
    }, Chunk.prototype.partial = function (a, b, c) {
        var d;
        d = dust.makeBase(b.global), d.blocks = b.blocks, b.stack && b.stack.tail && (d.stack = b.stack.tail), c && (d = d.push(c)), "string" == typeof a && (d.templateName = a), d = d.push(b.stack.head);
        var e;
        return e = "function" == typeof a ? this.capture(a, d, function (a, b) {
            d.templateName = d.templateName || a, dust.load(a, b, d).end()
        }) : dust.load(a, this, d)
    }, Chunk.prototype.helper = function (a, b, c, d) {
        var e = this;
        if (!dust.helpers[a])return dust.log("Invalid helper [" + a + "]", WARN), e;
        try {
            return dust.helpers[a](e, b, c, d)
        } catch (f) {
            return dust.log("Error in " + a + " helper: " + f, ERROR), e.setError(f)
        }
    }, Chunk.prototype.capture = function (a, b, c) {
        return this.map(function (d) {
            var e = new Stub(function (a, b) {
                a ? d.setError(a) : c(b, d)
            });
            a(e.head, b).end()
        })
    }, Chunk.prototype.setError = function (a) {
        return this.error = a, this.root.flush(), this
    };
    for (var f in Chunk.prototype)dust._aliases[f] && (Chunk.prototype[dust._aliases[f]] = Chunk.prototype[f]);
    Tap.prototype.push = function (a) {
        return new Tap(a, this)
    }, Tap.prototype.go = function (a) {
        for (var b = this; b;)a = b.head(a), b = b.tail;
        return a
    };
    var HCHARS = /[&<>"']/, AMP = /&/g, LT = /</g, GT = />/g, QUOT = /\"/g, SQUOT = /\'/g;
    dust.escapeHtml = function (a) {
        return"string" == typeof a || a && "function" == typeof a.toString ? ("string" != typeof a && (a = a.toString()), HCHARS.test(a) ? a.replace(AMP, "&amp;").replace(LT, "&lt;").replace(GT, "&gt;").replace(QUOT, "&quot;").replace(SQUOT, "&#39;") : a) : a
    };
    var BS = /\\/g, FS = /\//g, CR = /\r/g, LS = /\u2028/g, PS = /\u2029/g, NL = /\n/g, LF = /\f/g, SQ = /'/g, DQ = /"/g, TB = /\t/g;
    dust.escapeJs = function (a) {
        return"string" == typeof a ? a.replace(BS, "\\\\").replace(FS, "\\/").replace(DQ, '\\"').replace(SQ, "\\'").replace(CR, "\\r").replace(LS, "\\u2028").replace(PS, "\\u2029").replace(NL, "\\n").replace(LF, "\\f").replace(TB, "\\t") : a
    }, dust.escapeJSON = function (a) {
        return JSON ? JSON.stringify(a).replace(LS, "\\u2028").replace(PS, "\\u2029").replace(LT, "\\u003c") : (dust.log("JSON is undefined.  JSON stringify has not been used on [" + a + "]", WARN), a)
    }, "function" == typeof define && define.amd && define.amd.dust === !0 ? define("dust.core", function () {
        return dust
    }) : "object" == typeof exports ? module.exports = dust : root.dust = dust
}(function () {
        return this
    }()), function (a, b) {
    "function" == typeof define && define.amd && define.amd.dust === !0 ? define("dust.parse", ["dust.core"], function (dust) {
        return b(dust).parse
    }) : "object" == typeof exports ? module.exports = b(require("./dust")) : b(a.dust)
}(this, function (dust) {
    var a = function () {
        function a(a, b) {
            function c() {
                this.constructor = a
            }

            c.prototype = b.prototype, a.prototype = new c
        }

        function b(a, b, c, d, e, f) {
            this.message = a, this.expected = b, this.found = c, this.offset = d, this.line = e, this.column = f, this.name = "SyntaxError"
        }

        function c(a) {
            function c() {
                return f(uc).line
            }

            function d() {
                return f(uc).column
            }

            function e(a) {
                throw h(a, null, uc)
            }

            function f(b) {
                function c(b, c, d) {
                    var e, f;
                    for (e = c; d > e; e++)f = a.charAt(e), "\n" === f ? (b.seenCR || b.line++, b.column = 1, b.seenCR = !1) : "\r" === f || "\u2028" === f || "\u2029" === f ? (b.line++, b.column = 1, b.seenCR = !0) : (b.column++, b.seenCR = !1)
                }

                return vc !== b && (vc > b && (vc = 0, wc = {line: 1, column: 1, seenCR: !1}), c(wc, vc, b), vc = b), wc
            }

            function g(a) {
                xc > tc || (tc > xc && (xc = tc, yc = []), yc.push(a))
            }

            function h(c, d, e) {
                function g(a) {
                    var b = 1;
                    for (a.sort(function (a, b) {
                        return a.description < b.description ? -1 : a.description > b.description ? 1 : 0
                    }); b < a.length;)a[b - 1] === a[b] ? a.splice(b, 1) : b++
                }

                function h(a, b) {
                    function c(a) {
                        function b(a) {
                            return a.charCodeAt(0).toString(16).toUpperCase()
                        }

                        return a.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g,function (a) {
                            return"\\x0" + b(a)
                        }).replace(/[\x10-\x1F\x80-\xFF]/g,function (a) {
                                return"\\x" + b(a)
                            }).replace(/[\u0180-\u0FFF]/g,function (a) {
                                return"\\u0" + b(a)
                            }).replace(/[\u1080-\uFFFF]/g, function (a) {
                                return"\\u" + b(a)
                            })
                    }

                    var d, e, f, g = new Array(a.length);
                    for (f = 0; f < a.length; f++)g[f] = a[f].description;
                    return d = a.length > 1 ? g.slice(0, -1).join(", ") + " or " + g[a.length - 1] : g[0], e = b ? '"' + c(b) + '"' : "end of input", "Expected " + d + " but " + e + " found."
                }

                var i = f(e), j = e < a.length ? a.charAt(e) : null;
                return null !== d && g(d), new b(null !== c ? c : h(d, j), d, j, e, i.line, i.column)
            }

            function i() {
                var a;
                return a = j()
            }

            function j() {
                var a, b, c;
                for (a = tc, b = [], c = k(); c !== V;)b.push(c), c = k();
                return b !== V && (uc = a, b = Y(b)), a = b
            }

            function k() {
                var a;
                return a = K(), a === V && (a = L(), a === V && (a = l(), a === V && (a = s(), a === V && (a = u(), a === V && (a = r(), a === V && (a = H())))))), a
            }

            function l() {
                var b, c, d, e, f, h, i, k;
                if (zc++, b = tc, c = m(), c !== V) {
                    for (d = [], e = S(); e !== V;)d.push(e), e = S();
                    d !== V ? (e = O(), e !== V ? (f = j(), f !== V ? (h = q(), h !== V ? (i = n(), i === V && (i = _), i !== V ? (uc = tc, k = aa(c, f, h, i), k = k ? ba : $, k !== V ? (uc = b, c = ca(c, f, h, i), b = c) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)
                } else tc = b, b = $;
                if (b === V)if (b = tc, c = m(), c !== V) {
                    for (d = [], e = S(); e !== V;)d.push(e), e = S();
                    d !== V ? (47 === a.charCodeAt(tc) ? (e = da, tc++) : (e = V, 0 === zc && g(ea)), e !== V ? (f = O(), f !== V ? (uc = b, c = fa(c), b = c) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)
                } else tc = b, b = $;
                return zc--, b === V && (c = V, 0 === zc && g(Z)), b
            }

            function m() {
                var b, c, d, e, f, h, i;
                if (b = tc, c = N(), c !== V)if (ga.test(a.charAt(tc)) ? (d = a.charAt(tc), tc++) : (d = V, 0 === zc && g(ha)), d !== V) {
                    for (e = [], f = S(); f !== V;)e.push(f), f = S();
                    e !== V ? (f = v(), f !== V ? (h = o(), h !== V ? (i = p(), i !== V ? (uc = b, c = ia(d, f, h, i), b = c) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)
                } else tc = b, b = $; else tc = b, b = $;
                return b
            }

            function n() {
                var b, c, d, e, f, h, i;
                if (zc++, b = tc, c = N(), c !== V)if (47 === a.charCodeAt(tc) ? (d = da, tc++) : (d = V, 0 === zc && g(ea)), d !== V) {
                    for (e = [], f = S(); f !== V;)e.push(f), f = S();
                    if (e !== V)if (f = v(), f !== V) {
                        for (h = [], i = S(); i !== V;)h.push(i), i = S();
                        h !== V ? (i = O(), i !== V ? (uc = b, c = ka(f), b = c) : (tc = b, b = $)) : (tc = b, b = $)
                    } else tc = b, b = $; else tc = b, b = $
                } else tc = b, b = $; else tc = b, b = $;
                return zc--, b === V && (c = V, 0 === zc && g(ja)), b
            }

            function o() {
                var b, c, d, e;
                return b = tc, c = tc, 58 === a.charCodeAt(tc) ? (d = la, tc++) : (d = V, 0 === zc && g(ma)), d !== V ? (e = v(), e !== V ? (uc = c, d = na(e), c = d) : (tc = c, c = $)) : (tc = c, c = $), c === V && (c = _), c !== V && (uc = b, c = oa(c)), b = c
            }

            function p() {
                var b, c, d, e, f, h, i;
                if (zc++, b = tc, c = [], d = tc, e = [], f = S(), f !== V)for (; f !== V;)e.push(f), f = S(); else e = $;
                for (e !== V ? (f = C(), f !== V ? (61 === a.charCodeAt(tc) ? (h = qa, tc++) : (h = V, 0 === zc && g(ra)), h !== V ? (i = w(), i === V && (i = v(), i === V && (i = F())), i !== V ? (uc = d, e = sa(f, i), d = e) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $); d !== V;) {
                    if (c.push(d), d = tc, e = [], f = S(), f !== V)for (; f !== V;)e.push(f), f = S(); else e = $;
                    e !== V ? (f = C(), f !== V ? (61 === a.charCodeAt(tc) ? (h = qa, tc++) : (h = V, 0 === zc && g(ra)), h !== V ? (i = w(), i === V && (i = v(), i === V && (i = F())), i !== V ? (uc = d, e = sa(f, i), d = e) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)
                }
                return c !== V && (uc = b, c = ta(c)), b = c, zc--, b === V && (c = V, 0 === zc && g(pa)), b
            }

            function q() {
                var b, c, d, e, f, h, i, k;
                for (zc++, b = tc, c = [], d = tc, e = N(), e !== V ? (58 === a.charCodeAt(tc) ? (f = la, tc++) : (f = V, 0 === zc && g(ma)), f !== V ? (h = C(), h !== V ? (i = O(), i !== V ? (k = j(), k !== V ? (uc = d, e = sa(h, k), d = e) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $); d !== V;)c.push(d), d = tc, e = N(), e !== V ? (58 === a.charCodeAt(tc) ? (f = la, tc++) : (f = V, 0 === zc && g(ma)), f !== V ? (h = C(), h !== V ? (i = O(), i !== V ? (k = j(), k !== V ? (uc = d, e = sa(h, k), d = e) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $);
                return c !== V && (uc = b, c = va(c)), b = c, zc--, b === V && (c = V, 0 === zc && g(ua)), b
            }

            function r() {
                var a, b, c, d, e;
                return zc++, a = tc, b = N(), b !== V ? (c = v(), c !== V ? (d = t(), d !== V ? (e = O(), e !== V ? (uc = a, b = xa(c, d), a = b) : (tc = a, a = $)) : (tc = a, a = $)) : (tc = a, a = $)) : (tc = a, a = $), zc--, a === V && (b = V, 0 === zc && g(wa)), a
            }

            function s() {
                var b, c, d, e, f, h, i, j, k, l;
                if (zc++, b = tc, c = N(), c !== V)if (62 === a.charCodeAt(tc) ? (d = za, tc++) : (d = V, 0 === zc && g(Aa)), d === V && (43 === a.charCodeAt(tc) ? (d = Ba, tc++) : (d = V, 0 === zc && g(Ca))), d !== V) {
                    for (e = [], f = S(); f !== V;)e.push(f), f = S();
                    if (e !== V)if (f = tc, h = C(), h !== V && (uc = f, h = Da(h)), f = h, f === V && (f = F()), f !== V)if (h = o(), h !== V)if (i = p(), i !== V) {
                        for (j = [], k = S(); k !== V;)j.push(k), k = S();
                        j !== V ? (47 === a.charCodeAt(tc) ? (k = da, tc++) : (k = V, 0 === zc && g(ea)), k !== V ? (l = O(), l !== V ? (uc = b, c = Ea(d, f, h, i), b = c) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)
                    } else tc = b, b = $; else tc = b, b = $; else tc = b, b = $; else tc = b, b = $
                } else tc = b, b = $; else tc = b, b = $;
                return zc--, b === V && (c = V, 0 === zc && g(ya)), b
            }

            function t() {
                var b, c, d, e, f;
                for (zc++, b = tc, c = [], d = tc, 124 === a.charCodeAt(tc) ? (e = Ga, tc++) : (e = V, 0 === zc && g(Ha)), e !== V ? (f = C(), f !== V ? (uc = d, e = na(f), d = e) : (tc = d, d = $)) : (tc = d, d = $); d !== V;)c.push(d), d = tc, 124 === a.charCodeAt(tc) ? (e = Ga, tc++) : (e = V, 0 === zc && g(Ha)), e !== V ? (f = C(), f !== V ? (uc = d, e = na(f), d = e) : (tc = d, d = $)) : (tc = d, d = $);
                return c !== V && (uc = b, c = Ia(c)), b = c, zc--, b === V && (c = V, 0 === zc && g(Fa)), b
            }

            function u() {
                var b, c, d, e, f;
                return zc++, b = tc, c = N(), c !== V ? (126 === a.charCodeAt(tc) ? (d = Ka, tc++) : (d = V, 0 === zc && g(La)), d !== V ? (e = C(), e !== V ? (f = O(), f !== V ? (uc = b, c = Ma(e), b = c) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $), zc--, b === V && (c = V, 0 === zc && g(Ja)), b
            }

            function v() {
                var a, b;
                return zc++, a = tc, b = B(), b !== V && (uc = a, b = Oa(b)), a = b, a === V && (a = tc, b = C(), b !== V && (uc = a, b = Pa(b)), a = b), zc--, a === V && (b = V, 0 === zc && g(Na)), a
            }

            function w() {
                var a, b;
                return zc++, a = tc, b = x(), b === V && (b = A()), b !== V && (uc = a, b = Ra(b)), a = b, zc--, a === V && (b = V, 0 === zc && g(Qa)), a
            }

            function x() {
                var b, c, d, e;
                return zc++, b = tc, c = A(), c !== V ? (46 === a.charCodeAt(tc) ? (d = Ta, tc++) : (d = V, 0 === zc && g(Ua)), d !== V ? (e = y(), e !== V ? (uc = b, c = Va(c, e), b = c) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $), zc--, b === V && (c = V, 0 === zc && g(Sa)), b
            }

            function y() {
                var b, c, d;
                if (zc++, b = tc, c = [], Xa.test(a.charAt(tc)) ? (d = a.charAt(tc), tc++) : (d = V, 0 === zc && g(Ya)), d !== V)for (; d !== V;)c.push(d), Xa.test(a.charAt(tc)) ? (d = a.charAt(tc), tc++) : (d = V, 0 === zc && g(Ya)); else c = $;
                return c !== V && (uc = b, c = Za(c)), b = c, zc--, b === V && (c = V, 0 === zc && g(Wa)), b
            }

            function z() {
                var b, c, d;
                return zc++, b = tc, 45 === a.charCodeAt(tc) ? (c = _a, tc++) : (c = V, 0 === zc && g(ab)), c !== V ? (d = y(), d !== V ? (uc = b, c = bb(c, d), b = c) : (tc = b, b = $)) : (tc = b, b = $), zc--, b === V && (c = V, 0 === zc && g($a)), b
            }

            function A() {
                var a, b;
                return zc++, a = z(), a === V && (a = y()), zc--, a === V && (b = V, 0 === zc && g(cb)), a
            }

            function B() {
                var b, c, d, e;
                if (zc++, b = tc, c = C(), c === V && (c = _), c !== V) {
                    if (d = [], e = E(), e === V && (e = D()), e !== V)for (; e !== V;)d.push(e), e = E(), e === V && (e = D()); else d = $;
                    d !== V ? (uc = b, c = eb(c, d), b = c) : (tc = b, b = $)
                } else tc = b, b = $;
                if (b === V)if (b = tc, 46 === a.charCodeAt(tc) ? (c = Ta, tc++) : (c = V, 0 === zc && g(Ua)), c !== V) {
                    for (d = [], e = E(), e === V && (e = D()); e !== V;)d.push(e), e = E(), e === V && (e = D());
                    d !== V ? (uc = b, c = fb(d), b = c) : (tc = b, b = $)
                } else tc = b, b = $;
                return zc--, b === V && (c = V, 0 === zc && g(db)), b
            }

            function C() {
                var b, c, d, e;
                if (zc++, b = tc, hb.test(a.charAt(tc)) ? (c = a.charAt(tc), tc++) : (c = V, 0 === zc && g(ib)), c !== V) {
                    for (d = [], jb.test(a.charAt(tc)) ? (e = a.charAt(tc), tc++) : (e = V, 0 === zc && g(kb)); e !== V;)d.push(e), jb.test(a.charAt(tc)) ? (e = a.charAt(tc), tc++) : (e = V, 0 === zc && g(kb));
                    d !== V ? (uc = b, c = lb(c, d), b = c) : (tc = b, b = $)
                } else tc = b, b = $;
                return zc--, b === V && (c = V, 0 === zc && g(gb)), b
            }

            function D() {
                var b, c, d, e, f, h;
                if (zc++, b = tc, c = tc, d = P(), d !== V) {
                    if (e = tc, f = [], Xa.test(a.charAt(tc)) ? (h = a.charAt(tc), tc++) : (h = V, 0 === zc && g(Ya)), h !== V)for (; h !== V;)f.push(h), Xa.test(a.charAt(tc)) ? (h = a.charAt(tc), tc++) : (h = V, 0 === zc && g(Ya)); else f = $;
                    f !== V && (uc = e, f = nb(f)), e = f, e === V && (e = v()), e !== V ? (f = Q(), f !== V ? (uc = c, d = ob(e), c = d) : (tc = c, c = $)) : (tc = c, c = $)
                } else tc = c, c = $;
                return c !== V ? (d = E(), d === V && (d = _), d !== V ? (uc = b, c = pb(c, d), b = c) : (tc = b, b = $)) : (tc = b, b = $), zc--, b === V && (c = V, 0 === zc && g(mb)), b
            }

            function E() {
                var b, c, d, e, f;
                if (zc++, b = tc, c = [], d = tc, 46 === a.charCodeAt(tc) ? (e = Ta, tc++) : (e = V, 0 === zc && g(Ua)), e !== V ? (f = C(), f !== V ? (uc = d, e = rb(f), d = e) : (tc = d, d = $)) : (tc = d, d = $), d !== V)for (; d !== V;)c.push(d), d = tc, 46 === a.charCodeAt(tc) ? (e = Ta, tc++) : (e = V, 0 === zc && g(Ua)), e !== V ? (f = C(), f !== V ? (uc = d, e = rb(f), d = e) : (tc = d, d = $)) : (tc = d, d = $); else c = $;
                return c !== V ? (d = D(), d === V && (d = _), d !== V ? (uc = b, c = sb(c, d), b = c) : (tc = b, b = $)) : (tc = b, b = $), zc--, b === V && (c = V, 0 === zc && g(qb)), b
            }

            function F() {
                var b, c, d, e;
                if (zc++, b = tc, 34 === a.charCodeAt(tc) ? (c = ub, tc++) : (c = V, 0 === zc && g(vb)), c !== V ? (34 === a.charCodeAt(tc) ? (d = ub, tc++) : (d = V, 0 === zc && g(vb)), d !== V ? (uc = b, c = wb(), b = c) : (tc = b, b = $)) : (tc = b, b = $), b === V && (b = tc, 34 === a.charCodeAt(tc) ? (c = ub, tc++) : (c = V, 0 === zc && g(vb)), c !== V ? (d = I(), d !== V ? (34 === a.charCodeAt(tc) ? (e = ub, tc++) : (e = V, 0 === zc && g(vb)), e !== V ? (uc = b, c = xb(d), b = c) : (tc = b, b = $)) : (tc = b, b = $)) : (tc = b, b = $), b === V))if (b = tc, 34 === a.charCodeAt(tc) ? (c = ub, tc++) : (c = V, 0 === zc && g(vb)), c !== V) {
                    if (d = [], e = G(), e !== V)for (; e !== V;)d.push(e), e = G(); else d = $;
                    d !== V ? (34 === a.charCodeAt(tc) ? (e = ub, tc++) : (e = V, 0 === zc && g(vb)), e !== V ? (uc = b, c = yb(d), b = c) : (tc = b, b = $)) : (tc = b, b = $)
                } else tc = b, b = $;
                return zc--, b === V && (c = V, 0 === zc && g(tb)), b
            }

            function G() {
                var a, b;
                return a = u(), a === V && (a = r(), a === V && (a = tc, b = I(), b !== V && (uc = a, b = zb(b)), a = b)), a
            }

            function H() {
                var b, c, d, e, f, h, i, j;
                if (zc++, b = tc, c = R(), c !== V) {
                    for (d = [], e = S(); e !== V;)d.push(e), e = S();
                    d !== V ? (uc = b, c = Bb(c, d), b = c) : (tc = b, b = $)
                } else tc = b, b = $;
                if (b === V) {
                    if (b = tc, c = [], d = tc, e = tc, zc++, f = M(), zc--, f === V ? e = ba : (tc = e, e = $), e !== V ? (f = tc, zc++, h = K(), zc--, h === V ? f = ba : (tc = f, f = $), f !== V ? (h = tc, zc++, i = L(), zc--, i === V ? h = ba : (tc = h, h = $), h !== V ? (i = tc, zc++, j = R(), zc--, j === V ? i = ba : (tc = i, i = $), i !== V ? (a.length > tc ? (j = a.charAt(tc), tc++) : (j = V, 0 === zc && g(Cb)), j !== V ? (uc = d, e = Db(j), d = e) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $), d !== V)for (; d !== V;)c.push(d), d = tc, e = tc, zc++, f = M(), zc--, f === V ? e = ba : (tc = e, e = $), e !== V ? (f = tc, zc++, h = K(), zc--, h === V ? f = ba : (tc = f, f = $), f !== V ? (h = tc, zc++, i = L(), zc--, i === V ? h = ba : (tc = h, h = $), h !== V ? (i = tc, zc++, j = R(), zc--, j === V ? i = ba : (tc = i, i = $), i !== V ? (a.length > tc ? (j = a.charAt(tc), tc++) : (j = V, 0 === zc && g(Cb)), j !== V ? (uc = d, e = Db(j), d = e) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $)) : (tc = d, d = $); else c = $;
                    c !== V && (uc = b, c = Eb(c)), b = c
                }
                return zc--, b === V && (c = V, 0 === zc && g(Ab)), b
            }

            function I() {
                var b, c, d, e, f;
                if (zc++, b = tc, c = [], d = tc, e = tc, zc++, f = M(), zc--, f === V ? e = ba : (tc = e, e = $), e !== V ? (f = J(), f === V && (Gb.test(a.charAt(tc)) ? (f = a.charAt(tc), tc++) : (f = V, 0 === zc && g(Hb))), f !== V ? (uc = d, e = Db(f), d = e) : (tc = d, d = $)) : (tc = d, d = $), d !== V)for (; d !== V;)c.push(d), d = tc, e = tc, zc++, f = M(), zc--, f === V ? e = ba : (tc = e, e = $), e !== V ? (f = J(), f === V && (Gb.test(a.charAt(tc)) ? (f = a.charAt(tc), tc++) : (f = V, 0 === zc && g(Hb))), f !== V ? (uc = d, e = Db(f), d = e) : (tc = d, d = $)) : (tc = d, d = $); else c = $;
                return c !== V && (uc = b, c = Ib(c)), b = c, zc--, b === V && (c = V, 0 === zc && g(Fb)), b
            }

            function J() {
                var b, c;
                return b = tc, a.substr(tc, 2) === Jb ? (c = Jb, tc += 2) : (c = V, 0 === zc && g(Kb)), c !== V && (uc = b, c = Lb()), b = c
            }

            function K() {
                var b, c, d, e, f, h;
                if (zc++, b = tc, a.substr(tc, 2) === Nb ? (c = Nb, tc += 2) : (c = V, 0 === zc && g(Ob)), c !== V) {
                    for (d = [], e = tc, f = tc, zc++, a.substr(tc, 2) === Pb ? (h = Pb, tc += 2) : (h = V, 0 === zc && g(Qb)), zc--, h === V ? f = ba : (tc = f, f = $), f !== V ? (a.length > tc ? (h = a.charAt(tc), tc++) : (h = V, 0 === zc && g(Cb)), h !== V ? (uc = e, f = Rb(h), e = f) : (tc = e, e = $)) : (tc = e, e = $); e !== V;)d.push(e), e = tc, f = tc, zc++, a.substr(tc, 2) === Pb ? (h = Pb, tc += 2) : (h = V, 0 === zc && g(Qb)), zc--, h === V ? f = ba : (tc = f, f = $), f !== V ? (a.length > tc ? (h = a.charAt(tc), tc++) : (h = V, 0 === zc && g(Cb)), h !== V ? (uc = e, f = Rb(h), e = f) : (tc = e, e = $)) : (tc = e, e = $);
                    d !== V ? (a.substr(tc, 2) === Pb ? (e = Pb, tc += 2) : (e = V, 0 === zc && g(Qb)), e !== V ? (uc = b, c = Sb(d), b = c) : (tc = b, b = $)) : (tc = b, b = $)
                } else tc = b, b = $;
                return zc--, b === V && (c = V, 0 === zc && g(Mb)), b
            }

            function L() {
                var b, c, d, e, f, h;
                if (zc++, b = tc, a.substr(tc, 2) === Ub ? (c = Ub, tc += 2) : (c = V, 0 === zc && g(Vb)), c !== V) {
                    for (d = [], e = tc, f = tc, zc++, a.substr(tc, 2) === Wb ? (h = Wb, tc += 2) : (h = V, 0 === zc && g(Xb)), zc--, h === V ? f = ba : (tc = f, f = $), f !== V ? (a.length > tc ? (h = a.charAt(tc), tc++) : (h = V, 0 === zc && g(Cb)), h !== V ? (uc = e, f = Db(h), e = f) : (tc = e, e = $)) : (tc = e, e = $); e !== V;)d.push(e), e = tc, f = tc, zc++, a.substr(tc, 2) === Wb ? (h = Wb, tc += 2) : (h = V, 0 === zc && g(Xb)), zc--, h === V ? f = ba : (tc = f, f = $), f !== V ? (a.length > tc ? (h = a.charAt(tc), tc++) : (h = V, 0 === zc && g(Cb)), h !== V ? (uc = e, f = Db(h), e = f) : (tc = e, e = $)) : (tc = e, e = $);
                    d !== V ? (a.substr(tc, 2) === Wb ? (e = Wb, tc += 2) : (e = V, 0 === zc && g(Xb)), e !== V ? (uc = b, c = Yb(d), b = c) : (tc = b, b = $)) : (tc = b, b = $)
                } else tc = b, b = $;
                return zc--, b === V && (c = V, 0 === zc && g(Tb)), b
            }

            function M() {
                var b, c, d, e, f, h, i, j, k, l;
                if (b = tc, c = N(), c !== V) {
                    for (d = [], e = S(); e !== V;)d.push(e), e = S();
                    if (d !== V)if (Zb.test(a.charAt(tc)) ? (e = a.charAt(tc), tc++) : (e = V, 0 === zc && g($b)), e !== V) {
                        for (f = [], h = S(); h !== V;)f.push(h), h = S();
                        if (f !== V) {
                            if (h = [], i = tc, j = tc, zc++, k = O(), zc--, k === V ? j = ba : (tc = j, j = $), j !== V ? (k = tc, zc++, l = R(), zc--, l === V ? k = ba : (tc = k, k = $), k !== V ? (a.length > tc ? (l = a.charAt(tc), tc++) : (l = V, 0 === zc && g(Cb)), l !== V ? (j = [j, k, l], i = j) : (tc = i, i = $)) : (tc = i, i = $)) : (tc = i, i = $), i !== V)for (; i !== V;)h.push(i), i = tc, j = tc, zc++, k = O(), zc--, k === V ? j = ba : (tc = j, j = $), j !== V ? (k = tc, zc++, l = R(), zc--, l === V ? k = ba : (tc = k, k = $), k !== V ? (a.length > tc ? (l = a.charAt(tc), tc++) : (l = V, 0 === zc && g(Cb)), l !== V ? (j = [j, k, l], i = j) : (tc = i, i = $)) : (tc = i, i = $)) : (tc = i, i = $); else h = $;
                            if (h !== V) {
                                for (i = [], j = S(); j !== V;)i.push(j), j = S();
                                i !== V ? (j = O(), j !== V ? (c = [c, d, e, f, h, i, j], b = c) : (tc = b, b = $)) : (tc = b, b = $)
                            } else tc = b, b = $
                        } else tc = b, b = $
                    } else tc = b, b = $; else tc = b, b = $
                } else tc = b, b = $;
                return b === V && (b = r()), b
            }

            function N() {
                var b;
                return 123 === a.charCodeAt(tc) ? (b = _b, tc++) : (b = V, 0 === zc && g(ac)), b
            }

            function O() {
                var b;
                return 125 === a.charCodeAt(tc) ? (b = bc, tc++) : (b = V, 0 === zc && g(cc)), b
            }

            function P() {
                var b;
                return 91 === a.charCodeAt(tc) ? (b = dc, tc++) : (b = V, 0 === zc && g(ec)), b
            }

            function Q() {
                var b;
                return 93 === a.charCodeAt(tc) ? (b = fc, tc++) : (b = V, 0 === zc && g(gc)), b
            }

            function R() {
                var b;
                return 10 === a.charCodeAt(tc) ? (b = hc, tc++) : (b = V, 0 === zc && g(ic)), b === V && (a.substr(tc, 2) === jc ? (b = jc, tc += 2) : (b = V, 0 === zc && g(kc)), b === V && (13 === a.charCodeAt(tc) ? (b = lc, tc++) : (b = V, 0 === zc && g(mc)), b === V && (8232 === a.charCodeAt(tc) ? (b = nc, tc++) : (b = V, 0 === zc && g(oc)), b === V && (8233 === a.charCodeAt(tc) ? (b = pc, tc++) : (b = V, 0 === zc && g(qc)))))), b
            }

            function S() {
                var b;
                return rc.test(a.charAt(tc)) ? (b = a.charAt(tc), tc++) : (b = V, 0 === zc && g(sc)), b === V && (b = R()), b
            }

            var T, U = arguments.length > 1 ? arguments[1] : {}, V = {}, W = {start: i}, X = i, Y = function (a) {
                return["body"].concat(a).concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, Z = {type: "other", description: "section"}, $ = V, _ = null, aa = function (a, b, c, d) {
                return d && a[1].text === d.text || e("Expected end tag for " + a[1].text + " but it was not found."), !0
            }, ba = void 0, ca = function (a, b, e) {
                return e.push(["param", ["literal", "block"], b]), a.push(e), a.concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, da = "/", ea = {type: "literal", value: "/", description: '"/"'}, fa = function (a) {
                return a.push(["bodies"]), a.concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, ga = /^[#?\^<+@%]/, ha = {type: "class", value: "[#?\\^<+@%]", description: "[#?\\^<+@%]"}, ia = function (a, b, c, d) {
                return[a, b, c, d]
            }, ja = {type: "other", description: "end tag"}, ka = function (a) {
                return a
            }, la = ":", ma = {type: "literal", value: ":", description: '":"'}, na = function (a) {
                return a
            }, oa = function (a) {
                return a ? ["context", a] : ["context"]
            }, pa = {type: "other", description: "params"}, qa = "=", ra = {type: "literal", value: "=", description: '"="'}, sa = function (a, b) {
                return["param", ["literal", a], b]
            }, ta = function (a) {
                return["params"].concat(a)
            }, ua = {type: "other", description: "bodies"}, va = function (a) {
                return["bodies"].concat(a)
            }, wa = {type: "other", description: "reference"}, xa = function (a, b) {
                return["reference", a, b].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, ya = {type: "other", description: "partial"}, za = ">", Aa = {type: "literal", value: ">", description: '">"'}, Ba = "+", Ca = {type: "literal", value: "+", description: '"+"'}, Da = function (a) {
                return["literal", a]
            }, Ea = function (a, b, e, f) {
                var g = ">" === a ? "partial" : a;
                return[g, b, e, f].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, Fa = {type: "other", description: "filters"}, Ga = "|", Ha = {type: "literal", value: "|", description: '"|"'}, Ia = function (a) {
                return["filters"].concat(a)
            }, Ja = {type: "other", description: "special"}, Ka = "~", La = {type: "literal", value: "~", description: '"~"'}, Ma = function (a) {
                return["special", a].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, Na = {type: "other", description: "identifier"}, Oa = function (a) {
                var b = ["path"].concat(a);
                return b.text = a[1].join(".").replace(/,line,\d+,col,\d+/g, ""), b
            }, Pa = function (a) {
                var b = ["key", a];
                return b.text = a, b
            }, Qa = {type: "other", description: "number"}, Ra = function (a) {
                return["literal", a]
            }, Sa = {type: "other", description: "float"}, Ta = ".", Ua = {type: "literal", value: ".", description: '"."'}, Va = function (a, b) {
                return parseFloat(a + "." + b)
            }, Wa = {type: "other", description: "unsigned_integer"}, Xa = /^[0-9]/, Ya = {type: "class", value: "[0-9]", description: "[0-9]"}, Za = function (a) {
                return parseInt(a.join(""), 10)
            }, $a = {type: "other", description: "signed_integer"}, _a = "-", ab = {type: "literal", value: "-", description: '"-"'}, bb = function (a, b) {
                return-1 * b
            }, cb = {type: "other", description: "integer"}, db = {type: "other", description: "path"}, eb = function (a, b) {
                return b = b[0], a && b ? (b.unshift(a), [!1, b].concat([
                    ["line", c()],
                    ["col", d()]
                ])) : [!0, b].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, fb = function (a) {
                return a.length > 0 ? [!0, a[0]].concat([
                    ["line", c()],
                    ["col", d()]
                ]) : [!0, []].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, gb = {type: "other", description: "key"}, hb = /^[a-zA-Z_$]/, ib = {type: "class", value: "[a-zA-Z_$]", description: "[a-zA-Z_$]"}, jb = /^[0-9a-zA-Z_$\-]/, kb = {type: "class", value: "[0-9a-zA-Z_$\\-]", description: "[0-9a-zA-Z_$\\-]"}, lb = function (a, b) {
                return a + b.join("")
            }, mb = {type: "other", description: "array"}, nb = function (a) {
                return a.join("")
            }, ob = function (a) {
                return a
            }, pb = function (a, b) {
                return b ? b.unshift(a) : b = [a], b
            }, qb = {type: "other", description: "array_part"}, rb = function (a) {
                return a
            }, sb = function (a, b) {
                return b ? a.concat(b) : a
            }, tb = {type: "other", description: "inline"}, ub = '"', vb = {type: "literal", value: '"', description: '"\\""'}, wb = function () {
                return["literal", ""].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, xb = function (a) {
                return["literal", a].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, yb = function (a) {
                return["body"].concat(a).concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, zb = function (a) {
                return["buffer", a]
            }, Ab = {type: "other", description: "buffer"}, Bb = function (a, b) {
                return["format", a, b.join("")].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, Cb = {type: "any", description: "any character"}, Db = function (a) {
                return a
            }, Eb = function (a) {
                return["buffer", a.join("")].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, Fb = {type: "other", description: "literal"}, Gb = /^[^"]/, Hb = {type: "class", value: '[^"]', description: '[^"]'}, Ib = function (a) {
                return a.join("")
            }, Jb = '\\"', Kb = {type: "literal", value: '\\"', description: '"\\\\\\""'}, Lb = function () {
                return'"'
            }, Mb = {type: "other", description: "raw"}, Nb = "{`", Ob = {type: "literal", value: "{`", description: '"{`"'}, Pb = "`}", Qb = {type: "literal", value: "`}", description: '"`}"'}, Rb = function (a) {
                return a
            }, Sb = function (a) {
                return["raw", a.join("")].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, Tb = {type: "other", description: "comment"}, Ub = "{!", Vb = {type: "literal", value: "{!", description: '"{!"'}, Wb = "!}", Xb = {type: "literal", value: "!}", description: '"!}"'}, Yb = function (a) {
                return["comment", a.join("")].concat([
                    ["line", c()],
                    ["col", d()]
                ])
            }, Zb = /^[#?\^><+%:@\/~%]/, $b = {type: "class", value: "[#?\\^><+%:@\\/~%]", description: "[#?\\^><+%:@\\/~%]"}, _b = "{", ac = {type: "literal", value: "{", description: '"{"'}, bc = "}", cc = {type: "literal", value: "}", description: '"}"'}, dc = "[", ec = {type: "literal", value: "[", description: '"["'}, fc = "]", gc = {type: "literal", value: "]", description: '"]"'}, hc = "\n", ic = {type: "literal", value: "\n", description: '"\\n"'}, jc = "\r\n", kc = {type: "literal", value: "\r\n", description: '"\\r\\n"'}, lc = "\r", mc = {type: "literal", value: "\r", description: '"\\r"'}, nc = "\u2028", oc = {type: "literal", value: "\u2028", description: '"\\u2028"'}, pc = "\u2029", qc = {type: "literal", value: "\u2029", description: '"\\u2029"'}, rc = /^[\t\x0B\f \xA0\uFEFF]/, sc = {type: "class", value: "[\\t\\x0B\\f \\xA0\\uFEFF]", description: "[\\t\\x0B\\f \\xA0\\uFEFF]"}, tc = 0, uc = 0, vc = 0, wc = {line: 1, column: 1, seenCR: !1}, xc = 0, yc = [], zc = 0;
            if ("startRule"in U) {
                if (!(U.startRule in W))throw new Error("Can't start parsing from rule \"" + U.startRule + '".');
                X = W[U.startRule]
            }
            if (T = X(), T !== V && tc === a.length)return T;
            throw T !== V && tc < a.length && g({type: "end", description: "end of input"}), h(null, yc, xc)
        }

        return a(b, Error), {SyntaxError: b, parse: c}
    }();
    return dust.parse = a.parse, a
}), function (a, b) {
    "function" == typeof define && define.amd && define.amd.dust === !0 ? define("dust.compile", ["dust.core", "dust.parse"], function (dust, a) {
        return b(a, dust).compile
    }) : "object" == typeof exports ? module.exports = b(require("./parser").parse, require("./dust")) : b(a.dust.parse, a.dust)
}(this, function (a, dust) {
    function b(a) {
        var b = {};
        return o.filterNode(b, a)
    }

    function c(a, b) {
        var c, d, e, f = [b[0]];
        for (c = 1, d = b.length; d > c; c++)e = o.filterNode(a, b[c]), e && f.push(e);
        return f
    }

    function d(a, b) {
        var c, d, e, f, g = [b[0]];
        for (d = 1, e = b.length; e > d; d++)f = o.filterNode(a, b[d]), f && ("buffer" === f[0] || "format" === f[0] ? c ? (c[0] = "buffer" === f[0] ? "buffer" : c[0], c[1] += f.slice(1, -2).join("")) : (c = f, g.push(f)) : (c = null, g.push(f)));
        return g
    }

    function e(a, b) {
        return["buffer", q[b[1]], b[2], b[3]]
    }

    function f(a, b) {
        return b
    }

    function g() {
    }

    function h(a, b) {
        return dust.config.whitespace ? (b.splice(1, 2, b.slice(1, -2).join("")), b) : null
    }

    function i(a, b) {
        var c = {name: b, bodies: [], blocks: {}, index: 0, auto: "h"}, d = dust.escapeJs(b), e = "function(dust){dust.register(" + (b ? '"' + d + '"' : "null") + "," + o.compileNode(c, a) + ");" + j(c) + k(c) + "return body_0;}";
        return dust.config.amd ? 'define("' + d + '",["dust.core"],' + e + ");" : "(" + e + ")(dust);"
    }

    function j(a) {
        var b, c = [], d = a.blocks;
        for (b in d)c.push('"' + b + '":' + d[b]);
        return c.length ? (a.blocks = "ctx=ctx.shiftBlocks(blocks);", "var blocks={" + c.join(",") + "};") : a.blocks = ""
    }

    function k(a) {
        var b, c, d = [], e = a.bodies, f = a.blocks;
        for (b = 0, c = e.length; c > b; b++)d[b] = "function body_" + b + "(chk,ctx){" + f + "return chk" + e[b] + ";}body_" + b + ".__dustBody=!0;";
        return d.join("")
    }

    function l(a, b) {
        var c, d, e = "";
        for (c = 1, d = b.length; d > c; c++)e += o.compileNode(a, b[c]);
        return e
    }

    function m(a, b, c) {
        return"." + (dust._aliases[c] || c) + "(" + o.compileNode(a, b[1]) + "," + o.compileNode(a, b[2]) + "," + o.compileNode(a, b[4]) + "," + o.compileNode(a, b[3]) + ")"
    }

    function n(a) {
        return a.replace(r, "\\\\").replace(s, '\\"').replace(t, "\\f").replace(u, "\\n").replace(v, "\\r").replace(w, "\\t")
    }

    var o = {}, p = dust.isArray;
    o.compile = function (c, d) {
        if (!d && null !== d)throw new Error("Template name parameter cannot be undefined when calling dust.compile");
        try {
            var e = b(a(c));
            return i(e, d)
        } catch (f) {
            if (!f.line || !f.column)throw f;
            throw new SyntaxError(f.message + " At line : " + f.line + ", column : " + f.column)
        }
    }, o.filterNode = function (a, b) {
        return o.optimizers[b[0]](a, b)
    }, o.optimizers = {body: d, buffer: f, special: e, format: h, reference: c, "#": c, "?": c, "^": c, "<": c, "+": c, "@": c, "%": c, partial: c, context: c, params: c, bodies: c, param: c, filters: f, key: f, path: f, literal: f, raw: f, comment: g, line: g, col: g}, o.pragmas = {esc: function (a, b, c) {
        var d, e = a.auto;
        return b || (b = "h"), a.auto = "s" === b ? "" : b, d = l(a, c.block), a.auto = e, d
    }};
    var q = {s: " ", n: "\n", r: "\r", lb: "{", rb: "}"};
    o.compileNode = function (a, b) {
        return o.nodes[b[0]](a, b)
    }, o.nodes = {body: function (a, b) {
        var c = a.index++, d = "body_" + c;
        return a.bodies[c] = l(a, b), d
    }, buffer: function (a, b) {
        return".w(" + x(b[1]) + ")"
    }, format: function (a, b) {
        return".w(" + x(b[1]) + ")"
    }, reference: function (a, b) {
        return".f(" + o.compileNode(a, b[1]) + ",ctx," + o.compileNode(a, b[2]) + ")"
    }, "#": function (a, b) {
        return m(a, b, "section")
    }, "?": function (a, b) {
        return m(a, b, "exists")
    }, "^": function (a, b) {
        return m(a, b, "notexists")
    }, "<": function (a, b) {
        for (var c = b[4], d = 1, e = c.length; e > d; d++) {
            var f = c[d], g = f[1][1];
            if ("block" === g)return a.blocks[b[1].text] = o.compileNode(a, f[2]), ""
        }
        return""
    }, "+": function (a, b) {
        return"undefined" == typeof b[1].text && "undefined" == typeof b[4] ? ".block(ctx.getBlock(" + o.compileNode(a, b[1]) + ",chk, ctx)," + o.compileNode(a, b[2]) + ", {}," + o.compileNode(a, b[3]) + ")" : ".block(ctx.getBlock(" + x(b[1].text) + ")," + o.compileNode(a, b[2]) + "," + o.compileNode(a, b[4]) + "," + o.compileNode(a, b[3]) + ")"
    }, "@": function (a, b) {
        return".h(" + x(b[1].text) + "," + o.compileNode(a, b[2]) + "," + o.compileNode(a, b[4]) + "," + o.compileNode(a, b[3]) + ")"
    }, "%": function (a, b) {
        var c, d, e, f, g, h, i, j, k, l = b[1][1];
        if (!o.pragmas[l])return"";
        for (c = b[4], d = {}, j = 1, k = c.length; k > j; j++)h = c[j], d[h[1][1]] = h[2];
        for (e = b[3], f = {}, j = 1, k = e.length; k > j; j++)i = e[j], f[i[1][1]] = i[2][1];
        return g = b[2][1] ? b[2][1].text : null, o.pragmas[l](a, g, d, f)
    }, partial: function (a, b) {
        return".p(" + o.compileNode(a, b[1]) + "," + o.compileNode(a, b[2]) + "," + o.compileNode(a, b[3]) + ")"
    }, context: function (a, b) {
        return b[1] ? "ctx.rebase(" + o.compileNode(a, b[1]) + ")" : "ctx"
    }, params: function (a, b) {
        for (var c = [], d = 1, e = b.length; e > d; d++)c.push(o.compileNode(a, b[d]));
        return c.length ? "{" + c.join(",") + "}" : "{}"
    }, bodies: function (a, b) {
        for (var c = [], d = 1, e = b.length; e > d; d++)c.push(o.compileNode(a, b[d]));
        return"{" + c.join(",") + "}"
    }, param: function (a, b) {
        return o.compileNode(a, b[1]) + ":" + o.compileNode(a, b[2])
    }, filters: function (a, b) {
        for (var c = [], d = 1, e = b.length; e > d; d++) {
            var f = b[d];
            c.push('"' + f + '"')
        }
        return'"' + a.auto + '"' + (c.length ? ",[" + c.join(",") + "]" : "")
    }, key: function (a, b) {
        return'ctx.get(["' + b[1] + '"], false)'
    }, path: function (a, b) {
        for (var c = b[1], d = b[2], e = [], f = 0, g = d.length; g > f; f++)e.push(p(d[f]) ? o.compileNode(a, d[f]) : '"' + d[f] + '"');
        return"ctx.getPath(" + c + ", [" + e.join(",") + "])"
    }, literal: function (a, b) {
        return x(b[1])
    }, raw: function (a, b) {
        return".w(" + x(b[1]) + ")"
    }};
    var r = /\\/g, s = /"/g, t = /\f/g, u = /\n/g, v = /\r/g, w = /\t/g, x = "undefined" == typeof JSON ? function (a) {
        return'"' + n(a) + '"'
    } : JSON.stringify;
    return dust.compile = o.compile, dust.filterNode = o.filterNode, dust.optimizers = o.optimizers, dust.pragmas = o.pragmas, dust.compileNode = o.compileNode, dust.nodes = o.nodes, o
}), "function" == typeof define && define.amd && define.amd.dust === !0 && define(["require", "dust.core", "dust.compile"], function (require, dust) {
    return dust.onLoad = function (a, b) {
        require([a], function () {
            b()
        })
    }, dust
});