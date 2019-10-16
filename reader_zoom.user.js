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

//creates necessary CSS for the userscript to function
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
    color: #000000;
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

// stores zoom state of a document
var zoomed = false;

// stores which page to display
var slideIndex = 1;

// stores whether higher DPI images were loaded
var imageLoaded = false;

// stores Slate tab that the images were loaded from
var activeTab;

// creates an overlay that serves as a container for the documents
var overlay = document.createElement('div');
overlay.id = 'overlayUMich';
document.body.appendChild(overlay);
overlay.addEventListener('keydown', key_handler, true);
overlay.addEventListener('contextmenu', overlayOff);

// enables scrolling by mouse drag
overlay.className = 'dragscroll';

// enables keyboard controls by setting focus on the overlay
overlay.tabIndex = -1;

// injects button into the footer of Slate Reader to display the overlay
var input = document.createElement('input');
input.type = 'button';
input.id = 'buttonUMich';
input.value = 'Display Larger Images';
input.onclick = overlayOn;
document.getElementsByClassName('reader_footer')[0].appendChild(input);

// calls overlay and displays higher DPI documents
function overlayOn() {
  // needs to be loaded to determine whether the current Slate tab has any zoomable images or not, displays alert if no images available
  const imageLink = document.querySelector('body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img');
  if (imageLink == null) {
    alert('Navigate to a tab with documents first.');
    return;
  }
  // uses regular expressions to extract data needed to determine the number of needed new HTML elements
  var startPage = 1;
  var currentPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+/);
  var endPage = document.getElementsByClassName('reader_status')[0].childNodes[0].textContent.match(/\d+(?=,)/);

  // determines which Slate tab is currently being displayed
  var targetTab = document.getElementsByClassName('stream active')[0].innerHTML;

  if (imageLoaded) {
	// determines whether the Slate tab in use has changed. If changed, deletes existing HTML elements and creates new ones
    if(activeTab !== targetTab){
      while (overlay.firstChild) {
	    // necessary to prevent unused HTML elements from cluttering the page
        overlay.removeChild(overlay.firstChild);
      }
      addElements(imageLink, startPage, endPage, currentPage);
      displayTooltip();
    } else {
      // for whatever reason, parseInt is required to convert variable to an integer
      slideIndex = parseInt(currentPage, 10);
      showSlides(slideIndex);
      displayTooltip();
      return;
    }
  } else {
    addElements(imageLink, startPage, endPage, currentPage);
    displayTooltip();
  }
}

// adds HTML elements needed for the userscript to function
function addElements(imageSrc, startPg, endPg, currPg) {
  for (var i = startPg; i <= endPg; i++) {
    // Slides are div elements that contain the page number and the image
    var slides = document.createElement('div');
    slides.id = 'slide_' + i;
    slides.className = 'mySlidesUMich fadeUMich';
    document.getElementById('overlayUMich').appendChild(slides);

    // page counter on the upper left corner
    var pgCounter = document.createElement('div');
    pgCounter.className = 'numbertextUMich';
    pgCounter.innerHTML = i + '/' + endPg;
    document.getElementById('slide_' + i).appendChild(pgCounter);

    // higher DPI images of the documents
    var imageElement = document.createElement('img');

    // replaces the part of HTML used to request the DPI of document with a higher one
    var imageNewSrc = imageSrc.src.replace(/z=\d*/, 'z=300');

    // lowers requested DPI if image fails to be loaded
    var errorDPI = 200

    // modifies the page number component of the URL to attach correct pages to the slides
    imageNewSrc = imageNewSrc.replace(/pg=\d*/, `pg=${i-1}`);
    imageElement.id = 'image_' + i;
    imageElement.src = imageNewSrc;
    imageElement.style.width = '100%';
    imageElement.onclick = toggleZoom;
    imageElement.onerror = function() {errorDPI -= 10; this.src = this.src.replace(/z=\d*/, `z=${errorDPI}`)};
    document.getElementById('slide_' + i).appendChild(imageElement);
  }

  // creates anchor elements on the edges of the screen for switching between pages
  var forward = document.createElement('a');
  forward.className = 'nextUMich';
  forward.onclick = function() {plusSlides(1)};
  forward.innerHTML = '&#10095';
  document.getElementById('overlayUMich').appendChild(forward);

  // creates anchor elements on the edges of the screen for switching between pages
  var backward = document.createElement('a');
  backward.className = 'prevUMich';
  backward.onclick = function() {plusSlides(-1)};
  backward.innerHTML = '&#10094';
  document.getElementById('overlayUMich').appendChild(backward);

  // opens the viewer and displays the page currently being displayed in Slate Reader
  slideIndex = parseInt(currPg, 10);
  showSlides(slideIndex);
  imageLoaded = true;
  activeTab = document.getElementsByClassName('stream active')[0].innerHTML;
}

// handles keyboard inputs
function key_handler(event) {
  hideTooltip();
  if (event.code == 'ArrowRight') {
    plusSlides(1);
  } else if (event.code == 'ArrowLeft') {
    plusSlides(-1);
  } else if (event.code == 'Escape') {
    overlayOff();
  }
  event.stopPropagation();
}

function overlayOff() {
  const elements = document.getElementById('image_' + slideIndex);
  // resets the zoom state of displayed document
  elements.setAttribute('style', 'width:100%');
  document.getElementById('overlayUMich').style.display = 'none';
  hideTooltip();
}

function toggleZoom() {
  // kind of a janky way to change zoom levels of a document, could use improvement?
  const elements = document.getElementById('image_' + slideIndex);
  hideTooltip();
  if (zoomed) {
    elements.setAttribute('style', 'width:100%');
    zoomed=false;
  } else {
    elements.setAttribute('style', 'width:130%');
    zoomed = true;
  }
}

// displays tooltip. It should disappear after 10 seconds or upon any input from the user
function displayTooltip() {
  var tooltip = document.createElement('div');
  tooltip.id = 'tooltipUMich';
  tooltip.innerHTML = '<p>Navigate between pages by<strong>&nbsp;left clicking on arrows&nbsp;</strong>near the edges of the screen.</p>' +
                      '<ul><li><strong>Esc Key:&nbsp;</strong>Return to reader</li>' +
                      '<li><strong>Right Click:&nbsp;</strong>Return to reader</li>' +
                      '<li><strong>Left Arrow Key:</strong> Previous page</li>' +
                      '<li><strong>Right Arrow Key:&nbsp;</strong>Next page</li>' +
                      '<li><strong>Left Click:</strong> Toggle between zoom levels</li>' +
                      '<li><strong>Hold Left Click &amp; Mouse Drag</strong>: Scroll document</li></ul>' +
                      '<p>If you encounter any bugs and/or glitches or have any suggestions or requests, <br>' +
                      '<strong>contact Ted Ma at <a href="mailto:tedma@umich.edu">tedma@umich.edu</a>.</strong></p>';
  document.getElementById('overlayUMich').appendChild(tooltip);
  tooltip.style.display = 'block';

  // automatically hides tooltip after 10 seconds
  setTimeout(function() {if (document.getElementById('tooltipUMich') == null) {return;} else {tooltip.parentNode.removeChild(tooltip)}}, 10000)
  overlay.style.display = "block";
  overlay.focus();
}

// HTML element for the tooltip must be destroyed after each time to prevent clutter
function hideTooltip() {
  var tooltip = document.getElementById('tooltipUMich');
  if (tooltip != null) {
    tooltip.parentNode.removeChild(tooltip);
  }
}

// handles switching between pages
function plusSlides(n) {
  const elements = document.getElementById('image_' + slideIndex);
  elements.setAttribute('style', 'width: 100%');
  showSlides(slideIndex += n);

  // return to top of the page
  overlay.scrollTo(0,0);
  zoomed = false;
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName('mySlidesUMich');
  if (n > slides.length) {slideIndex = 1};
  if (n < 1) {slideIndex = slides.length};
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';
  }
  slides[slideIndex-1].style.display = 'block';
}

// literally just copy pasted code from asvd's dragscroll library. Div overlayUMmich is assigned ID of dragscroll
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports);
  } else {
    factory((root.dragscroll = {}));
  }
} (this, function (exports) {
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

              //only change to dragscroll, hides tooltip on mouse movement
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
