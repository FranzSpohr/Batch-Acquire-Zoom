// ==UserScript==
// @name         Batch Acquire Zoom
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  For Slate Batch Acquire; zoom in and out with "+" and "-" keys on the numberpad. Needs Tampermonkey or Greasemonkey
// @author       Theodore Ma
// @match        https://*/manage/database/acquire
// @match        https://*/manage/lookup/* 
// @downloadURL  https://github.com/FranzSpohr/Batch-Acquire-Zoom/blob/master/batch-zoom.user.js
// @grant        none
// ==/UserScript==

window.addEventListener('keydown', ZoomIn);
window.addEventListener('keydown', ZoomOut);
var ZOOMED_DPI = 72;
var ZOOMED_DPI1 = 108;
var ZOOMED_DPI2 = 144;
var ZOOMED_DPI3 = 180;
var ZOOMED_DPI4 = 216;

function ZoomIn (event) {
    if (event.code == 'NumpadAdd') {
        const elements = document.querySelectorAll('.batch_page_container > img');
        elements.forEach(function(el) {
            if (el.src.includes(`z=${ZOOMED_DPI}`)) {
                el.src = el.src.replace(`z=${ZOOMED_DPI}`, `z=${ZOOMED_DPI1}`);
            } else if (el.src.includes(`z=${ZOOMED_DPI1}`)) {
                el.src = el.src.replace(`z=${ZOOMED_DPI1}`, `z=${ZOOMED_DPI2}`);
            } else if (el.src.includes(`z=${ZOOMED_DPI2}`)) {
                el.src = el.src.replace(`z=${ZOOMED_DPI2}`, `z=${ZOOMED_DPI3}`);
            } else if (el.src.includes(`z=${ZOOMED_DPI3}`)) {
                el.src = el.src.replace(`z=${ZOOMED_DPI3}`, `z=${ZOOMED_DPI4}`);
            }
        });
    }
}

function ZoomOut (event) {
    if (event.code == 'NumpadSubtract') {
        const elements = document.querySelectorAll('.batch_page_container > img');
        elements.forEach(function(el) {
            if (el.src.includes(`z=${ZOOMED_DPI4}`)) {
                el.src = el.src.replace(`z=${ZOOMED_DPI4}`, `z=${ZOOMED_DPI3}`);
            } else if (el.src.includes(`z=${ZOOMED_DPI3}`)) {
                el.src = el.src.replace(`z=${ZOOMED_DPI3}`, `z=${ZOOMED_DPI2}`);
            } else if (el.src.includes(`z=${ZOOMED_DPI2}`)) {
                el.src = el.src.replace(`z=${ZOOMED_DPI2}`, `z=${ZOOMED_DPI1}`);
            } else if (el.src.includes(`z=${ZOOMED_DPI1}`)) {
                el.src = el.src.replace(`z=${ZOOMED_DPI1}`, `z=${ZOOMED_DPI}`);
            }
        });
    }
}
