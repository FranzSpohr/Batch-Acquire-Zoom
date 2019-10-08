// ==UserScript==
// @name         Slate Reader Zoom
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @description  For Slate Reader. Opens a page with a highder DPI render of document. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
// @match        https://api.cdn.technolutions.net/pdf/*
// @updateURL    https://github.com/FranzSpohr/Slate_Tools/blob/master/reader_zoom.user.js
// @grant        none
// ==/UserScript==

// little buffer to prevent forced scrollbars
var padding = 20;

// Values to use when opening window
var winWidth = screen.width + padding;
var winHeight = screen.height + padding;

if (/manage\/reader/.test (location.pathname) ) {
    //Run in Slate Reader
    var input=document.createElement("input");

    input.type="button";
    input.value="Open Zoomed-In Image";
    input.onclick = zoom_Overlay;
    input.setAttribute("style", "font-size:14px;position:absolute;top:97.4%;right:62.5%;");
    document.body.appendChild(input);
} else if (/pdf\/render/.test (location.pathname) ) {
    //Run in the new window
    const newImg = document.querySelector("img");

    newImg.style.width = (screen.width)*0.975;
    newImg.style.height = 'auto';

    var buttonExit=document.createElement("input");
    buttonExit.type="button";
    buttonExit.value="Exit";
    buttonExit.onclick = closeWindow;
    buttonExit.setAttribute("style", "font-size:14px;position:fixed;top:96%;right:50%;")
    document.body.appendChild(buttonExit);
}

// Run code for all sites here.
function zoom_Overlay(){
    const imageLink = document.querySelector("body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img");
    var startPage = 1
    var currentPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+/);
    var endPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+(?=,)/);
    if (imageLink == null) {
        alert("Navigate to a tab with documents first.");
        return;
    } else if (imageLink.src.includes('z=72')||imageLink.src.includes('z=96')||imageLink.src.includes('z=144')){
        imageLink.src = imageLink.src.replace(/z=\d*/, 'z=300');
    }
    imageLink.src = imageLink.src.replace(/pg=\d*/, `pg=${currentPage}`);
    window.open(imageLink.src, "_blank", 'height=' + winHeight + ',width=' + winWidth +',toolbar=no,resiable=no,menubar=no,location=no,status=no,scrollbars=no').moveTo(0,0);
};

function closeWindow(){
    window.close()
}
