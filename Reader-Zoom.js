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

var zoom_levels = [72,96,144,168,192]
var zoom_min = 0
var zoom_max = 4
