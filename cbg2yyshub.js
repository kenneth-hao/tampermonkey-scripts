// ==UserScript==
// @name         痒痒鼠魔方 Helper.js
// @namespace    yyshub.top
// @version      v1.0
// @description  直接加载 CBG 数据到痒痒鼠魔方。
// @license      GPT
// @version      2024-11-19
// @description  try to take over the world!
// @author       清明月见
// @homepage     http://yyshub.top/
// @match        https://yys.cbg.163.com/*
// @match        http://yyshub.top/*
// @iconURL      http://yyshub.top/static/img/favicon.png
// @run-at       document-start
// @require      https://scriptcat.org/lib/513/2.0.0/ElementGetter.js#sha256=KbLWud5OMbbXZHRoU/GLVgvIgeosObRYkDEbE/YanRU=
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_openInTab
// @downloadURL none
// @updateURL none
// ==/UserScript==

(function() {
    'use strict';

    const YYSHUB_URL = "http://yyshub.top";
    // const YYSHUB_URL = "http://192.168.3.156:5173";
    const CBG_URL_MATCH = "api/get_equip_detail";
    const KEY_OF_CBG_DATA = "cbg_data";

    // Your code here...
    console.log('load Tampermonkey of 痒痒鼠魔方 Helper');

    GM_getTab(function(tab) {
        tab.href = unsafeWindow.location.href;
        GM_saveTab(tab);
    });

    GM_getTabs((tabs) => {
        let isOpenYyshub = false;
        for (const [tabId, tab] of Object.entries(tabs)) {
            if (tab && tab.href.startsWith(YYSHUB_URL)) {
                isOpenYyshub = true
            }
        }

        if (!isOpenYyshub) {
           GM_openInTab(YYSHUB_URL, { active: false, insert: true, setParent :true })
        }
    });

    GM_addValueChangeListener(KEY_OF_CBG_DATA, function(name, old_value, new_value, remote) {
        if (remote && new_value) {
            // console.log(name, old_value, new_value, remote)
            elmGetter.get('#yys4tampermonkey').then(e => {
                console.log('# 魔方 # 加载数据')
                e.click(new_value);
            });
            GM_setValue(KEY_OF_CBG_DATA, '');
        }
    })

    let _open = XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, URL) {
        let _onreadystatechange = this.onreadystatechange,
            _this = this;

        _this.onreadystatechange = function() {
            // catch only completed 'api/search/universal' requests
            if (_this.readyState === 4 && _this.status === 200 && ~URL.indexOf(CBG_URL_MATCH)) {
                try {
                    //////////////////////////////////////
                    // THIS IS ACTIONS FOR YOUR REQUEST //
                    //             EXAMPLE:             //
                    //////////////////////////////////////
                    let data = JSON.parse(_this.responseText); // {"fields": ["a","b"]}

                    elmGetter.get('.site-navbar .right').then(navbar => {
                        let b = document.createElement('a');
                        b.innerText = "# 魔方 #";
                        b.className = "navbar-menu";
                        b.id = "mofang"
                        b.style.cursor = "pointer";
                        b.style.color = "#AAA";
                        b.onclick = function() {
                            GM_setValue(KEY_OF_CBG_DATA, data) // open close
                        }
                        navbar.insertBefore(b, navbar.children[0]);
                    });

                    // rewrite responseText
                    Object.defineProperty(_this, 'responseText', {
                        value: JSON.stringify(data)
                    });
                    Object.defineProperty(_this, 'response', {
                        value: JSON.stringify(data)
                    });
                    /////////////// END //////////////////
                } catch (e) {}

                console.log('onreadystatechange! :)', method, URL /*, _this.responseText*/ );
            }
            // call original callback
            if (_onreadystatechange) _onreadystatechange.apply(this, arguments);
        };

        return _open.apply(_this, arguments);
    };
})();