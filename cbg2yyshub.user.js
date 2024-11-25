// ==UserScript==
// @name         痒痒鼠魔方 Helper.js
// @namespace    yyshub.top
// @description  直接加载 CBG 数据到痒痒鼠魔方。
// @license      GPT
// @version      2024-11-25
// @author       清明月见
// @homepage     http://yyshub.top/
// @iconURL      http://yyshub.top/static/img/favicon.png
// @match        https://yys.cbg.163.com/*
// @match        http://yyshub.top/*
// @run-at       document-start
// @require      https://update.greasyfork.org/scripts/448197/1478721/ElementGetter20.js
// @require      https://update.greasyfork.org/scripts/455943/1270016/ajaxHooker.js
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
    const CBG_DETAIL_URL_MATCH = "/cgi/api/get_equip_detail";
    const CBG_DESC_URL_MATCH = "/cgi/api/get_equip_desc";
    const KEY_OF_CBG_DATA = "cbg_data";

    console.log('load Tampermonkey of 痒痒鼠魔方 Helper');

    GM_getTab(function(tab) {
        tab.href = unsafeWindow.location.href;
        GM_saveTab(tab);
    });

    if (unsafeWindow.location.href.startsWith(CBG_URL)) {
        GM_getTabs((tabs) => {
            let isOpenYyshub = false;
            for (const [tabId, tab] of Object.entries(tabs)) {
                if (tab?.href?.startsWith(YYSHUB_URL)) {
                    isOpenYyshub = true
                }
            }

            if (!isOpenYyshub) {
                GM_openInTab(YYSHUB_URL + '/#/yuhun/list', { active: false, insert: true, setParent :true })
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

    const loadMofang = (data) => {
        if (data) {
            elmGetter.get('.site-navbar .right .navbar-menu')
                .then(navbarMenu => {
                    // 安装 CBG Helper.js 的情况下, 会重复获取御魂数据
                    // 这里做下兜底
                    if (!document.getElementById('mofang')) {
                        let b = document.createElement('a');
                        b.innerText = "# 魔方 #";
                        b.title = "如果有帮到你，可以请作者喝一杯咖啡 ☕️";
                        b.className = "navbar-menu";
                        b.id = "mofang"
                        b.style.cursor = "pointer";
                        b.style.color = "rgb(236, 209, 107)";
                        b.onclick = function() {
                            GM_setValue(KEY_OF_CBG_DATA, data) // open close
                        }
                        const navbar = navbarMenu.parentElement;
                        navbar.insertBefore(b, navbar.children[0]);
                        console.log('# 魔方 # inject success')
                    }
                });
        }
    }

    ajaxHooker.hook(request => {
        if (request.url.startsWith(CBG_DESC_URL_MATCH)) {
            request.response = res => {
                if (res.status == 200) {
                    loadMofang(res.json)
                }
            };
        }
        if (request.url.startsWith(CBG_DETAIL_URL_MATCH)) {
            request.response = res => {
                if (res.status == 200) {
                    const data = JSON.parse(res.responseText)
                    if (data?.equip?.equip_desc) {
                        loadMofang(data)
                    }
                }
            }
        }
    })
})();