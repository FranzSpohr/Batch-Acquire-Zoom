// ==UserScript==
// @name         Slate Reader Zoom
// @namespace    http://tampermonkey.net/
// @version      10.10.19
// @description  For Slate Reader. Opens an overlay with a highder DPI render of document. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
// @match        https://api.cdn.technolutions.net/pdf/*
// @updateURL    https://github.com/FranzSpohr/Slate_Tools/blob/master/reader_zoom.user.js
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle (`
#overlay {
overflow: auto;
position: fixed;
display: none;
width: 100%;
height: 100%;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: rgba(0,0,0,0.5);
z-index: 2;
cursor: pointer;
}
`);

var overlay=document.createElement("div");

overlay.innerHTML = '<div id="overlay"></div>;';
overlay.onclick = overlayOff;

document.body.appendChild(overlay);

var input=document.createElement("input");

input.type="button";
input.value="Display Larger Image";
input.onclick = overlayOn;
input.setAttribute("style", "font-size:14px;position:absolute;top:97.4%;right:62.5%;");

document.body.appendChild(input);

function overlayOn() {
    const imageLink = document.querySelector("body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img");
    if (imageLink == null) {
        alert("Navigate to a tab with documents first.");
        return;
    } else {
        imageLink.src = imageLink.src.replace(/z=\d*/, 'z=300');
        var currentPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+/);
        var startPage = 1;
        var endPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+(?=,)/);
        imageLink.src = imageLink.src.replace(/pg=\d*/, `pg=${currentPage-1}`);
        document.getElementById("overlay").style.display = "block";
        document.getElementById("overlay").innerHTML = '<img class = "zoomed_image" src=' + imageLink.src + 'position = "fixed" width = "100%" height="auto">;'
        alert(imageLink.src)
        alert(currentPage)
    }
}

function overlayOff() {
  document.getElementById("overlay").style.display = "none";
}
