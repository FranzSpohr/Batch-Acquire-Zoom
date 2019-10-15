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

//creates necessary CSS for userscript to function 
GM_addStyle (`
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

  #tooltipUMich {
    border-radius: 25px;
    border: 1px solid #00274c;
    position: fixed;
    width: auto;
    height: auto;
    top: 2.0%;
    right: 1.5%;
    color: black;
    background-color: rgba(192, 192, 192, .95);
    text-align: justify;
    padding: 16px;
  }

  #buttonUMich {
    font-size: 13px;
    position: absolute;
    right: 50%;
    height: 25px;
  }

  .mySlidesUMich {
	display: none
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
    border: 1px solid #00274c;
    color: 	#000000;
    font-size: 20px;
    padding: 6px 10px;
    position: fixed;
    top: 5px;
    left: 5px;
    background-color: rgba(192, 192, 192, 0.7);
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

/*
*/
var zoomed = false
var slideIndex = 1;
var imageLoaded = false;
var activeTab;

var overlay = document.createElement("div");
overlay.id = 'overlayUMich';
document.body.appendChild(overlay);
overlay.addEventListener('keydown', key_handler, true);
overlay.addEventListener('contextmenu', overlayOff)
overlay.className = 'dragscroll'
overlay.tabIndex = -1;

var input=document.createElement("input");
input.type="button";
input.id = 'buttonUMich'
input.value="Display Larger Image";
input.onclick = overlayOn;
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
      displayTooltip()
    } else {
      slideIndex = parseInt(currentPage,10);
      showSlides(slideIndex);
      displayTooltip()
      return;
    }
  } else {
    addElements(imageLink,startPage,endPage,currentPage);
    displayTooltip();
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
    imageLoc.style.width = '100%';
    imageLoc.onclick = toggleZoom
    document.getElementById("slide"+i).appendChild(imageLoc);
  }

  var forward = document.createElement("a");
  forward.className = "nextUMich";
  forward.onclick = function(){plusSlides(1)};
  forward.innerHTML = "&#10095;";
  document.getElementById("overlayUMich").appendChild(forward);

  var backward = document.createElement("a");
  backward.className = "prevUMich";
  backward.onclick = function(){plusSlides(-1)};
  backward.innerHTML = "&#10094;";
  document.getElementById("overlayUMich").appendChild(backward);

  slideIndex = parseInt(currPg, 10);
  showSlides(slideIndex);
  imageLoaded = true;
  activeTab = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent;
};

function key_handler(event) {
  hideTooltip();
  if (event.code == 'ArrowRight') {
    plusSlides(1);
  } else if (event.code == 'ArrowLeft') {
    plusSlides(-1);
  } else if (event.code == 'Escape') {
    overlayOff();
  };
  event.stopPropagation();
};

function overlayOff() {
  const elements = document.getElementById('imageNew'+slideIndex);
  elements.setAttribute("style", "width:100%;");
  document.getElementById("overlayUMich").style.display = "none";
  hideTooltip();
};

function toggleZoom () {
  const elements = document.getElementById('imageNew'+slideIndex);
  hideTooltip();
  if (zoomed) {
    elements.setAttribute("style", "width:100%;");
    zoomed=false;
  } else {
    elements.setAttribute("style", "width:130%;");
    zoomed=true;
  }
}

function displayTooltip () {
  if (document.getElementById('tooltipUMich') == null) {
    var tooltip = document.createElement("div");
    tooltip.id = 'tooltipUMich';
    tooltip.innerHTML = '<p>Navigate between pages by<strong>&nbsp;left clicking on arrows&nbsp;</strong>near the edges of the screen.</p><ul><li><strong>Esc Key:&nbsp;</strong>Return to reader</li><li><strong>Right Click:&nbsp;</strong>Return to reader</li><li><strong>Left Arrow Key:</strong> Previous page</li><li><strong>Right Arrow Key:&nbsp;</strong>Next page</li><li><strong>Left Click:</strong> Toggle between zoom levels</li><li><strong>Hold Left Click &amp; Mouse Drag</strong>: Scroll document</li></ul><p>If you encounter any bugs and/or glitches or have<br>any suggestions or requests, please <strong>contact Ted Ma at <a href="mailto:tedma@umich.edu">tedma@umich.edu</a>.</strong></p>'
    document.getElementById("overlayUMich").appendChild(tooltip);
    tooltip.style.display = 'block';
    setTimeout(function(){tooltip.parentNode.removeChild(tooltip)}, 10000)
  } else {
    tooltip.style.display = 'block';
  }
  overlay.style.display = "block";
  overlay.focus()
}

function hideTooltip () {
  var tooltip = document.getElementById('tooltipUMich');
  if (tooltip != null){
    tooltip.parentNode.removeChild(tooltip);
  }
}

function plusSlides(n) {
  const elements = document.getElementById('imageNew'+slideIndex);
  elements.setAttribute("style", "width:100%;");
  showSlides(slideIndex += n);
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
              //only change to dragscroll to hide tooltip on mouse movement
              hideTooltip();
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
