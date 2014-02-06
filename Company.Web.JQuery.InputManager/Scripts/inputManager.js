﻿; function inputManager(target, options) {

    "use strict";

    // control type check
    (function (n) {
        if (n != "input" && n != 'textarea') {
            throw "unsupported element type '" + n + "' for inputManager";
        }
    })(target.get(0).nodeName.toLowerCase());

    // save settings
    var _Settings = $.extend({}, {
        divTemplate: "<div style='position: relative; display:inline-block;'></div>",
        events: {
            onKeyup: null,
            onKeydown: null
        },
    }, options);

    var _Target = $(target);
    var _UIRoot = _Target.wrap($(_Settings.divTemplate)).parent();

    this.getTarget = function () {
        return _Target;
    }

    this.getUIRoot = function () {
        return _UIRoot;
    }

    this.getSettings = function () {
        return _Settings;
    }

    var onKeyup = function (e) {

        if (_Settings.events.onKeyup) {

            var preText = getInitialText(_Target);
            var postText = _Target.val().substring(preText.length);

            var position = getCursorPostion(_Target, preText);

            var param = $.extend(e, {
                preText: preText,
                postText: postText,
                cursorPosition: position
            });

            (contextBinder(_Settings.events.onKeyup, this))(param);
        }

    }

    var onKeydown = function (e) {

        if (_Settings.events.onKeydown) {

            var preText = getInitialText(_Target);
            var postText = _Target.val().substring(preText.length);

            var position = getCursorPostion(_Target, preText);

            var param = $.extend(e, {
                preText: preText,
                postText: postText,
                cursorPosition: position
            });

            (contextBinder(_Settings.events.onKeydown, this))(param);
        }
    }

    var getInitialText = function ($this) {

        // Get Previous text
        var selectedText = "";
        var index = $this.get(0).selectionEnd;

        if (typeof index === "number") {
            selectedText = $this.val().substring(0, index);
        }
        else if (document.selection) {
            var range = $this.createTextRange();
            range.moveStart("character", 0);
            range.moveEnd("textedit");
            selectedText = range.text;
        }

        return selectedText;
    }

    var getCursorPostion = function ($this, preText) {

        // Get textbox/textarea style.
        var styles = {};

        $([
            "font-family", "font-size", "font-weight", "font-style", "font-variant",
            "padding-top", "padding-left", "padding-bottom", "padding-right",
            "margin-top", "margin-left", "margin-bottom", "margin-right",
            "line-height", "letter-spacing", "word-spacing", "text-decoration", "text-align",
            "border-width", "border-style", "direction", "height", "width"
        ]).each(function (i, item) {
            styles[item] = $this.css(item);
        });

        //fix borders.
        if (styles["border-width"] === "") {
            styles["border-width"] = "1px";
            styles["border-style"] = "solid";
        }

        //add aditional behavior.
        var css = $.extend({
            "overflow": "auto",
            "box-sizing": "border-box",
            "white-space": "pre-wrap",
            "word-wrap": "break-word",
            "position": "absolute",
            "top": "0px",
            "left": "-9999px"
        }, styles);

        //create div as a copy and get cursor position.
        var $div = $("<div></div>").css(css).append(preText).appendTo(document.body);
        var $cursor = $("<span></span>").text(String.fromCharCode(".")).appendTo($div);
        var pos = $cursor.position();

        if ($this.css("direction") === "rtl") {
            pos.right = $div.width() - pos.left;
            delete pos.left;
        }

        pos.top += $cursor.height() - $this.scrollTop();
        $div.remove();

        return pos;
    };

    //Private Static - changes function scope so that 'this' could point to source object
    var contextBinder = function (func, scope) {
        if (func.bind) {
            return func.bind(scope);
        } else {
            return function () {
                func.apply(scope, arguments[2]);
            };
        }
    };

    _Target.on("keyup", contextBinder(onKeyup, this));
    _Target.on("keydown", contextBinder(onKeydown, this));

}

