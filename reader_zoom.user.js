// ==UserScript==
// @name         Slate Reader Zoom
// @namespace    https://umich.edu/
// @version      10.15.19
// @description  For Slate Reader. Opens a page with a highder DPI render of document. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
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
background-color: rgba(0,0,0,0.5);
color: white;
}

.numbertextUMich {
border-radius:  25px;
border: 1px solid #000000;
color: 	#000000;
font-size: 20px;
padding: 6px 10px;
position: fixed;
top: 5px;
left: 5px;
background-color: rgba(192, 192, 192, 0.5);
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

var zoomed = false
var slideIndex = 1;
var imageLoaded = false;
var activeTab;

var overlay = document.createElement("div");
overlay.id = 'overlayUMich';
document.body.appendChild(overlay);
overlay.addEventListener('keydown', key_handler, true);
overlay.className = 'dragscroll'
overlay.onclick = toggleZoom;
overlay.tabIndex = -1;

var input=document.createElement("input");
input.type="button";
input.value="Display Larger Image";
input.onclick = overlayOn;
input.setAttribute("style", "font-size:13px;position:absolute;right:50%;height:25px;");
document.getElementsByClassName('reader_footer')[0].appendChild(input);

function overlayOn() {
    const imageLink = document.querySelector("body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img");

    if (imageLink == null) {
        alert("Navigate to a tab with documents first.");
        return;
    }

    var startPage = 1;
    var currentPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+/);
    var endPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+(?=,)/);
    var targetTab = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent;

    if (imageLoaded) {
        if(activeTab !== targetTab){
            while (overlay.firstChild) {
                overlay.removeChild(overlay.firstChild);
            }
            addElements(imageLink,startPage,endPage,currentPage)
            overlay.style.display = "block";
            overlay.focus()
        } else {
            slideIndex = parseInt(currentPage,10);
            showSlides(slideIndex);
            overlay.style.display = "block";
            overlay.focus()
            return;
        }
    } else {
        addElements(imageLink,startPage,endPage,currentPage);
        overlay.style.display = "block";
        overlay.focus()
    }
}

function addElements(imageSrc,startPg,endPg,currPg) {
    var imageNew = imageSrc.src.replace(/z=\d*/, 'z=300');

    for (var i = startPg; i <= endPg; i++) {
        imageNew = imageNew.replace(/pg=\d*/, `pg=${i-1}`);
        var slide = document.createElement("div");
        slide.id = 'slide'+i;
        slide.className = 'mySlidesUMich fadeUMich';
        document.getElementById("overlayUMich").appendChild(slide);

        var pgCounter = document.createElement("div");
        pgCounter.className = "numbertextUMich";
        pgCounter.innerHTML = i+'/'+endPg;
        document.getElementById("slide"+i).appendChild(pgCounter);

        var imageLoc = document.createElement("img");
        imageLoc.id = 'imageNew' + i;
        imageLoc.src = imageNew;
        imageLoc.addEventListener('contextmenu', overlayOff)
        imageLoc.style.width = '100%';
        document.getElementById("slide"+i).appendChild(imageLoc);
    }

    var forward = document.createElement("a");
    forward.className = "nextUMich";
    forward.onclick = plusSlides;
    forward.innerHTML = "&#10095;";
    document.getElementById("overlayUMich").appendChild(forward);

    var backward = document.createElement("a");
    backward.className = "prevUMich";
    backward.onclick = minusSlides;
    backward.innerHTML = "&#10094;";
    document.getElementById("overlayUMich").appendChild(backward);

    slideIndex = parseInt(currPg, 10);
    showSlides(slideIndex);
    imageLoaded = true;
    activeTab = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent;
};

function key_handler(event) {
      if (event.code == 'ArrowRight') {
          plusSlides();
      } else if (event.code == 'ArrowLeft') {
          minusSlides();
      } else if (event.code == 'Escape') {
          overlayOff();
      };
    event.stopPropagation();
};

function overlayOff() {
    const elements = document.getElementById('imageNew'+slideIndex);
    elements.setAttribute("style", "width:100%;");
    overlay.scrollTo(0,0);
    document.getElementById("overlayUMich").style.display = "none";
};

function toggleZoom () {
    const elements = document.getElementById('imageNew'+slideIndex);
    if (zoomed) {
        elements.setAttribute("style", "width:100%;");
        zoomed=false;
    } else {
        elements.setAttribute("style", "width:130%;");
        zoomed=true;
    }
}

function plusSlides() {
    const elements = document.getElementById('imageNew'+slideIndex);
    elements.setAttribute("style", "width:100%;");
    showSlides(slideIndex += 1);
    overlay.scrollTo(0,0);
    zoomed=false;
};

function minusSlides() {
    const elements = document.getElementById('imageNew'+slideIndex);
    elements.setAttribute("style", "width:100%;");
    showSlides(slideIndex -= 1);
    overlay.scrollTo(0,0);
    zoomed=false;
};

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlidesUMich");
    if (n > slides.length) {slideIndex = 1};
    if (n < 1) {slideIndex = slides.length};
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    };
    slides[slideIndex-1].style.display = "block";
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.dragscroll = {}));
    }
}(this, function (exports) {
    var _window = window;
    var _document = document;
    var mousemove = 'mousemove';
    var mouseup = 'mouseup';
    var mousedown = 'mousedown';
    var mouseenter = 'mouseenter';
    var click = 'click';
    var EventListener = 'EventListener';
    var addEventListener = 'add'+EventListener;
    var removeEventListener = 'remove'+EventListener;
    var newScrollX, newScrollY;
    var moveThreshold = 4;

    var dragged = [];
    var reset = function(i, el) {
        for (i = 0; i < dragged.length;) {
            el = dragged[i++];
            el = el.container || el;
            el[removeEventListener](mousedown, el.md, 0);
            el[removeEventListener](click, el.mc, 0);
            _window[removeEventListener](mouseup, el.mu, 0);
            _window[removeEventListener](mousemove, el.mm, 0);
            _document[removeEventListener](mouseenter, el.me, 0);
        }

        // cloning into array since HTMLCollection is updated dynamically
        dragged = [].slice.call(_document.getElementsByClassName('dragscroll'));
        for (i = 0; i < dragged.length;) {
            (function(el, lastClientX, lastClientY, startX, startY, moved, pushed, scroller, cont){
                (cont = el.container || el)[addEventListener](
                    mousedown,
                    cont.md = function(e) {
                        if (!el.hasAttribute('nochilddrag') ||
                            _document.elementFromPoint(
                                e.pageX, e.pageY
                            ) == cont
                        ) {
                            pushed = 1;
                            moved = 0;
                            startX = lastClientX = e.clientX;
                            startY = lastClientY = e.clientY;
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }, 0
                );
                (cont = el.container || el)[addEventListener](
                  click,
                  cont.mc = function(e) {
                    if (moved) {
                      e.preventDefault();
                      e.stopPropagation();
                      moved = 0; pushed = 0;
                    }
                  }, 1
                );
                _window[addEventListener](
                    mouseup, cont.mu = function() {pushed = 0;}, 0
                );
                _document[addEventListener](
                  mouseenter, cont.me = function(e) {if (!e.buttonsPressed) pushed = 0;}, 0
                );
                _window[addEventListener](
                    mousemove,
                    cont.mm = function(e) {
                        if (pushed) {
                          if (!moved &&
                            (Math.abs(e.clientX - startX) > moveThreshold ||
                             Math.abs(e.clientY - startY) > moveThreshold)) {
                               moved = true;
                             }
                          if (moved) {
                            (scroller = el.scroller||el).scrollLeft -=
                                newScrollX = (- lastClientX + (lastClientX=e.clientX));
                            scroller.scrollTop -=
                                newScrollY = (- lastClientY + (lastClientY=e.clientY));
                            if (el == _document.body) {
                                (scroller = _document.documentElement).scrollLeft -= newScrollX;
                                scroller.scrollTop -= newScrollY;
                            }
                          }
                        }
                    }, 0
                );
             })(dragged[i++]);
        }
    }


    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window[addEventListener]('load', reset, 0);
    }

    exports.reset = reset;
}));
