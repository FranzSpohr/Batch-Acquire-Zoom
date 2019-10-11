// ==UserScript==
// @name         Slate Reader Zoom
// @namespace    https://umich.edu/
// @version      10.13.19
// @description  For Slate Reader. Opens a page with a highder DPI render of document. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
// @match        https://api.cdn.technolutions.net/pdf/*
// @updateURL    https://github.com/FranzSpohr/Slate_Tools/blob/master/reader_zoom.user.js
// @grant        GM_addStyle
// ==/UserScript==


GM_addStyle (`
.mySlidesUMich {display: none}

#overlayUMich {
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

.prevUMich, .nextUMich {
cursor: pointer;
position: fixed;
top: 0%;
display: flex;
height: 100%;
align-items: center;
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

.nextUMich {
right: 1%;
border-radius: 3px 0 0 3px;
}

.prevUMich:hover, .nextUMich:hover {
background-color: rgba(0,0,0,0.8);
color: white;
}

.numbertextUMich {
color: 	#000000;
font-size: 25px;
padding: 8px 12px;
position: fixed;
top: 0;
background-color: rgba(255, 255, 255, 0.5);
}

.fadeUMich {
-webkit-animation-name: fadeUMich;
-webkit-animation-duration: 0.5s;
animation-name: fadeUMich;
animation-duration: 0.5s;
}

@-webkit-keyframes fadeUMich {
from {opacity: .4}
to {opacity: 1}
}

@keyframes fadeUMich {
from {opacity: .4}
to {opacity: 1}
}
`);

var slideIndex = 1
var imageLoaded = false

var overlay = document.createElement("div");
overlay.id = 'overlayUMich'
document.body.appendChild(overlay);

var input=document.createElement("input");
input.type="button";
input.value="Display Larger Image";
input.onclick = overlayOn;
input.setAttribute("style", "font-size:14px;position:absolute;top:97.4%;right:50%;");
document.body.appendChild(input);

function overlayOn() {
    const imageLink = document.querySelector("body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img");
    var currentPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+/);
    var startPage = 1;
    var endPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+(?=,)/);
    if (imageLink == null) {
        alert("Navigate to a tab with documents first.");
        return;
    } else if (imageLoaded) {
        document.getElementById("overlayUMich").style.display = "block";
        slideIndex = parseInt(currentPage,10);
        showSlides(slideIndex);
        return;
    } else {
        var imageNew = imageLink.src.replace(/z=\d*/, 'z=300');

        document.getElementById("overlayUMich").style.display = "block";
        for (var i = startPage; i <= endPage; i++) {
            imageNew = imageNew.replace(/pg=\d*/, `pg=${i-1}`);
            var slide = document.createElement("div")
            slide.id = 'slide'+i
            slide.className = 'mySlidesUMich fadeUMich'
            document.getElementById("overlayUMich").appendChild(slide)

            var pgCounter = document.createElement("div")
            pgCounter.className = "numbertextUMich"
            pgCounter.innerHTML = i+'/'+endPage
            document.getElementById("slide"+i).appendChild(pgCounter)

            var imageLoc = document.createElement("img")
            imageLoc.src = imageNew
            imageLoc.onclick = overlayOff
            imageLoc.style.width = '100%'
            document.getElementById("slide"+i).appendChild(imageLoc)
        }

        var forward = document.createElement("a");
        forward.className = "nextUMich"
        forward.onclick = plusSlides;
        forward.innerHTML = "&#10095;"
        document.getElementById("overlayUMich").appendChild(forward);

        var backward = document.createElement("a");
        backward.className = "prevUMich"
        backward.onclick = minusSlides;
        backward.innerHTML = "&#10094;"
        document.getElementById("overlayUMich").appendChild(backward);

        slideIndex = parseInt(currentPage, 10);
        showSlides(slideIndex);
        imageLoaded = true;
    }
}

function overlayOff() {
    document.getElementById("overlayUMich").style.display = "none";
}

function plusSlides() {
    showSlides(slideIndex += 1);
}

function minusSlides() {
    showSlides(slideIndex -= 1);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlidesUMich");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex-1].style.display = "block";
}
