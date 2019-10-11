// ==UserScript==
// @name         Slate Reader Zoom
// @namespace    http://tampermonkey.net/
// @version      10.11.19
// @description  For Slate Reader. Opens a page with a highder DPI render of document. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
// @match        https://api.cdn.technolutions.net/pdf/*
// @updateURL    https://github.com/FranzSpohr/Slate_Tools/blob/master/reader_zoom.user.js
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle (`
.mySlides {display: none}

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

.prev, .next {
cursor: pointer;
position: fixed;
top: 50%;
width: auto;
margin-top: -22px;
padding: 16px;
color: black;
font-weight: bold;
font-size: 18px;
transition: 0.6s ease;
border-radius: 0 3px 3px 0;
user-select: none;
}

.next {
right: 1%;
border-radius: 3px 0 0 3px;
}

.prev:hover, .next:hover {
background-color: rgba(0,0,0,0.8);
color: white;
}

.numbertext {
color: 	#000000;
font-size: 25px;
padding: 8px 12px;
position: fixed;
top: 0;
background-color: #FEFEFE;
}

.active, .dot:hover {
background-color: #717171;
}

.fade {
-webkit-animation-name: fade;
-webkit-animation-duration: 1.5s;
animation-name: fade;
animation-duration: 1.5s;
}

@-webkit-keyframes fade {
from {opacity: .4}
to {opacity: 1}
}

@keyframes fade {
from {opacity: .4}
to {opacity: 1}
}
`);

var slideIndex = 1
var imageLoaded = false

var overlay = document.createElement("div");
overlay.id = 'overlay'
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
    } else if (imageLoaded) {
        document.getElementById("overlay").style.display = "block";
        slideIndex = 1;
        showSlides(slideIndex);
        return;
    } else {
        var imageNew = imageLink.src.replace(/z=\d*/, 'z=300');
        var currentPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+/);
        var startPage = 1;
        var endPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+(?=,)/);
        document.getElementById("overlay").style.display = "block";

        for (var i = startPage; i <= endPage; i++) {
            imageNew = imageNew.replace(/pg=\d*/, `pg=${i-1}`);
            var slide = document.createElement("div")
            slide.id = 'slide'+i
            slide.className = 'mySlides fade'
            document.getElementById("overlay").appendChild(slide)
            var pgCounter = document.createElement("div")
            pgCounter.className = "numbertext"
            pgCounter.innerHTML = i+'/'+endPage
            document.getElementById("slide"+i).appendChild(pgCounter)
            var imageLoc = document.createElement("img")
            imageLoc.src = imageNew
            imageLoc.onclick = overlayOff
            imageLoc.style.width = '100%'
            document.getElementById("slide"+i).appendChild(imageLoc)
        }

        var forward = document.createElement("a");
        forward.className = "next"
        forward.onclick = plusSlides
        forward.innerHTML = "&#10095;"
        document.getElementById("overlay").appendChild(forward);

        var backward = document.createElement("a");
        backward.className = "prev"
        backward.onclick = minusSlides
        backward.innerHTML = "&#10094;"
        document.getElementById("overlay").appendChild(backward);

        slideIndex = 1;
        showSlides(slideIndex);
        imageLoaded = true
    }
}

function overlayOff() {
    document.getElementById("overlay").style.display = "none";
}

function plusSlides() {
    showSlides(slideIndex += 1);
}

function minusSlides() {
    showSlides(slideIndex -= 1);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex-1].style.display = "block";
}
