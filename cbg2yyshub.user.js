// ==UserScript==
// @name         痒痒鼠魔方 Helper.js
// @namespace    yyshub.top
// @description  直接加载 CBG 数据到痒痒鼠魔方。
// @license      GPT
// @version      2024-11-20
// @author       清明月见
// @homepage     http://yyshub.top/
// @iconURL      http://yyshub.top/static/img/favicon.png
// @match        https://yys.cbg.163.com/*
// @match        http://yyshub.top/*
// @run-at       document-start
// @require      https://scriptcat.org/lib/513/2.0.0/ElementGetter.js#sha256=KbLWud5OMbbXZHRoU/GLVgvIgeosObRYkDEbE/YanRU=
// @require      https://scriptcat.org/lib/637/1.4.3/ajaxHooker.js#sha256=y1sWy1M/U5JP1tlAY5e80monDp27fF+GMRLsOiIrSUY=
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_openInTab
// @downloadURL https://update.greasyfork.org/scripts/518093/%E7%97%92%E7%97%92%E9%BC%A0%E9%AD%94%E6%96%B9%20Helperjs.user.js
// @updateURL https://update.greasyfork.org/scripts/518093/%E7%97%92%E7%97%92%E9%BC%A0%E9%AD%94%E6%96%B9%20Helperjs.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const YYSHUB_URL = "http://yyshub.top";
    const CBG_URL = "https://yys.cbg.163.com";
    const CBG_DESC_URL_MATCH = "/cgi/api/get_equip_desc";
    const KEY_OF_CBG_DATA = "cbg_data";

    // Your code here...
    console.log('load Tampermonkey of 痒痒鼠魔方 Helper');

    GM_getTab(function(tab) {
        console.log('tab', tab);
        tab.href = unsafeWindow.location.href;
        GM_saveTab(tab);
    });

    if (unsafeWindow.location.href.startsWith(CBG_URL)) {
        GM_getTabs((tabs) => {
            console.log('getTabs', tabs);
            let isOpenYyshub = false;
            for (const [tabId, tab] of Object.entries(tabs)) {
                if (tab?.href?.startsWith(YYSHUB_URL)) {
                    isOpenYyshub = true
                }
            }

            if (!isOpenYyshub) {
                GM_openInTab(YYSHUB_URL, { active: false, insert: true, setParent :true })
            }
        });
    }

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

    ajaxHooker.hook(request => {
        if (request.url.startsWith(CBG_DESC_URL_MATCH)) {
            request.response = res => {
                if (res.status == 200) {
                    elmGetter.get('.site-navbar .right')
                        .then(navbar => {
                            let b = document.createElement('a');
                            b.innerText = "# 魔方 #";
                            b.className = "navbar-menu";
                            b.id = "mofang"
                            b.style.cursor = "pointer";
                            b.style.color = "#AAA";
                            b.onclick = function() {
                                GM_setValue(KEY_OF_CBG_DATA, res.json) // open close
                            }
                            navbar.insertBefore(b, navbar.children[0]);
                        });
                }
            };
        }
    })
})();