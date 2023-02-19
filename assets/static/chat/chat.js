/*
@license
Webix Chat v.10.0.6
This software is covered by Webix Commercial License.
Usage without proper license is prohibited.
(c) XB Software Ltd.
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.chat = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var NavigationBlocked = (function () {
        function NavigationBlocked() {
        }
        return NavigationBlocked;
    }());
    var JetBase = (function () {
        function JetBase(webix, config) {
            this.webixJet = true;
            this.webix = webix;
            this._events = [];
            this._subs = {};
            this._data = {};
            if (config && config.params)
                webix.extend(this._data, config.params);
        }
        JetBase.prototype.getRoot = function () {
            return this._root;
        };
        JetBase.prototype.destructor = function () {
            this._detachEvents();
            this._destroySubs();
            this._events = this._container = this.app = this._parent = this._root = null;
        };
        JetBase.prototype.setParam = function (id, value, url) {
            if (this._data[id] !== value) {
                this._data[id] = value;
                this._segment.update(id, value, 0);
                if (url) {
                    return this.show(null);
                }
            }
        };
        JetBase.prototype.getParam = function (id, parent) {
            var value = this._data[id];
            if (typeof value !== "undefined" || !parent) {
                return value;
            }
            var view = this.getParentView();
            if (view) {
                return view.getParam(id, parent);
            }
        };
        JetBase.prototype.getUrl = function () {
            return this._segment.suburl();
        };
        JetBase.prototype.getUrlString = function () {
            return this._segment.toString();
        };
        JetBase.prototype.getParentView = function () {
            return this._parent;
        };
        JetBase.prototype.$$ = function (id) {
            if (typeof id === "string") {
                var root_1 = this.getRoot();
                return root_1.queryView((function (obj) { return (obj.config.id === id || obj.config.localId === id) &&
                    (obj.$scope === root_1.$scope); }), "self");
            }
            else {
                return id;
            }
        };
        JetBase.prototype.on = function (obj, name, code) {
            var id = obj.attachEvent(name, code);
            this._events.push({ obj: obj, id: id });
            return id;
        };
        JetBase.prototype.contains = function (view) {
            for (var key in this._subs) {
                var kid = this._subs[key].view;
                if (kid === view || kid.contains(view)) {
                    return true;
                }
            }
            return false;
        };
        JetBase.prototype.getSubView = function (name) {
            var sub = this.getSubViewInfo(name);
            if (sub) {
                return sub.subview.view;
            }
        };
        JetBase.prototype.getSubViewInfo = function (name) {
            var sub = this._subs[name || "default"];
            if (sub) {
                return { subview: sub, parent: this };
            }
            if (name === "_top") {
                this._subs[name] = { url: "", id: null, popup: true };
                return this.getSubViewInfo(name);
            }
            if (this._parent) {
                return this._parent.getSubViewInfo(name);
            }
            return null;
        };
        JetBase.prototype._detachEvents = function () {
            var events = this._events;
            for (var i = events.length - 1; i >= 0; i--) {
                events[i].obj.detachEvent(events[i].id);
            }
        };
        JetBase.prototype._destroySubs = function () {
            for (var key in this._subs) {
                var subView = this._subs[key].view;
                if (subView) {
                    subView.destructor();
                }
            }
            this._subs = {};
        };
        JetBase.prototype._init_url_data = function () {
            var url = this._segment.current();
            this._data = {};
            this.webix.extend(this._data, url.params, true);
        };
        JetBase.prototype._getDefaultSub = function () {
            if (this._subs.default) {
                return this._subs.default;
            }
            for (var key in this._subs) {
                var sub = this._subs[key];
                if (!sub.branch && sub.view && key !== "_top") {
                    var child = sub.view._getDefaultSub();
                    if (child) {
                        return child;
                    }
                }
            }
        };
        JetBase.prototype._routed_view = function () {
            var parent = this.getParentView();
            if (!parent) {
                return true;
            }
            var sub = parent._getDefaultSub();
            if (!sub && sub !== this) {
                return false;
            }
            return parent._routed_view();
        };
        return JetBase;
    }());
    function parse(url) {
        if (url[0] === "/") {
            url = url.substr(1);
        }
        var parts = url.split("/");
        var chunks = [];
        for (var i = 0; i < parts.length; i++) {
            var test = parts[i];
            var result = {};
            var pos = test.indexOf(":");
            if (pos === -1) {
                pos = test.indexOf("?");
            }
            if (pos !== -1) {
                var params = test.substr(pos + 1).split(/[\:\?\&]/g);
                for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                    var param = params_1[_i];
                    var dchunk = param.split("=");
                    result[dchunk[0]] = decodeURIComponent(dchunk[1]);
                }
            }
            chunks[i] = {
                page: (pos > -1 ? test.substr(0, pos) : test),
                params: result,
                isNew: true
            };
        }
        return chunks;
    }
    function url2str(stack) {
        var url = [];
        for (var _i = 0, stack_1 = stack; _i < stack_1.length; _i++) {
            var chunk = stack_1[_i];
            url.push("/" + chunk.page);
            var params = obj2str(chunk.params);
            if (params) {
                url.push("?" + params);
            }
        }
        return url.join("");
    }
    function obj2str(obj) {
        var str = [];
        for (var key in obj) {
            if (typeof obj[key] === "object")
                continue;
            if (str.length) {
                str.push("&");
            }
            str.push(key + "=" + encodeURIComponent(obj[key]));
        }
        return str.join("");
    }
    var Route = (function () {
        function Route(route, index) {
            this._next = 1;
            if (typeof route === "string") {
                this.route = {
                    url: parse(route),
                    path: route
                };
            }
            else {
                this.route = route;
            }
            this.index = index;
        }
        Route.prototype.current = function () {
            return this.route.url[this.index];
        };
        Route.prototype.next = function () {
            return this.route.url[this.index + this._next];
        };
        Route.prototype.suburl = function () {
            return this.route.url.slice(this.index);
        };
        Route.prototype.shift = function (params) {
            var route = new Route(this.route, this.index + this._next);
            route.setParams(route.route.url, params, route.index);
            return route;
        };
        Route.prototype.setParams = function (url, params, index) {
            if (params) {
                var old = url[index].params;
                for (var key in params)
                    old[key] = params[key];
            }
        };
        Route.prototype.refresh = function () {
            var url = this.route.url;
            for (var i = this.index + 1; i < url.length; i++) {
                url[i].isNew = true;
            }
        };
        Route.prototype.toString = function () {
            var str = url2str(this.suburl());
            return str ? str.substr(1) : "";
        };
        Route.prototype._join = function (path, kids) {
            var url = this.route.url;
            if (path === null) {
                return url;
            }
            var old = this.route.url;
            var reset = true;
            url = old.slice(0, this.index + (kids ? this._next : 0));
            if (path) {
                url = url.concat(parse(path));
                for (var i = 0; i < url.length; i++) {
                    if (old[i]) {
                        url[i].view = old[i].view;
                    }
                    if (reset && old[i] && url[i].page === old[i].page) {
                        url[i].isNew = false;
                    }
                    else if (url[i].isNew) {
                        reset = false;
                    }
                }
            }
            return url;
        };
        Route.prototype.append = function (path) {
            var url = this._join(path, true);
            this.route.path = url2str(url);
            this.route.url = url;
            return this.route.path;
        };
        Route.prototype.show = function (path, view, kids) {
            var _this = this;
            var url = this._join(path.url, kids);
            this.setParams(url, path.params, this.index + (kids ? this._next : 0));
            return new Promise(function (res, rej) {
                var redirect = url2str(url);
                var obj = {
                    url: url,
                    redirect: redirect,
                    confirm: Promise.resolve()
                };
                var app = view ? view.app : null;
                if (app) {
                    var result = app.callEvent("app:guard", [obj.redirect, view, obj]);
                    if (!result) {
                        rej(new NavigationBlocked());
                        return;
                    }
                }
                obj.confirm.catch(function (err) { return rej(err); }).then(function () {
                    if (obj.redirect === null) {
                        rej(new NavigationBlocked());
                        return;
                    }
                    if (obj.redirect !== redirect) {
                        app.show(obj.redirect);
                        rej(new NavigationBlocked());
                        return;
                    }
                    _this.route.path = redirect;
                    _this.route.url = url;
                    res();
                });
            });
        };
        Route.prototype.size = function (n) {
            this._next = n;
        };
        Route.prototype.split = function () {
            var route = {
                url: this.route.url.slice(this.index + 1),
                path: ""
            };
            if (route.url.length) {
                route.path = url2str(route.url);
            }
            return new Route(route, 0);
        };
        Route.prototype.update = function (name, value, index) {
            var chunk = this.route.url[this.index + (index || 0)];
            if (!chunk) {
                this.route.url.push({ page: "", params: {} });
                return this.update(name, value, index);
            }
            if (name === "") {
                chunk.page = value;
            }
            else {
                chunk.params[name] = value;
            }
            this.route.path = url2str(this.route.url);
        };
        return Route;
    }());
    var JetView = (function (_super) {
        __extends(JetView, _super);
        function JetView(app, config) {
            var _this = _super.call(this, app.webix) || this;
            _this.app = app;
            _this._children = [];
            return _this;
        }
        JetView.prototype.ui = function (ui, config) {
            config = config || {};
            var container = config.container || ui.container;
            var jetview = this.app.createView(ui);
            this._children.push(jetview);
            jetview.render(container, this._segment, this);
            if (typeof ui !== "object" || (ui instanceof JetBase)) {
                return jetview;
            }
            else {
                return jetview.getRoot();
            }
        };
        JetView.prototype.show = function (path, config) {
            config = config || {};
            if (typeof path === "object") {
                for (var key in path) {
                    this.setParam(key, path[key]);
                }
                path = null;
            }
            else {
                if (path.substr(0, 1) === "/") {
                    return this.app.show(path, config);
                }
                if (path.indexOf("./") === 0) {
                    path = path.substr(2);
                }
                if (path.indexOf("../") === 0) {
                    var parent_1 = this.getParentView();
                    if (parent_1) {
                        return parent_1.show(path.substr(3), config);
                    }
                    else {
                        return this.app.show("/" + path.substr(3));
                    }
                }
                var sub = this.getSubViewInfo(config.target);
                if (sub) {
                    if (sub.parent !== this) {
                        return sub.parent.show(path, config);
                    }
                    else if (config.target && config.target !== "default") {
                        return this._renderFrameLock(config.target, sub.subview, {
                            url: path,
                            params: config.params,
                        });
                    }
                }
                else {
                    if (path) {
                        return this.app.show("/" + path, config);
                    }
                }
            }
            return this._show(this._segment, { url: path, params: config.params }, this);
        };
        JetView.prototype._show = function (segment, path, view) {
            var _this = this;
            return segment.show(path, view, true).then(function () {
                _this._init_url_data();
                return _this._urlChange();
            }).then(function () {
                if (segment.route.linkRouter) {
                    _this.app.getRouter().set(segment.route.path, { silent: true });
                    _this.app.callEvent("app:route", [segment.route.path]);
                }
            });
        };
        JetView.prototype.init = function (_$view, _$) {
        };
        JetView.prototype.ready = function (_$view, _$url) {
        };
        JetView.prototype.config = function () {
            this.app.webix.message("View:Config is not implemented");
        };
        JetView.prototype.urlChange = function (_$view, _$url) {
        };
        JetView.prototype.destroy = function () {
        };
        JetView.prototype.destructor = function () {
            this.destroy();
            this._destroyKids();
            if (this._root) {
                this._root.destructor();
                _super.prototype.destructor.call(this);
            }
        };
        JetView.prototype.use = function (plugin, config) {
            plugin(this.app, this, config);
        };
        JetView.prototype.refresh = function () {
            var url = this.getUrl();
            this.destroy();
            this._destroyKids();
            this._destroySubs();
            this._detachEvents();
            if (this._container.tagName) {
                this._root.destructor();
            }
            this._segment.refresh();
            return this._render(this._segment);
        };
        JetView.prototype.render = function (root, url, parent) {
            var _this = this;
            if (typeof url === "string") {
                url = new Route(url, 0);
            }
            this._segment = url;
            this._parent = parent;
            this._init_url_data();
            root = root || document.body;
            var _container = (typeof root === "string") ? this.webix.toNode(root) : root;
            if (this._container !== _container) {
                this._container = _container;
                return this._render(url);
            }
            else {
                return this._urlChange().then(function () { return _this.getRoot(); });
            }
        };
        JetView.prototype._render = function (url) {
            var _this = this;
            var config = this.config();
            if (config.then) {
                return config.then(function (cfg) { return _this._render_final(cfg, url); });
            }
            else {
                return this._render_final(config, url);
            }
        };
        JetView.prototype._render_final = function (config, url) {
            var _this = this;
            var slot = null;
            var container = null;
            var show = false;
            if (!this._container.tagName) {
                slot = this._container;
                if (slot.popup) {
                    container = document.body;
                    show = true;
                }
                else {
                    container = this.webix.$$(slot.id);
                }
            }
            else {
                container = this._container;
            }
            if (!this.app || !container) {
                return Promise.reject(null);
            }
            var response;
            var current = this._segment.current();
            var result = { ui: {} };
            this.app.copyConfig(config, result.ui, this._subs);
            this.app.callEvent("app:render", [this, url, result]);
            result.ui.$scope = this;
            if (!slot && current.isNew && current.view) {
                current.view.destructor();
            }
            try {
                if (slot && !show) {
                    var oldui = container;
                    var parent_2 = oldui.getParentView();
                    if (parent_2 && parent_2.name === "multiview" && !result.ui.id) {
                        result.ui.id = oldui.config.id;
                    }
                }
                this._root = this.app.webix.ui(result.ui, container);
                var asWin = this._root;
                if (show && asWin.setPosition && !asWin.isVisible()) {
                    asWin.show();
                }
                if (slot) {
                    if (slot.view && slot.view !== this && slot.view !== this.app) {
                        slot.view.destructor();
                    }
                    slot.id = this._root.config.id;
                    if (this.getParentView() || !this.app.app)
                        slot.view = this;
                    else {
                        slot.view = this.app;
                    }
                }
                if (current.isNew) {
                    current.view = this;
                    current.isNew = false;
                }
                response = Promise.resolve(this._init(this._root, url)).then(function () {
                    return _this._urlChange().then(function () {
                        _this._initUrl = null;
                        return _this.ready(_this._root, url.suburl());
                    });
                });
            }
            catch (e) {
                response = Promise.reject(e);
            }
            return response.catch(function (err) { return _this._initError(_this, err); });
        };
        JetView.prototype._init = function (view, url) {
            return this.init(view, url.suburl());
        };
        JetView.prototype._urlChange = function () {
            var _this = this;
            this.app.callEvent("app:urlchange", [this, this._segment]);
            var waits = [];
            for (var key in this._subs) {
                var frame = this._subs[key];
                var wait = this._renderFrameLock(key, frame, null);
                if (wait) {
                    waits.push(wait);
                }
            }
            return Promise.all(waits).then(function () {
                return _this.urlChange(_this._root, _this._segment.suburl());
            });
        };
        JetView.prototype._renderFrameLock = function (key, frame, path) {
            if (!frame.lock) {
                var lock = this._renderFrame(key, frame, path);
                if (lock) {
                    frame.lock = lock.then(function () { return frame.lock = null; }, function () { return frame.lock = null; });
                }
            }
            return frame.lock;
        };
        JetView.prototype._renderFrame = function (key, frame, path) {
            var _this = this;
            if (key === "default") {
                if (this._segment.next()) {
                    var params = path ? path.params : null;
                    if (frame.params) {
                        params = this.webix.extend(params || {}, frame.params);
                    }
                    return this._createSubView(frame, this._segment.shift(params));
                }
                else if (frame.view && frame.popup) {
                    frame.view.destructor();
                    frame.view = null;
                }
            }
            if (path !== null) {
                frame.url = path.url;
                if (frame.params) {
                    path.params = this.webix.extend(path.params || {}, frame.params);
                }
            }
            if (frame.route) {
                if (path !== null) {
                    return frame.route.show(path, frame.view).then(function () {
                        return _this._createSubView(frame, frame.route);
                    });
                }
                if (frame.branch) {
                    return;
                }
            }
            var view = frame.view;
            if (!view && frame.url) {
                if (typeof frame.url === "string") {
                    frame.route = new Route(frame.url, 0);
                    if (path)
                        frame.route.setParams(frame.route.route.url, path.params, 0);
                    if (frame.params)
                        frame.route.setParams(frame.route.route.url, frame.params, 0);
                    return this._createSubView(frame, frame.route);
                }
                else {
                    if (typeof frame.url === "function" && !(view instanceof frame.url)) {
                        view = new (this.app._override(frame.url))(this.app, "");
                    }
                    if (!view) {
                        view = frame.url;
                    }
                }
            }
            if (view) {
                return view.render(frame, (frame.route || this._segment), this);
            }
        };
        JetView.prototype._initError = function (view, err) {
            if (this.app) {
                this.app.error("app:error:initview", [err, view]);
            }
            return true;
        };
        JetView.prototype._createSubView = function (sub, suburl) {
            var _this = this;
            return this.app.createFromURL(suburl.current()).then(function (view) {
                return view.render(sub, suburl, _this);
            });
        };
        JetView.prototype._destroyKids = function () {
            var uis = this._children;
            for (var i = uis.length - 1; i >= 0; i--) {
                if (uis[i] && uis[i].destructor) {
                    uis[i].destructor();
                }
            }
            this._children = [];
        };
        return JetView;
    }(JetBase));
    var JetViewRaw = (function (_super) {
        __extends(JetViewRaw, _super);
        function JetViewRaw(app, config) {
            var _this = _super.call(this, app, config) || this;
            _this._ui = config.ui;
            return _this;
        }
        JetViewRaw.prototype.config = function () {
            return this._ui;
        };
        return JetViewRaw;
    }(JetView));
    var SubRouter = (function () {
        function SubRouter(cb, config, app) {
            this.path = "";
            this.app = app;
        }
        SubRouter.prototype.set = function (path, config) {
            this.path = path;
            var a = this.app;
            a.app.getRouter().set(a._segment.append(this.path), { silent: true });
        };
        SubRouter.prototype.get = function () {
            return this.path;
        };
        return SubRouter;
    }());
    var _once = true;
    var JetAppBase = (function (_super) {
        __extends(JetAppBase, _super);
        function JetAppBase(config) {
            var _this = this;
            var webix = (config || {}).webix || window.webix;
            config = webix.extend({
                name: "App",
                version: "1.0",
                start: "/home"
            }, config, true);
            _this = _super.call(this, webix, config) || this;
            _this.config = config;
            _this.app = _this.config.app;
            _this.ready = Promise.resolve();
            _this._services = {};
            _this.webix.extend(_this, _this.webix.EventSystem);
            return _this;
        }
        JetAppBase.prototype.getUrl = function () {
            return this._subSegment.suburl();
        };
        JetAppBase.prototype.getUrlString = function () {
            return this._subSegment.toString();
        };
        JetAppBase.prototype.getService = function (name) {
            var obj = this._services[name];
            if (typeof obj === "function") {
                obj = this._services[name] = obj(this);
            }
            return obj;
        };
        JetAppBase.prototype.setService = function (name, handler) {
            this._services[name] = handler;
        };
        JetAppBase.prototype.destructor = function () {
            this.getSubView().destructor();
            _super.prototype.destructor.call(this);
        };
        JetAppBase.prototype.copyConfig = function (obj, target, config) {
            if (obj instanceof JetBase ||
                (typeof obj === "function" && obj.prototype instanceof JetBase)) {
                obj = { $subview: obj };
            }
            if (typeof obj.$subview != "undefined") {
                return this.addSubView(obj, target, config);
            }
            var isArray = obj instanceof Array;
            target = target || (isArray ? [] : {});
            for (var method in obj) {
                var point = obj[method];
                if (typeof point === "function" && point.prototype instanceof JetBase) {
                    point = { $subview: point };
                }
                if (point && typeof point === "object" &&
                    !(point instanceof this.webix.DataCollection) && !(point instanceof RegExp) && !(point instanceof Map)) {
                    if (point instanceof Date) {
                        target[method] = new Date(point);
                    }
                    else {
                        var copy = this.copyConfig(point, (point instanceof Array ? [] : {}), config);
                        if (copy !== null) {
                            if (isArray)
                                target.push(copy);
                            else
                                target[method] = copy;
                        }
                    }
                }
                else {
                    target[method] = point;
                }
            }
            return target;
        };
        JetAppBase.prototype.getRouter = function () {
            return this.$router;
        };
        JetAppBase.prototype.clickHandler = function (e, target) {
            if (e) {
                target = target || (e.target || e.srcElement);
                if (target && target.getAttribute) {
                    var trigger_1 = target.getAttribute("trigger");
                    if (trigger_1) {
                        this._forView(target, function (view) { return view.app.trigger(trigger_1); });
                        e.cancelBubble = true;
                        return e.preventDefault();
                    }
                    var route_1 = target.getAttribute("route");
                    if (route_1) {
                        this._forView(target, function (view) { return view.show(route_1); });
                        e.cancelBubble = true;
                        return e.preventDefault();
                    }
                }
            }
            var parent = target.parentNode;
            if (parent) {
                this.clickHandler(e, parent);
            }
        };
        JetAppBase.prototype.getRoot = function () {
            return this.getSubView().getRoot();
        };
        JetAppBase.prototype.refresh = function () {
            var _this = this;
            if (!this._subSegment) {
                return Promise.resolve(null);
            }
            return this.getSubView().refresh().then(function (view) {
                _this.callEvent("app:route", [_this.getUrl()]);
                return view;
            });
        };
        JetAppBase.prototype.loadView = function (url) {
            var _this = this;
            var views = this.config.views;
            var result = null;
            if (url === "") {
                return Promise.resolve(this._loadError("", new Error("Webix Jet: Empty url segment")));
            }
            try {
                if (views) {
                    if (typeof views === "function") {
                        result = views(url);
                    }
                    else {
                        result = views[url];
                    }
                    if (typeof result === "string") {
                        url = result;
                        result = null;
                    }
                }
                if (!result) {
                    if (url === "_hidden") {
                        result = { hidden: true };
                    }
                    else if (url === "_blank") {
                        result = {};
                    }
                    else {
                        url = url.replace(/\./g, "/");
                        result = this.require("jet-views", url);
                    }
                }
            }
            catch (e) {
                result = this._loadError(url, e);
            }
            if (!result.then) {
                result = Promise.resolve(result);
            }
            result = result
                .then(function (module) { return module.__esModule ? module.default : module; })
                .catch(function (err) { return _this._loadError(url, err); });
            return result;
        };
        JetAppBase.prototype._forView = function (target, handler) {
            var view = this.webix.$$(target);
            if (view) {
                handler(view.$scope);
            }
        };
        JetAppBase.prototype._loadViewDynamic = function (url) {
            return null;
        };
        JetAppBase.prototype.createFromURL = function (chunk) {
            var _this = this;
            var view;
            if (chunk.isNew || !chunk.view) {
                view = this.loadView(chunk.page)
                    .then(function (ui) { return _this.createView(ui, name, chunk.params); });
            }
            else {
                view = Promise.resolve(chunk.view);
            }
            return view;
        };
        JetAppBase.prototype._override = function (ui) {
            var over = this.config.override;
            if (over) {
                var dv = void 0;
                while (ui) {
                    dv = ui;
                    ui = over.get(ui);
                }
                return dv;
            }
            return ui;
        };
        JetAppBase.prototype.createView = function (ui, name, params) {
            ui = this._override(ui);
            var obj;
            if (typeof ui === "function") {
                if (ui.prototype instanceof JetAppBase) {
                    return new ui({ app: this, name: name, params: params, router: SubRouter });
                }
                else if (ui.prototype instanceof JetBase) {
                    return new ui(this, { name: name, params: params });
                }
                else {
                    ui = ui(this);
                }
            }
            if (ui instanceof JetBase) {
                obj = ui;
            }
            else {
                obj = new JetViewRaw(this, { name: name, ui: ui });
            }
            return obj;
        };
        JetAppBase.prototype.show = function (url, config) {
            if (url && this.app && url.indexOf("//") == 0)
                return this.app.show(url.substr(1), config);
            return this.render(this._container, url || this.config.start, config);
        };
        JetAppBase.prototype.trigger = function (name) {
            var rest = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                rest[_i - 1] = arguments[_i];
            }
            this.apply(name, rest);
        };
        JetAppBase.prototype.apply = function (name, data) {
            this.callEvent(name, data);
        };
        JetAppBase.prototype.action = function (name) {
            return this.webix.bind(function () {
                var rest = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    rest[_i] = arguments[_i];
                }
                this.apply(name, rest);
            }, this);
        };
        JetAppBase.prototype.on = function (name, handler) {
            this.attachEvent(name, handler);
        };
        JetAppBase.prototype.use = function (plugin, config) {
            plugin(this, null, config);
        };
        JetAppBase.prototype.error = function (name, er) {
            this.callEvent(name, er);
            this.callEvent("app:error", er);
            if (this.config.debug) {
                for (var i = 0; i < er.length; i++) {
                    console.error(er[i]);
                    if (er[i] instanceof Error) {
                        var text = er[i].message;
                        if (text.indexOf("Module build failed") === 0) {
                            text = text.replace(/\x1b\[[0-9;]*m/g, "");
                            document.body.innerHTML = "<pre style='font-size:16px; background-color: #ec6873; color: #000; padding:10px;'>" + text + "</pre>";
                        }
                        else {
                            text += "<br><br>Check console for more details";
                            this.webix.message({ type: "error", text: text, expire: -1 });
                        }
                    }
                }
                debugger;
            }
        };
        JetAppBase.prototype.render = function (root, url, config) {
            var _this = this;
            this._container = (typeof root === "string") ?
                this.webix.toNode(root) :
                (root || document.body);
            var firstInit = !this.$router;
            var path = null;
            if (firstInit) {
                if (_once && "tagName" in this._container) {
                    this.webix.event(document.body, "click", function (e) { return _this.clickHandler(e); });
                    _once = false;
                }
                if (typeof url === "string") {
                    url = new Route(url, 0);
                }
                this._subSegment = this._first_start(url);
                this._subSegment.route.linkRouter = true;
            }
            else {
                if (typeof url === "string") {
                    path = url;
                }
                else {
                    if (this.app) {
                        path = url.split().route.path || this.config.start;
                    }
                    else {
                        path = url.toString();
                    }
                }
            }
            var params = config ? config.params : this.config.params || null;
            var top = this.getSubView();
            var segment = this._subSegment;
            var ready = segment
                .show({ url: path, params: params }, top)
                .then(function () { return _this.createFromURL(segment.current()); })
                .then(function (view) { return view.render(root, segment); })
                .then(function (base) {
                _this.$router.set(segment.route.path, { silent: true });
                _this.callEvent("app:route", [_this.getUrl()]);
                return base;
            });
            this.ready = this.ready.then(function () { return ready; });
            return ready;
        };
        JetAppBase.prototype.getSubView = function () {
            if (this._subSegment) {
                var view = this._subSegment.current().view;
                if (view)
                    return view;
            }
            return new JetView(this, {});
        };
        JetAppBase.prototype.require = function (type, url) { return null; };
        JetAppBase.prototype._first_start = function (route) {
            var _this = this;
            this._segment = route;
            var cb = function (a) { return setTimeout(function () {
                _this.show(a).catch(function (e) {
                    if (!(e instanceof NavigationBlocked))
                        throw e;
                });
            }, 1); };
            this.$router = new (this.config.router)(cb, this.config, this);
            if (this._container === document.body && this.config.animation !== false) {
                var node_1 = this._container;
                this.webix.html.addCss(node_1, "webixappstart");
                setTimeout(function () {
                    _this.webix.html.removeCss(node_1, "webixappstart");
                    _this.webix.html.addCss(node_1, "webixapp");
                }, 10);
            }
            if (!route) {
                var urlString = this.$router.get();
                if (!urlString) {
                    urlString = this.config.start;
                    this.$router.set(urlString, { silent: true });
                }
                route = new Route(urlString, 0);
            }
            else if (this.app) {
                var now = route.current().view;
                route.current().view = this;
                if (route.next()) {
                    route.refresh();
                    route = route.split();
                }
                else {
                    route = new Route(this.config.start, 0);
                }
                route.current().view = now;
            }
            return route;
        };
        JetAppBase.prototype._loadError = function (url, err) {
            this.error("app:error:resolve", [err, url]);
            return { template: " " };
        };
        JetAppBase.prototype.addSubView = function (obj, target, config) {
            var url = obj.$subview !== true ? obj.$subview : null;
            var name = obj.name || (url ? this.webix.uid() : "default");
            target.id = obj.id || "s" + this.webix.uid();
            var view = config[name] = {
                id: target.id,
                url: url,
                branch: obj.branch,
                popup: obj.popup,
                params: obj.params
            };
            return view.popup ? null : target;
        };
        return JetAppBase;
    }(JetBase));
    var HashRouter = (function () {
        function HashRouter(cb, config) {
            var _this = this;
            this.config = config || {};
            this._detectPrefix();
            this.cb = cb;
            window.onpopstate = function () { return _this.cb(_this.get()); };
        }
        HashRouter.prototype.set = function (path, config) {
            var _this = this;
            if (this.config.routes) {
                var compare = path.split("?", 2);
                for (var key in this.config.routes) {
                    if (this.config.routes[key] === compare[0]) {
                        path = key + (compare.length > 1 ? "?" + compare[1] : "");
                        break;
                    }
                }
            }
            if (this.get() !== path) {
                window.history.pushState(null, null, this.prefix + this.sufix + path);
            }
            if (!config || !config.silent) {
                setTimeout(function () { return _this.cb(path); }, 1);
            }
        };
        HashRouter.prototype.get = function () {
            var path = this._getRaw().replace(this.prefix, "").replace(this.sufix, "");
            path = (path !== "/" && path !== "#") ? path : "";
            if (this.config.routes) {
                var compare = path.split("?", 2);
                var key = this.config.routes[compare[0]];
                if (key) {
                    path = key + (compare.length > 1 ? "?" + compare[1] : "");
                }
            }
            return path;
        };
        HashRouter.prototype._detectPrefix = function () {
            var sufix = this.config.routerPrefix;
            this.sufix = "#" + ((typeof sufix === "undefined") ? "!" : sufix);
            this.prefix = document.location.href.split("#", 2)[0];
        };
        HashRouter.prototype._getRaw = function () {
            return document.location.href;
        };
        return HashRouter;
    }());
    var isPatched = false;
    function patch(w) {
        if (isPatched || !w) {
            return;
        }
        isPatched = true;
        var win = window;
        if (!win.Promise) {
            win.Promise = w.promise;
        }
        var version = w.version.split(".");
        if (version[0] * 10 + version[1] * 1 < 53) {
            w.ui.freeze = function (handler) {
                var res = handler();
                if (res && res.then) {
                    res.then(function (some) {
                        w.ui.$freeze = false;
                        w.ui.resize();
                        return some;
                    });
                }
                else {
                    w.ui.$freeze = false;
                    w.ui.resize();
                }
                return res;
            };
        }
        var baseAdd = w.ui.baselayout.prototype.addView;
        var baseRemove = w.ui.baselayout.prototype.removeView;
        var config = {
            addView: function (view, index) {
                if (this.$scope && this.$scope.webixJet && !view.queryView) {
                    var jview_1 = this.$scope;
                    var subs_1 = {};
                    view = jview_1.app.copyConfig(view, {}, subs_1);
                    baseAdd.apply(this, [view, index]);
                    var _loop_1 = function (key) {
                        jview_1._renderFrame(key, subs_1[key], null).then(function () {
                            jview_1._subs[key] = subs_1[key];
                        });
                    };
                    for (var key in subs_1) {
                        _loop_1(key);
                    }
                    return view.id;
                }
                else {
                    return baseAdd.apply(this, arguments);
                }
            },
            removeView: function () {
                baseRemove.apply(this, arguments);
                if (this.$scope && this.$scope.webixJet) {
                    var subs = this.$scope._subs;
                    for (var key in subs) {
                        var test = subs[key];
                        if (!w.$$(test.id)) {
                            test.view.destructor();
                            delete subs[key];
                        }
                    }
                }
            }
        };
        w.extend(w.ui.layout.prototype, config, true);
        w.extend(w.ui.baselayout.prototype, config, true);
        w.protoUI({
            name: "jetapp",
            $init: function (cfg) {
                this.$app = new this.app(cfg);
                var id = w.uid().toString();
                cfg.body = { id: id };
                this.$ready.push(function () {
                    this.callEvent("onInit", [this.$app]);
                    this.$app.render({ id: id });
                });
            }
        }, w.ui.proxy, w.EventSystem);
    }
    var JetApp = (function (_super) {
        __extends(JetApp, _super);
        function JetApp(config) {
            var _this = this;
            config.router = config.router || HashRouter;
            _this = _super.call(this, config) || this;
            patch(_this.webix);
            return _this;
        }
        JetApp.prototype.require = function (type, url) {
            return require(type + "/" + url);
        };
        return JetApp;
    }(JetAppBase));
    var UrlRouter = (function (_super) {
        __extends(UrlRouter, _super);
        function UrlRouter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        UrlRouter.prototype._detectPrefix = function () {
            this.prefix = "";
            this.sufix = this.config.routerPrefix || "";
        };
        UrlRouter.prototype._getRaw = function () {
            return document.location.pathname + (document.location.search || "");
        };
        return UrlRouter;
    }(HashRouter));
    var EmptyRouter = (function () {
        function EmptyRouter(cb, _$config) {
            this.path = "";
            this.cb = cb;
        }
        EmptyRouter.prototype.set = function (path, config) {
            var _this = this;
            this.path = path;
            if (!config || !config.silent) {
                setTimeout(function () { return _this.cb(path); }, 1);
            }
        };
        EmptyRouter.prototype.get = function () {
            return this.path;
        };
        return EmptyRouter;
    }());
    function UnloadGuard(app, view, config) {
        view.on(app, "app:guard", function (_$url, point, promise) {
            if (point === view || point.contains(view)) {
                var res_1 = config();
                if (res_1 === false) {
                    promise.confirm = Promise.reject(new NavigationBlocked());
                }
                else {
                    promise.confirm = promise.confirm.then(function () { return res_1; });
                }
            }
        });
    }
    function has(store, key) {
        return Object.prototype.hasOwnProperty.call(store, key);
    }
    function forEach(obj, handler, context) {
        for (var key in obj) {
            if (has(obj, key)) {
                handler.call((context || obj), obj[key], key, obj);
            }
        }
    }
    function trim(str) {
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
    function warn(message) {
        message = 'Warning: ' + message;
        if (typeof console !== 'undefined') {
            console.error(message);
        }
        try {
            throw new Error(message);
        }
        catch (x) { }
    }
    var replace = String.prototype.replace;
    var split = String.prototype.split;
    var delimiter = '||||';
    var russianPluralGroups = function (n) {
        var end = n % 10;
        if (n !== 11 && end === 1) {
            return 0;
        }
        if (2 <= end && end <= 4 && !(n >= 12 && n <= 14)) {
            return 1;
        }
        return 2;
    };
    var pluralTypes = {
        arabic: function (n) {
            if (n < 3) {
                return n;
            }
            var lastTwo = n % 100;
            if (lastTwo >= 3 && lastTwo <= 10)
                return 3;
            return lastTwo >= 11 ? 4 : 5;
        },
        bosnian_serbian: russianPluralGroups,
        chinese: function () { return 0; },
        croatian: russianPluralGroups,
        french: function (n) { return n > 1 ? 1 : 0; },
        german: function (n) { return n !== 1 ? 1 : 0; },
        russian: russianPluralGroups,
        lithuanian: function (n) {
            if (n % 10 === 1 && n % 100 !== 11) {
                return 0;
            }
            return n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19) ? 1 : 2;
        },
        czech: function (n) {
            if (n === 1) {
                return 0;
            }
            return (n >= 2 && n <= 4) ? 1 : 2;
        },
        polish: function (n) {
            if (n === 1) {
                return 0;
            }
            var end = n % 10;
            return 2 <= end && end <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
        },
        icelandic: function (n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; },
        slovenian: function (n) {
            var lastTwo = n % 100;
            if (lastTwo === 1) {
                return 0;
            }
            if (lastTwo === 2) {
                return 1;
            }
            if (lastTwo === 3 || lastTwo === 4) {
                return 2;
            }
            return 3;
        }
    };
    var pluralTypeToLanguages = {
        arabic: ['ar'],
        bosnian_serbian: ['bs-Latn-BA', 'bs-Cyrl-BA', 'srl-RS', 'sr-RS'],
        chinese: ['id', 'id-ID', 'ja', 'ko', 'ko-KR', 'lo', 'ms', 'th', 'th-TH', 'zh'],
        croatian: ['hr', 'hr-HR'],
        german: ['fa', 'da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hi-IN', 'hu', 'hu-HU', 'it', 'nl', 'no', 'pt', 'sv', 'tr'],
        french: ['fr', 'tl', 'pt-br'],
        russian: ['ru', 'ru-RU'],
        lithuanian: ['lt'],
        czech: ['cs', 'cs-CZ', 'sk'],
        polish: ['pl'],
        icelandic: ['is'],
        slovenian: ['sl-SL']
    };
    function langToTypeMap(mapping) {
        var ret = {};
        forEach(mapping, function (langs, type) {
            forEach(langs, function (lang) {
                ret[lang] = type;
            });
        });
        return ret;
    }
    function pluralTypeName(locale) {
        var langToPluralType = langToTypeMap(pluralTypeToLanguages);
        return langToPluralType[locale]
            || langToPluralType[split.call(locale, /-/, 1)[0]]
            || langToPluralType.en;
    }
    function pluralTypeIndex(locale, count) {
        return pluralTypes[pluralTypeName(locale)](count);
    }
    function escape(token) {
        return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function constructTokenRegex(opts) {
        var prefix = (opts && opts.prefix) || '%{';
        var suffix = (opts && opts.suffix) || '}';
        if (prefix === delimiter || suffix === delimiter) {
            throw new RangeError('"' + delimiter + '" token is reserved for pluralization');
        }
        return new RegExp(escape(prefix) + '(.*?)' + escape(suffix), 'g');
    }
    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$';
    var defaultTokenRegex = /%\{(.*?)\}/g;
    function transformPhrase(phrase, substitutions, locale, tokenRegex) {
        if (typeof phrase !== 'string') {
            throw new TypeError('Polyglot.transformPhrase expects argument #1 to be string');
        }
        if (substitutions == null) {
            return phrase;
        }
        var result = phrase;
        var interpolationRegex = tokenRegex || defaultTokenRegex;
        var options = typeof substitutions === 'number' ? { smart_count: substitutions } : substitutions;
        if (options.smart_count != null && result) {
            var texts = split.call(result, delimiter);
            result = trim(texts[pluralTypeIndex(locale || 'en', options.smart_count)] || texts[0]);
        }
        result = replace.call(result, interpolationRegex, function (expression, argument) {
            if (!has(options, argument) || options[argument] == null) {
                return expression;
            }
            return replace.call(options[argument], dollarRegex, dollarBillsYall);
        });
        return result;
    }
    function Polyglot(options) {
        var opts = options || {};
        this.phrases = {};
        this.extend(opts.phrases || {});
        this.currentLocale = opts.locale || 'en';
        var allowMissing = opts.allowMissing ? transformPhrase : null;
        this.onMissingKey = typeof opts.onMissingKey === 'function' ? opts.onMissingKey : allowMissing;
        this.warn = opts.warn || warn;
        this.tokenRegex = constructTokenRegex(opts.interpolation);
    }
    Polyglot.prototype.locale = function (newLocale) {
        if (newLocale)
            this.currentLocale = newLocale;
        return this.currentLocale;
    };
    Polyglot.prototype.extend = function (morePhrases, prefix) {
        forEach(morePhrases, function (phrase, key) {
            var prefixedKey = prefix ? prefix + '.' + key : key;
            if (typeof phrase === 'object') {
                this.extend(phrase, prefixedKey);
            }
            else {
                this.phrases[prefixedKey] = phrase;
            }
        }, this);
    };
    Polyglot.prototype.unset = function (morePhrases, prefix) {
        if (typeof morePhrases === 'string') {
            delete this.phrases[morePhrases];
        }
        else {
            forEach(morePhrases, function (phrase, key) {
                var prefixedKey = prefix ? prefix + '.' + key : key;
                if (typeof phrase === 'object') {
                    this.unset(phrase, prefixedKey);
                }
                else {
                    delete this.phrases[prefixedKey];
                }
            }, this);
        }
    };
    Polyglot.prototype.clear = function () {
        this.phrases = {};
    };
    Polyglot.prototype.replace = function (newPhrases) {
        this.clear();
        this.extend(newPhrases);
    };
    Polyglot.prototype.t = function (key, options) {
        var phrase, result;
        var opts = options == null ? {} : options;
        if (typeof this.phrases[key] === 'string') {
            phrase = this.phrases[key];
        }
        else if (typeof opts._ === 'string') {
            phrase = opts._;
        }
        else if (this.onMissingKey) {
            var onMissingKey = this.onMissingKey;
            result = onMissingKey(key, opts, this.currentLocale, this.tokenRegex);
        }
        else {
            this.warn('Missing translation for key: "' + key + '"');
            result = key;
        }
        if (typeof phrase === 'string') {
            result = transformPhrase(phrase, opts, this.currentLocale, this.tokenRegex);
        }
        return result;
    };
    Polyglot.prototype.has = function (key) {
        return has(this.phrases, key);
    };
    Polyglot.transformPhrase = function transform(phrase, substitutions, locale) {
        return transformPhrase(phrase, substitutions, locale);
    };
    var webixPolyglot = Polyglot;
    function Locale(app, _view, config) {
        config = config || {};
        var storage = config.storage;
        var lang = storage ? (storage.get("lang") || "en") : (config.lang || "en");
        function setLangData(name, data, silent) {
            if (data.__esModule) {
                data = data.default;
            }
            var pconfig = { phrases: data };
            if (config.polyglot) {
                app.webix.extend(pconfig, config.polyglot);
            }
            var poly = service.polyglot = new webixPolyglot(pconfig);
            poly.locale(name);
            service._ = app.webix.bind(poly.t, poly);
            lang = name;
            if (storage) {
                storage.put("lang", lang);
            }
            if (config.webix) {
                var locName = config.webix[name];
                if (locName) {
                    app.webix.i18n.setLocale(locName);
                }
            }
            if (!silent) {
                return app.refresh();
            }
            return Promise.resolve();
        }
        function getLang() { return lang; }
        function setLang(name, silent) {
            if (config.path === false) {
                return;
            }
            var path = (config.path ? config.path + "/" : "") + name;
            var data = app.require("jet-locales", path);
            setLangData(name, data, silent);
        }
        var service = {
            getLang: getLang, setLang: setLang, setLangData: setLangData,
            _: null, polyglot: null
        };
        app.setService("locale", service);
        setLang(lang, true);
    }
    function show(view, config, value) {
        var _a;
        if (config.urls) {
            value = config.urls[value] || value;
        }
        else if (config.param) {
            value = (_a = {}, _a[config.param] = value, _a);
        }
        view.show(value);
    }
    function Menu(app, view, config) {
        var frame = view.getSubViewInfo().parent;
        var ui = view.$$(config.id || config);
        var silent = false;
        ui.attachEvent("onchange", function () {
            if (!silent) {
                show(frame, config, this.getValue());
            }
        });
        ui.attachEvent("onafterselect", function () {
            if (!silent) {
                var id = null;
                if (ui.setValue) {
                    id = this.getValue();
                }
                else if (ui.getSelectedId) {
                    id = ui.getSelectedId();
                }
                show(frame, config, id);
            }
        });
        view.on(app, "app:route", function () {
            var name = "";
            if (config.param) {
                name = view.getParam(config.param, true);
            }
            else {
                var segment = frame.getUrl()[1];
                if (segment) {
                    name = segment.page;
                }
            }
            if (name) {
                silent = true;
                if (ui.setValue && ui.getValue() !== name) {
                    ui.setValue(name);
                }
                else if (ui.select && ui.exists(name) && ui.getSelectedId() !== name) {
                    ui.select(name);
                }
                silent = false;
            }
        });
    }
    var baseicons = {
        good: "check",
        error: "warning",
        saving: "refresh fa-spin"
    };
    var basetext = {
        good: "Ok",
        error: "Error",
        saving: "Connecting..."
    };
    function Status(app, view, config) {
        var status = "good";
        var count = 0;
        var iserror = false;
        var expireDelay = config.expire;
        if (!expireDelay && expireDelay !== false) {
            expireDelay = 2000;
        }
        var texts = config.texts || basetext;
        var icons = config.icons || baseicons;
        if (typeof config === "string") {
            config = { target: config };
        }
        function refresh(content) {
            var area = view.$$(config.target);
            if (area) {
                if (!content) {
                    content = "<div class='status_" +
                        status +
                        "'><span class='webix_icon fa-" +
                        icons[status] + "'></span> " + texts[status] + "</div>";
                }
                area.setHTML(content);
            }
        }
        function success() {
            count--;
            setStatus("good");
        }
        function fail(err) {
            count--;
            setStatus("error", err);
        }
        function start(promise) {
            count++;
            setStatus("saving");
            if (promise && promise.then) {
                promise.then(success, fail);
            }
        }
        function getStatus() {
            return status;
        }
        function hideStatus() {
            if (count === 0) {
                refresh(" ");
            }
        }
        function setStatus(mode, err) {
            if (count < 0) {
                count = 0;
            }
            if (mode === "saving") {
                status = "saving";
                refresh();
            }
            else {
                iserror = (mode === "error");
                if (count === 0) {
                    status = iserror ? "error" : "good";
                    if (iserror) {
                        app.error("app:error:server", [err.responseText || err]);
                    }
                    else {
                        if (expireDelay) {
                            setTimeout(hideStatus, expireDelay);
                        }
                    }
                    refresh();
                }
            }
        }
        function track(data) {
            var dp = app.webix.dp(data);
            if (dp) {
                view.on(dp, "onAfterDataSend", start);
                view.on(dp, "onAfterSaveError", function (_id, _obj, response) { return fail(response); });
                view.on(dp, "onAfterSave", success);
            }
        }
        app.setService("status", {
            getStatus: getStatus,
            setStatus: setStatus,
            track: track
        });
        if (config.remote) {
            view.on(app.webix, "onRemoteCall", start);
        }
        if (config.ajax) {
            view.on(app.webix, "onBeforeAjax", function (_mode, _url, _data, _request, _headers, _files, promise) {
                start(promise);
            });
        }
        if (config.data) {
            track(config.data);
        }
    }
    function Theme(app, _view, config) {
        config = config || {};
        var storage = config.storage;
        var theme = storage ?
            (storage.get("theme") || "flat-default")
            :
                (config.theme || "flat-default");
        var service = {
            getTheme: function () { return theme; },
            setTheme: function (name, silent) {
                var parts = name.split("-");
                var links = document.getElementsByTagName("link");
                for (var i = 0; i < links.length; i++) {
                    var lname = links[i].getAttribute("title");
                    if (lname) {
                        if (lname === name || lname === parts[0]) {
                            links[i].disabled = false;
                        }
                        else {
                            links[i].disabled = true;
                        }
                    }
                }
                app.webix.skin.set(parts[0]);
                app.webix.html.removeCss(document.body, "theme-" + theme);
                app.webix.html.addCss(document.body, "theme-" + name);
                theme = name;
                if (storage) {
                    storage.put("theme", name);
                }
                if (!silent) {
                    app.refresh();
                }
            }
        };
        app.setService("theme", service);
        service.setTheme(theme, true);
    }
    function copyParams(data, url, route) {
        for (var i = 0; i < route.length; i++) {
            data[route[i]] = url[i + 1] ? url[i + 1].page : "";
        }
    }
    function UrlParam(app, view, config) {
        var route = config.route || config;
        var data = {};
        view.on(app, "app:urlchange", function (subview, segment) {
            if (view === subview) {
                copyParams(data, segment.suburl(), route);
                segment.size(route.length + 1);
            }
        });
        var os = view.setParam;
        var og = view.getParam;
        view.setParam = function (name, value, show) {
            var index = route.indexOf(name);
            if (index >= 0) {
                data[name] = value;
                this._segment.update("", value, index + 1);
                if (show) {
                    return view.show(null);
                }
            }
            else {
                return os.call(this, name, value, show);
            }
        };
        view.getParam = function (key, mode) {
            var val = data[key];
            if (typeof val !== "undefined") {
                return val;
            }
            return og.call(this, key, mode);
        };
        copyParams(data, view.getUrl(), route);
    }
    function User(app, _view, config) {
        config = config || {};
        var login = config.login || "/login";
        var logout = config.logout || "/logout";
        var afterLogin = config.afterLogin || app.config.start;
        var afterLogout = config.afterLogout || "/login";
        var ping = config.ping || 5 * 60 * 1000;
        var model = config.model;
        var user = config.user;
        var service = {
            getUser: function () {
                return user;
            },
            getStatus: function (server) {
                if (!server) {
                    return user !== null;
                }
                return model.status().catch(function () { return null; }).then(function (data) {
                    user = data;
                });
            },
            login: function (name, pass) {
                return model.login(name, pass).then(function (data) {
                    user = data;
                    if (!data) {
                        throw new Error("Access denied");
                    }
                    app.callEvent("app:user:login", [user]);
                    app.show(afterLogin);
                });
            },
            logout: function () {
                user = null;
                return model.logout().then(function (res) {
                    app.callEvent("app:user:logout", []);
                    return res;
                });
            }
        };
        function canNavigate(url, obj) {
            if (url === logout) {
                service.logout();
                obj.redirect = afterLogout;
            }
            else if (url !== login && !service.getStatus()) {
                obj.redirect = login;
            }
        }
        app.setService("user", service);
        app.attachEvent("app:guard", function (url, _$root, obj) {
            if (config.public && config.public(url)) {
                return true;
            }
            if (typeof user === "undefined") {
                obj.confirm = service.getStatus(true).then(function () { return canNavigate(url, obj); });
            }
            return canNavigate(url, obj);
        });
        if (ping) {
            setInterval(function () { return service.getStatus(true); }, ping);
        }
    }
    var webix$1 = window.webix;
    if (webix$1) {
        patch(webix$1);
    }
    var plugins = {
        UnloadGuard: UnloadGuard, Locale: Locale, Menu: Menu, Theme: Theme, User: User, Status: Status, UrlParam: UrlParam
    };
    var w = window;
    if (!w.Promise) {
        w.Promise = w.webix.promise;
    }

    var once = false;
    function initRLayout() {
        if (once)
            return;
        once = true;
        webix.protoUI({
            name: "r-layout",
            sizeTrigger: function (app, handler, value) {
                this._compactValue = value;
                this._compactHandler = handler;
                this._app = app;
                var config = app.config;
                this._forceCompact = typeof config.params.forceCompact !== "undefined";
                this._compactWidth = config.compactWidth;
                if (!this._forceCompact)
                    this._checkTrigger(this.$view.width, value);
            },
            _checkTrigger: function (x, value) {
                if (this._compactWidth) {
                    if ((x <= this._compactWidth && !value) ||
                        (x > this._compactWidth && value)) {
                        this._compactWidth = null;
                        this._compactHandler(!value);
                        return false;
                    }
                }
                return true;
            },
            $setSize: function (x, y) {
                if (this._forceCompact || this._checkTrigger(x, this._compactValue))
                    webix.ui.layout.prototype.$setSize.call(this, x, y);
                if (this._app)
                    this._app.callEvent("view:resize", []);
            },
        }, webix.ui.layout);
    }

    function initJetWin(app) {
        var appId;
        var service = {
            updateConfig: function (config) {
                var appView = app.getRoot();
                var appNode = appView.$view;
                if (!appId) {
                    if (appNode.id)
                        appId = appNode.id;
                    else
                        appNode.id = appId = "webix_" + webix.uid();
                    webix.html.addStyle(".webix_win_inside *:not(.webix_modal_box):not(.webix_modal_cover){ z-index: 0; }");
                    webix.html.addStyle("#" + appId + "{ position: relative; }");
                    webix.html.addStyle("#" + appId + " .webix_window{ z-index:2 !important; }");
                    webix.html.addStyle("#" + appId + " .webix_disabled{ z-index:1 !important; }");
                }
                else if (appId && !appNode.id)
                    appNode.id = appId;
                config.container = appId;
                if (config.fullscreen) {
                    config._fillApp = true;
                    delete config.fullscreen;
                }
                if (!config.on)
                    config.on = {};
                var firstShow = true;
                var defaultHandler = config.on.onShow;
                config.on.onShow = function () {
                    var _this = this;
                    if (defaultHandler)
                        defaultHandler.apply(this, arguments);
                    if (firstShow) {
                        this.$setSize = function (x, y) {
                            setSize(_this, appView, true);
                            webix.ui.window.prototype.$setSize.apply(_this, [x, y]);
                        };
                        setHandlers(this, app);
                        firstShow = null;
                    }
                    webix.callEvent("onClick", []);
                    webix.html.addCss(appNode, "webix_win_inside");
                    appView.disable();
                    setSize(this, appView);
                };
                return config;
            }
        };
        app.setService("jet-win", service);
    }
    function setSize(win, appView, silent) {
        var appWidth = appView.$width;
        var appHeight = appView.$height;
        if (win.config._fillApp)
            win.define({
                width: appWidth,
                height: appHeight,
            });
        else {
            win.define({
                left: (appWidth - win.$width) / 2,
                top: (appHeight - win.$height) / 2,
            });
        }
        if (!silent)
            win.resize();
    }
    function setHandlers(win, app) {
        var appView = app.getRoot();
        win.attachEvent("onHide", function () {
            if (!appView.$destructed) {
                webix.html.removeCss(appView.$view, "webix_win_inside");
                appView.enable();
            }
        });
        var resizeEv = app.attachEvent("view:resize", function () {
            setSize(win, appView);
        });
        win.attachEvent("onDestruct", function () {
            app.detachEvent(resizeEv);
        });
    }

    var index = 1;
    function uid() {
        return index++;
    }
    var empty = undefined;
    var context = null;
    function link(source, target, key) {
        Object.defineProperty(target, key, {
            get: function () { return source[key]; },
            set: function (value) { return (source[key] = value); },
        });
    }
    function createState(data, config) {
        config = config || {};
        var handlers = {};
        var out = {};
        var observe = function (mask, handler) {
            var key = uid();
            handlers[key] = { mask: mask, handler: handler };
            if (mask === "*")
                handler(out, empty, mask);
            else
                handler(out[mask], empty, mask);
            return key;
        };
        var extend = function (data, sconfig) {
            sconfig = sconfig || config;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var test = data[key];
                    if (sconfig.nested && typeof test === "object" && test) {
                        out[key] = createState(test, sconfig);
                    }
                    else {
                        reactive(out, test, key, notify);
                    }
                }
            }
        };
        var observeEnd = function (id) {
            delete handlers[id];
        };
        var queue = [];
        var waitInQueue = false;
        var batch = function (code) {
            if (typeof code !== "function") {
                var values_1 = code;
                code = function () {
                    for (var key in values_1)
                        out[key] = values_1[key];
                };
            }
            waitInQueue = true;
            code(out);
            waitInQueue = false;
            while (queue.length) {
                var obj = queue.shift();
                notify.apply(this, obj);
            }
        };
        var notify = function (key, old, value, meta) {
            if (waitInQueue) {
                queue.push([key, old, value, meta]);
                return;
            }
            var list = Object.keys(handlers);
            for (var i = 0; i < list.length; i++) {
                var obj = handlers[list[i]];
                if (!obj)
                    continue;
                if (obj.mask === "*" || obj.mask === key) {
                    obj.handler(value, old, key, meta);
                }
            }
        };
        Object.defineProperty(out, "$changes", {
            value: {
                attachEvent: observe,
                detachEvent: observeEnd,
            },
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(out, "$observe", {
            value: observe,
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(out, "$batch", {
            value: batch,
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(out, "$extend", {
            value: extend,
            enumerable: false,
            configurable: false,
        });
        out.$extend(data, config);
        return out;
    }
    function reactive(obj, val, key, notify) {
        Object.defineProperty(obj, key, {
            get: function () {
                return val;
            },
            set: function (value) {
                var changed = false;
                if (val === null || value === null) {
                    changed = val !== value;
                }
                else {
                    changed = val.valueOf() != value.valueOf();
                }
                if (changed) {
                    var old = val;
                    val = value;
                    notify(key, old, value, context);
                }
            },
            enumerable: true,
            configurable: false,
        });
    }

    function reportError(e) {
        console.error(e);
    }
    function defer() {
        var resolve;
        var promise = new Promise(function (res) {
            resolve = res;
        });
        promise.resolve = resolve;
        return promise;
    }
    function rtc(sendSignal, rtcConfig, handler, locale, node) {
        rtcConfig = rtcConfig || {
            iceServers: [
                {
                    urls: "stun:turn.webix.com:5349",
                },
                {
                    urls: "turn:turn.webix.com:5349",
                    username: "demo",
                    credential: "redro43a",
                },
            ],
        };
        var conn = new RTCPeerConnection(rtcConfig);
        var ready = defer();
        var trigger = function (obj) {
            if (obj)
                handler(obj);
            else
                handler({ action: "streams", conn: conn });
        };
        conn.onicecandidate = function (ev) {
            if (ev.candidate) {
                sendSignal("new-ice-candidate", ev.candidate);
            }
        };
        conn.ontrack = function () {
            trigger();
        };
        conn.onnegotiationneeded = function () {
            conn
                .createOffer()
                .then(function (offer) { return conn.setLocalDescription(offer); })
                .then(function () { return sendSignal("offer", conn.localDescription); })
                .catch(reportError);
        };
        conn.oniceconnectionstatechange = function () {
            switch (conn.iceConnectionState) {
                case "closed":
                case "failed":
                    end(true);
                    break;
            }
        };
        conn.onicegatheringstatechange = function () {
            switch (conn.signalingState) {
                case "closed":
                    end(true);
                    break;
            }
        };
        var handleGetUserMediaError = function (e, type) {
            if (!conn)
                return;
            switch (e.name) {
                case "NotFoundError":
                    webix.alert({
                        container: node,
                        text: locale("Could not find your") +
                            " " +
                            locale(type == "audio" ? "microphone" : "camera"),
                    });
                    break;
                case "SecurityError":
                case "PermissionDeniedError":
                    end(true);
                    break;
                default:
                    webix.alert({
                        container: node,
                        text: locale("Error opening your") +
                            " " +
                            locale(type == "audio" ? "microphone" : "camera"),
                    });
                    break;
            }
        };
        var start = function (mode, emode, reset) {
            if (reset)
                sendSignal("reset", "");
        };
        var restart = function () {
            conn.restartIce();
        };
        var onOffer = function (msg) {
            var desc = new RTCSessionDescription(msg);
            if (conn.getSenders().length === 0) {
                conn
                    .setRemoteDescription(desc)
                    .then(function () { return conn.createAnswer(); })
                    .then(function (answer) { return conn.setLocalDescription(answer); })
                    .then(function () {
                    ready.resolve();
                    sendSignal("answer", conn.localDescription);
                })
                    .catch(reportError);
            }
            else {
                conn
                    .setRemoteDescription(desc)
                    .then(function () { return conn.createAnswer(); })
                    .then(function (answer) { return conn.setLocalDescription(answer); })
                    .then(function () {
                    sendSignal("answer", conn.localDescription);
                })
                    .catch(reportError);
            }
        };
        var onAnswer = function (msg) {
            var desc = new RTCSessionDescription(msg);
            return conn
                .setRemoteDescription(desc)
                .then(function () {
                ready.resolve();
            })
                .catch(reportError);
        };
        var onCandidate = function (msg) {
            ready
                .then(function () {
                var candidate = new RTCIceCandidate(msg);
                return conn.addIceCandidate(candidate);
            })
                .catch(reportError);
        };
        var end = function (final) {
            if (conn) {
                conn.ontrack = null;
                conn.onremovetrack = null;
                conn.onremovestream = null;
                conn.onicecandidate = null;
                conn.oniceconnectionstatechange = null;
                conn.onsignalingstatechange = null;
                conn.onicegatheringstatechange = null;
                conn.onnegotiationneeded = null;
                conn.close();
                conn = null;
            }
            trigger({ action: "end", final: final });
        };
        var status = function () {
            return conn && conn.remoteDescription ? 1 : 0;
        };
        var enable = function (kind, mode) {
            var promise = webix.promise.defer();
            var tracks = conn
                .getSenders()
                .map(function (a) { return a.track || {}; })
                .reduce(function (p, c) { return p.concat(c); }, []);
            tracks = tracks.filter(function (a) { return a.kind === kind; });
            if (mode && !tracks.length) {
                trigger({ action: "upgrade", kind: kind, promise: promise });
            }
            else {
                tracks.forEach(function (a) { return (a.enabled = mode); });
                promise.resolve();
            }
            return promise;
        };
        var mediaValues = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
            },
            video: {
                facingMode: "user",
            },
        };
        var upgrade = function (type, promise) {
            var _a;
            return navigator.mediaDevices
                .getUserMedia((_a = {}, _a[type] = mediaValues[type], _a))
                .then(function (local) {
                local.getTracks().forEach(function (track) { return conn.addTrack(track, local); });
                trigger();
                promise.resolve();
            })
                .catch(function (e) {
                promise.reject();
                handleGetUserMediaError(e, type);
            });
        };
        return {
            start: start,
            end: end,
            restart: restart,
            status: status,
            enable: enable,
            onOffer: onOffer,
            onAnswer: onAnswer,
            upgrade: upgrade,
            onCandidate: onCandidate,
        };
    }

    function setStream(nodes, type, value) {
        var track = value.track;
        if (!track)
            return;
        var kind = track.kind;
        var tag = nodes[type][kind];
        var stream = new MediaStream();
        stream.addTrack(track);
        tag.srcObject = stream;
    }
    function phone(sendSignal, rtcConfig, nodes, role, mode, locale, node) {
        mode = webix.extend(mode || {}, {
            audio: true,
            video: false,
        });
        var emode = {
            audio: true,
            video: false,
        };
        var baseConn;
        var handler = function (_a) {
            var action = _a.action, conn = _a.conn, final = _a.final, kind = _a.kind, promise = _a.promise;
            if (action === "upgrade") {
                mode[kind] = true;
                baseConn.upgrade(kind, promise);
            }
            else if (action === "end") {
                if (nodes.remote.audio.srcObject)
                    nodes.remote.audio.srcObject.getTracks().forEach(function (track) { return track.stop(); });
                if (nodes.local.audio.srcObject)
                    nodes.local.audio.srcObject.getTracks().forEach(function (track) { return track.stop(); });
                if (nodes.remote.video.srcObject)
                    nodes.remote.video.srcObject.getTracks().forEach(function (track) { return track.stop(); });
                if (nodes.local.video.srcObject)
                    nodes.local.video.srcObject.getTracks().forEach(function (track) { return track.stop(); });
                nodes.local.audio.removeAttribute("src");
                nodes.local.audio.removeAttribute("srcObject");
                nodes.remote.audio.removeAttribute("src");
                nodes.remote.audio.removeAttribute("srcObject");
                nodes.local.video.removeAttribute("src");
                nodes.local.video.removeAttribute("srcObject");
                nodes.remote.video.removeAttribute("src");
                nodes.remote.video.removeAttribute("srcObject");
                if (final)
                    nodes.end();
            }
            else if (action === "streams") {
                conn.getSenders().forEach(function (a) { return setStream(nodes, "local", a); });
                conn.getReceivers().forEach(function (a) { return setStream(nodes, "remote", a); });
            }
        };
        var events = function (type, msg) {
            switch (type) {
                case "reset":
                    baseConn.end();
                    baseConn = init();
                    break;
                case "offer":
                    baseConn.onOffer(msg);
                    break;
                case "answer":
                    baseConn.onAnswer(msg);
                    break;
                case "new-ice-candidate":
                    baseConn.onCandidate(msg);
                    break;
                case "await-offer":
                    sendSignal("active", __assign({}, emode));
                    baseConn.restart();
                    break;
                case "active":
                    for (var key in msg) {
                        var trigger = nodes.active["remote"]
                            ? nodes.active["remote"][key]
                            : null;
                        if (trigger)
                            trigger(msg[key]);
                    }
                    break;
            }
        };
        var init = function () {
            sendSignal("active", __assign({}, emode));
            return rtc(sendSignal, rtcConfig, handler, locale, node);
        };
        baseConn = init();
        var end = function () {
            if (baseConn)
                baseConn.end();
        };
        var enable = function (key, value) {
            var promise = baseConn.enable(key, value);
            promise
                .then(function () {
                emode[key] = value;
            })
                .catch(function () {
                emode[key] = mode[key] = false;
            })
                .finally(function () {
                sendSignal("active", __assign({}, emode));
            });
            return promise;
        };
        switch (role) {
            case 1:
                baseConn.start(mode, emode);
                break;
            case 2:
                sendSignal("await-offer", "");
                break;
            case 3:
                baseConn.start(mode, emode, true);
                break;
        }
        return { events: events, enable: enable, end: end };
    }

    var CallPanel = (function (_super) {
        __extends(CallPanel, _super);
        function CallPanel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CallPanel.prototype.config = function () {
            this.time = 0;
            this.Helpers = this.app.getService("helpers");
            this.Back = this.app.getService("backend");
            this.callStatuses = this.Back.callStatuses;
            this.State = this.getParam("state", true);
            this.LocalState = createState({
                audio: true,
                video: false,
                remoteVideo: false,
                remoteAudio: false,
            });
            this.Initiator = this.State.callUsers[0] === this.app.config.user;
            if (this.State.callStatus === this.callStatuses["active"]) {
                this.AfterRefresh = true;
            }
            var users = this.app.getService("local")._users;
            return {
                type: "clean",
                width: this.getParam("compact", true) ? 0 : 380,
                rows: [
                    {
                        css: "webix_chat_call",
                        localId: "fullscreen",
                        rows: [
                            {
                                animate: false,
                                borderless: true,
                                cells: [this.GetAudioConfig(users), this.GetVideoConfig()],
                            },
                            {
                                borderless: true,
                                css: "webix_chat_video webix_chat_audio",
                                minHeight: 96,
                                gravity: 0.0001,
                                template: "\n\t\t\t\t\t\t\t\t<div style=\"position: relative; width: 100%; height: 100%;\">\n\t\t\t\t\t\t\t\t\t<div class=\"webix_chat_video_remote\">\n\t\t\t\t\t\t\t\t\t\t<audio autoplay></audio>\n\t\t\t\t\t\t\t\t\t\t<video autoplay playsinline></video>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"webix_chat_video_local\">\n\t\t\t\t\t\t\t\t\t\t<audio autoplay></audio>\n\t\t\t\t\t\t\t\t\t\t<video autoplay playsinline></video>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t" + this.Helpers.avatar(users.getItem(this.app.config.user), "webix_chat_video_local_avatar") + "\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t",
                                localId: "connection",
                            },
                            this.GetActionsConfig(),
                        ],
                    },
                ],
            };
        };
        CallPanel.prototype.init = function () {
            var _this = this;
            var video = this.$$("connection").$view;
            this.localVideo = video.querySelector(".webix_chat_video_local");
            this.localAvatar = video.querySelector(".webix_chat_video_local_avatar");
            this.remoteVideo = video.querySelector(".webix_chat_video_remote");
            this.on(this.Back.pubsub(), "signal", function (_a) {
                var msg = _a.msg, type = _a.type;
                if (_this.AfterRefresh)
                    return;
                if (msg)
                    msg = JSON.parse(msg);
                if (_this.Phone)
                    _this.Phone.events(type, msg);
            });
            this.on(this.app, "updateCallTime", function (time) { return _this.UpdateCallTime(time); });
            this.on(this.State.$changes, "callStatus", function (status) {
                return _this.HandleCallStatusChange(status);
            });
            this.on(this.LocalState.$changes, "remoteVideo", function () { return _this.ShowVideo(); });
        };
        CallPanel.prototype.GetAudioConfig = function (users) {
            var _this = this;
            var _ = this.app.getService("locale")._;
            return {
                localId: "audio",
                type: "clean",
                rows: [
                    {
                        css: "webix_chat_audio_time",
                        localId: "audio-timer",
                        batch: "active",
                        height: 56,
                        template: function () {
                            return _("Active call") + " (" + _this.Helpers.normalizeTime(_this.time) + ")";
                        },
                    },
                    {
                        gravity: 0.0001,
                        css: "webix_chat_audio",
                    },
                    {
                        height: 270,
                        css: "webix_chat_audio",
                        template: function () {
                            var user = users.getItem(_this.State.callUsers[_this.Initiator ? 1 : 0]);
                            var avatar = _this.Helpers.avatar(user, "webix_chat_call_avatar webix_chat_avatar");
                            return (avatar + "<p class='webix_chat_call_name'>" + user.name + "</p>");
                        },
                    },
                    {
                        batch: "outgoing",
                        css: "webix_chat_audio",
                        height: 30,
                        template: _("Ringing"),
                    },
                    {
                        batch: "income",
                        css: "webix_chat_audio",
                        height: 30,
                        template: _("Is calling you"),
                    },
                    {
                        batch: "income",
                        height: 42,
                        css: "webix_chat_audio",
                        cols: [
                            {},
                            {
                                view: "button",
                                height: 0,
                                width: 86,
                                value: _("Accept"),
                                css: "webix_chat_accept",
                                click: function () { return _this.AcceptCall(); },
                            },
                            {
                                view: "button",
                                width: 86,
                                value: _("Reject"),
                                css: "webix_danger",
                                click: function () { return _this.RejectCall(); },
                            },
                            {},
                        ],
                    },
                    {
                        batch: "refresh",
                        height: 42,
                        css: "webix_chat_audio",
                        cols: [
                            {},
                            {
                                view: "button",
                                height: 0,
                                width: 86,
                                value: _("Join call"),
                                css: "webix_chat_accept",
                                click: function () {
                                    _this.AfterRefresh = false;
                                    _this.Start(true);
                                },
                            },
                            {
                                view: "button",
                                width: 86,
                                value: _("End call"),
                                css: "webix_danger",
                                click: function () { return _this.EndCall(); },
                            },
                            {},
                        ],
                    },
                    {
                        gravity: 0.0001,
                        css: "webix_chat_audio",
                    },
                ],
            };
        };
        CallPanel.prototype.GetVideoConfig = function () {
            var _this = this;
            return {
                localId: "video",
                type: "clean",
                rows: [
                    {
                        css: "webix_chat_video_time",
                        height: 56,
                        type: "clean",
                        cols: [
                            {
                                localId: "video-timer",
                                template: function () {
                                    return _this.Helpers.normalizeTime(_this.time);
                                },
                            },
                            {
                                view: "icon",
                                localId: "fullscreen-icon",
                                icon: "chi-fullscreen",
                                click: function () {
                                    _this.SetFullscreen(!_this.fullscreen);
                                },
                            },
                            { width: 6 },
                        ],
                    },
                ],
            };
        };
        CallPanel.prototype.GetActionsConfig = function () {
            var _this = this;
            return {
                height: 80,
                css: "webix_chat_call_actions",
                localId: "call-actions",
                rows: [
                    {},
                    {
                        height: 44,
                        cols: [
                            {},
                            {
                                view: "toggle",
                                type: "icon",
                                offIcon: "chi-video-off",
                                onIcon: "chi-video",
                                localId: "video-toggle",
                                css: "webix_primary",
                                width: 44,
                                click: function () { return _this.EnableVideo(true); },
                            },
                            { width: 32 },
                            {
                                view: "toggle",
                                type: "icon",
                                offIcon: "chi-audio-off",
                                onIcon: "chi-audio",
                                localId: "audio-toggle",
                                css: "webix_primary",
                                width: 44,
                                value: true,
                                click: function () { return _this.EnableAudio(true); },
                            },
                            { width: 32 },
                            {
                                view: "button",
                                type: "icon",
                                icon: "chi-hangup",
                                css: "webix_danger",
                                width: 44,
                                click: function () { return _this.EndCall(); },
                            },
                            {},
                        ],
                    },
                    {},
                ],
            };
        };
        CallPanel.prototype.ControlVisibility = function (type, batch, actions) {
            var view = this.$$(type);
            view.show();
            if (batch)
                view.showBatch(batch);
            this.$$("call-actions")[actions ? "show" : "hide"]();
        };
        CallPanel.prototype.SetFullscreen = function (fullscreen) {
            webix.fullscreen.exit();
            var icon = this.$$("fullscreen-icon");
            icon.config.icon = "chi-fullscreen" + (fullscreen ? "-off" : "");
            icon.refresh();
            this.fullscreen = fullscreen
                ? webix.fullscreen.set(this.$$("fullscreen"), {
                    head: false,
                    css: "webix_chat_video_fullscreen",
                })
                : null;
        };
        CallPanel.prototype.Start = function (isAfterRefresh) {
            if (this.AfterRefresh) {
                this.ControlVisibility("audio", "refresh", false);
            }
            else {
                this.ControlVisibility("audio", "active", true);
                this.InitPhone(this.Initiator, isAfterRefresh);
                if (this.LocalState.audio)
                    this.EnableAudio();
                if (this.LocalState.video)
                    this.EnableVideo();
            }
        };
        CallPanel.prototype.InitPhone = function (isInitiator, isAfterRefresh) {
            var _this = this;
            var alist = this.$$("connection").$view.querySelectorAll("audio");
            var vlist = this.$$("connection").$view.querySelectorAll("video");
            this.Phone = phone(this.SendSignal.bind(this), this.app.config.rtcConfig || null, {
                local: { audio: alist[1], video: vlist[1] },
                remote: { audio: alist[0], video: vlist[0] },
                active: {
                    remote: {
                        video: function (v) { return (_this.LocalState.remoteVideo = v); },
                        audio: function (v) { return (_this.LocalState.remoteAudio = v); },
                    },
                },
                end: function () { return _this.EndCall(); },
            }, isInitiator ? (isAfterRefresh ? 3 : 1) : isAfterRefresh ? 2 : 4, { video: this.LocalState.video, audio: this.LocalState.audio }, this.app.getService("locale")._, this.app.getRoot().$view);
        };
        CallPanel.prototype.EndCall = function () {
            this.SetFullscreen(false);
            this.getParam("state", true).callStatus = this.callStatuses["drop"];
            if (this.Phone) {
                this.Phone.end();
                this.Phone = null;
                this.Back.updateCall(this.State.callId, this.callStatuses["end"]);
            }
            else {
                this.Back.updateCall(this.State.callId, this.callStatuses["ignore"]);
            }
        };
        CallPanel.prototype.AcceptCall = function () {
            this.Back.updateCall(this.State.callId, this.callStatuses["accept"]);
        };
        CallPanel.prototype.RejectCall = function () {
            this.getParam("state", true).callStatus = this.callStatuses["drop"];
            this.Back.updateCall(this.State.callId, this.callStatuses["reject"]);
        };
        CallPanel.prototype.SendSignal = function (type, payload) {
            if (this.app) {
                if (typeof payload !== "string")
                    payload = JSON.stringify(payload);
                return this.Back.signalCall(type, payload);
            }
        };
        CallPanel.prototype.EnableAudio = function (toggle) {
            var _this = this;
            var v = toggle
                ? (this.LocalState.audio = !this.LocalState.audio)
                : this.LocalState.audio;
            if (this.Phone) {
                this.Phone.enable("audio", v).catch(function () {
                    _this.LocalState.audio = false;
                    _this.$$("audio-toggle").setValue(false);
                });
            }
        };
        CallPanel.prototype.EnableVideo = function (toggle) {
            var _this = this;
            var v = toggle
                ? (this.LocalState.video = !this.LocalState.video)
                : this.LocalState.video;
            if (this.Phone) {
                this.Phone.enable("video", v)
                    .catch(function () {
                    _this.LocalState.video = false;
                    _this.$$("video-toggle").setValue(false);
                })
                    .finally(function () {
                    _this.ShowVideo();
                });
            }
        };
        CallPanel.prototype.CheckVideoVisibility = function () {
            var remote = this.LocalState.remoteVideo;
            var local = this.LocalState.video;
            var visibility = ["none", "none", "none"];
            if (remote) {
                if (local)
                    visibility = ["none", "block", "block"];
                else
                    visibility = ["block", "none", "block"];
            }
            else if (local)
                visibility = ["none", "block", "none"];
            [this.localAvatar, this.localVideo, this.remoteVideo].forEach(function (node, i) {
                node.style.display = visibility[i];
            });
        };
        CallPanel.prototype.UpdateCallTime = function (time) {
            this.time = time;
            if (this.fullscreen)
                this.fullscreen.queryView({ localId: "video-timer" }).refresh();
            else if (this.$$("audio-timer").isVisible())
                this.$$("audio-timer").refresh();
            else if (this.$$("video-timer").isVisible())
                this.$$("video-timer").refresh();
        };
        CallPanel.prototype.HandleCallStatusChange = function (status) {
            if (status == this.callStatuses["init"]) {
                this.ControlVisibility("audio", this.Initiator ? "outgoing" : "income", this.Initiator);
            }
            else if (status == this.callStatuses["active"]) {
                this.Start();
            }
            else if (status == this.callStatuses["reject"] ||
                status == this.callStatuses["end"] ||
                status == this.callStatuses["ignore"] ||
                status == this.callStatuses["lost"]) {
                if (this.Phone) {
                    this.SetFullscreen(false);
                    this.Phone.end();
                    this.Phone = null;
                }
            }
        };
        CallPanel.prototype.ShowVideo = function () {
            if (this.State.callStatus == this.callStatuses["active"] &&
                !this.AfterRefresh) {
                var remote = this.LocalState.remoteVideo;
                var audio = !this.LocalState.video && !remote;
                if (audio || !remote) {
                    this.SetFullscreen(false);
                    this.ControlVisibility("audio", "active", true);
                }
                else if (!this.fullscreen)
                    this.ControlVisibility("video", "", true);
                this.CheckVideoVisibility();
            }
        };
        return CallPanel;
    }(JetView));

    var FormView = (function (_super) {
        __extends(FormView, _super);
        function FormView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FormView.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            var helpers = this.app.getService("helpers");
            var avatarInput = {
                view: "forminput",
                name: "avatar",
                body: {
                    localId: "avatar",
                    css: "webix_chat_form_avatar",
                    width: 130,
                    height: 130,
                    borderless: true,
                    template: function (data) {
                        return helpers.formAvatar(data, _("Change avatar"));
                    },
                    onClick: {
                        webix_chat_avatar: function () {
                            var upload = _this.app.getService("upload");
                            upload.fileDialog();
                        },
                    },
                },
            };
            var nameInput = {
                name: "name",
                localId: "name",
                inputAlign: "center",
                view: "text",
                width: 300,
                placeholder: _("Chat name"),
                on: {
                    onChange: function (v) {
                        _this.NameChangedHandler(v);
                    },
                    onTimedKeyPress: function () {
                        _this.NameChangedHandler(_this.$$("name").getValue());
                    },
                },
            };
            var form = {
                padding: 20,
                margin: 20,
                elementsConfig: {
                    labelWidth: 130,
                    labelAlign: "right",
                },
                view: "form",
                localId: "form",
                css: "webix_chat_newchat_form",
                elements: [
                    { align: "center", body: avatarInput },
                    { align: "center", body: nameInput },
                    {},
                ],
            };
            return form;
        };
        FormView.prototype.init = function () {
            var _this = this;
            var _a = this.getParam("state", true), name = _a.name, avatar = _a.avatar, chat = _a.chat;
            this.$$("form").setValues({ name: name, avatar: { avatar: avatar } });
            var upload = this.app.getService("upload").getUploader(chat);
            this.on(upload, "onAfterFileAdd", function (data) {
                _this.UpdateAvatar(data);
            });
            this.on(upload, "onUploadComplete", function (data) {
                _this.UpdateAvatar(data);
            });
        };
        FormView.prototype.ready = function () {
            var _this = this;
            webix.delay(function () {
                _this.$$("name").focus();
            });
        };
        FormView.prototype.UpdateAvatar = function (data) {
            var _this = this;
            if (data.status === "client" && data.file) {
                var reader_1 = new FileReader();
                reader_1.onload = function () {
                    _this.SetLocalAvatar(reader_1.result);
                };
                reader_1.readAsDataURL(data.file);
            }
            else if (data.status === "server") {
                var avatar = data.value;
                this.$$("form").setValues({ avatar: avatar }, true);
                this.AvatarChangedHandler(avatar);
                this.SetLocalAvatar(avatar);
            }
        };
        FormView.prototype.SetLocalAvatar = function (avatar) {
            this.$$("avatar").setValues({ avatar: avatar });
        };
        FormView.prototype.SetInitValues = function () {
            var state = this.getParam("state", true);
            var _a = state.values.form, name = _a.name, avatar = _a.avatar;
            if (name || avatar) {
                this.$$("form").setValues({ name: name, avatar: { avatar: avatar } });
            }
        };
        FormView.prototype.NameChangedHandler = function () { };
        FormView.prototype.AvatarChangedHandler = function () { };
        return FormView;
    }(JetView));

    var checkedIcon = "<span class='webix_icon wxi-checkbox-marked'></span>";
    var notCheckedIcon = "<span class='webix_icon wxi-checkbox-blank'></span>";

    webix.ui.datafilter.umMasterCheckox = webix.extend({
        refresh: function (master, node, config) {
            node.onclick = function () {
                config.checked = !config.checked;
                var elem = node.querySelector(".webix_icon");
                elem.className =
                    "webix_icon wxi-checkbox-" + (config.checked ? "marked" : "blank");
                master.data.each(function (obj) { return (obj[config.columnId] = config.checked); });
                master.refresh();
                master.callEvent("onCustomSave", []);
            };
        },
        render: function (master, config) {
            return config.checked ? checkedIcon : notCheckedIcon;
        },
    }, webix.ui.datafilter.masterCheckbox);

    var PeopleView = (function (_super) {
        __extends(PeopleView, _super);
        function PeopleView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PeopleView.prototype.config = function () {
            var _this = this;
            var selectedList = {
                batch: "selected",
                view: "template",
                localId: "selected",
                scroll: "x",
                template: "",
                borderless: true,
            };
            var material = webix.skin.$name == "material" || webix.skin.$name == "mini";
            selectedList.height = 80 + (material ? 8 : 10) + webix.env.scrollSize;
            var table = {
                view: "datatable",
                localId: "table",
                css: "webix_chat_people_table",
                rowHeight: 60,
                headerRowHeight: Math.max(webix.skin.$active.barHeight - 2, 44),
                columns: this.GetColumns(),
                scheme: {
                    $sort: {
                        by: "name",
                        dir: "asc",
                    },
                },
                checkboxRefresh: true,
                on: {
                    onItemClick: function (id) { return _this.Toggle(id.row * 1); },
                    onCustomSave: function () { return _this.UpdatePeopleList(); },
                },
            };
            return {
                visibleBatch: "default",
                rows: [selectedList, table],
            };
        };
        PeopleView.prototype.init = function () {
            var _this = this;
            var users = this.app.getService("local").users();
            var table = this.$$("table");
            this.Users = [].concat(this.getParam("state", true).users);
            this.UsersStore = new webix.DataCollection({
                data: [],
            });
            this.UsersStore.data.attachEvent("onSyncApply", function () {
                table.clearAll();
                table.parse(_this.UsersStore.data
                    .serialize()
                    .map(function (_a) {
                    var id = _a.id, name = _a.name, avatar = _a.avatar, status = _a.status;
                    return { id: id, name: name, avatar: avatar, status: status };
                })
                    .filter(function (a) { return a.id !== _this.app.config.user; }));
                table.sort(function (a, b) { return _this.SortUsers(a, b); });
                _this.LoadPeopleList();
            });
            this.UsersStore.sync(users);
        };
        PeopleView.prototype.destroy = function () {
            this.UsersStore.destructor();
            this.UsersStore = null;
        };
        PeopleView.prototype.GetColumns = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            var helpers = this.app.getService("helpers");
            return [
                {
                    id: "selected",
                    header: {
                        content: "textFilter",
                        placeholder: _("Search"),
                        colspan: 2,
                        prepare: function (a) { return a.toLowerCase(); },
                        compare: this.GetCompare(),
                    },
                    width: 45,
                    cssFormat: function (_, obj) {
                        if (obj.selected) {
                            var isGroupUser = _this.Users.indexOf(obj.id) >= 0;
                            return "webix_chat_row_" + (isGroupUser ? "group_user" : "select");
                        }
                        return "";
                    },
                    template: function (obj) {
                        return obj.selected ? helpers.checkedIcon : helpers.notCheckedIcon;
                    },
                },
                {
                    id: "name",
                    header: "",
                    template: function (user) {
                        return helpers.listAvatar(user, "webix_chat_people_avatar") + user.name;
                    },
                    fillspace: 2,
                    cssFormat: function (_, obj) {
                        if (obj.selected) {
                            var isGroupUser = _this.Users.indexOf(obj.id) >= 0;
                            return "webix_chat_row_" + (isGroupUser ? "group_user" : "select");
                        }
                        return "";
                    },
                },
            ];
        };
        PeopleView.prototype.GetCompare = function () {
            return function (value, searchValue, user) {
                return user.name.toLowerCase().indexOf(searchValue) > -1;
            };
        };
        PeopleView.prototype.GetPeopleList = function (selected) {
            var _this = this;
            selected.sort(function (a, b) { return _this.SortUsers(a, b); });
            return this.app
                .getService("helpers")
                .peopleList(selected, false, this.Users);
        };
        PeopleView.prototype.SortUsers = function (a, b) {
            var ai = this.Users.indexOf(a.id);
            var bi = this.Users.indexOf(b.id);
            if (ai >= 0 && bi < 0)
                return 1;
            if (bi >= 0 && ai < 0)
                return -1;
            return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
        };
        PeopleView.prototype.Toggle = function (id) {
            var table = this.$$("table");
            var item = table.getItem(id);
            table.updateItem(id, { selected: !item.selected });
            this.UpdatePeopleList();
        };
        PeopleView.prototype.UpdatePeopleList = function () {
            var selected = this.GetSelected();
            this.SetBatch(selected.length ? "selected" : "default");
            var html = this.GetPeopleList(selected);
            this.$$("selected").setHTML(html);
            var state = this.getParam("state", true);
            state.users = this.GetSelectedIds();
        };
        PeopleView.prototype.LoadPeopleList = function () {
            var _this = this;
            var state = this.getParam("state", true);
            var ids = state.users.filter(function (a) { return a !== _this.app.config.user; });
            if (ids && ids.length) {
                var users_1 = [];
                ids.forEach(function (id) {
                    var item = _this.$$("table").getItem(id);
                    users_1.push(item);
                    item.selected = true;
                });
                this.SetBatch("selected");
                var html = this.GetPeopleList(users_1);
                this.$$("selected").setHTML(html);
            }
        };
        PeopleView.prototype.GetSelected = function () {
            var selected = [];
            this.$$("table").data.each(function (row) {
                if (row.selected)
                    selected.push(row);
            });
            return selected;
        };
        PeopleView.prototype.GetSelectedIds = function () {
            var selected = [];
            this.$$("table").data.each(function (row) {
                if (row.selected)
                    selected.push(row.id);
            });
            return selected;
        };
        PeopleView.prototype.SetBatch = function (batch) {
            if (batch)
                this.getRoot().showBatch(batch);
            else
                this.getRoot().showBatch("default");
        };
        return PeopleView;
    }(JetView));

    var Toolbar = (function (_super) {
        __extends(Toolbar, _super);
        function Toolbar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Toolbar.prototype.config = function () {
            return {
                view: "toolbar",
                height: Math.max(webix.skin.$active.toolbarHeight, 46),
                borderless: true,
                cols: [],
            };
        };
        Toolbar.prototype.init = function () {
            var _this = this;
            var state = this.getParam("state", true);
            this.on(state.$changes, "toolbar", function () {
                var cols = state.toolbar.cols.map(function (a) { return _this.ButtonFactory(a, state); });
                _this.webix.ui(cols, _this.getRoot());
            });
        };
        Toolbar.prototype.ButtonFactory = function (id, state) {
            var _this = this;
            var _ = this.app.getService("locale")._;
            switch (id) {
                case "close":
                    return {
                        view: "icon",
                        icon: "wxi-close",
                        hotkey: "esc",
                        width: Math.max(webix.skin.$active.inputHeight, 38),
                        click: function () {
                            state.cursor = 0;
                        },
                    };
                case "back":
                    return {
                        view: "icon",
                        icon: "chi-back",
                        width: Math.max(webix.skin.$active.inputHeight, 38),
                        hotkey: "esc",
                        click: function () {
                            state.cursor = state.cursor - 1;
                        },
                    };
                case "start":
                    return {
                        view: "icon",
                        icon: "chi-back",
                        width: Math.max(webix.skin.$active.inputHeight, 38),
                        hotkey: "esc",
                        click: function () {
                            _this.app.callEvent("wizardStart", []);
                        },
                    };
                case "label":
                    return {
                        view: "label",
                        css: "webix_chat_wizard_title",
                        labelAlign: "center",
                        label: typeof state.toolbar.label === "function"
                            ? state.toolbar.label()
                            : state.toolbar.label,
                    };
                case "edit":
                    return {
                        view: "icon",
                        icon: "wxi-pencil",
                        width: Math.max(webix.skin.$active.inputHeight, 38),
                        batch: "m1",
                        click: function () {
                            state.cursor = state.cursor + 1;
                        },
                    };
                case "save":
                    return {
                        batch: "m2",
                        view: "button",
                        label: _("Save"),
                        hotkey: "enter",
                        width: 130,
                        css: "webix_primary",
                        click: function () {
                            _this.app.callEvent("wizardSave", []);
                        },
                    };
            }
        };
        return Toolbar;
    }(JetView));

    var BaseWindow = (function (_super) {
        __extends(BaseWindow, _super);
        function BaseWindow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BaseWindow.prototype.config = function () {
            return this.app.getService("jet-win").updateConfig({
                view: "window",
                fullscreen: this.getParam("compact", true),
                width: 450,
                height: 600,
                borderless: true,
                head: Toolbar,
                body: {
                    $subview: true,
                },
            });
        };
        BaseWindow.prototype.init = function () {
            var _this = this;
            var id = this.getParam("id") || 0;
            var chat = id
                ? this.app
                    .getService("local")
                    .chats()
                    .getItem(id)
                : {
                    id: 0,
                    name: "",
                    users: [],
                    avatar: "",
                };
            var messageId = this.getParam("msgId") || 0;
            var state = createState({
                cursor: 1,
                toolbar: { label: "", cols: [] },
                chat: chat.id,
                name: chat.name,
                avatar: chat.avatar,
                users: [].concat(chat.users),
                group: !chat.direct_id,
                messageId: messageId,
            });
            this.setParam("state", state);
            var stages = this.stages();
            this.on(state.$changes, "cursor", function (v) {
                webix.delay(function () {
                    if (!stages[v])
                        _this.Close();
                    else {
                        _this.show(stages[v][0]);
                        state.toolbar = stages[v][1];
                    }
                });
            });
            this.on(this.app, "wizardSave", function () {
                if (_this.Save) {
                    _this.Save();
                    _this.Close();
                }
            });
        };
        BaseWindow.prototype.Close = function () {
            this.show("_hidden", { target: "top" });
        };
        return BaseWindow;
    }(JetView));

    var FormView$1 = (function (_super) {
        __extends(FormView, _super);
        function FormView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FormView.prototype.init = function () {
            var _this = this;
            this.on(this.app, "wizardSave", function () { return _this.Save(); });
            return _super.prototype.init.call(this);
        };
        FormView.prototype.Save = function () {
            var state = this.getParam("state", true);
            var ops = this.app.getService("operations");
            var form = this.$$("form").getValues();
            ops.updateChat(state.chat, form.name, form.avatar.avatar);
            state.$batch({
                name: form.name,
                avatar: form.avatar.avatar,
                cursor: 1,
            });
        };
        return FormView;
    }(FormView));

    var NewChatWin = (function (_super) {
        __extends(NewChatWin, _super);
        function NewChatWin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NewChatWin.prototype.stages = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            return [
                null,
                [
                    "./chat.info.info",
                    {
                        label: function () { return _this.getParam("state").name; },
                        cols: ["close", "label", "edit"],
                    },
                ],
                [
                    "./chat.info.form",
                    {
                        label: "<span class=\"webix_chat_wizard_title2\">" + _("Edit chat") + "</span>",
                        cols: ["back", "label", "save"],
                    },
                ],
                [
                    "./chat.info.people",
                    {
                        label: "<span class=\"webix_chat_wizard_title2\">" + _("Add members") + "</span>",
                        cols: ["start", "label", "save"],
                    },
                ],
            ];
        };
        NewChatWin.prototype.init = function () {
            var _this = this;
            _super.prototype.init.call(this);
            this.on(this.app, "leaveChatClick", function () {
                _this.LeaveChat();
            });
        };
        NewChatWin.prototype.LeaveChat = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            webix
                .confirm({
                container: this.app.getRoot().$view,
                title: _("Leave chat"),
                ok: _("Leave"),
                cancel: _("Cancel"),
                text: _("Are you sure to leave this chat?"),
            })
                .then(function () {
                var ops = _this.app.getService("operations");
                ops.leaveChat(_this.getParam("state").chat);
                _this.Close();
            });
        };
        return NewChatWin;
    }(BaseWindow));

    var ChatInfo = (function (_super) {
        __extends(ChatInfo, _super);
        function ChatInfo() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ChatInfo.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            var state = this.getParam("state", true);
            var helpers = this.app.getService("helpers");
            this.ShowAll = false;
            this.MemberListMaxCount = 3;
            this.CanAddUsers = state.group;
            var chatAvatar = {
                localId: "avatar",
                css: "webix_chat_form_avatar",
                width: 130,
                height: 130,
                borderless: true,
                template: function (data) {
                    return helpers.formAvatar(data, _("Avatar"));
                },
                data: { avatar: state.avatar },
            };
            var membersList = {
                view: "list",
                localId: "members",
                css: "webix_chat_list",
                borderless: true,
                autoheight: true,
                type: {
                    height: 60,
                    template: function (user) { return _this.ListTemplate(user); },
                    text: function (a) { return a.replace(/<[^>]*>/g, ""); },
                },
                onClick: {
                    webix_chat_list_item_delete: function (e, id) {
                        return _this.DeleteMemberClickHandler(id);
                    },
                },
            };
            var addMembersButton = {
                view: "button",
                type: "icon",
                width: 150,
                height: Math.max(webix.skin.$active.inputHeight, 38),
                icon: "wxi-plus",
                label: _("Add members"),
                click: function () { return (state.cursor = 3); },
            };
            var leaveChatButton = {
                view: "button",
                css: "webix_chat_delete_button",
                label: _("Leave chat"),
                width: 130,
                click: function () { return _this.LeaveChat(); },
            };
            var form = [
                {
                    type: "form",
                    cols: [{}, chatAvatar, {}],
                },
                {
                    type: "form",
                    rows: [
                        {
                            cols: [
                                {
                                    view: "label",
                                    label: _("Members") + " (" + state.users.length + ")",
                                },
                                addMembersButton,
                            ],
                        },
                        membersList,
                        {
                            localId: "showAllButton",
                            hidden: true,
                            autoheight: true,
                            borderless: true,
                            view: "template",
                            template: "<span class=\"webix_chat_show_all_btn\">" + _("Show all members") + "</span>",
                            css: "webix_chat_show_all_tmpl",
                            onClick: {
                                webix_chat_show_all_btn: function () { return _this.ShowAllMembers(state.users); },
                            },
                            inputWidth: 150,
                        },
                    ],
                },
                {},
            ];
            if (state.group)
                form.push({
                    type: "form",
                    padding: { top: 0 },
                    cols: [leaveChatButton, {}],
                });
            return {
                view: "form",
                type: "clean",
                scroll: true,
                borderless: true,
                elements: form,
            };
        };
        ChatInfo.prototype.init = function () {
            var _this = this;
            var state = this.getParam("state", true);
            if (this.$$("members"))
                this.InitMembersList(state.users);
            this.on(state.$changes, "users", function (v) { return _this.Filter(v); });
        };
        ChatInfo.prototype.InitMembersList = function (users) {
            var _this = this;
            var local = this.app.getService("local");
            var members = this.$$("members");
            members.data.attachEvent("onSyncApply", function () {
                members.data.sort(function (a, b) { return _this.Sort(a, b); }, "asc");
                _this.Filter(users);
            });
            members.sync(local.users());
        };
        ChatInfo.prototype.ListTemplate = function (user) {
            var _ = this.app.getService("locale")._;
            var youText = user.id == this.app.config.user
                ? " (<span class='webix_chat_list_you_text'>" + _("You") + "</span>)"
                : "";
            return (this.app.getService("helpers").listAvatar(user) +
                user.name +
                youText +
                this.DeleteButtonTemplate(user));
        };
        ChatInfo.prototype.DeleteButtonTemplate = function (user) {
            var html = "";
            if (user.id != this.app.config.user && this.CanAddUsers) {
                html =
                    "<button type='button' class='webix_icon_button webix_chat_list_item_delete'>" +
                        "<span class='webix_icon wxi-close'></span>" +
                        "</button>";
            }
            return html;
        };
        ChatInfo.prototype.Sort = function (a, b) {
            if (b.id == this.app.config.user)
                return 1;
            if (a.id == this.app.config.user)
                return -1;
            return a.name > b.name ? 1 : -1;
        };
        ChatInfo.prototype.ShowAllMembers = function (users) {
            this.ShowAll = true;
            this.Filter(users);
            this.$$("showAllButton").hide();
        };
        ChatInfo.prototype.Filter = function (users) {
            var _this = this;
            this.MemberListCount = 0;
            this.$$("members").data.filter(function (user) {
                var isDirect = user.direct_id == user.id;
                var groupMember = users && users.indexOf(user.id) > -1;
                var result = isDirect || groupMember;
                if (result && !_this.ShowAll) {
                    _this.MemberListCount++;
                }
                return result && _this.MemberListCount <= _this.MemberListMaxCount;
            });
            if (this.MemberListCount > this.MemberListMaxCount)
                this.$$("showAllButton").show();
        };
        ChatInfo.prototype.DeleteMemberClickHandler = function (id) {
            var _this = this;
            var _ = this.app.getService("locale")._;
            var ops = this.app.getService("operations");
            webix
                .confirm({
                container: this.app.getRoot().$view,
                title: _("Delete member"),
                ok: _("Delete"),
                cancel: _("Cancel"),
                text: _("Are you sure to delete this member?"),
            })
                .then(function () {
                var state = _this.getParam("state", true);
                state.users = state.users.filter(function (a) { return a != id; });
                ops.setUsers(state.chat, state.users);
            });
        };
        ChatInfo.prototype.LeaveChat = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            webix
                .confirm({
                container: this.app.getRoot().$view,
                title: _("Leave chat"),
                ok: _("Leave"),
                cancel: _("Cancel"),
                text: _("Are you sure to leave this chat?"),
            })
                .then(function () {
                var ops = _this.app.getService("operations");
                var state = _this.getParam("state", true);
                ops.leaveChat(state.chat);
                state.cursor = 0;
            });
        };
        return ChatInfo;
    }(JetView));

    var PeopleView$1 = (function (_super) {
        __extends(PeopleView, _super);
        function PeopleView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PeopleView.prototype.init = function () {
            var _this = this;
            var state = this.getParam("state", true);
            this._users = [].concat(state.users);
            this.on(this.app, "wizardStart", function () { return _this.Back(); });
            this.on(this.app, "wizardSave", function () { return _this.Save(); });
            return _super.prototype.init.call(this);
        };
        PeopleView.prototype.Save = function () {
            var state = this.getParam("state", true);
            var ops = this.app.getService("operations");
            ops.setUsers(state.chat, state.users);
            state.cursor = 1;
        };
        PeopleView.prototype.Back = function () {
            this.getParam("state", true).$batch({ cursor: 1, users: this._users });
        };
        return PeopleView;
    }(PeopleView));

    var NewChatWin$1 = (function (_super) {
        __extends(NewChatWin, _super);
        function NewChatWin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NewChatWin.prototype.stages = function () {
            var _ = this.app.getService("locale")._;
            return [
                null,
                [
                    "./chat.common.people",
                    {
                        label: "<span class=\"webix_chat_wizard_title2\">" + _("Add members") + "</span>",
                        cols: ["close", "label", "save"],
                    },
                ],
            ];
        };
        NewChatWin.prototype.Save = function () {
            var app = this.app;
            var state = this.getParam("state");
            if (state.users.length) {
                app.getService("operations").setUsers(state.chat, state.users);
            }
        };
        return NewChatWin;
    }(BaseWindow));

    var FormView$2 = (function (_super) {
        __extends(FormView, _super);
        function FormView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FormView.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            var form = _super.prototype.config.call(this, true);
            var nextButton = {
                view: "button",
                localId: "next",
                type: "icon",
                hotkey: "enter",
                icon: "chi-next",
                css: "webix_primary",
                label: "<span class=\"webix_chat_next_text\">" + _("People") + "</span>",
                width: 160,
                disabled: true,
                height: Math.max(webix.skin.$active.inputHeight, 38),
                align: "center",
                click: function () {
                    _this.ShowNextPage();
                },
            };
            form.elements.push({ align: "right", body: nextButton });
            return form;
        };
        FormView.prototype.ShowNextPage = function () {
            var state = this.getParam("state", true);
            var form = this.$$("form").getValues();
            state.name = form.name;
            state.avatar = form.avatar.avatar;
            state.cursor = state.cursor + 1;
        };
        FormView.prototype.NameChangedHandler = function (value) {
            var next = this.$$("next");
            if (value)
                next.enable();
            else
                next.disable();
        };
        return FormView;
    }(FormView));

    var NewChatWin$2 = (function (_super) {
        __extends(NewChatWin, _super);
        function NewChatWin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NewChatWin.prototype.stages = function () {
            var _ = this.app.getService("locale")._;
            return [
                null,
                [
                    "./chat.new.form",
                    {
                        label: "<span class=\"webix_chat_wizard_title1\">" + _("New chat") + "</span>",
                        cols: ["close", "label"],
                    },
                ],
                [
                    "./chat.common.people",
                    {
                        label: "<span class=\"webix_chat_wizard_title2\">" + _("Add members") + "</span>",
                        cols: ["back", "label", "save"],
                    },
                ],
            ];
        };
        NewChatWin.prototype.Save = function () {
            var app = this.app;
            var _a = this.getParam("state"), name = _a.name, avatar = _a.avatar, users = _a.users;
            if (users && users.length)
                app
                    .getService("operations")
                    .addGroupChat(name, avatar, users)
                    .then(function (cid) { return app.callEvent("showChat", ["chat", cid]); });
        };
        return NewChatWin;
    }(BaseWindow));

    var ListView = (function (_super) {
        __extends(ListView, _super);
        function ListView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ListView.prototype.config = function () {
            var _this = this;
            return {
                view: "list",
                localId: "list",
                select: true,
                borderless: true,
                css: "webix_chat_list",
                type: {
                    height: 60,
                    template: function (data, common) {
                        return _this.ListTemplate(data, common);
                    },
                    text: function (a) { return a.replace(/<[^>]*>/g, ""); },
                },
            };
        };
        ListView.prototype.InitSelf = function (data, filter) {
            var _this = this;
            var list = this.$$("list");
            list.data.attachEvent("onSyncApply", function () {
                _this.ApplySearchValue();
                _this.SyncHandler();
            });
            list.sync(data, filter || null);
            list.attachEvent("onAfterSelect", function (id) {
                _this.ShowChat(id);
            });
            this.on(this.app.getState().$changes, "search", function (v) {
                _this.Find(v);
            });
        };
        ListView.prototype.SyncHandler = function () { };
        ListView.prototype.ShowChat = function () { };
        ListView.prototype.ListTemplate = function (item) {
            return item.name;
        };
        ListView.prototype.EscapeRegExp = function (text) {
            return text.replace(/[[\]{}()*+?.\\^$|]/g, "\\$&");
        };
        ListView.prototype.ApplySearchValue = function () {
            var searchValue = this.app.getState().search;
            if (searchValue)
                this.Find(searchValue);
        };
        ListView.prototype.Find = function (text) {
            var _this = this;
            var list = this.$$("list");
            this.EscapedSearchText = this.EscapeRegExp(text || "");
            if (text) {
                text = text.toLowerCase();
                list.filter(function (data) { return _this.SearchCompare(text, data); });
            }
            else
                list.filter();
        };
        ListView.prototype.SearchCompare = function (value, item) {
            return item.name.toLowerCase().indexOf(value) > -1;
        };
        ListView.prototype.Select = function (id) {
            var list = this.$$("list");
            if (id != list.getSelectedId() && list.getItem(id))
                list.select(id);
        };
        return ListView;
    }(JetView));

    var MessageCallEnd = 900;
    var MessageCallRejected = 901;
    var MessageCallMissed = 902;
    var chatsView = (function (_super) {
        __extends(chatsView, _super);
        function chatsView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        chatsView.prototype.config = function () {
            var _this = this;
            var limited = this.app.config.mode === "limited";
            var _ = this.app.getService("locale")._;
            var ui = _super.prototype.config.call(this);
            var bottomForm = {
                padding: 9,
                rows: [
                    {
                        view: "button",
                        type: "icon",
                        icon: "wxi-plus",
                        css: "webix_chat_add_button",
                        height: Math.max(webix.skin.$active.inputHeight, 38),
                        label: _("New chat"),
                        click: function () { return _this.app.callEvent("newChat", []); },
                        hidden: limited,
                    },
                ],
            };
            return {
                type: "clean",
                rows: [ui, bottomForm],
            };
        };
        chatsView.prototype.init = function () {
            var _this = this;
            var state = this.app.getParam("state", true);
            var chats = this.app.getService("local").chats();
            this.InitSelf(chats);
            chats.waitData.then(function () {
                _this.on(state.$changes, "chatId", function (id) {
                    if (id)
                        _this.Select(id);
                    else
                        _this.$$("list").unselectAll();
                });
            });
            if (this.app.config.emojis)
                this.Emojis = this.app.getService("emojis");
        };
        chatsView.prototype.ShowChat = function (id) {
            this.app.callEvent("showChat", ["chat", id * 1]);
        };
        chatsView.prototype.ListTemplate = function (chat, common) {
            var locale = this.app.getService("locale")._;
            var helpers = this.app.getService("helpers");
            var html = "";
            html += helpers.listAvatar(chat);
            html += "<div class='webix_chat_listitem_block'>";
            html += "<div class='webix_chat_listitem_name'>" + helpers.addTextMark(chat.name, this.EscapedSearchText) + "</div>";
            if (chat.date)
                html += "<span class='webix_chat_listitem_date'>" + helpers.dateChatFormat(chat.date) + "</span>";
            if (chat.unread_count) {
                var css = "webix_chat_listitem_number";
                if (chat.unread_count > 9)
                    css += " webix_chat_listitem_number_wide";
                html += "<span class='" + css + "'>" + chat.unread_count + "</span>";
            }
            if (chat.message_type) {
                html += "<div class='webix_chat_listitem_message'>";
                switch (chat.message_type) {
                    case MessageCallEnd:
                        html += locale("Ended call") + " (" + chat.message + ")";
                        break;
                    case MessageCallRejected:
                        html += locale("Rejected call");
                        break;
                    case MessageCallMissed:
                        html += locale("Missed call");
                        break;
                }
                html += "</div>";
            }
            else if (chat.message) {
                var message = common.text(chat.message);
                if (this.Emojis)
                    message = this.Emojis.replaceEmoji(message);
                html += "<div class='webix_chat_listitem_message'>";
                html += message;
                html += "</div>";
            }
            return html + "</div>";
        };
        return chatsView;
    }(ListView));

    webix.protoUI({
        name: "chat-search",
        $cssName: "search",
        on_click: {
            webix_input_icon: function (e) {
                var css = e.target.className;
                if (css.indexOf(this.config.closeIcon) > -1) {
                    this.getInputNode().focus();
                    this.setValue("");
                    this.callEvent("onCloseIconClick", [e]);
                    this.hideCloseIcon();
                }
                else {
                    this.getInputNode().focus();
                    this.callEvent("onSearchIconClick", [e]);
                }
            },
        },
        setIcon: function (icon) {
            var nodes = this.$view.getElementsByClassName("webix_input_icon");
            if (nodes.length)
                nodes[0].className = "webix_input_icon " + icon;
        },
        showCloseIcon: function () {
            this.setIcon(this.config.closeIcon);
        },
        hideCloseIcon: function () {
            this.setIcon(this.config.icon);
        },
        defaults: {
            closeIcon: "wxi-close",
        },
    }, webix.ui.search);

    var SideBar = (function (_super) {
        __extends(SideBar, _super);
        function SideBar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SideBar.prototype.config = function () {
            var _this = this;
            var _ = this.app.getService("locale")._;
            var tabbar = {
                view: "tabbar",
                borderless: true,
                css: "webix_chat_tabbar",
                height: 52,
                bottomOffset: 0,
                options: [
                    { value: _("Chats"), id: "chats" },
                    { value: _("Users"), id: "users" },
                ],
                on: {
                    onChange: function (v) { return _this.ShowPanel(v); },
                },
            };
            var rows = [
                tabbar,
                {
                    padding: 9,
                    rows: [
                        {
                            view: "chat-search",
                            localId: "search",
                            height: Math.max(webix.skin.$active.inputHeight, 38),
                            placeholder: _("Search"),
                        },
                    ],
                },
                {
                    $subview: true,
                    name: "left",
                },
            ];
            return {
                css: "webix_chat_sidebar",
                width: 320,
                type: "clean",
                rows: rows,
            };
        };
        SideBar.prototype.init = function () {
            var _this = this;
            this.State = this.getParam("state", true);
            this.ShowPanel("chats");
            this.$$("search").attachEvent("onTimedKeyPress", function () {
                _this.State.search = _this.$$("search").getValue();
            });
            this.$$("search").attachEvent("onChange", function () {
                _this.State.search = _this.$$("search").getValue();
            });
            this.on(this.State.$changes, "search", function (v) {
                if (v)
                    _this.$$("search").showCloseIcon();
                else {
                    _this.$$("search").setValue("");
                    _this.$$("search").hideCloseIcon();
                }
            });
        };
        SideBar.prototype.ShowPanel = function (v) {
            this.State.search = "";
            this.show("./" + v, { target: "left" });
        };
        return SideBar;
    }(JetView));

    var SideMenu = (function (_super) {
        __extends(SideMenu, _super);
        function SideMenu() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SideMenu.prototype.config = function () {
            var _this = this;
            return {
                view: "sidemenu",
                css: "webix_chat_sidemenu",
                animate: false,
                width: 320,
                position: "left",
                state: function (state) {
                    state.left = _this.Parent.left;
                    (state.top = _this.Parent.top), (state.height = _this.Parent.height);
                },
                body: SideBar,
            };
        };
        SideMenu.prototype.init = function () {
            var _this = this;
            this.on(this.app, "top:navigation", function () {
                _this.getRoot().hide();
            });
            this.on(this.app, "view:resize", function () {
                if (_this.getRoot().isVisible())
                    _this.Show(true);
            });
        };
        SideMenu.prototype.Show = function (updatePos) {
            if (!updatePos && this.getRoot().isVisible())
                return;
            this.Parent = this.app.getRoot().$view.getBoundingClientRect();
            this.getRoot().show();
        };
        return SideMenu;
    }(JetView));

    var EmojiTemplate = (function (_super) {
        __extends(EmojiTemplate, _super);
        function EmojiTemplate() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EmojiTemplate.prototype.config = function () {
            var _this = this;
            var _ = (this._ = this.app.getService("locale")._);
            this.Emojis = this.app.getService("emojis");
            return {
                view: "popup",
                body: {
                    rows: [
                        {
                            css: "webix_chat_layout_esearch",
                            padding: { top: 5, bottom: 5, left: 10, right: 10 },
                            visibleBatch: "categories",
                            localId: "toolbar",
                            rows: [
                                {
                                    batch: "categories",
                                    cols: [
                                        {
                                            view: "icon",
                                            localId: "searchBtn",
                                            icon: "wxi-search",
                                        },
                                        {
                                            view: "list",
                                            borderless: true,
                                            localId: "categories",
                                            css: "webix_chat_emoji_categories_list",
                                            template: function (obj) { return _this.CategoryMenuTemplate(obj); },
                                            select: true,
                                            layout: "x",
                                            on: {
                                                onItemClick: function (id, e) {
                                                    _this.ShowCategory(id);
                                                    webix.html.preventEvent(e);
                                                },
                                            },
                                            data: this.Emojis.categories(),
                                        },
                                    ],
                                },
                                {
                                    batch: "search",
                                    margin: webix.skin.$active.layoutMargin.form,
                                    cols: [
                                        {
                                            view: "icon",
                                            localId: "backBtn",
                                            icon: "chi-back",
                                        },
                                        { view: "text", localId: "search", placeholder: _("Search") },
                                    ],
                                },
                            ],
                        },
                        {
                            view: "scrollview",
                            height: 200,
                            scroll: true,
                            localId: "views",
                            body: {
                                visibleBatch: "categories",
                                type: "clean",
                                padding: {
                                    left: 10,
                                    right: 10,
                                },
                                rows: this.GetLists(),
                            },
                        },
                        {
                            localId: "preview",
                            view: "template",
                            hidden: webix.env.mobile,
                            template: " ",
                            height: 40,
                        },
                    ],
                },
            };
        };
        EmojiTemplate.prototype.init = function () {
            var _this = this;
            this.Preview = this.$$("preview");
            var search = this.$$("search");
            search.attachEvent("onTimedKeyPress", function () {
                _this.Find(search.getValue());
            });
            this.ScrollHandler();
            this._searchClickEvent = webix.event(this.$$("searchBtn").$view, "click", function (e) {
                _this.ShowSearchHeader();
                webix.html.preventEvent(e);
            });
            this._backClickEvent = webix.event(this.$$("backBtn").$view, "click", function (e) {
                _this.HideSearchHeader();
                webix.html.preventEvent(e);
            });
        };
        EmojiTemplate.prototype.ScrollHandler = function () {
            var _this = this;
            var views = this.$$("views")
                .getBody()
                .getChildViews();
            var sum = 0, heights = [];
            views.forEach(function (v) {
                if (!v.config.hidden) {
                    sum += v.$height - 5;
                    heights.push(sum);
                }
            });
            this._scrollEvent = webix.event(this.$$("views").$view, "scroll", function () {
                var y = _this.$$("views").$view.scrollTop;
                var index;
                for (var i = 0; i < heights.length && typeof index == "undefined"; i++) {
                    if (i == heights.length - 1 ||
                        (y < heights[i] && (!i || y >= heights[i - 1])))
                        index = i;
                }
                _this.$$("categories").select(_this.Emojis.categories()[index].id);
            });
        };
        EmojiTemplate.prototype.GetLists = function () {
            var _this = this;
            var rows = [];
            var data = {};
            this.Emojis.emojis().data.each(function (emoji) {
                if (!data[emoji.category])
                    data[emoji.category] = [];
                data[emoji.category].push(emoji);
            });
            this.Emojis.categories().forEach(function (c) {
                rows.push(_this.ListConfig("category_" + c.id, c.id == "basic" ? _this.Emojis.basicEmojis() : data[c.id], _this._(c.name), "categories"));
            });
            rows.push(this.ListConfig("searchResults", [], this._("Search results"), "search"));
            return rows;
        };
        EmojiTemplate.prototype.ListConfig = function (id, data, title, batch) {
            var _this = this;
            var config = {
                type: "clean",
                batch: batch,
                rows: [
                    {
                        template: title,
                        css: "webix_emoji_category_label",
                        autoheight: true,
                    },
                    {
                        view: "dataview",
                        localId: id,
                        autoheight: true,
                        xCount: 6,
                        type: {
                            css: "webix_chat_emojis_item",
                            width: 40,
                            height: 40,
                        },
                        on: {
                            onItemClick: function (id) {
                                this.$scope.app.callEvent("pasteEmoji", [id, this.getItem(id)]);
                            },
                            onMouseMove: function (id) {
                                var item = this.getItem(id);
                                this.$scope.ShowPreview(item);
                            },
                        },
                        mouseEventDelay: 100,
                        template: function (obj) { return _this.ItemTemplate(obj); },
                        data: data,
                    },
                ],
            };
            if (!webix.env.mobile)
                config.rows[1].on.onMouseMove = function (id) {
                    var item = this.getItem(id);
                    this.$scope.ShowPreview(item);
                };
            return config;
        };
        EmojiTemplate.prototype.Show = function (node) {
            this.HideSearchHeader();
            this.getRoot().show(node);
            var id = this.Emojis.categories()[0].id;
            this.$$("categories").select(id);
            this.ShowCategory(id);
        };
        EmojiTemplate.prototype.Hide = function () {
            this.getRoot().hide();
        };
        EmojiTemplate.prototype.ItemTemplate = function (obj) {
            return ("<div class='webix_chat_emoji webix_chat_emoji_" +
                obj.unified +
                "'></div>");
        };
        EmojiTemplate.prototype.ShowPreview = function (item) {
            this.Preview.setHTML(this.PreviewTemplate(item));
        };
        EmojiTemplate.prototype.PreviewTemplate = function (obj) {
            var search = this.$$("search");
            var value = search.isVisible() ? search.getValue() : "";
            var name = this.Emojis.findName(obj, value);
            if (!name)
                return "";
            name = this.Emojis.shortNameToTitle(name);
            return ("<div class='webix_chat_emoji_preview'>" +
                "<div class='webix_chat_emoji webix_chat_emoji_" +
                obj.unified +
                "'></div>" +
                "<div class='webix_chat_emoji_name'>" +
                name +
                "</div></div>");
        };
        EmojiTemplate.prototype.Find = function (value) {
            if (value) {
                this.$$("views")
                    .getBody()
                    .showBatch("search");
                value = value.toLowerCase();
                var data = this.Emojis.emojis().data.find(function (item) {
                    var result = false;
                    for (var i = 0; i < item.names.length && !result; i++)
                        result = item.names[i].includes(value);
                    return result;
                });
                this.$$("searchResults").clearAll();
                this.$$("searchResults").parse(data);
            }
            else {
                this.$$("views")
                    .getBody()
                    .showBatch("categories");
            }
        };
        EmojiTemplate.prototype.ShowSearchHeader = function () {
            this.$$("toolbar").showBatch("search");
            this.$$("search").setValue("");
            this.$$("search").focus();
        };
        EmojiTemplate.prototype.HideSearchHeader = function () {
            this.Find();
            this.$$("views")
                .getBody()
                .showBatch("categories");
            this.$$("toolbar").showBatch("categories");
        };
        EmojiTemplate.prototype.CategoryMenuTemplate = function (obj) {
            return "<span class='webix_icon " + obj.icon + "'></span>";
        };
        EmojiTemplate.prototype.ShowCategory = function (categoryId) {
            var index = this.Emojis.categories().findIndex(function (c) { return c.id == categoryId; });
            var layoutId = this.$$("views")
                .getBody()
                .getChildViews()[index].config.id;
            this.$$("views").showView(layoutId);
        };
        EmojiTemplate.prototype.destroy = function () {
            if (this._scrollEvent)
                webix.eventRemove(this._scrollEvent);
            webix.eventRemove(this._backClickEvent);
            webix.eventRemove(this._searchClickEvent);
        };
        return EmojiTemplate;
    }(JetView));

    var EmojiSuggest = (function (_super) {
        __extends(EmojiSuggest, _super);
        function EmojiSuggest(app, master) {
            var _this = _super.call(this, app) || this;
            _this.Master = master;
            return _this;
        }
        EmojiSuggest.prototype.config = function () {
            var _this = this;
            this.Emojis = this.app.getService("emojis");
            var symbol = this.Emojis.symbol;
            return {
                view: "mentionsuggest",
                symbol: symbol,
                maxHeight: 200,
                css: "webix_chat_emojisuggest",
                template: function (obj) { return _this.SuggestTemplate(obj); },
                filter: function (data) {
                    if (_this.FilterText) {
                        var text = _this.getRoot().getItemText(data.id);
                        return (text &&
                            text.toLowerCase().indexOf(_this.FilterText.toLowerCase()) > -1);
                    }
                    return false;
                },
                body: {
                    template: function (obj) { return _this.ItemTemplate(obj); },
                    data: this.Emojis.emojis(),
                },
            };
        };
        EmojiSuggest.prototype.init = function () {
            var _this = this;
            this.Text = this.Master.queryView({ name: "text" });
            this.Text.setValueHere = function (value, data, details) {
                if (value.indexOf(" ") != -1 && value.indexOf(" ") != value.length - 1)
                    value = "\"" + value + "\"";
                return webix.ui.text.prototype.setValueHere.apply(this, [
                    value,
                    data,
                    details,
                ]);
            };
            this.Popup = this.getRoot();
            this.on(this.Popup.getList().data, "onBeforeFilter", function () {
                return _this.BeforeFilterHandler();
            });
            this._keyEvent = webix.event(this.Text.$view, "keydown", function (e) {
                _this.KeyCode = e.keyCode;
            }, { capture: true });
            this.on(this.Popup, "onValueSuggest", function (data, text) {
                webix.delay(function () {
                    _this.Master.focus();
                    var inp = _this.Text.getInputNode();
                    var len = text.length - _this.FilterText.length;
                    inp.setSelectionRange(_this._lastCursorPosition + len, _this._lastCursorPosition + len);
                });
            });
            this.on(this.Popup, "onShow", function () { return _this.ShowHandler(); });
        };
        EmojiSuggest.prototype.ShowHandler = function () {
            var list = this.Popup.getList();
            list.select(list.getFirstId());
        };
        EmojiSuggest.prototype.LinkInput = function () {
            var _this = this;
            this.on(this.Text, "onAfterRender", function () {
                _this.Popup.linkInput(_this.Text);
            });
        };
        EmojiSuggest.prototype.BeforeFilterHandler = function () {
            this._lastCursorPosition = webix.html.getSelectionRange(this.Text.getInputNode()).start;
            var code = this.KeyCode;
            if ((code == 37 || code == 39) && !this.Popup.isVisible())
                return false;
            this.FilterText = null;
            var value = this.Text.getValue();
            var symbol = this.Emojis.symbol;
            value = value.substring(0, this._lastCursorPosition);
            if (value.indexOf(symbol) === -1)
                return false;
            else {
                value = value
                    .toLowerCase()
                    .substring(value.lastIndexOf(symbol) + symbol.length);
                if (value.length &&
                    value.match("^[A-Za-z0-9-+]+$") &&
                    !value.indexOf(this.LastFilterFail) > -1) {
                    var result = this.Emojis.emojis().data.find(function (emoji) {
                        return emoji.names.some(function (n) { return n.toLowerCase().indexOf(value) != -1; });
                    }, true);
                    if (result)
                        this.FilterText = value;
                    else {
                        this.FilterText = null;
                        this.LastFilterFail = value;
                    }
                    return this.FilterText;
                }
                if (this.Popup.isVisible())
                    this.Popup.hide();
                return false;
            }
        };
        EmojiSuggest.prototype.SuggestTemplate = function (obj) {
            var text = this.Emojis.findName(obj, this.FilterText);
            return text ? text + ": " : null;
        };
        EmojiSuggest.prototype.ItemTemplate = function (obj) {
            var name = this.Emojis.findName(obj, this.FilterText);
            if (!name)
                return "";
            name = this.Emojis.shortNameToTitle(name);
            return ("<div class='webix_chat_emoji_preview'>" +
                "<div class='webix_chat_emoji webix_chat_emoji_" +
                obj.unified +
                "'></div>" +
                "<div class='webix_chat_emoji_name'>" +
                name +
                "</div></div>");
        };
        EmojiSuggest.prototype.destroy = function () {
            webix.eventRemove(this._keyEvent);
        };
        return EmojiSuggest;
    }(JetView));

    var Toolbar$1 = (function (_super) {
        __extends(Toolbar, _super);
        function Toolbar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Toolbar.prototype.config = function () {
            var _this = this;
            var config = this.app.config;
            var _ = this.app.getService("locale")._;
            this.Compact = this.getParam("compact", true);
            var mode = config.mode;
            this.Limited = mode === "single" || mode === "limited";
            var width = Math.max(webix.skin.$active.inputHeight, 38);
            return {
                view: "toolbar",
                localId: "toolbar",
                visibleBatch: "active",
                css: "webix_chat_toolbar",
                padding: {
                    right: 4,
                    top: 3,
                    bottom: 3,
                },
                elements: [
                    {
                        view: "icon",
                        icon: "webix_icon chi-menu",
                        click: function () { return _this.app.callEvent("showSidebar", []); },
                        hidden: !this.Compact || mode === "single",
                    },
                    {
                        view: "template",
                        height: 46,
                        localId: "chatTitle",
                        css: "webix_chat_toolbar_tmpl",
                        name: "chatTitle",
                        borderless: true,
                        template: function (data) { return _this.TitleTemplate(data); },
                        onClick: {
                            webix_chat_title: function () {
                                _this.ChatInfoHandler();
                            },
                        },
                    },
                    {
                        view: "icon",
                        batch: "active",
                        icon: "chi-video",
                        tooltip: _("Start call"),
                        localId: "call",
                        width: width,
                        click: function () {
                            _this.StartCallHandler();
                        },
                    },
                    {
                        view: "icon",
                        batch: "active",
                        icon: "chi-account-plus",
                        tooltip: _("Add members"),
                        width: width,
                        click: function () {
                            _this.NewMembersHandler();
                        },
                    },
                    {
                        view: "icon",
                        batch: "active",
                        icon: "wxi-dots",
                        width: width,
                        click: function (id, ev) {
                            _this.ToggleMenu(ev);
                        },
                    },
                ],
            };
        };
        Toolbar.prototype.init = function () {
            var _this = this;
            var state = this.getParam("state", true);
            this.State = state;
            var chats = this.app.getService("local").chats();
            chats.data.attachEvent("onStoreUpdated", function (id) {
                if (!id || id == state.chatId) {
                    _this.Refresh();
                }
            });
            this.on(state.$changes, "*", function () {
                _this.Refresh();
            });
            this.InitMenu();
        };
        Toolbar.prototype.Refresh = function () {
            var state = this.State;
            if (!this.getRoot())
                return false;
            var local = this.app.getService("local");
            var obj;
            if (state.chatId) {
                var chats = local.chats();
                obj = chats.getItem(state.chatId);
            }
            else {
                var users = local.users();
                obj = users.getItem(state.userId);
            }
            obj = obj || {};
            this.$$("chatTitle").setValues(obj);
            if (obj.direct_id && this.app.config.calls)
                this.$$("call").show();
            else
                this.$$("call").hide();
            var t = this.$$("toolbar");
            if (state.chatId && !this.Limited)
                t.showBatch("active");
            else
                t.showBatch("inactive");
        };
        Toolbar.prototype.TitleTemplate = function (data) {
            var _ = this.app.getService("locale")._;
            var helpers = this.app.getService("helpers");
            var result = "";
            if (data.name) {
                result += helpers.listAvatar(data, "webix_chat_toolbar_avatar");
                if (data.users) {
                    var members = data.users.length + " " + _("members");
                    result += "<div class='webix_chat_title'>";
                    if (data.direct_id)
                        result += "<span class=\"webix_chat_messages_chat_name\">" + data.name + "</span>";
                    else
                        result +=
                            "<div class=\"webix_chat_messages_groupchat_name\">" + data.name + "</div>" +
                                ("<div class=\"webix_chat_messages_groupchat_members\">" + members + "</div>");
                    result += "</div>";
                }
                else
                    result += "<span class=\"webix_chat_messages_user_name\">" + data.name + "</span>";
            }
            return result;
        };
        Toolbar.prototype.ToggleMenu = function (ev) {
            if (this.ToolbarMenu.isVisible())
                this.ToolbarMenu.hide();
            else
                this.ToolbarMenu.show(ev.target, { pos: "left", y: 30, x: 10 });
        };
        Toolbar.prototype.InitMenu = function () {
            var _this = this;
            this.ToolbarMenu = this.ui({
                view: "contextmenu",
                autowidth: true,
                point: false,
                data: this.GetMenuData(),
                on: {
                    onItemClick: function (id) {
                        if (_this.ToolbarMenu.callEvent("onBeforeMenuAction", [id])) {
                            if (id == "info")
                                _this.ChatInfoHandler();
                        }
                    },
                },
            });
            return this.ToolbarMenu;
        };
        Toolbar.prototype.GetMenuData = function () {
            var _ = this.app.getService("locale")._;
            return [{ id: "info", value: _("Chat info") }];
        };
        Toolbar.prototype.ChatInfoHandler = function () {
            if (this.State.chatId && !this.Limited)
                this.app.callEvent("chatInfo", [this.State.chatId]);
        };
        Toolbar.prototype.NewMembersHandler = function () {
            this.app.callEvent("newMembers", [this.State.chatId]);
        };
        Toolbar.prototype.StartCallHandler = function () {
            this.app.callEvent("startCall", [
                this.State.userId || this.State.chatId,
                this.State.chatId || 0,
            ]);
        };
        return Toolbar;
    }(JetView));

    webix.protoUI({
        name: "chat-comments",
        $cssName: "comments",
        $init: function (config) {
            if (config.ChatFormConfig)
                config.ChatFormConfig(config);
            if (config.ChatListConfig)
                config.ChatListConfig(config);
        },
    }, webix.ui.comments);
    webix.protoUI({
        name: "chat-comments-layout",
        $cssName: "layout",
        hide: function () { },
    }, webix.ui.layout);
    webix.protoUI({
        name: "chat-comments-text",
        $cssName: "texthighlight",
        define: function (a, b) {
            var h = a.height;
            if (h) {
                var c = this.config;
                if (h < 70 && h > c.inactiveHeight)
                    a.height = c.inactiveHeight;
            }
            return webix.ui.texthighlight.prototype.define.call(this, a, b);
        },
    }, webix.ui.texthighlight);

    var MessagesView = (function (_super) {
        __extends(MessagesView, _super);
        function MessagesView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MessagesView.prototype.config = function () {
            var _this = this;
            this.Helpers = this.app.getService("helpers");
            this.State = this.getParam("state", true);
            this.Upload = this.app.getService("upload");
            this.UploadDelay = 500;
            this.WithReactions = this.app.config.reactions;
            this._ = this.app.getService("locale")._;
            var ui = {
                view: "chat-comments",
                sendAction: "enter",
                localId: "comments",
                css: this.WithReactions ? "webix_chat_comments_rct" : "",
                currentUser: this.app.config.user,
                users: new webix.DataCollection({
                    data: [],
                    scheme: {
                        $init: function (user) {
                            user.value = user.name;
                            user.image = user.avatar;
                        },
                    },
                }),
                listItem: {
                    templateText: function (obj) { return _this.MessageTemplateText(obj); },
                    templateLinks: function (obj) { return _this.MessageTemplateLink(obj); },
                    templateMenu: function (obj) { return _this.MessageTemplateMenu(obj); },
                    templateUser: function (obj) { return _this.MessageTemplateUser(obj); },
                    templateAvatar: function (obj) { return _this.MessageTemplateAvatar(obj); },
                    templateDate: function (obj) { return _this.MessageTemplateDate(obj); },
                },
            };
            if (this.app.config.files || this.app.config.emojis)
                ui.ChatFormConfig = function (conf) { return _this.FormConfig(conf); };
            if (this.WithReactions)
                ui.ChatListConfig = function (conf) { return _this.ListConfig(conf); };
            return {
                rows: [Toolbar$1, ui],
            };
        };
        MessagesView.prototype.init = function () {
            var _this = this;
            var comments = (this.Comments = this.$$("comments"));
            var list = (this.List = comments.queryView("list"));
            this.Local = this.app.getService("local");
            this.Back = this.app.getService("backend");
            this.Users = this.Local.users();
            var serverEvents = this.Back.pubsub();
            this.Ops = this.app.getService("operations");
            var users = comments.getUsers();
            this.on(users.data, "onSyncApply", function () {
                users.data.each(function (item) {
                    item.value = item.name;
                });
            });
            users.sync(this.Local.users());
            comments.attachEvent("onAfterAdd", function (cid) {
                var obj = comments.getItem(cid);
                if (!obj.chat_id) {
                    var userId_1 = _this.State.userId;
                    var formatted = obj.text.replace(/</g, "&lt;");
                    if (formatted !== obj.text) {
                        comments.updateItem(cid, { text: formatted });
                    }
                    if (_this.State.chatId) {
                        _this.AddMessage(_this.State.chatId, obj.text, cid);
                        _this.ScrollToBottom();
                    }
                    else if (userId_1) {
                        comments.disable();
                        _this.Ops.addChat(userId_1)
                            .then(function (chatId) { return _this.AddMessage(chatId, obj.text, cid); })
                            .then(function () { return _this.app.callEvent("showChat", ["user", userId_1]); });
                    }
                }
            });
            comments.attachEvent("onBeforeDelete", function (id) {
                if (_this.IsUsersMessage(comments.getItem(id))) {
                    _this.Ops.removeMessage(id);
                }
                return true;
            });
            comments.attachEvent("onDataUpdate", function (id, msg, old) {
                if (_this.IsUsersMessage(msg) && msg.text != old.text) {
                    _this.Ops.updateMessage(id, msg.text);
                }
            });
            this.on(this.app, "showChat", function () {
                var chats = _this.Local.chats();
                chats.waitData.then(function () {
                    if (_this.getRoot())
                        _this.FilterUsers(comments.getUsers(), chats, _this.State.chatId, _this.State.userId);
                });
            });
            this.on(serverEvents, "messages", function (pack) {
                var op = pack.op, origin = pack.origin, msg = pack.msg;
                if (msg.chat_id != _this.State.chatId)
                    return;
                switch (op) {
                    case "add":
                        msg.date = new Date(msg.date);
                        if (comments.exists(origin)) {
                            list.data.changeId(origin, msg.id);
                            comments.updateItem(msg.id, msg);
                        }
                        else if (!comments.exists(msg.id)) {
                            comments.add(msg);
                            _this.ScrollToBottom();
                        }
                        break;
                    case "remove":
                        if (comments.exists(msg.id))
                            comments.remove(msg.id);
                        break;
                    case "update":
                        msg.date = new Date(msg.date);
                        if (comments.exists(msg.id)) {
                            comments.updateItem(msg.id, msg);
                        }
                        break;
                }
            });
            this.on(this.State.$changes, "chatId", function () {
                _this.LoadChat(_this.State.chatId, _this.State.userId);
            });
            if (this.app.config.files)
                this.InitUploader();
            this.on(this.Comments.getMenu(), "onBeforeShow", function () {
                return _this.ShowMenuHandler(_this.Comments.getMenu());
            });
            this.AddImageHandler();
            if (this.app.config.emojis)
                this.InitEmojis();
        };
        MessagesView.prototype.IsUsersMessage = function (msg) {
            return msg.user_id == this.app.config.user && (!msg.type || msg.type < 900);
        };
        MessagesView.prototype.IsUsersReaction = function (msgId, reaction) {
            if (msgId == this.app.config.user)
                return false;
            var msg = this.Comments.getItem(msgId);
            return msg.reactions[reaction].includes(this.app.config.user);
        };
        MessagesView.prototype.AddMessage = function (chatId, text, messageId) {
            var _this = this;
            return this.Ops.addMessage(chatId, messageId, text).then(function (msg) {
                if (_this.Comments.exists(messageId))
                    _this.Comments.queryView("list").data.changeId(messageId, msg.id);
            });
        };
        MessagesView.prototype.ScrollToBottom = function () {
            var list = this.$$("comments").queryView("list");
            list.showItem(list.getLastId());
        };
        MessagesView.prototype.LoadChat = function (id, userId) {
            var _this = this;
            var comments = this.$$("comments");
            comments.clearAll();
            this.Uploader = this.Upload.getUploader(id, "file");
            if (id || userId) {
                comments.enable();
                if (id)
                    this.Local.messages(id).then(function (data) {
                        if (!_this.getRoot())
                            return;
                        comments.parse(data);
                        _this.Ops.resetCounter(id);
                        _this.ScrollToBottom();
                    });
                this.Focus();
            }
            else {
                comments.disable();
            }
        };
        MessagesView.prototype.FilterUsers = function (users, chats, chatId, userId) {
            var _this = this;
            var chat = chatId ? chats.getItem(chatId) : null;
            users.data.filter(function (user) {
                if (chatId)
                    return (chat &&
                        (chat.users.indexOf(user.id) >= 0 && user.id != _this.app.config.user));
                return user.id == userId;
            });
        };
        MessagesView.prototype.Focus = function () {
            var _this = this;
            webix.delay(function () {
                if (_this.getRoot())
                    _this.Comments.focus();
            });
        };
        MessagesView.prototype.MessageTemplateText = function (obj) {
            var text = obj.text;
            if (this.app.config.emojis)
                text = this.Emojis.replaceEmoji(text);
            var type = obj.type;
            if (type === 800) {
                var parts = text.split("\n");
                if (parts.length === 4)
                    text = this.Preview(parts[0], parts[3], parts[1], parts[2]);
                else
                    text = this.FileLinkTemplate(parts[0], parts[1], parts[2]);
            }
            else if (type >= 900) {
                var outgoing = this.State.userId == obj.user_id;
                var arrow = "chi-arrow-" + (outgoing ? "bottom-left" : "top-right");
                var message = void 0;
                switch (type) {
                    case 900:
                        message = outgoing
                            ? this._("Incoming call")
                            : this._("Outgoing call");
                        break;
                    case 901:
                        message = this._("Rejected call");
                        break;
                    case 902:
                        message = this._("Missed call");
                        break;
                }
                text =
                    "<span class = 'webix_chat_call_type " +
                        arrow +
                        " webix_chat_call_type_" +
                        this.Back.callMessages[type] +
                        "'></span>" +
                        "<div class = 'webix_chat_call_message'>" +
                        message +
                        "<p>" +
                        text +
                        "</p></div>";
            }
            if (this.WithReactions && type < 900)
                text = this.ReactionsTemplate(obj, text);
            return "<div class = 'webix_comments_message'>" + text + "</div>";
        };
        MessagesView.prototype.FileLinkTemplate = function (url, name, size) {
            return ("<a target=\"_blank\" href=\"" + url + "\" class=\"webix_chat_file_block\">" +
                "<span class='webix_icon chi-file-outline webix_chat_file_icon'></span>" +
                "<div class='webix_chat_file_section'>" +
                this.FileNameTemplate(name) +
                ("<div class=\"webix_chat_file_size\">" + this.FormatBytes(size) + "</div>") +
                "</div></a>");
        };
        MessagesView.prototype.MessageTemplateLink = function (obj) {
            if (obj.type)
                return obj.text;
            var text = obj.text.replace(/(https?:\/\/[^\s]+)/g, this.Preview);
            return text;
        };
        MessagesView.prototype.Preview = function (url, preview, name, size) {
            url = webix.template.escape(url);
            var html = "", css = "";
            if (url.match(/.(jpg|jpeg|png|gif)$/)) {
                if (this && name) {
                    return (this.FileLinkTemplate(url, name, size) +
                        "<br/><a target='_blank' class='webix_chat_preview_lnk' href='" +
                        url +
                        "'>" +
                        "<img class='webix_comments_image' src='" +
                        preview +
                        "' />" +
                        "</a>");
                }
                else {
                    html +=
                        "<img class='webix_comments_image webix_comments_image_link' src='" +
                            preview +
                            "'/>" +
                            "<div class='webix_chat_file_name_link'>" +
                            url +
                            "</div>";
                }
            }
            else
                html += url;
            return ("<a target='_blank' class='" +
                css +
                "' href='" +
                url +
                "'>" +
                html +
                "</a>");
        };
        MessagesView.prototype.AddImageHandler = function () {
            var _this = this;
            webix.event(this.Comments.$view, "error", function (e) { return _this.ImageErrorHandler(e); }, {
                capture: true,
            });
        };
        MessagesView.prototype.ImageErrorHandler = function (e) {
            var trg = e.target;
            if (trg.className.indexOf("webix_comments_image") != -1)
                trg.className += " webix_chat_onerror";
        };
        MessagesView.prototype.FileNameTemplate = function (s) {
            if (s.length > 40)
                return s.substring(0, 20) + "..." + s.substring(s.length - 20, s.length);
            return s;
        };
        MessagesView.prototype.MessageTemplateAvatar = function (obj) {
            var html = "<div class='webix_chat_list_avatar'>";
            var users = this.Comments.getUsers();
            var user = users && users.exists(obj.user_id) ? users.getItem(obj.user_id) : {};
            if (user.status)
                html += this.Helpers.status(user);
            html += this.Helpers.avatar(user);
            html += "</div>";
            return html;
        };
        MessagesView.prototype.MessageTemplateUser = function (obj) {
            var users = this.Comments.getUsers();
            var user = users && users.exists(obj.user_id) ? users.getItem(obj.user_id) : {};
            return ("<span class = 'webix_comments_name'>" + (user.name || "") + "</span>");
        };
        MessagesView.prototype.MessageTemplateMenu = function () {
            var withReactions = this.app.config.reactions;
            if (this.Comments.config.readonly)
                return "";
            return ((withReactions
                ? "<span class='webix_icon chi-emoticon-outline webix_chat_reaction'></span>"
                : "") + "<span class='webix_icon wxi-dots webix_comments_menu'></span>");
        };
        MessagesView.prototype.MessageTemplateDate = function (obj) {
            return obj.date
                ? "<span class='webix_comments_date'>" +
                    this.Helpers.dateChatFormat(obj.date) +
                    "</span>"
                : "";
        };
        MessagesView.prototype.FormConfig = function (config) {
            var _this = this;
            var elements = config.rows[1].elements;
            var textarea = elements[0];
            var skin = webix.skin.$active;
            textarea.view = "chat-comments-text";
            config.rows[1].minHeight = textarea.height = textarea.inactiveHeight =
                skin.inputHeight;
            var button = elements[1].cols[1];
            button.autowidth = true;
            var icons = [{}];
            if (this.app.config.files)
                icons.push({
                    view: "icon",
                    icon: "chi-paperclip",
                    click: function () {
                        _this.Uploader.fileDialog();
                    },
                });
            if (this.app.config.emojis)
                icons.push({
                    view: "icon",
                    icon: "chi-emoticon-outline",
                    localId: "emojiIcon",
                });
            config.rows[1].rows = [
                {
                    view: "list",
                    css: "webix_chat_ulist",
                    localId: "fileList",
                    autoheight: true,
                    borderless: true,
                    template: function (obj) { return _this.ListUploadTemplate(obj); },
                    type: {
                        height: skin.listItemHeight > 30 ? 30 : skin.listItemHeight,
                    },
                    onClick: {
                        webix_icon: function (ev, id) {
                            _this.StopUpload(id);
                            return false;
                        },
                    },
                },
                {
                    cols: [
                        {
                            padding: {
                                right: 5,
                            },
                            rows: icons,
                        },
                        textarea,
                        {
                            padding: { left: webix.skin.$active.layoutMargin.form },
                            view: "chat-comments-layout",
                            rows: [{}, button],
                        },
                    ],
                },
            ];
            delete config.rows[1].elements;
        };
        MessagesView.prototype.ListUploadTemplate = function (obj) {
            var html = "<div class='webix_chat_ulist_item'>";
            html += "<div class='webix_chat_upload_name'>" + obj.name + "</div>";
            var s = obj.status;
            if (s == "exsize" || s == "error") {
                html += "<div class='webix_chat_upload_error' >" + this._(s == "exsize" ? "File size exceeds the limit" : "File upload error") + "</div>";
            }
            else {
                html += "<div class='webix_chat_upload_progress'>";
                html += "<div class='webix_chat_upload_progress_bar " + obj.status + "'>&nbsp;</div>";
                html += "</div>";
            }
            html += "<div class='webix_icon wxi-close'></div>";
            html += this.UploadIconTemplate(obj);
            html += "</div>";
            return html;
        };
        MessagesView.prototype.InitUploader = function () {
            var _this = this;
            var uploader = this.Upload.getUploader(this.State.chatId, "file");
            uploader.addDropZone(this.getRoot().$view, "");
            this.on(uploader.files.data, "onStoreUpdated", function (id, data, mode) {
                if (mode == "update" &&
                    data.status == "transfer" &&
                    _this.$$("fileList").getItem(id)) {
                    if (!data.percent)
                        data.xhr.addEventListener("error", function () {
                            data.status = "error";
                            delete data.xhr;
                            _this.$$("fileList").updateItem(id, data);
                        }, false);
                    _this.$$("fileList")
                        .getItemNode(id)
                        .querySelector(".webix_chat_upload_progress_bar").style.width =
                        data.percent + "%";
                }
            });
            this.on(this.app, "onSizeExceed", function (data) {
                return _this.$$("fileList").add(__assign(__assign({}, data), { status: "exsize" }));
            });
            this.on(uploader, "onAfterFileAdd", function (data) {
                _this.$$("fileList").add(__assign(__assign({}, data), { status: "transfer" }));
            });
            this.on(uploader, "onFileUpload", function (data, response) {
                return _this.UploadHandler(data, response);
            });
            this.on(uploader, "onFileUploadError", function (data, response) {
                return _this.UploadHandler(data, response);
            });
        };
        MessagesView.prototype.UploadHandler = function (data, response) {
            var _this = this;
            webix.delay(function () {
                var id = data.id, status = response.status;
                if (_this.$$("fileList").getItem(id)) {
                    if (status == "server")
                        _this.$$("fileList").remove(id);
                    else
                        _this.$$("fileList").updateItem(id, { status: response.status });
                }
            }, null, [], this.UploadDelay);
        };
        MessagesView.prototype.StopUpload = function (id) {
            this.$$("fileList").remove(id);
            if (this.Uploader.files.getItem(id))
                this.Uploader.stopUpload(id);
        };
        MessagesView.prototype.FormatBytes = function (bytes) {
            var _this = this;
            var sizes = ["B", "KB", "MB", "GB"].map(function (a) { return _this._(a); });
            if (bytes == 0)
                return "0 " + sizes[0];
            var k = 1024;
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
        };
        MessagesView.prototype.UploadIconTemplate = function (obj) {
            var icon = obj.status != "transfer"
                ? "chi-alert-circle-outline webix_chat_upl_error_icon"
                : "";
            return "<span class='webix_icon " + icon + "'></span>";
        };
        MessagesView.prototype.ShowMenuHandler = function (menu) {
            var id = menu.getContext().id;
            var item = this.Comments.getItem(id);
            if (item.type == 800)
                menu.disableItem("edit");
            else
                menu.enableItem("edit");
            return true;
        };
        MessagesView.prototype.destroy = function () {
            if (this._emojiEvent)
                webix.eventRemove(this._emojiEvent);
        };
        MessagesView.prototype.ShowEmojis = function (e, activeId, mode) {
            var _this = this;
            if (!this.EmojiPopup) {
                this.EmojiPopup = this.ui(EmojiTemplate);
                this.on(this.EmojiPopup.getRoot(), "onHide", function () {
                    if (_this.ReactionsMode)
                        _this.List.removeCss(_this.ReactionsActiveId, "webix_active");
                });
            }
            this.ReactionsMode = mode;
            this.ReactionsActiveId = activeId;
            this.EmojiPopup.Show(e);
        };
        MessagesView.prototype.InitEmojis = function () {
            var _this = this;
            this.Emojis = this.app.getService("emojis");
            this._emojiEvent = webix.event(this.$$("emojiIcon").$view, "click", function (e) {
                webix.html.preventEvent(e);
                _this.ShowEmojis(e);
            });
            this.textarea = this.Comments.queryView({ name: "text" });
            this.on(this.app, "pasteEmoji", function (id, item) {
                if (_this.ReactionsMode) {
                    var emojiStr = _this.EmojiNameTemplate(item);
                    _this.AddReaction(_this.ReactionsActiveId, emojiStr);
                    _this.EmojiPopup.Hide();
                }
                else
                    _this.PasteEmoji(item);
            });
            this.EmojiSuggest = this.ui(new EmojiSuggest(this.app, this.Comments));
            this.EmojiSuggest.LinkInput();
        };
        MessagesView.prototype.PasteEmoji = function (emoji) {
            var _this = this;
            var caretPos = this.textarea.getInputNode().selectionEnd;
            var oldVal = this.textarea.getValue();
            var str1 = oldVal.substring(0, caretPos);
            var str2 = oldVal.substring(caretPos);
            var emojiStr = this.EmojiNameTemplate(emoji);
            var len = emojiStr.length;
            this.textarea.setValue(str1 + emojiStr + str2);
            this.EmojiPopup.Hide();
            webix.delay(function () {
                _this.Comments.focus();
                _this.textarea
                    .getInputNode()
                    .setSelectionRange(caretPos + len, caretPos + len);
            });
        };
        MessagesView.prototype.AddReaction = function (msgId, emojiStr) {
            var _this = this;
            var msg = this.Comments.getItem(msgId);
            var userId = this.app.config.user;
            if (msg.user_id != userId &&
                (!msg.reactions || msg.reactions[emojiStr] != userId))
                this.Ops.addReaction(msgId, emojiStr).then(function (msg) {
                    if (msg) {
                        _this.Comments.updateItem(msgId, msg);
                    }
                });
        };
        MessagesView.prototype.EmojiNameTemplate = function (emoji) {
            return ":" + emoji.name + ": ";
        };
        MessagesView.prototype.ReactionsTemplate = function (obj, text) {
            var reactions = this.GetReactionsList(obj);
            if (reactions) {
                var button = this.IsUsersMessage(obj)
                    ? ""
                    : "<div class='webix_chat_reaction_add'>" +
                        "<span class='webix_icon chi-emoticon-outline'></span> <span class='webix_chat_reaction_plus'>+</span>" +
                        "</div>";
                return text + "<div class=\"webix_chat_message_reactions\">" + reactions + button + "</div>";
            }
            return text;
        };
        MessagesView.prototype.reactedTooltipTemplate = function (users) {
            var _this = this;
            return users.reduce(function (res, id) {
                var name = _this.Users.getItem(id).name;
                if (id == _this.app.config.user)
                    name += " (you)";
                return !res ? name : res + ", " + name;
            }, "");
        };
        MessagesView.prototype.GetReactionsList = function (obj) {
            var reactions = obj.reactions || [];
            var str = "";
            for (var name_1 in reactions) {
                var emoji = this.Emojis.replaceEmoji(name_1);
                if (emoji) {
                    var r = reactions[name_1];
                    var tooltip = this.reactedTooltipTemplate(r);
                    var isUserReaction = r.includes(this.app.config.user);
                    var css = "webix_chat_reaction_block" +
                        (isUserReaction ? " webix_chat_user_reaction" : "");
                    str += "<div class=\"" + css + "\" webix_tooltip=\"" + tooltip + "\" data-name=\"" + name_1 + "\">" + emoji + "<span class=\"webix_chat_reaction_count\">" + r.length + "</span></div>";
                }
            }
            return str;
        };
        MessagesView.prototype.ListConfig = function (config) {
            var _this = this;
            var list = config.rows[0];
            list.tooltip = {
                template: "",
                css: "webix_chat_reaction_tooltip",
            };
            if (!list.onClick)
                list.onClick = {};
            var on = list.onClick;
            on.webix_chat_reaction = function (e, id) { return _this.ShowReactionsPopup(e, id); };
            on.webix_chat_reaction_add = function (e, id) { return _this.ShowReactionsPopup(e, id); };
            on.webix_chat_reaction_block = function (e, id, t) {
                return _this.ReactionClickHandler(id, t);
            };
        };
        MessagesView.prototype.ReactionClickHandler = function (id, trg) {
            var _this = this;
            var emoji = trg.getAttribute("data-name");
            if (this.IsUsersReaction(id, emoji)) {
                this.Ops.removeReaction(parseInt(id), emoji).then(function (msg) {
                    if (msg) {
                        _this.Comments.updateItem(id, msg);
                    }
                });
            }
            else {
                this.AddReaction(parseInt(id), emoji);
            }
        };
        MessagesView.prototype.ShowReactionsPopup = function (e, id) {
            this.List.addCss(id, "webix_active");
            var intId = id * 1;
            if (!isNaN(intId))
                id = intId;
            this.ShowEmojis(e, id, "reactions");
        };
        return MessagesView;
    }(JetView));

    var TopView = (function (_super) {
        __extends(TopView, _super);
        function TopView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TopView.prototype.config = function () {
            initRLayout();
            var isSingle = this.app.config.mode === "single";
            var fCompact = this.getParam("forceCompact");
            var isForced = !webix.isUndefined(fCompact) || isSingle;
            if (isForced)
                this.setParam("compact", fCompact || isSingle);
            this.Compact = this.getParam("compact");
            var cols = this.Compact
                ? [{ $subview: true, name: "center" }]
                : [
                    SideBar,
                    { $subview: true, name: "center" },
                    { $subview: "_hidden", name: "panel" },
                ];
            return {
                view: "r-layout",
                id: "main",
                css: "webix_chat_main_layout",
                rows: [{ cols: cols, margin: 0 }, { $subview: true, name: "top", popup: true }],
            };
        };
        TopView.prototype.init = function () {
            var _this = this;
            var local = this.app.getService("local");
            var root = this.getRoot();
            if (root.sizeTrigger)
                root.sizeTrigger(this.app, function (mode) { return _this.SetCompactMode(mode); }, !!this.Compact);
            this.ShowDefaultChat();
            this.on(this.app, "showSidebar", function () { return _this.ShowSidebar(); });
            this.on(this.app, "showChat", function (type, id) {
                var userId = null;
                if (type === "user") {
                    userId = id;
                    var chat = local.chats().find(function (a) { return a.direct_id == id; }, true);
                    id = chat ? chat.id : null;
                }
                else {
                    var chat = local.chats().getItem(id);
                    if (chat.direct_id) {
                        type = "user";
                        userId = chat.direct_id;
                    }
                }
                _this.ShowChat(type, id, userId);
            });
            this.on(this.app, "leaveChat", function (chatId) {
                _this.LeaveChat(chatId);
            });
            this.on(this.app, "removeChatMember", function (chatId) {
                _this.LeaveChat(chatId, true);
            });
            this.on(this.app, "newChat", function () {
                _this.ShowChatWindow();
            });
            this.on(this.app, "chatInfo", function (id) {
                _this.ShowChatInfo(id);
            });
            this.on(this.app, "newMembers", function (id) {
                _this.ShowNewMembersWindow(id);
            });
            this.on(this.app, "startCall", function (id, chatId) {
                _this.StartCall(id, chatId);
            });
            var state = this.getParam("state");
            this.on(state.$changes, "callId", function (v) {
                if (v) {
                    if (_this.Compact)
                        _this.show("./call.panel", { target: "center" });
                    else {
                        _this.show("./call.panel", { target: "panel" });
                        _this.show("./messages", { target: "center" });
                    }
                }
                else {
                    _this.show("./messages", { target: "center" });
                    if (!_this.Compact)
                        _this.show("_hidden", { target: "panel" });
                }
            });
            var back = this.app.getService("backend");
            var serverEvents = back.pubsub();
            var callStatuses = back.callStatuses;
            this.on(serverEvents, "signal", function (obj) {
                if (obj.type === "active") {
                    if (!state.timer)
                        back.callInfo().then(function (info) {
                            var start = new Date(info.start);
                            var date = Math.max(new Date(), start);
                            state.time = Math.floor((date - start) / 1000);
                            _this.CallTimer();
                        });
                }
                else if (obj.type === "connect") {
                    var info = JSON.parse(obj.msg);
                    if (info.devices) {
                        if (info.devices.indexOf(_this.app.config.device) == -1)
                            _this.EndCall();
                        return;
                    }
                    if (state.callId && info.id != state.callId) {
                        if (info.status < 900) {
                            back.updateCall(info.id, callStatuses["reject"]);
                        }
                        return;
                    }
                    if (info.start && !state.timer)
                        _this.CallTimer();
                    if (info.status == callStatuses["init"])
                        state.callChatId = state.chatId;
                    var callUsers = info.users;
                    var callId = info.id;
                    var callStatus = info.status;
                    if (info.status == callStatuses["end"] ||
                        info.status == callStatuses["reject"] ||
                        info.status == callStatuses["ignore"] ||
                        info.status == callStatuses["lost"]) {
                        _this.EndCall();
                    }
                    else {
                        state.$batch({ callId: callId, callStatus: callStatus, callUsers: callUsers });
                    }
                }
            });
        };
        TopView.prototype.EndCall = function () {
            var state = this.getParam("state");
            if (state.timer)
                clearInterval(state.timer);
            state.$batch({
                callId: 0,
                callStatus: "",
                callUsers: [],
                callChatId: null,
                timer: null,
                time: null,
            });
        };
        TopView.prototype.ShowDefaultChat = function () {
            var _this = this;
            var state = this.getParam("state");
            var chats = this.app.getService("local").chats();
            chats.waitData.then(function () {
                if (!state.chatId) {
                    if (!chats.count()) {
                        if (_this.Compact)
                            _this.ShowSidebar();
                    }
                    else {
                        state.chatId = chats.getFirstId();
                    }
                }
            });
        };
        TopView.prototype.ShowChat = function (chatType, chatId, userId) {
            this.getParam("state").$batch({ chatId: chatId, chatType: chatType, userId: userId });
            this.show("_hidden", { target: "top" });
        };
        TopView.prototype.ShowChatWindow = function () {
            this.show("chat.new", { target: "top" });
        };
        TopView.prototype.ShowChatInfo = function (id) {
            this.show("chat.info", { target: "top", params: { id: id } });
        };
        TopView.prototype.ShowNewMembersWindow = function (id) {
            this.show("chat.members", { target: "top", params: { id: id } });
        };
        TopView.prototype.LeaveChat = function (id, removed) {
            var _ = this.app.getService("locale")._;
            var state = this.getParam("state");
            if (id === state.chatId) {
                if (removed)
                    webix.alert(_("You have been removed from the group"));
                state.$batch({ chatId: 0, chatType: "", userId: 0 });
            }
        };
        TopView.prototype.SetCompactMode = function (mode) {
            var _this = this;
            webix.delay(function () {
                _this.setParam("compact", mode);
                _this.refresh();
            });
        };
        TopView.prototype.ShowSidebar = function () {
            if (!this.SideMenu || !this.SideMenu.getRoot())
                this.SideMenu = this.ui(SideMenu);
            this.SideMenu.Show();
        };
        TopView.prototype.StartCall = function (id, chatId) {
            var _ = this.app.getService("locale")._;
            var back = this.app.getService("backend");
            back.startCall(id, chatId).catch(function () {
                webix.alert(_("Can't start the call"));
            });
        };
        TopView.prototype.CallTimer = function () {
            var _this = this;
            var state = this.getParam("state");
            if (!state.time)
                state.time = 0;
            state.timer = setInterval(function () {
                _this.app.callEvent("updateCallTime", [++state.time]);
            }, 1000);
        };
        return TopView;
    }(JetView));

    var UsersView = (function (_super) {
        __extends(UsersView, _super);
        function UsersView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        UsersView.prototype.init = function () {
            var users = this.app.getService("local").users();
            this.InitSelf(users);
        };
        UsersView.prototype.SyncHandler = function () {
            var _this = this;
            this.$$("list").data.filter(function (a) { return a.id != _this.app.config.user; });
            this.$$("list").data.silent(function () {
                this.sort("name", "asc");
            });
        };
        UsersView.prototype.ShowChat = function (id) {
            this.app.callEvent("showChat", ["user", id * 1]);
        };
        UsersView.prototype.ListTemplate = function (user) {
            var helpers = this.app.getService("helpers");
            return (helpers.listAvatar(user) +
                helpers.addTextMark(user.name, this.EscapedSearchText));
        };
        return UsersView;
    }(ListView));

    var views = { JetView: JetView };
    views["call/panel"] = CallPanel;
    views["chat/common/form"] = FormView;
    views["chat/common/people"] = PeopleView;
    views["chat/common/toolbar"] = Toolbar;
    views["chat/common/window"] = BaseWindow;
    views["chat/info/form"] = FormView$1;
    views["chat/info"] = NewChatWin;
    views["chat/info/info"] = ChatInfo;
    views["chat/info/people"] = PeopleView$1;
    views["chat/members"] = NewChatWin$1;
    views["chat/new/form"] = FormView$2;
    views["chat/new"] = NewChatWin$2;
    views["chats"] = chatsView;
    views["compact/sidemenu"] = SideMenu;
    views["list"] = ListView;
    views["messages/emojis"] = EmojiTemplate;
    views["messages/emojisuggest"] = EmojiSuggest;
    views["messages"] = MessagesView;
    views["messages/toolbar"] = Toolbar$1;
    views["sidebar"] = SideBar;
    views["top"] = TopView;
    views["users"] = UsersView;

    var en = {
        "Add members": "Add members",
        "Are you sure to leave this chat?": "Are you sure to leave this chat?",
        Avatar: "Avatar",
        "Are you sure to delete this member?": "Are you sure to delete this member?",
        Cancel: "Cancel",
        "Change avatar": "Change avatar",
        "Chat info": "Chat info",
        "Chat name": "Chat name",
        Chats: "Chats",
        "Create group": "Create group",
        Delete: "Delete",
        "Delete member": "Delete member",
        "Edit chat": "Edit chat",
        Leave: "Leave",
        "Leave chat": "Leave chat",
        member: "member",
        members: "members",
        Members: "Members",
        "New chat": "New chat",
        "No people to add": "No people to add",
        People: "People",
        Save: "Save",
        Search: "Search",
        "Show all members": "Show all members",
        Users: "Users",
        You: "You",
        Ringing: "Ringing...",
        "Active call": "Active call",
        "Is calling you": "Is calling you...",
        Accept: "Accept",
        Reject: "Reject",
        "Start call": "Start call",
        "Join call": "Join call",
        "End call": "End call",
        "Ended call": "Ended call",
        "Incoming call": "Incoming call",
        "Outgoing call": "Outgoing call",
        "Rejected call": "Rejected call",
        "Missed call": "Missed call",
        "Can't start the call": "Can't start the call",
        "Could not find your": "Could not find your",
        "Error opening your": "Error opening your",
        microphone: "microphone",
        camera: "camera",
        Size: "Size",
        B: "B",
        KB: "KB",
        MB: "MB",
        GB: "GB",
        "File size exceeds the limit": "File size exceeds the limit",
        "File upload error": "File upload error",
        "Smileys & People": "Smileys & People",
        "Animals & Nature": "Animals & Nature",
        Activity: "Activity",
        "Travel & Places": "Travel & Places",
        "Food & Drink": "Food & Drink",
        Objects: "Objects",
        "Search results": "Search results",
        Symbols: "Symbols",
        Basic: "Basic",
    };

    var Local = (function () {
        function Local(app) {
            this.app = app;
            this._messages = {};
            this._subs = [];
        }
        Local.prototype.users = function () {
            var _this = this;
            if (!this._users) {
                var back = this.app.getService("backend");
                this._users = new webix.DataCollection({});
                back.users().then(function (d) { return _this._users.parse(d); });
                this._subs.push(back.pubsub().attachEvent("users", function (u) {
                    var op = u.op, user_id = u.user_id, data = u.data;
                    var user;
                    switch (op) {
                        case "online": {
                            user = _this._users.getItem(user_id);
                            if (user && user.status != data) {
                                _this._users.updateItem(user_id, { status: data });
                            }
                            var chat = _this._chats.find(function (a) { return a.direct_id == user_id; }, true);
                            if (chat)
                                _this._chats.updateItem(chat.id, { status: data ? 2 : 1 });
                            break;
                        }
                    }
                }));
            }
            return this._users;
        };
        Local.prototype.chats = function () {
            var _this = this;
            var state = this.app.getState();
            if (!this._chats) {
                this._chats = new webix.DataCollection({
                    scheme: {
                        $change: function (obj) {
                            if (obj.date && typeof obj.date === "string")
                                obj.date = new Date(obj.date);
                            if (obj.direct_id) {
                                var user = _this.users().getItem(obj.direct_id);
                                if (!obj.name)
                                    obj.name = "PM: " + user.name;
                                if (!obj.avatar) {
                                    obj.avatar = user.avatar;
                                }
                                obj.status = user.status;
                            }
                        },
                        $sort: {
                            by: "date",
                            dir: "desc",
                            as: "date",
                        },
                    },
                });
                var back_1 = this.app.getService("backend");
                Promise.all([back_1.chats(), this.users().waitData]).then(function (d) {
                    _this._chats.parse(d[0]);
                });
                this._subs.push(back_1.pubsub().attachEvent("chats", function (c) {
                    var op = c.op, chat_id = c.chat_id, data = c.data;
                    var update;
                    switch (op) {
                        case "add":
                        case "update":
                            if (data.users.indexOf(_this.app.config.user) == -1) {
                                if (_this._chats.exists(chat_id)) {
                                    _this.app.callEvent("removeChatMember", [chat_id]);
                                    _this._chats.remove(chat_id);
                                }
                                return;
                            }
                            if (!_this._chats.exists(chat_id))
                                _this._chats.add(data, 0);
                            else {
                                update = {
                                    name: data.name,
                                    avatar: data.avatar,
                                    users: data.users,
                                };
                                if (!data.direct_id) {
                                    update.direct_id = 0;
                                }
                                _this._chats.updateItem(chat_id, update);
                            }
                            break;
                        case "message":
                            _this._chats.updateItem(chat_id, {
                                message: data.message,
                                message_type: data.message_type,
                                date: new Date(data.date),
                            });
                            break;
                    }
                }));
                this._subs.push(back_1.pubsub().attachEvent("messages", function (c) {
                    var op = c.op, msg = c.msg;
                    var chat;
                    switch (op) {
                        case "add":
                            chat = _this._chats.getItem(msg.chat_id);
                            if (chat) {
                                if (state.chatId != chat.id) {
                                    _this._chats.updateItem(chat.id, {
                                        message: msg.text,
                                        message_type: msg.type,
                                        unread_count: chat.unread_count + 1,
                                        date: msg.date,
                                    });
                                }
                                else {
                                    _this._chats.updateItem(chat.id, {
                                        message: msg.text,
                                        message_type: msg.type,
                                        date: msg.date,
                                    });
                                    back_1.resetCounter(chat.id);
                                }
                                if (_this._chats.getIndexById(chat.id))
                                    _this._chats.moveTop(chat.id);
                            }
                            break;
                    }
                }));
            }
            return this._chats;
        };
        Local.prototype.messages = function (id) {
            var backs = this.app.getService("backend");
            return (this._messages[id] = backs.messages(id));
        };
        return Local;
    }());

    var t = (function () {
        function t(t) {
            var e = t.url, s = t.token;
            this._url = e, this._token = s, this._mode = 1, this._seed = 1, this._queue = [], this.data = {}, this.api = {}, this._events = {};
        }
        t.prototype.headers = function () { return { Accept: "application/json", "Content-Type": "application/json", "Remote-Token": this._token }; };
        t.prototype.fetch = function (t, e) { var s = { credentials: "include", headers: this.headers() }; return e && (s.method = "POST", s.body = e), fetch(t, s).then(function (t) { return t.json(); }); };
        t.prototype.load = function (t) {
            var _this = this;
            return t && (this._url = t), this.fetch(this._url).then(function (t) { return _this.parse(t); });
        };
        t.prototype.parse = function (t) { var e = t.key, s = t.websocket; e && (this._token = t.key); for (var e_1 in t.data)
            this.data[e_1] = t.data[e_1]; for (var e_2 in t.api) {
            var s_1 = this.api[e_2] = {}, i = t.api[e_2];
            for (var t_1 in i)
                s_1[t_1] = this._wrapper(e_2 + "." + t_1);
        } return s && this.connect(), this; };
        t.prototype.connect = function () {
            var _this = this;
            var t = this._socket;
            t && (this._socket = null, t.onclose = function () { }, t.close()), this._mode = 2, this._socket = function (t, e, s, i) { var n = e; "/" === n[0] && (n = document.location.protocol + "//" + document.location.host + e); n = n.replace(/^http(s|):/, "ws$1:"); var o = -1 != n.indexOf("?") ? "&" : "?"; n = "" + n + o + "token=" + s + "&ws=1"; var r = new WebSocket(n); return r.onclose = function () { return setTimeout(function () { return t.connect(); }, 2e3); }, r.onmessage = function (e) { var s = JSON.parse(e.data); switch (s.action) {
                case "result":
                    t.result(s.body, []);
                    break;
                case "event":
                    t.fire(s.body.name, s.body.value);
                    break;
                case "start":
                    i();
                    break;
                default: t.onError(s.data);
            } }, r; }(this, this._url, this._token, function () { return (_this._mode = 3, _this._send(), _this._resubscribe(), _this); });
        };
        t.prototype._wrapper = function (t) { return function () {
            var _this = this;
            var e = [].slice.call(arguments);
            var s = null;
            var i = new Promise(function (i, n) { s = { data: { id: _this._uid(), name: t, args: e }, status: 1, resolve: i, reject: n }, _this._queue.push(s); });
            return this.onCall(s, i), 3 === this._mode ? this._send(s) : setTimeout(function () { return _this._send(); }, 1), i;
        }.bind(this); };
        t.prototype._uid = function () { return (this._seed++).toString(); };
        t.prototype._send = function (t) {
            var _this = this;
            if (2 == this._mode)
                return void setTimeout(function () { return _this._send(); }, 100);
            var e = t ? [t] : this._queue.filter(function (t) { return 1 === t.status; });
            if (!e.length)
                return;
            var s = e.map(function (t) { return (t.status = 2, t.data); });
            3 !== this._mode ? this.fetch(this._url, JSON.stringify(s)).catch(function (t) { return _this.onError(t); }).then(function (t) { return _this.result(t, s); }) : this._socket.send(JSON.stringify({ action: "call", body: s }));
        };
        t.prototype.result = function (t, e) { var s = {}; if (t)
            for (var e_3 = 0; e_3 < t.length; e_3++)
                s[t[e_3].id] = t[e_3];
        else
            for (var t_2 = 0; t_2 < e.length; t_2++)
                s[e[t_2].id] = { id: e[t_2].id, error: "Network Error", data: null }; for (var t_3 = this._queue.length - 1; t_3 >= 0; t_3--) {
            var e_4 = this._queue[t_3], i = s[e_4.data.id];
            i && (this.onResponse(e_4, i), i.error ? e_4.reject(i.error) : e_4.resolve(i.data), this._queue.splice(t_3, 1));
        } };
        t.prototype.on = function (t, e) { var s = this._uid(); var i = this._events[t]; var n = !!i; return n || (i = this._events[t] = []), i.push({ id: s, handler: e }), n || 3 != this._mode || this._socket.send(JSON.stringify({ action: "subscribe", name: t })), { name: t, id: s }; };
        t.prototype._resubscribe = function () { if (3 == this._mode)
            for (var t_4 in this._events)
                this._socket.send(JSON.stringify({ action: "subscribe", name: t_4 })); };
        t.prototype.detach = function (t) { if (!t) {
            if (3 == this._mode)
                for (var t_5 in this._events)
                    this._socket.send(JSON.stringify({ action: "unsubscribe", key: t_5 }));
            return void (this._events = {});
        } var e = t.id, s = t.name, i = this._events[s]; if (i) {
            var t_6 = i.filter(function (t) { return t.id != e; });
            t_6.length ? this._events[s] = t_6 : (delete this._events[s], 3 == this._mode && this._socket.send(JSON.stringify({ action: "unsubscribe", name: s })));
        } };
        t.prototype.fire = function (t, e) { var s = this._events[t]; if (s)
            for (var t_7 = 0; t_7 < s.length; t_7++)
                s[t_7].handler(e); };
        t.prototype.onError = function (t) { return null; };
        t.prototype.onCall = function (t, e) { };
        t.prototype.onResponse = function (t, e) { };
        return t;
    }());

    var Backend = (function () {
        function Backend(app) {
            var _this = this;
            this.app = app;
            var remote = new t({
                url: app.config.url,
                token: app.config.token,
            });
            this._ready = remote.load().then(function (back) {
                _this._api = back.api;
                _this._data = back.data;
                _this._pubsub = {
                    attachEvent: function (name, handler) { return back.on(name, handler); },
                    detachEvent: function (ev) { return back.detach(ev); },
                };
                var id = (app.config.user = _this._data.user);
                app.config.device = _this._data.device;
                _this._data.users.forEach(function (a) {
                    if (a.id === id)
                        a.status = 2;
                });
            });
            this.callStatuses = {
                init: 1,
                accept: 2,
                active: 3,
                drop: 900,
                reject: 901,
                end: 902,
                ignore: 903,
                lost: 904,
            };
            this.callMessages = {
                900: "start",
                901: "reject",
                902: "ignore",
            };
        }
        Backend.prototype.ready = function () {
            return this._ready;
        };
        Backend.prototype.users = function () {
            return Promise.resolve(this._data.users);
        };
        Backend.prototype.chats = function () {
            return Promise.resolve(this._data.chats);
        };
        Backend.prototype.callInfo = function () {
            return Promise.resolve(this._data.call);
        };
        Backend.prototype.addChat = function (uid) {
            return this._api.chat.AddDirect(uid * 1);
        };
        Backend.prototype.messages = function (cid) {
            return this._api.message.GetAll(cid * 1).then(function (data) {
                data.forEach(function (a) { return (a.date = new Date(a.date)); });
                return data;
            });
        };
        Backend.prototype.addMessage = function (cid, text, origin) {
            return this._api.message.Add(text, cid * 1, origin.toString()).then(function (a) {
                a.date = new Date(a.date);
                return a;
            });
        };
        Backend.prototype.removeMessage = function (messageId) {
            return this._api.message.Remove(messageId * 1);
        };
        Backend.prototype.updateMessage = function (messageId, text) {
            return this._api.message.Update(messageId * 1, text);
        };
        Backend.prototype.resetCounter = function (cid) {
            this._api.message.ResetCounter(cid * 1);
        };
        Backend.prototype.pubsub = function () {
            return this._pubsub;
        };
        Backend.prototype.addGroupChat = function (name, avatar, users) {
            return this._api.chat.AddGroup(name, avatar, users);
        };
        Backend.prototype.updateChat = function (id, name, avatar) {
            return this._api.chat.Update(id, name, avatar);
        };
        Backend.prototype.leave = function (chatId, userId) {
            return this._api.chat.Leave(chatId, userId);
        };
        Backend.prototype.setUsers = function (chatId, users) {
            return this._api.chat.SetUsers(chatId, users);
        };
        Backend.prototype.avatarUploadUrl = function (id) {
            return this.app.config.url + ("/chat/" + id + "/avatar");
        };
        Backend.prototype.fileUploadUrl = function (id) {
            return this.app.config.url + ("/chat/" + id + "/file");
        };
        Backend.prototype.startCall = function (withUser, chatID) {
            return this._api.call.Start(withUser, chatID);
        };
        Backend.prototype.updateCall = function (id, value) {
            return this._api.call.SetStatus(id, value);
        };
        Backend.prototype.signalCall = function (type, payload) {
            return this._api.call.Signal(type, payload);
        };
        Backend.prototype.addReaction = function (msgId, reaction) {
            return this._api.message.AddReaction(msgId, reaction).then(function (a) {
                a.date = new Date(a.date);
                return a;
            });
        };
        Backend.prototype.removeReaction = function (msgId, reaction) {
            return this._api.message.RemoveReaction(msgId, reaction).then(function (a) {
                a.date = new Date(a.date);
                return a;
            });
        };
        Backend.prototype.basicEmojis = function () {
            return Promise.resolve(["+1", "-1", "smile", "frowning", "tada", "heart"]);
        };
        return Backend;
    }());

    var Operations = (function () {
        function Operations(_app) {
            this._app = _app;
            this._local = this._app.getService("local");
            this._back = this._app.getService("backend");
        }
        Operations.prototype.addChat = function (userId) {
            var _this = this;
            return this._back.addChat(userId).then(function (chat) {
                _this._local.chats().add(chat, 0);
                return chat.id;
            });
        };
        Operations.prototype.addMessage = function (cid, origin, text) {
            var chats = this._local.chats();
            chats.updateItem(cid, {
                message: this._getMessageText(text),
                message_type: 0,
                date: new Date(),
            });
            if (chats.getIndexById(cid))
                chats.moveTop(cid);
            return this._back.addMessage(cid, text, origin);
        };
        Operations.prototype.removeMessage = function (id) {
            return this._back.removeMessage(id);
        };
        Operations.prototype.updateMessage = function (id, text) {
            return this._back.updateMessage(id, text);
        };
        Operations.prototype._getMessageText = function (text) {
            var limit = 80;
            if (this._app.config.emojis) {
                var arr = text.match(this._app.getService("emojis").emojiRegExp);
                if (arr)
                    arr.forEach(function (str) {
                        limit += str.length;
                    });
            }
            return text.substr(0, Math.min(text.length, limit));
        };
        Operations.prototype.resetCounter = function (cid) {
            this._back.resetCounter(cid);
            var chats = this._local.chats();
            if (chats.exists(cid)) {
                chats.updateItem(cid, { unread_count: 0 });
            }
        };
        Operations.prototype.addGroupChat = function (name, avatar, users) {
            var _this = this;
            return this._back.addGroupChat(name, avatar, users).then(function (chat) {
                _this._local.chats().add(chat, 0);
                return chat.id;
            });
        };
        Operations.prototype.updateChat = function (chatId, name, avatar) {
            var _this = this;
            return this._back.updateChat(chatId, name, avatar).then(function (info) {
                _this._local.chats().updateItem(chatId, info);
            });
        };
        Operations.prototype.leaveChat = function (chatId) {
            var _this = this;
            return this._back.leave(chatId, this._app.config.user).then(function () {
                _this._app.callEvent("leaveChat", [chatId]);
                _this._local.chats().remove(chatId);
            });
        };
        Operations.prototype.setUsers = function (chatId, users) {
            var _this = this;
            return this._back.setUsers(chatId, users).then(function (info) {
                var chat = _this._local.chats();
                if (info.id == chatId)
                    chat.updateItem(chatId, info);
                else {
                    chat.add(info, 0);
                    _this._app.callEvent("showChat", [chat, info.id]);
                }
            });
        };
        Operations.prototype.addReaction = function (msgId, reaction) {
            return this._back.addReaction(msgId, reaction);
        };
        Operations.prototype.removeReaction = function (msgId, reaction) {
            return this._back.removeReaction(msgId, reaction);
        };
        return Operations;
    }());

    var UploadHandler = (function () {
        function UploadHandler(app) {
            this.app = app;
            this.initUploader();
            this.maxFileSize = 10000000;
        }
        UploadHandler.prototype.initUploader = function () {
            var _this = this;
            this.uploader = webix.ui({
                view: "uploader",
                apiOnly: true,
                autosend: true,
                on: {
                    onBeforeFileAdd: function (data) { return _this.configUpload(data); },
                },
            });
        };
        UploadHandler.prototype.config = function (props) {
            webix.extend(this.uploader.config, props, true);
        };
        UploadHandler.prototype.getUploader = function (chat, mode) {
            this._chat = chat;
            this._mode = mode;
            return this.uploader;
        };
        UploadHandler.prototype.configUpload = function (file) {
            var back = this.app.getService("backend");
            this.uploader.config.upload =
                this._mode == "file"
                    ? back.fileUploadUrl(this._chat)
                    : back.avatarUploadUrl(this._chat);
            this.uploader.config.urlData = { token: this.app.config.token };
            if (file.size > this.maxFileSize) {
                this.app.callEvent("onSizeExceed", [file]);
                return false;
            }
        };
        UploadHandler.prototype.fileDialog = function () {
            this.uploader.fileDialog();
        };
        return UploadHandler;
    }());

    var Helpers = (function () {
        function Helpers() {
            this.statusMap = {
                1: "none",
                2: "active",
                3: "busy",
                4: "away",
            };
            this.checkedIcon = "<span class='webix_icon wxi-checkbox-marked'></span>";
            this.notCheckedIcon = "<span class='webix_icon wxi-checkbox-blank'></span>";
            this.dateMask = "%d.%m.%Y";
            this.weekMask = "%D";
            this.todayDateMask = "%H:%i";
        }
        Helpers.prototype.status = function (user) {
            return ("<span class = 'webix_chat_status webix_chat_status_" +
                this.statusMap[user.status] +
                "'></span>");
        };
        Helpers.prototype.listAvatar = function (user, cssClass) {
            var css = typeof cssClass == "string" ? cssClass : "webix_chat_list_avatar";
            var html = "<div class='" + css + "'>";
            if (user.status)
                html += this.status(user);
            html += this.avatar(user);
            html += "</div>";
            return html;
        };
        Helpers.prototype.initials = function (name) {
            var initials = name.match(/\b\w/g) || [];
            return ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
        };
        Helpers.prototype.avatar = function (user, cssClass) {
            var css = typeof cssClass == "string" ? cssClass : "webix_chat_avatar";
            if (user.avatar)
                return "<img alt=\"\" class=\"" + css + "\" src=\"" + user.avatar + "\"/>";
            if (!user.name)
                return "<div class='" + css + " webix_icon wxi-user'></div>";
            return "<div class='" + css + "'>" + this.initials(user.name || "") + "</div>";
        };
        Helpers.prototype.formAvatar = function (user, tooltip) {
            var css = "webix_chat_avatar";
            if (user.avatar)
                return "<img alt=\"\" title=\"" + tooltip + "\" class=\"" + css + "\" src=\"" + user.avatar + "\"/>";
            return "<div class='" + css + "  webix_icon chi-camera' title='" + tooltip + "'</div>";
        };
        Helpers.prototype.dateChatFormat = function (date) {
            var mask = this.dateMask;
            var today = webix.Date.datePart(new Date(), true);
            var day = webix.Date.datePart(date, true);
            if (webix.Date.equal(day, today))
                mask = this.todayDateMask;
            else if (day > webix.Date.add(today, -7, "day"))
                mask = this.weekMask;
            return webix.Date.dateToStr(mask)(date);
        };
        Helpers.prototype.peopleList = function (users, deleteIcon, groupUsers) {
            var _this = this;
            var list = "<ul class='webix_chat_peoplelist'>";
            users.forEach(function (user) {
                list +=
                    "<li class='webix_chat_peoplelist_item' data-id='" + user.id + "'>" +
                        "<div class='webix_chat_peoplelist_avatar'>" +
                        _this.avatar(user) +
                        (groupUsers && groupUsers.indexOf(user.id) >= 0
                            ? "<div class='webix_chat_group_user_marker'><span class='webix_icon wxi-check'></span></div>"
                            : "") +
                        (deleteIcon
                            ? "<div class='webix_chat_peoplelist_delete_icon'><span class='webix_icon wxi-close'></span></div>"
                            : "") +
                        "</div>" +
                        ("<p class=\"webix_chat_peoplelist_item_name\">" + user.name + "</p></li>");
            });
            list += "</ul>";
            return list;
        };
        Helpers.prototype.addTextMark = function (value, text) {
            if (!text)
                return value;
            return value.replace(new RegExp("(" + text + ")", "ig"), "<span class='webix_chat_search_mark'>$1</span>");
        };
        Helpers.prototype.normalizeTime = function (seconds) {
            seconds = seconds || 0;
            var min = Math.floor(seconds / 60);
            var sec = seconds - min * 60;
            return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
        };
        return Helpers;
    }());

    var emojis = [
        [["watch"], "231A", 6],
        [["soccer"], "26BD", 3],
        [["heart"], "2764", 7],
        [["green_apple"], "1F34F", 5],
        [["dog"], "1F436", 2],
        [["grinning"], "1F600", 1],
        [["car", "red_car"], "1F697", 4],
        [["apple"], "1F34E", 5],
        [["basketball"], "1F3C0", 3],
        [["cat"], "1F431", 2],
        [["yellow_heart"], "1F49B", 7],
        [["iphone"], "1F4F1", 6],
        [["smiley"], "1F603", 1],
        [["taxi"], "1F695", 4],
        [["pear"], "1F350", 5],
        [["football"], "1F3C8", 3],
        [["mouse"], "1F42D", 2],
        [["green_heart"], "1F49A", 7],
        [["calling"], "1F4F2", 6],
        [["smile"], "1F604", 1],
        [["blue_car"], "1F699", 4],
        [["baseball"], "26BE", 3],
        [["tangerine"], "1F34A", 5],
        [["hamster"], "1F439", 2],
        [["blue_heart"], "1F499", 7],
        [["computer"], "1F4BB", 6],
        [["grin"], "1F601", 1],
        [["bus"], "1F68C", 4],
        [["keyboard"], "2328", 6],
        [["lemon"], "1F34B", 5],
        [["tennis"], "1F3BE", 3],
        [["rabbit"], "1F430", 2],
        [["purple_heart"], "1F49C", 7],
        [["laughing", "satisfied"], "1F606", 1],
        [["trolleybus"], "1F68E", 4],
        [["banana"], "1F34C", 5],
        [["racing_car"], "1F3CE", 4],
        [["volleyball"], "1F3D0", 3],
        [["black_heart"], "1F5A4", 7],
        [["desktop_computer"], "1F5A5", 6],
        [["sweat_smile"], "1F605", 1],
        [["fox_face"], "1F98A", 2],
        [["watermelon"], "1F349", 5],
        [["rugby_football"], "1F3C9", 3],
        [["bear"], "1F43B", 2],
        [["broken_heart"], "1F494", 7],
        [["printer"], "1F5A8", 6],
        [["joy"], "1F602", 1],
        [["police_car"], "1F693", 4],
        [["heavy_heart_exclamation_mark_ornament"], "2763", 7],
        [["grapes"], "1F347", 5],
        [["8ball"], "1F3B1", 3],
        [["panda_face"], "1F43C", 2],
        [["three_button_mouse"], "1F5B1", 6],
        [["ambulance"], "1F691", 4],
        [["rolling_on_the_floor_laughing"], "1F923", 1],
        [["relaxed"], "263A", 1],
        [["strawberry"], "1F353", 5],
        [["table_tennis_paddle_and_ball"], "1F3D3", 3],
        [["koala"], "1F428", 2],
        [["two_hearts"], "1F495", 7],
        [["trackball"], "1F5B2", 6],
        [["fire_engine"], "1F692", 4],
        [["melon"], "1F348", 5],
        [["badminton_racquet_and_shuttlecock"], "1F3F8", 3],
        [["tiger"], "1F42F", 2],
        [["revolving_hearts"], "1F49E", 7],
        [["joystick"], "1F579", 6],
        [["blush"], "1F60A", 1],
        [["minibus"], "1F690", 4],
        [["cherries"], "1F352", 5],
        [["heartbeat"], "1F493", 7],
        [["compression"], "1F5DC", 6],
        [["innocent"], "1F607", 1],
        [["truck"], "1F69A", 4],
        [["goal_net"], "1F945", 3],
        [["lion_face"], "1F981", 2],
        [["peach"], "1F351", 5],
        [["ice_hockey_stick_and_puck"], "1F3D2", 3],
        [["cow"], "1F42E", 2],
        [["heartpulse"], "1F497", 7],
        [["minidisc"], "1F4BD", 6],
        [["slightly_smiling_face"], "1F642", 1],
        [["articulated_lorry"], "1F69B", 4],
        [["pineapple"], "1F34D", 5],
        [["field_hockey_stick_and_ball"], "1F3D1", 3],
        [["pig"], "1F437", 2],
        [["sparkling_heart"], "1F496", 7],
        [["floppy_disk"], "1F4BE", 6],
        [["upside_down_face"], "1F643", 1],
        [["tractor"], "1F69C", 4],
        [["cricket_bat_and_ball"], "1F3CF", 3],
        [["pig_nose"], "1F43D", 2],
        [["cupid"], "1F498", 7],
        [["cd"], "1F4BF", 6],
        [["wink"], "1F609", 1],
        [["scooter"], "1F6F4", 4],
        [["kiwifruit"], "1F95D", 5],
        [["golf"], "26F3", 3],
        [["frog"], "1F438", 2],
        [["gift_heart"], "1F49D", 7],
        [["dvd"], "1F4C0", 6],
        [["relieved"], "1F60C", 1],
        [["bike"], "1F6B2", 4],
        [["avocado"], "1F951", 5],
        [["tomato"], "1F345", 5],
        [["bow_and_arrow"], "1F3F9", 3],
        [["monkey_face"], "1F435", 2],
        [["heart_decoration"], "1F49F", 7],
        [["vhs"], "1F4FC", 6],
        [["heart_eyes"], "1F60D", 1],
        [["motor_scooter"], "1F6F5", 4],
        [["eggplant"], "1F346", 5],
        [["fishing_pole_and_fish"], "1F3A3", 3],
        [["racing_motorcycle"], "1F3CD", 4],
        [["camera"], "1F4F7", 6],
        [["kissing_heart"], "1F618", 1],
        [["see_no_evil"], "1F648", 2],
        [["camera_with_flash"], "1F4F8", 6],
        [["kissing"], "1F617", 1],
        [["hear_no_evil"], "1F649", 2],
        [["rotating_light"], "1F6A8", 4],
        [["boxing_glove"], "1F94A", 3],
        [["cucumber"], "1F952", 5],
        [["video_camera"], "1F4F9", 6],
        [["kissing_smiling_eyes"], "1F619", 1],
        [["speak_no_evil"], "1F64A", 2],
        [["oncoming_police_car"], "1F694", 4],
        [["martial_arts_uniform"], "1F94B", 3],
        [["carrot"], "1F955", 5],
        [["ice_skate"], "26F8", 3],
        [["corn"], "1F33D", 5],
        [["movie_camera"], "1F3A5", 6],
        [["monkey"], "1F412", 2],
        [["kissing_closed_eyes"], "1F61A", 1],
        [["oncoming_bus"], "1F68D", 4],
        [["hot_pepper"], "1F336", 5],
        [["ski"], "1F3BF", 3],
        [["chicken"], "1F414", 2],
        [["film_projector"], "1F4FD", 6],
        [["yum"], "1F60B", 1],
        [["oncoming_automobile"], "1F698", 4],
        [["skier"], "26F7", 3],
        [["film_frames"], "1F39E", 6],
        [["penguin"], "1F427", 2],
        [["stuck_out_tongue_winking_eye"], "1F61C", 1],
        [["oncoming_taxi"], "1F696", 4],
        [["potato"], "1F954", 5],
        [["sweet_potato"], "1F360", 5],
        [["snowboarder"], "1F3C2", 3],
        [["bird"], "1F426", 2],
        [["telephone_receiver"], "1F4DE", 6],
        [["stuck_out_tongue_closed_eyes"], "1F61D", 1],
        [["aerial_tramway"], "1F6A1", 4],
        [["phone", "telephone"], "260E", 6],
        [["chestnut"], "1F330", 5],
        [["baby_chick"], "1F424", 2],
        [["stuck_out_tongue"], "1F61B", 1],
        [["mountain_cableway"], "1F6A0", 4],
        [["weight_lifter"], "1F3CB", 3],
        [["hatching_chick"], "1F423", 2],
        [["pager"], "1F4DF", 6],
        [["suspension_railway"], "1F69F", 4],
        [["money_mouth_face"], "1F911", 1],
        [["peanuts"], "1F95C", 5],
        [["honey_pot"], "1F36F", 5],
        [["hatched_chick"], "1F425", 2],
        [["fax"], "1F4E0", 6],
        [["railway_car"], "1F683", 4],
        [["hugging_face"], "1F917", 1],
        [["fencer"], "1F93A", 3],
        [["tv"], "1F4FA", 6],
        [["train"], "1F68B", 4],
        [["nerd_face"], "1F913", 1],
        [["wrestlers"], "1F93C", 3],
        [["croissant"], "1F950", 5],
        [["duck"], "1F986", 2],
        [["bread"], "1F35E", 5],
        [["radio"], "1F4FB", 6],
        [["sunglasses"], "1F60E", 1],
        [["mountain_railway"], "1F69E", 4],
        [["eagle"], "1F985", 2],
        [["studio_microphone"], "1F399", 6],
        [["monorail"], "1F69D", 4],
        [["clown_face"], "1F921", 1],
        [["baguette_bread"], "1F956", 5],
        [["owl"], "1F989", 2],
        [["level_slider"], "1F39A", 6],
        [["bullettrain_side"], "1F684", 4],
        [["face_with_cowboy_hat"], "1F920", 1],
        [["person_doing_cartwheel"], "1F938", 3],
        [["bat"], "1F987", 2],
        [["cheese_wedge"], "1F9C0", 5],
        [["control_knobs"], "1F39B", 6],
        [["wolf"], "1F43A", 2],
        [["smirk"], "1F60F", 1],
        [["bullettrain_front"], "1F685", 4],
        [["egg"], "1F95A", 5],
        [["stopwatch"], "23F1", 6],
        [["fried_egg", "cooking"], "1F373", 5],
        [["boar"], "1F417", 2],
        [["unamused"], "1F612", 1],
        [["light_rail"], "1F688", 4],
        [["timer_clock"], "23F2", 6],
        [["horse"], "1F434", 2],
        [["disappointed"], "1F61E", 1],
        [["steam_locomotive"], "1F682", 4],
        [["bacon"], "1F953", 5],
        [["alarm_clock"], "23F0", 6],
        [["person_with_ball"], "26F9", 3],
        [["pensive"], "1F614", 1],
        [["train2"], "1F686", 4],
        [["pancakes"], "1F95E", 5],
        [["unicorn_face"], "1F984", 2],
        [["fried_shrimp"], "1F364", 5],
        [["bee", "honeybee"], "1F41D", 2],
        [["mantelpiece_clock"], "1F570", 6],
        [["worried"], "1F61F", 1],
        [["metro"], "1F687", 4],
        [["handball"], "1F93E", 3],
        [["hourglass"], "231B", 6],
        [["poultry_leg"], "1F357", 5],
        [["bug"], "1F41B", 2],
        [["confused"], "1F615", 1],
        [["tram"], "1F68A", 4],
        [["hourglass_flowing_sand"], "23F3", 6],
        [["meat_on_bone"], "1F356", 5],
        [["slightly_frowning_face"], "1F641", 1],
        [["station"], "1F689", 4],
        [["butterfly"], "1F98B", 2],
        [["white_frowning_face"], "2639", 1],
        [["pizza"], "1F355", 5],
        [["snail"], "1F40C", 2],
        [["satellite_antenna"], "1F4E1", 6],
        [["helicopter"], "1F681", 4],
        [["hotdog"], "1F32D", 5],
        [["golfer"], "1F3CC", 3],
        [["shell"], "1F41A", 2],
        [["battery"], "1F50B", 6],
        [["persevere"], "1F623", 1],
        [["small_airplane"], "1F6E9", 4],
        [["airplane"], "2708", 4],
        [["hamburger"], "1F354", 5],
        [["beetle"], "1F41E", 2],
        [["electric_plug"], "1F50C", 6],
        [["confounded"], "1F616", 1],
        [["fries"], "1F35F", 5],
        [["surfer"], "1F3C4", 3],
        [["ant"], "1F41C", 2],
        [["bulb"], "1F4A1", 6],
        [["tired_face"], "1F62B", 1],
        [["airplane_departure"], "1F6EB", 4],
        [["flashlight"], "1F526", 6],
        [["spider"], "1F577", 2],
        [["weary"], "1F629", 1],
        [["airplane_arriving"], "1F6EC", 4],
        [["stuffed_flatbread"], "1F959", 5],
        [["taco"], "1F32E", 5],
        [["swimmer"], "1F3CA", 3],
        [["candle"], "1F56F", 6],
        [["spider_web"], "1F578", 2],
        [["triumph"], "1F624", 1],
        [["rocket"], "1F680", 4],
        [["burrito"], "1F32F", 5],
        [["turtle"], "1F422", 2],
        [["wastebasket"], "1F5D1", 6],
        [["angry"], "1F620", 1],
        [["satellite"], "1F6F0", 4],
        [["water_polo"], "1F93D", 3],
        [["snake"], "1F40D", 2],
        [["seat"], "1F4BA", 4],
        [["rage"], "1F621", 1],
        [["oil_drum"], "1F6E2", 6],
        [["green_salad"], "1F957", 5],
        [["money_with_wings"], "1F4B8", 6],
        [["no_mouth"], "1F636", 1],
        [["canoe"], "1F6F6", 4],
        [["shallow_pan_of_food"], "1F958", 5],
        [["lizard"], "1F98E", 2],
        [["boat", "sailboat"], "26F5", 4],
        [["spaghetti"], "1F35D", 5],
        [["dollar"], "1F4B5", 6],
        [["neutral_face"], "1F610", 1],
        [["scorpion"], "1F982", 2],
        [["ramen"], "1F35C", 5],
        [["yen"], "1F4B4", 6],
        [["expressionless"], "1F611", 1],
        [["rowboat"], "1F6A3", 3],
        [["motor_boat"], "1F6E5", 4],
        [["crab"], "1F980", 2],
        [["stew"], "1F372", 5],
        [["horse_racing"], "1F3C7", 3],
        [["euro"], "1F4B6", 6],
        [["hushed"], "1F62F", 1],
        [["speedboat"], "1F6A4", 4],
        [["squid"], "1F991", 2],
        [["fish_cake"], "1F365", 5],
        [["octopus"], "1F419", 2],
        [["pound"], "1F4B7", 6],
        [["frowning"], "1F626", 1],
        [["passenger_ship"], "1F6F3", 4],
        [["ferry"], "26F4", 4],
        [["sushi"], "1F363", 5],
        [["moneybag"], "1F4B0", 6],
        [["anguished"], "1F627", 1],
        [["bicyclist"], "1F6B4", 3],
        [["shrimp"], "1F990", 2],
        [["bento"], "1F371", 5],
        [["tropical_fish"], "1F420", 2],
        [["credit_card"], "1F4B3", 6],
        [["open_mouth"], "1F62E", 1],
        [["ship"], "1F6A2", 4],
        [["anchor"], "2693", 4],
        [["curry"], "1F35B", 5],
        [["fish"], "1F41F", 2],
        [["gem"], "1F48E", 6],
        [["astonished"], "1F632", 1],
        [["mountain_bicyclist"], "1F6B5", 3],
        [["scales"], "2696", 6],
        [["rice"], "1F35A", 5],
        [["running_shirt_with_sash"], "1F3BD", 3],
        [["blowfish"], "1F421", 2],
        [["dizzy_face"], "1F635", 1],
        [["construction"], "1F6A7", 4],
        [["fuelpump"], "26FD", 4],
        [["rice_ball"], "1F359", 5],
        [["sports_medal"], "1F3C5", 3],
        [["dolphin", "flipper"], "1F42C", 2],
        [["wrench"], "1F527", 6],
        [["flushed"], "1F633", 1],
        [["rice_cracker"], "1F358", 5],
        [["medal"], "1F396", 3],
        [["hammer"], "1F528", 6],
        [["scream"], "1F631", 1],
        [["busstop"], "1F68F", 4],
        [["shark"], "1F988", 2],
        [["hammer_and_pick"], "2692", 6],
        [["oden"], "1F362", 5],
        [["whale"], "1F433", 2],
        [["fearful"], "1F628", 1],
        [["vertical_traffic_light"], "1F6A6", 4],
        [["first_place_medal"], "1F947", 3],
        [["dango"], "1F361", 5],
        [["whale2"], "1F40B", 2],
        [["cold_sweat"], "1F630", 1],
        [["traffic_light"], "1F6A5", 4],
        [["hammer_and_wrench"], "1F6E0", 6],
        [["second_place_medal"], "1F948", 3],
        [["pick"], "26CF", 6],
        [["shaved_ice"], "1F367", 5],
        [["crocodile"], "1F40A", 2],
        [["world_map"], "1F5FA", 4],
        [["cry"], "1F622", 1],
        [["third_place_medal"], "1F949", 3],
        [["ice_cream"], "1F368", 5],
        [["trophy"], "1F3C6", 3],
        [["leopard"], "1F406", 2],
        [["nut_and_bolt"], "1F529", 6],
        [["moyai"], "1F5FF", 4],
        [["disappointed_relieved"], "1F625", 1],
        [["gear"], "2699", 6],
        [["icecream"], "1F366", 5],
        [["rosette"], "1F3F5", 3],
        [["tiger2"], "1F405", 2],
        [["statue_of_liberty"], "1F5FD", 4],
        [["drooling_face"], "1F924", 1],
        [["chains"], "26D3", 6],
        [["fountain"], "26F2", 4],
        [["cake"], "1F370", 5],
        [["reminder_ribbon"], "1F397", 3],
        [["water_buffalo"], "1F403", 2],
        [["sob"], "1F62D", 1],
        [["birthday"], "1F382", 5],
        [["ticket"], "1F3AB", 3],
        [["ox"], "1F402", 2],
        [["gun"], "1F52B", 6],
        [["tokyo_tower"], "1F5FC", 4],
        [["sweat"], "1F613", 1],
        [["custard"], "1F36E", 5],
        [["admission_tickets"], "1F39F", 3],
        [["european_castle"], "1F3F0", 4],
        [["cow2"], "1F404", 2],
        [["bomb"], "1F4A3", 6],
        [["sleepy"], "1F62A", 1],
        [["lollipop"], "1F36D", 5],
        [["circus_tent"], "1F3AA", 3],
        [["japanese_castle"], "1F3EF", 4],
        [["hocho", "knife"], "1F52A", 6],
        [["sleeping"], "1F634", 1],
        [["deer"], "1F98C", 2],
        [["candy"], "1F36C", 5],
        [["stadium"], "1F3DF", 4],
        [["dromedary_camel"], "1F42A", 2],
        [["dagger_knife"], "1F5E1", 6],
        [["face_with_rolling_eyes"], "1F644", 1],
        [["juggling"], "1F939", 3],
        [["crossed_swords"], "2694", 6],
        [["chocolate_bar"], "1F36B", 5],
        [["ferris_wheel"], "1F3A1", 4],
        [["camel"], "1F42B", 2],
        [["thinking_face"], "1F914", 1],
        [["popcorn"], "1F37F", 5],
        [["roller_coaster"], "1F3A2", 4],
        [["elephant"], "1F418", 2],
        [["shield"], "1F6E1", 6],
        [["lying_face"], "1F925", 1],
        [["doughnut"], "1F369", 5],
        [["carousel_horse"], "1F3A0", 4],
        [["performing_arts"], "1F3AD", 3],
        [["grimacing"], "1F62C", 1],
        [["smoking"], "1F6AC", 6],
        [["rhinoceros"], "1F98F", 2],
        [["coffin"], "26B0", 6],
        [["umbrella_on_ground"], "26F1", 4],
        [["cookie"], "1F36A", 5],
        [["art"], "1F3A8", 3],
        [["zipper_mouth_face"], "1F910", 1],
        [["gorilla"], "1F98D", 2],
        [["funeral_urn"], "26B1", 6],
        [["clapper"], "1F3AC", 3],
        [["beach_with_umbrella"], "1F3D6", 4],
        [["racehorse"], "1F40E", 2],
        [["nauseated_face"], "1F922", 1],
        [["glass_of_milk"], "1F95B", 5],
        [["baby_bottle"], "1F37C", 5],
        [["microphone"], "1F3A4", 3],
        [["desert_island"], "1F3DD", 4],
        [["amphora"], "1F3FA", 6],
        [["pig2"], "1F416", 2],
        [["sneezing_face"], "1F927", 1],
        [["coffee"], "2615", 5],
        [["mountain"], "26F0", 4],
        [["headphones"], "1F3A7", 3],
        [["goat"], "1F410", 2],
        [["crystal_ball"], "1F52E", 6],
        [["mask"], "1F637", 1],
        [["tea"], "1F375", 5],
        [["musical_score"], "1F3BC", 3],
        [["snow_capped_mountain"], "1F3D4", 4],
        [["ram"], "1F40F", 2],
        [["prayer_beads"], "1F4FF", 6],
        [["face_with_thermometer"], "1F912", 1],
        [["sake"], "1F376", 5],
        [["musical_keyboard"], "1F3B9", 3],
        [["sheep"], "1F411", 2],
        [["barber"], "1F488", 6],
        [["mount_fuji"], "1F5FB", 4],
        [["face_with_head_bandage"], "1F915", 1],
        [["alembic"], "2697", 6],
        [["volcano"], "1F30B", 4],
        [["beer"], "1F37A", 5],
        [["dog2"], "1F415", 2],
        [["smiling_imp"], "1F608", 1],
        [["drum_with_drumsticks"], "1F941", 3],
        [["beers"], "1F37B", 5],
        [["saxophone"], "1F3B7", 3],
        [["desert"], "1F3DC", 4],
        [["poodle"], "1F429", 2],
        [["imp"], "1F47F", 1],
        [["telescope"], "1F52D", 6],
        [["trumpet"], "1F3BA", 3],
        [["camping"], "1F3D5", 4],
        [["cat2"], "1F408", 2],
        [["japanese_ogre"], "1F479", 1],
        [["microscope"], "1F52C", 6],
        [["clinking_glasses"], "1F942", 5],
        [["tent"], "26FA", 4],
        [["wine_glass"], "1F377", 5],
        [["guitar"], "1F3B8", 3],
        [["rooster"], "1F413", 2],
        [["japanese_goblin"], "1F47A", 1],
        [["hole"], "1F573", 6],
        [["violin"], "1F3BB", 3],
        [["pill"], "1F48A", 6],
        [["hankey", "poop", "shit"], "1F4A9", 1],
        [["railway_track"], "1F6E4", 4],
        [["tumbler_glass"], "1F943", 5],
        [["turkey"], "1F983", 2],
        [["cocktail"], "1F378", 5],
        [["game_die"], "1F3B2", 3],
        [["ghost"], "1F47B", 1],
        [["syringe"], "1F489", 6],
        [["dove_of_peace"], "1F54A", 2],
        [["motorway"], "1F6E3", 4],
        [["thermometer"], "1F321", 6],
        [["tropical_drink"], "1F379", 5],
        [["dart"], "1F3AF", 3],
        [["building_construction"], "1F3D7", 4],
        [["rabbit2"], "1F407", 2],
        [["skull"], "1F480", 1],
        [["skull_and_crossbones"], "2620", 1],
        [["champagne"], "1F37E", 5],
        [["bowling"], "1F3B3", 3],
        [["factory"], "1F3ED", 4],
        [["mouse2"], "1F401", 2],
        [["toilet"], "1F6BD", 6],
        [["video_game"], "1F3AE", 3],
        [["house"], "1F3E0", 4],
        [["rat"], "1F400", 2],
        [["alien"], "1F47D", 1],
        [["potable_water"], "1F6B0", 6],
        [["spoon"], "1F944", 5],
        [["fork_and_knife"], "1F374", 5],
        [["slot_machine"], "1F3B0", 3],
        [["house_with_garden"], "1F3E1", 4],
        [["chipmunk"], "1F43F", 2],
        [["space_invader"], "1F47E", 1],
        [["shower"], "1F6BF", 6],
        [["knife_fork_plate"], "1F37D", 5],
        [["house_buildings"], "1F3D8", 4],
        [["feet", "paw_prints"], "1F43E", 2],
        [["bathtub"], "1F6C1", 6],
        [["robot_face"], "1F916", 1],
        [["jack_o_lantern"], "1F383", 1],
        [["derelict_house_building"], "1F3DA", 4],
        [["dragon"], "1F409", 2],
        [["bath"], "1F6C0", 6],
        [["office"], "1F3E2", 4],
        [["dragon_face"], "1F432", 2],
        [["smiley_cat"], "1F63A", 1],
        [["bellhop_bell"], "1F6CE", 6],
        [["cactus"], "1F335", 2],
        [["department_store"], "1F3EC", 4],
        [["key"], "1F511", 6],
        [["smile_cat"], "1F638", 1],
        [["christmas_tree"], "1F384", 2],
        [["post_office"], "1F3E3", 4],
        [["old_key"], "1F5DD", 6],
        [["joy_cat"], "1F639", 1],
        [["evergreen_tree"], "1F332", 2],
        [["european_post_office"], "1F3E4", 4],
        [["heart_eyes_cat"], "1F63B", 1],
        [["door"], "1F6AA", 6],
        [["deciduous_tree"], "1F333", 2],
        [["hospital"], "1F3E5", 4],
        [["smirk_cat"], "1F63C", 1],
        [["couch_and_lamp"], "1F6CB", 6],
        [["palm_tree"], "1F334", 2],
        [["bank"], "1F3E6", 4],
        [["kissing_cat"], "1F63D", 1],
        [["bed"], "1F6CF", 6],
        [["seedling"], "1F331", 2],
        [["hotel"], "1F3E8", 4],
        [["scream_cat"], "1F640", 1],
        [["sleeping_accommodation"], "1F6CC", 6],
        [["herb"], "1F33F", 2],
        [["convenience_store"], "1F3EA", 4],
        [["frame_with_picture"], "1F5BC", 6],
        [["crying_cat_face"], "1F63F", 1],
        [["shamrock"], "2618", 2],
        [["school"], "1F3EB", 4],
        [["pouting_cat"], "1F63E", 1],
        [["shopping_bags"], "1F6CD", 6],
        [["four_leaf_clover"], "1F340", 2],
        [["love_hotel"], "1F3E9", 4],
        [["open_hands"], "1F450", 1],
        [["shopping_trolley"], "1F6D2", 6],
        [["gift"], "1F381", 6],
        [["bamboo"], "1F38D", 2],
        [["wedding"], "1F492", 4],
        [["raised_hands"], "1F64C", 1],
        [["balloon"], "1F388", 6],
        [["tanabata_tree"], "1F38B", 2],
        [["classical_building"], "1F3DB", 4],
        [["clap"], "1F44F", 1],
        [["church"], "26EA", 4],
        [["leaves"], "1F343", 2],
        [["flags"], "1F38F", 6],
        [["pray"], "1F64F", 1],
        [["fallen_leaf"], "1F342", 2],
        [["ribbon"], "1F380", 6],
        [["mosque"], "1F54C", 4],
        [["handshake"], "1F91D", 1],
        [["maple_leaf"], "1F341", 2],
        [["confetti_ball"], "1F38A", 6],
        [["+1", "thumbsup"], "1F44D", 1],
        [["synagogue"], "1F54D", 4],
        [["mushroom"], "1F344", 2],
        [["tada"], "1F389", 6],
        [["-1", "thumbsdown"], "1F44E", 1],
        [["kaaba"], "1F54B", 4],
        [["shinto_shrine"], "26E9", 4],
        [["ear_of_rice"], "1F33E", 2],
        [["dolls"], "1F38E", 6],
        [["facepunch", "punch"], "1F44A", 1],
        [["fist"], "270A", 1],
        [["izakaya_lantern", "lantern"], "1F3EE", 6],
        [["bouquet"], "1F490", 2],
        [["japan"], "1F5FE", 4],
        [["tulip"], "1F337", 2],
        [["wind_chime"], "1F390", 6],
        [["rice_scene"], "1F391", 4],
        [["left-facing_fist"], "1F91B", 1],
        [["email", "envelope"], "2709", 6],
        [["rose"], "1F339", 2],
        [["national_park"], "1F3DE", 4],
        [["right-facing_fist"], "1F91C", 1],
        [["sunrise"], "1F305", 4],
        [["envelope_with_arrow"], "1F4E9", 6],
        [["hand_with_index_and_middle_fingers_crossed"], "1F91E", 1],
        [["wilted_flower"], "1F940", 2],
        [["v"], "270C", 1],
        [["sunrise_over_mountains"], "1F304", 4],
        [["sunflower"], "1F33B", 2],
        [["incoming_envelope"], "1F4E8", 6],
        [["stars"], "1F320", 4],
        [["blossom"], "1F33C", 2],
        [["e-mail"], "1F4E7", 6],
        [["the_horns", "sign_of_the_horns"], "1F918", 1],
        [["cherry_blossom"], "1F338", 2],
        [["sparkler"], "1F387", 4],
        [["ok_hand"], "1F44C", 1],
        [["love_letter"], "1F48C", 6],
        [["hibiscus"], "1F33A", 2],
        [["fireworks"], "1F386", 4],
        [["point_left"], "1F448", 1],
        [["inbox_tray"], "1F4E5", 6],
        [["city_sunrise"], "1F307", 4],
        [["earth_americas"], "1F30E", 2],
        [["point_right"], "1F449", 1],
        [["outbox_tray"], "1F4E4", 6],
        [["city_sunset"], "1F306", 4],
        [["earth_africa"], "1F30D", 2],
        [["point_up_2"], "1F446", 1],
        [["package"], "1F4E6", 6],
        [["earth_asia"], "1F30F", 2],
        [["cityscape"], "1F3D9", 4],
        [["label"], "1F3F7", 6],
        [["point_down"], "1F447", 1],
        [["point_up"], "261D", 1],
        [["night_with_stars"], "1F303", 4],
        [["full_moon"], "1F315", 2],
        [["mailbox_closed"], "1F4EA", 6],
        [["hand", "raised_hand"], "270B", 1],
        [["milky_way"], "1F30C", 4],
        [["waning_gibbous_moon"], "1F316", 2],
        [["mailbox"], "1F4EB", 6],
        [["bridge_at_night"], "1F309", 4],
        [["last_quarter_moon"], "1F317", 2],
        [["mailbox_with_mail"], "1F4EC", 6],
        [["raised_back_of_hand"], "1F91A", 1],
        [["foggy"], "1F301", 4],
        [["waning_crescent_moon"], "1F318", 2],
        [["mailbox_with_no_mail"], "1F4ED", 6],
        [["raised_hand_with_fingers_splayed"], "1F590", 1],
        [["new_moon"], "1F311", 2],
        [["postbox"], "1F4EE", 6],
        [["spock-hand"], "1F596", 1],
        [["waxing_crescent_moon"], "1F312", 2],
        [["wave"], "1F44B", 1],
        [["postal_horn"], "1F4EF", 6],
        [["first_quarter_moon"], "1F313", 2],
        [["scroll"], "1F4DC", 6],
        [["call_me_hand"], "1F919", 1],
        [["moon", "waxing_gibbous_moon"], "1F314", 2],
        [["muscle"], "1F4AA", 1],
        [["page_with_curl"], "1F4C3", 6],
        [["new_moon_with_face"], "1F31A", 2],
        [["page_facing_up"], "1F4C4", 6],
        [["middle_finger", "reversed_hand_with_middle_finger_extended"], "1F595", 1],
        [["writing_hand"], "270D", 1],
        [["full_moon_with_face"], "1F31D", 2],
        [["bookmark_tabs"], "1F4D1", 6],
        [["sun_with_face"], "1F31E", 2],
        [["bar_chart"], "1F4CA", 6],
        [["selfie"], "1F933", 1],
        [["first_quarter_moon_with_face"], "1F31B", 2],
        [["nail_care"], "1F485", 1],
        [["chart_with_upwards_trend"], "1F4C8", 6],
        [["last_quarter_moon_with_face"], "1F31C", 2],
        [["ring"], "1F48D", 1],
        [["chart_with_downwards_trend"], "1F4C9", 6],
        [["crescent_moon"], "1F319", 2],
        [["lipstick"], "1F484", 1],
        [["spiral_note_pad"], "1F5D2", 6],
        [["kiss"], "1F48B", 1],
        [["dizzy"], "1F4AB", 2],
        [["spiral_calendar_pad"], "1F5D3", 6],
        [["star"], "2B50", 2],
        [["lips"], "1F444", 1],
        [["calendar"], "1F4C6", 6],
        [["star2"], "1F31F", 2],
        [["tongue"], "1F445", 1],
        [["date"], "1F4C5", 6],
        [["sparkles"], "2728", 2],
        [["ear"], "1F442", 1],
        [["card_index"], "1F4C7", 6],
        [["zap"], "26A1", 2],
        [["nose"], "1F443", 1],
        [["card_file_box"], "1F5C3", 6],
        [["footprints"], "1F463", 1],
        [["fire"], "1F525", 2],
        [["ballot_box_with_ballot"], "1F5F3", 6],
        [["eye"], "1F441", 1],
        [["boom", "collision"], "1F4A5", 2],
        [["file_cabinet"], "1F5C4", 6],
        [["comet"], "2604", 2],
        [["eyes"], "1F440", 1],
        [["clipboard"], "1F4CB", 6],
        [["sunny"], "2600", 2],
        [["file_folder"], "1F4C1", 6],
        [["speaking_head_in_silhouette"], "1F5E3", 1],
        [["mostly_sunny", "sun_small_cloud"], "1F324", 2],
        [["bust_in_silhouette"], "1F464", 1],
        [["open_file_folder"], "1F4C2", 6],
        [["partly_sunny"], "26C5", 2],
        [["busts_in_silhouette"], "1F465", 1],
        [["card_index_dividers"], "1F5C2", 6],
        [["barely_sunny", "sun_behind_cloud"], "1F325", 2],
        [["baby"], "1F476", 1],
        [["rolled_up_newspaper"], "1F5DE", 6],
        [["partly_sunny_rain", "sun_behind_rain_cloud"], "1F326", 2],
        [["boy"], "1F466", 1],
        [["newspaper"], "1F4F0", 6],
        [["rainbow"], "1F308", 2],
        [["girl"], "1F467", 1],
        [["notebook"], "1F4D3", 6],
        [["cloud"], "2601", 2],
        [["man"], "1F468", 1],
        [["notebook_with_decorative_cover"], "1F4D4", 6],
        [["rain_cloud"], "1F327", 2],
        [["woman"], "1F469", 1],
        [["ledger"], "1F4D2", 6],
        [["thunder_cloud_and_rain"], "26C8", 2],
        [["closed_book"], "1F4D5", 6],
        [["lightning", "lightning_cloud"], "1F329", 2],
        [["person_with_blond_hair"], "1F471", 1],
        [["green_book"], "1F4D7", 6],
        [["snow_cloud"], "1F328", 2],
        [["older_man"], "1F474", 1],
        [["blue_book"], "1F4D8", 6],
        [["snowman"], "2603", 2],
        [["older_woman"], "1F475", 1],
        [["orange_book"], "1F4D9", 6],
        [["snowman_without_snow"], "26C4", 2],
        [["man_with_gua_pi_mao"], "1F472", 1],
        [["books"], "1F4DA", 6],
        [["snowflake"], "2744", 2],
        [["book", "open_book"], "1F4D6", 6],
        [["wind_blowing_face"], "1F32C", 2],
        [["man_with_turban"], "1F473", 1],
        [["bookmark"], "1F516", 6],
        [["dash"], "1F4A8", 2],
        [["link"], "1F517", 6],
        [["tornado", "tornado_cloud"], "1F32A", 2],
        [["cop"], "1F46E", 1],
        [["paperclip"], "1F4CE", 6],
        [["fog"], "1F32B", 2],
        [["linked_paperclips"], "1F587", 6],
        [["ocean"], "1F30A", 2],
        [["construction_worker"], "1F477", 1],
        [["triangular_ruler"], "1F4D0", 6],
        [["droplet"], "1F4A7", 2],
        [["straight_ruler"], "1F4CF", 6],
        [["guardsman"], "1F482", 1],
        [["sweat_drops"], "1F4A6", 2],
        [["pushpin"], "1F4CC", 6],
        [["umbrella_with_rain_drops"], "2614", 2],
        [["round_pushpin"], "1F4CD", 6],
        [["scissors"], "2702", 6],
        [["sleuth_or_spy"], "1F575", 1],
        [["lower_left_ballpoint_pen"], "1F58A", 6],
        [["lower_left_fountain_pen"], "1F58B", 6],
        [["black_nib"], "2712", 6],
        [["lower_left_paintbrush"], "1F58C", 6],
        [["lower_left_crayon"], "1F58D", 6],
        [["memo", "pencil"], "1F4DD", 6],
        [["pencil2"], "270F", 6],
        [["mag"], "1F50D", 6],
        [["mag_right"], "1F50E", 6],
        [["lock_with_ink_pen"], "1F50F", 6],
        [["closed_lock_with_key"], "1F510", 6],
        [["lock"], "1F512", 6],
        [["unlock"], "1F513", 6],
        [["mother_christmas"], "1F936", 1],
        [["santa"], "1F385", 1],
        [["princess"], "1F478", 1],
        [["prince"], "1F934", 1],
        [["bride_with_veil"], "1F470", 1],
        [["man_in_tuxedo"], "1F935", 1],
        [["angel"], "1F47C", 1],
        [["pregnant_woman"], "1F930", 1],
        [["bow"], "1F647", 1],
        [["information_desk_person"], "1F481", 1],
        [["no_good"], "1F645", 1],
        [["ok_woman"], "1F646", 1],
        [["raising_hand"], "1F64B", 1],
        [["face_palm"], "1F926", 1],
        [["shrug"], "1F937", 1],
        [["person_with_pouting_face"], "1F64E", 1],
        [["person_frowning"], "1F64D", 1],
        [["haircut"], "1F487", 1],
        [["massage"], "1F486", 1],
        [["man_in_business_suit_levitating"], "1F574", 1],
        [["dancer"], "1F483", 1],
        [["man_dancing"], "1F57A", 1],
        [["dancers"], "1F46F", 1],
        [["walking"], "1F6B6", 1],
        [["runner", "running"], "1F3C3", 1],
        [["couple", "man_and_woman_holding_hands"], "1F46B", 1],
        [["two_women_holding_hands"], "1F46D", 1],
        [["two_men_holding_hands"], "1F46C", 1],
        [["family", "man-woman-boy"], "1F46A", 1],
        [["hearts"], "2665", 7],
        [["womans_clothes"], "1F45A", 1],
        [["shirt", "tshirt"], "1F455", 1],
        [["jeans"], "1F456", 1],
        [["necktie"], "1F454", 1],
        [["dress"], "1F457", 1],
        [["bikini"], "1F459", 1],
        [["kimono"], "1F458", 1],
        [["high_heel"], "1F460", 1],
        [["sandal"], "1F461", 1],
        [["boot"], "1F462", 1],
        [["mans_shoe", "shoe"], "1F45E", 1],
        [["athletic_shoe"], "1F45F", 1],
        [["womans_hat"], "1F452", 1],
        [["tophat"], "1F3A9", 1],
        [["mortar_board"], "1F393", 1],
        [["crown"], "1F451", 1],
        [["helmet_with_white_cross"], "26D1", 1],
        [["school_satchel"], "1F392", 1],
        [["pouch"], "1F45D", 1],
        [["purse"], "1F45B", 1],
        [["handbag"], "1F45C", 1],
        [["briefcase"], "1F4BC", 1],
        [["eyeglasses"], "1F453", 1],
        [["dark_sunglasses"], "1F576", 1],
        [["closed_umbrella"], "1F302", 1],
        [["umbrella"], "2602", 1],
    ];

    var Local$1 = (function () {
        function Local(app) {
            this.app = app;
            this.data = emojis;
            this.buildNameMap();
            this.emojiRegExp = /:([^ :]+)/gi;
            this.symbol = ":";
        }
        Local.prototype.emojis = function () {
            if (this._emojis)
                return this._emojis;
            var emData = (this._emojis = new webix.DataCollection({}));
            var data = this.getEmojiData(emojis);
            emData.parse(data);
            return emData;
        };
        Local.prototype.getEmojiData = function (arr) {
            return arr.map(function (emoji) {
                return {
                    id: webix.uid(),
                    name: emoji[0][0],
                    unified: emoji[1],
                    category: emoji[2],
                    names: emoji[0],
                };
            });
        };
        Local.prototype.replaceEmoji = function (text) {
            var _this = this;
            var matches = text.match(this.emojiRegExp);
            var symbol = this.symbol;
            if (matches)
                matches.forEach(function (str) {
                    str = str.replace(_this.emojiRegExp, function (match, s) {
                        return s;
                    });
                    var code = _this.emojiNameMap[str];
                    if (code)
                        text = text.replace(symbol + str + symbol, "<span class='webix_chat_emoji webix_chat_emoji_" +
                            code +
                            "'></span>");
                });
            return text;
        };
        Local.prototype.basicEmojis = function () {
            var _this = this;
            if (this._basicEmojis)
                return this._basicEmojis;
            var emData = (this._basicEmojis = new webix.DataCollection({}));
            var back = this.app.getService("backend");
            back.basicEmojis().then(function (d) {
                var arr = [];
                d.forEach(function (name) {
                    var emoji = _this.findEmojiByName(name);
                    if (emoji)
                        arr.push(emoji);
                });
                emData.parse(_this.getEmojiData(arr));
            });
            return emData;
        };
        Local.prototype.findEmojiByName = function (name) {
            return emojis.find(function (em) { return em[0].indexOf(name) != -1; });
        };
        Local.prototype.findName = function (emoji, value) {
            return value
                ? emoji.names.find(function (n) { return n.toLowerCase().indexOf(value) != -1; })
                : emoji.name;
        };
        Local.prototype.buildNameMap = function () {
            var _this = this;
            this.emojiNameMap = {};
            emojis.forEach(function (em) {
                em[0].forEach(function (name) { return (_this.emojiNameMap[name] = em[1]); });
            });
        };
        Local.prototype.shortNameToTitle = function (name) {
            name = name.split("_").join(" ");
            return name[0].toUpperCase() + name.substring(1).toLowerCase();
        };
        Local.prototype.categories = function () {
            if (!this._categories)
                this._categories = [
                    { id: "basic", icon: "chi-star-outline", name: "Basic" },
                    { id: 1, icon: "chi-emoticon-outline", name: "Smileys & People" },
                    { id: 2, icon: "chi-cat", name: "Animals & Nature" },
                    { id: 3, icon: "chi-soccer", name: "Activity" },
                    { id: 4, icon: "chi-earth", name: "Travel & Places" },
                    { id: 5, icon: "chi-food-fork-drink", name: "Food & Drink" },
                    { id: 7, icon: "chi-heart-outline", name: "Symbols" },
                    { id: 6, icon: "chi-bullhorn-outline", name: "Objects" },
                ];
            return this._categories;
        };
        return Local;
    }());

    var App = (function (_super) {
        __extends(App, _super);
        function App(config) {
            var _this = this;
            var state = createState({
                chatId: 0,
                chatType: null,
                userId: null,
                search: "",
                callStatus: 0,
                callId: 0,
                callUsers: [],
            });
            var params = { state: state };
            if (config.compaсt)
                params.forceCompact = config.compact;
            if (config.reactions && typeof !config.emojis)
                config.emojis = true;
            var defaults = {
                router: EmptyRouter,
                version: "10.0.6",
                debug: true,
                start: "/top",
                mode: "full",
                compactWidth: 650,
                params: { state: state, forceCompact: config.compact },
                files: false,
            };
            _this = _super.call(this, __assign(__assign({}, defaults), config)) || this;
            if (_this.config.debug) {
                webix.Promise = window.Promise;
            }
            var dynamic = function (obj) {
                return _this.config.override ? _this.config.override.get(obj) || obj : obj;
            };
            _this.setService("local", new (dynamic(Local))(_this));
            _this.setService("backend", new (dynamic(Backend))(_this));
            _this.setService("operations", new (dynamic(Operations))(_this));
            _this.setService("upload", new (dynamic(UploadHandler))(_this));
            _this.setService("helpers", new (dynamic(Helpers))(_this));
            _this.setService("emojis", new (dynamic(Local$1))(_this));
            initJetWin(_this);
            _this.use(plugins.Locale, _this.config.locale || {
                lang: "en",
                webix: {
                    en: "en-US",
                },
            });
            return _this;
        }
        App.prototype.render = function (node) {
            var _this = this;
            var back = this.getService("backend");
            back
                .ready()
                .then(function () { return back.callInfo(); })
                .then(function (info) {
                if (info && info.id) {
                    var state = _this.config.params.state;
                    state.$batch({
                        callId: info.id,
                        callUsers: info.users,
                        callStatus: info.status,
                    });
                }
                _super.prototype.render.call(_this, node);
            });
        };
        App.prototype.require = function (type, name) {
            if (type === "jet-views")
                return views[name];
            else if (type === "jet-locales")
                return locales[name];
            return null;
        };
        App.prototype.getState = function () {
            return this.config.params.state;
        };
        return App;
    }(JetApp));
    webix.protoUI({
        name: "chat",
        app: App,
        getState: function () {
            return this.$app.getState();
        },
        getService: function (name) {
            return this.$app.getService(name);
        },
        $init: function () {
            this.$view.className += " webix_chat";
            var state = this.$app.getState();
            for (var key in state) {
                link(state, this.config, key);
            }
        },
    }, webix.ui.jetapp);
    var services = { Local: Local, Backend: Backend, Operations: Operations, Upload: UploadHandler, Helpers: Helpers, Emojis: Local$1 };
    var locales = { en: en };

    exports.App = App;
    exports.locales = locales;
    exports.services = services;
    exports.views = views;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
