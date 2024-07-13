// ==UserScript==
// @name         Add GPA Rank on the Homepage
// @namespace    http://tampermonkey.net/
// @version      2024-07-13
// @description  在交换生界面直接显示GPA和排名，而无需点开申请页面
// @author       Coxine
// @match        http://elite.nju.edu.cn/exchangesystem/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nju.edu.cn
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const loginDiv = document.querySelector('.login-in');
    if (checkLogin(loginDiv)) {
        console.log('Login, display rank');
        loginDiv.removeChild(loginDiv.lastChild);
        loginDiv.removeChild(loginDiv.lastChild);
        calcRank().then(data => addRank(data, loginDiv));
    }
})();

function checkLogin(loginDiv) {
    return loginDiv !== null;
}

async function calcRank() {
    // fetch
    const url = "http://elite.nju.edu.cn/exchangesystem/index/create?pid=380"
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const gpaElement = doc.querySelector('body > div > div:nth-child(4) > div:nth-child(11) > div:nth-child(3) > div.xm_text_span > span');
        const gpa = parseFloat(gpaElement.innerHTML);
        const rankPercent = doc.querySelector('input[name="data.pmbfb"]').value;
        const rankPercentVal = parseFloat(rankPercent.substring(0, rankPercent.length - 1));
        const total = parseInt(doc.querySelector('input[name="data.zyzrs"]').value);
        const rank = Math.round(rankPercentVal * total / 100);
        return [gpa, rank, total];
    } catch (error) {
        console.error('Failed to fetch the title:', error);
        return null;
    }
}

function addRank(data, loginDiv) {
    console.log(data);
    const GPADiv = document.createElement('p');
    GPADiv.innerText = `GPA: ${data[0]}`;
    const rankDiv = document.createElement('p');
    rankDiv.innerText = `排名: ${data[1]}/${data[2]}`;
    loginDiv.appendChild(GPADiv);
    loginDiv.appendChild(rankDiv);
}


