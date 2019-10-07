// ==UserScript==
// @name         Slate Reader Zoom
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  For Slate Reader. Increases available zoom levels. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
// @match        https://api.cdn.technolutions.net/pdf/*
// @updateURL    https://github.com/FranzSpohr/Slate_Tools/blob/master/reader_zoom.user.js
// @grant        none
// ==/UserScript==

var input=document.createElement("input");

input.type="button";
input.value="Open Zoomed-In Window";
input.onclick = zoom_Overlay;
input.setAttribute("style", "font-size:14px;position:absolute;top:97.5%;right:62.5%;");
document.body.appendChild(input);

function zoom_Overlay(){
    const imageLink = document.querySelector("body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img");
    if (imageLink.src.includes('z=72')){
        imageLink.src = imageLink.src.replace('z=72', 'z=216');
    } else if (imageLink.src.includes('z=96')) {
        imageLink.src = imageLink.src.replace('z=96', 'z=216');
    } else if (imageLink.src.includes('z=144')) {
        imageLink.src = imageLink.src.replace('z=144', 'z=216');
    }
    window.open(imageLink.src, '_blank','height=' + screen.height + ',width=' + screen.width + ',toolbar=no,resiable=yes,menubar=no,location=no');
};
