// ==UserScript==
// @name         Reader Zoom
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  For Slate Reader. Increases available zoom levels. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
// @updateURL    
// @grant        none
// ==/UserScript==

window.addEventListener('keydown', ZoomIn);
window.addEventListener('keydown', ZoomOut);
