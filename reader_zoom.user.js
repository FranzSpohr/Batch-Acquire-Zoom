// ==UserScript==
// @name         Slate Reader Zoom
// @namespace    http://tampermonkey.net/
// @version      10.9.19
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
    if (imageLink == null) {
        alert("Navigate to a tab with documents first.");
        return;
    } else if (imageLink.src.includes('z=72')||imageLink.src.includes('z=96')||imageLink.src.includes('z=144')){
        imageLink.src = imageLink.src.replace(/z=\d*/, 'z=300');
        var startPage = 1;
        var currentPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+/);
        var endPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+(?=,)/);
    }
    imageLink.src = imageLink.src.replace(/pg=\d*/, `pg=${currentPage-1}`);
    var win = popupWindow("","Zoom",window,1920,1080)
    win.document.body.innerHTML = '<img class = "zoomed_image" src=' + imageLink.src + ' width = "100%" height="auto">'
};

function popupWindow(url, title, win, w, h) {
    const y = win.top.outerHeight / 2 + win.top.screenY - ( h / 2);
    const x = win.top.outerWidth / 2 + win.top.screenX - ( w / 2);
    return win.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+y+', left='+x);
}


function closeWindow(){
    window.close()
}
