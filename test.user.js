// ==UserScript==
// @name         Reader Zoom test 2
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  For Slate Reader. Increases available zoom levels. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
// @match        https://api.cdn.technolutions.net/pdf/*
// @match        about:blank      
// @updateURL
// @grant        none
// ==/UserScript==

// little buffer to prevent forced scrollbars
var padding = 20;

// Values to use when opening window
var winWidth = 1440 + padding;
var winHeight = 900 + padding;

if (/manage\/reader/.test (location.pathname) ) {
    //Run in Slate Reader
    var input=document.createElement("input");

    input.type="button";
    input.value="Open Zoomed-In Window";
    input.onclick = zoom_Overlay;
    input.setAttribute("style", "font-size:14px;position:absolute;top:97.4%;right:62.5%;");
    document.body.appendChild(input);
} else if (/pdf\/render/.test (location.pathname) ) {
    //Run in the new window

    window.addEventListener('keydown', navigateWindow, true)

    const newImg = document.querySelector("img");
    newImg.style.width = (screen.width)*0.975;
    newImg.style.height = 'auto';

    var buttonBack=document.createElement("input");
    buttonBack.type="button";
    buttonBack.value="Previous";
    buttonBack.onclick = previousDoc;
    buttonBack.setAttribute("style", "font-size:14px;position:fixed;top:96%;right:54%;")
    document.body.appendChild(buttonBack);

    var buttonNext=document.createElement("input");
    buttonNext.type="button";
    buttonNext.value="Next";
    buttonNext.onclick = previousDoc;
    buttonNext.setAttribute("style", "font-size:14px;position:fixed;top:96%;right:46%;")
    document.body.appendChild(buttonNext);

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
    //window.open(imageLink.src, "_blank", 'height=' + winHeight + ',width=' + winWidth +',toolbar=no,resiable=no,menubar=no,location=no,status=no,scrollbars=no').moveTo(0,0);
    //var win = window.open("", "Title", 'height=' + winHeight + ',width=' + winWidth + "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes");
    //win.document.body.innerHTML = "HTML";
    //win.moveto(0,0);
    var win = popupWindow("","Zoom",window,1920,1080)
    //win.document.body.innerHTML = '<img class = "zoomed_image" src=' + imageLink.src + ' width = "100%" height="auto">'
    var spot = win.document.createElement('script');
    spot.src = "https://rawcdn.githack.com/nextapps-de/spotlight/0.6.3/dist/spotlight.bundle.js"
    spot.type = 'text/javascript';
    documents.getElementsByTagName('head')[0].appendChild(spot);
    win.document.body.innerHTML = '<a class="spotlight" href="' + imageLink.src + '"><img src="' + imageLink.src + '" width = "50%" height="auto"></a>'
};

function popupWindow(url, title, win, w, h) {
    const y = win.top.outerHeight / 2 + win.top.screenY - ( h / 2);
    const x = win.top.outerWidth / 2 + win.top.screenX - ( w / 2);
    return win.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+y+', left='+x);
}

function fetchImgSrc(){
    const imageLink = window.location.href
    imageLink.src = imageLink.src.replace(/pg=\d*/, 'pg=${Zoom_Levels[i-1]}');
}
function navigateWindow(){
}
function nextDoc(){
}
function previousDoc(){
}
function closeWindow(){
    window.close()
}
