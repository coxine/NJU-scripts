// ==UserScript==
// @name         SEECODER  courseware quick download
// @namespace    http://tampermonkey.net/
// @version      2025-03-06
// @description  快速下载 SEECODER 平台课程的课件
// @author       Coxine
// @match        https://p-nju.seec.seecoder.cn/course/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=seecoder.cn
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  async function fetchCourseWares(courseID) {
    const url = `https://p-nju.seec.seecoder.cn/api/courseWare/getCourseWaresByCourseId?courseId=${courseID}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error("Error fetching course wares:", error);
      return [];
    }
  }

  function extractFileInfo(data) {
    try {
      if (data.code !== 0 || !Array.isArray(data.data)) {
        throw new Error("Invalid data format");
      }

      return data.data.map(item => {
        const courseWare = item.courseWareVO;
        return {
          name: courseWare.name,
          fileUrl: courseWare.fileUrl
        };
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  }

  function generateTable(fileInfo) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.setAttribute('border', '0');

    const tbody = document.createElement('tbody');
    fileInfo.forEach(file => {
      const row = document.createElement('tr');

      const nameCell = document.createElement('td');
      nameCell.textContent = file.name;
      row.appendChild(nameCell);

      const linkCell = document.createElement('td');
      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.textContent = '下载';
      linkCell.appendChild(link);
      row.appendChild(linkCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
  }

  function getCourseIdFromUrl(url) {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  }

  function waitForElement(selector, callback, timeout = 5000) {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        callback(element);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        console.error(`Element '${selector}' not found within timeout`);
      }
    }, 100);
  }

  function appendTable(element, table) {
    element.style = 'padding:10px 10px';
    element.appendChild(document.createElement('hr'));
    element.appendChild(document.createElement('h3')).textContent = '课件列表';
    element.appendChild(table);
  }

  async function main() {
    const COURSE_ID = getCourseIdFromUrl(window.location.href);
    const courseWares = await fetchCourseWares(COURSE_ID);
    const table = generateTable(extractFileInfo(courseWares));

    waitForElement('.introduce-content', (element) => {
      appendTable(element, table);
    });
  }

  main();
})();