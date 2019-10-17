// ==UserScript==
// @name         Slate Reader Zoom
// @namespace    https://umich.edu/
// @version      10.17.19
// @description  For Slate Reader. Opens a page with a highder DPI render of document. Needs Tampermonkey for Chrome or Greasemonkey for Firefox.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/reader/*
// @updateURL    //https://github.com/FranzSpohr/Slate_Tools/blob/master/reader_zoom.user.js
// @grant        GM_addStyle
// ==/UserScript==

// creates necessary CSS for the userscript to function.
// names are intentionally garish to avoid any existing CSS
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
    background-color: rgba(0,0,0,0.75);
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

  // contains navigation dots
  #dotContainerUMich {
    text-align: center;
    position: fixed;
    left: 50%;
    bottom: 1.5%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  .mySlidesUMich {
	display: none
  }

  // buttons for page nvaigation on edges of the screen
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

  // page navigation button on the right needs a seaparate right value due to the scroll bar being present
  .nextUMich {
    right: 1%;
    border-radius: 3px 0 0 3px;
  }

  .prevUMich:hover, .nextUMich:hover {
    background-color: rgba(0,0,0,0.5);
    color: white !important;
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
    background-color: rgba(192, 192, 192, 0.5);
  }

  .dotUMich {
    cursor: pointer;
    height: 15px;
    width: 15px;
    margin: 0 2px;
    background-color: rgba(0, 98, 190, 0.25);
    border-radius: 50%;
    display: inline-block;
    transition: background-color 0.3s ease;
    position: relative;
  }

  .activeUMich, .dotUMich:hover {
    background-color: rgb(0,39,76);
  }

  // little tooltip box that appears above dots with page info
  .dotUMich .dotHoverUMich {
    visibility: hidden;
    width: auto;
    background-color: #00274c;
    color: #fff;
    font-size: 18px;
    text-align: center;
    border-radius: 6px;
    padding: 6px 10px;
    position: absolute;
    z-index: 1;
    bottom: 150%;
    left: 50%;
    opacity: 0;
    transition: opacity .5s;
    margin-left: inherit;
    -webkit-transform: translate(-50%, 0%);
    transform: translate(-50%, 0%);
   }

  .dotUMich .dotHoverUMich:after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #00274c transparent transparent transparent;
  }

  .dotUMich:hover .dotHoverUMich {
    visibility: visible;
    opacity: 1;
  }
`);

var zoomed = false; // zoom state of a page
var slideIndex = 1; // which page to display in viewer
var imageLoaded = false; // toggled when higher DPI images are loaded
var activeTab; // Slate tab that the images were loaded from

// creates an overlay that serves as a canvas for all elements created by this userscript
var overlay = document.createElement('div');
overlay.id = 'overlayUMich';
document.body.appendChild(overlay);
overlay.addEventListener('keydown', key_handler, true);
overlay.addEventListener('contextmenu', overlayOff);
overlay.addEventListener('wheel', hideDots, {passive: false});
overlay.addEventListener('wheel', hideTooltip, {passive: false});
overlay.className = 'dragscroll'; // enables scrolling by mouse drag
overlay.tabIndex = -1; // enables keyboard controls by setting focus on the overlay

// injects button into the footer of Slate Reader. clicking it will open the viewer.
var input = document.createElement('input');
input.type = 'button';
input.id = 'buttonUMich';
input.value = 'Display Larger Images';
input.onclick = overlayOn;
document.getElementsByClassName('reader_footer')[0].appendChild(input);

// calls overlay and displays higher DPI images
function overlayOn() {
  // needs to be loaded first to determine whether the current Slate tab has any images or not, displays alert if no images available
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
      // for whatever reason, parseInt is required to convert the slindeIndex into an integer
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
  
  // container for the navigation dots
  var dotContainer = document.createElement('div');
  dotContainer.id = 'dotContainerUMich'
  document.getElementById('overlayUMich').appendChild(dotContainer);

  for (let i = startPg; i <= endPg; i++) {
    // Contains individual page numbers and the images
    var slides = document.createElement('div');
    slides.id = 'slide_' + i;
    slides.className = 'mySlidesUMich';
    document.getElementById('overlayUMich').appendChild(slides);

    // page counter on the upper left corner
    var pgCounter = document.createElement('div');
    pgCounter.className = 'numbertextUMich';
    pgCounter.innerHTML = i + '/' + endPg;
    document.getElementById('slide_' + i).appendChild(pgCounter);

	// dots that can be used to navigate pages
    var navDots = document.createElement('span');
    navDots.className = 'dotUMich';
    navDots.onclick = function() {currentSlide(i)};
    dotContainer.appendChild(navDots);

	// displays page info above dots
    var dotHover = document.createElement('span');
    dotHover.className = 'dotHoverUMich';
    dotHover.innerHTML = 'Page ' + i;
    navDots.appendChild(dotHover);

    var imageElement = document.createElement('img'); // element for higher DPI images of the documents
    var imageNewSrc = imageSrc.src.replace(/z=\d*/, 'z=300'); // replaces the part of URL that specifies DPI of the image
    var errorDPI = 200 // lowers requested DPI if image fails to be loaded

    // modifies the page number component of the URL to attach correct pages to the slides
    imageNewSrc = imageNewSrc.replace(/pg=\d*/, `pg=${i-1}`);
    imageElement.id = 'image_' + i;
    imageElement.src = imageNewSrc;
    imageElement.style.width = '100%';
    imageElement.onclick = toggleZoom;
	// if image cannot be loaded due to request DPI being too high, lowers DPI by 10 until loading is succesful
    imageElement.onerror = function() {errorDPI -= 10; this.src = this.src.replace(/z=\d*/, `z=${errorDPI}`)};
    document.getElementById('slide_' + i).appendChild(imageElement);
  }
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
  event.stopPropagation(); // without this, pages in Slate Reader will scroll with the zoomed viewer. 
}

function overlayOff() {
  const elements = document.getElementById('image_' + slideIndex);
  // resets the zoom state of the current page
  elements.setAttribute('style', 'width:100%');
  document.getElementById('overlayUMich').style.display = 'none';
  hideTooltip();
}

// kind of a janky way to change zoom levels of a document by just changing image's width, could use improvement?
function toggleZoom() {
  const elements = document.getElementById('image_' + slideIndex);
  hideTooltip();
  if (zoomed) {
    elements.setAttribute('style', 'width:100%');
    zoomed = false;
  } else {
    elements.setAttribute('style', 'width:130%');
    zoomed = true;
  }
}

// displays tooltip. Should disappear after 10 seconds or upon any input from the user
function displayTooltip() {
  var tooltip = document.createElement('div');
  tooltip.id = 'tooltipUMich';
  tooltip.innerHTML = '<p>Navigate between pages by<strong>&nbsp;left clicking on arrows&nbsp;</strong>near the edges of the screen.</p>' +
                      '<p><strong>Left click on the dotss&nbsp;</strong>on the bottom to jump between pages.</p>' +
                      '<ul><li><strong>Esc Key:&nbsp;</strong>Return to reader</li>' +
                      '<li><strong>Right Click:&nbsp;</strong>Return to reader</li>' +
	              '<br><li><strong>Up Arrow Key:</strong> Scroll up</li>' +
                      '<li><strong>Down Arrow Key:</strong> Scroll down</li>' +
                      '<li><strong>Left Arrow Key:</strong> Previous page</li>' +
                      '<li><strong>Right Arrow Key:&nbsp;</strong>Next page</li>' +
                      '<br><li><strong>Left Click:</strong> Toggle between zoom levels</li>' +
                      '<li><strong>Hold Left Click &amp; Mouse Drag</strong>: Scroll document</li></ul>' +
                      '<p>If you encounter any bugs and/or glitches or have any suggestions or requests, <br>' +
                      '<strong>contact Ted Ma at <a href="mailto:tedma@umich.edu">tedma@umich.edu</a>.</strong></p>';
  document.getElementById('overlayUMich').appendChild(tooltip);
  tooltip.style.display = 'block';
  // automatically hides tooltip after 10 seconds
  setTimeout(function() {if (document.getElementById('tooltipUMich') == null) {return;} else {tooltip.parentNode.removeChild(tooltip)}}, 10000)
  overlay.style.display = 'block';
  overlay.focus();
}

// HTML element for the tooltip destroyed after each instance to prevent clutter
function hideTooltip() {
  var tooltip = document.getElementById('tooltipUMich');
  if (tooltip != null) {
    tooltip.parentNode.removeChild(tooltip);
  }
}

// needed to reset the timer and prevent the dot from appearing again too soon
var timeoutHandle = setTimeout(function() {if (document.getElementById('dotContainerUMich') == null) { return;}else{document.getElementById('dotContainerUMich').style.display = 'block'}}, 500);
function hideDots() {
  document.getElementById('dotContainerUMich').style.display = 'none';
  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(function() {if (document.getElementById('dotContainerUMich') == null); document.getElementById('dotContainerUMich').style.display = 'block'}, 500);
}

// handles switching between pages
function plusSlides(n) {
  const currImage = document.getElementById('image_' + slideIndex);
  currImage.setAttribute('style', 'width: 100%');
  zoomed = false;
  showSlides(slideIndex += n);
  overlay.scrollTo(0,0); // return to top of the page
}

// used by dots to navigate pages
function currentSlide(n) {
  showSlides(slideIndex = n);
}

// adopted from slideshow turorial in W3C
function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName('mySlidesUMich');
  var dots = document.getElementsByClassName("dotUMich");
  if (n > slides.length) {slideIndex = 1};
  if (n < 1) {slideIndex = slides.length};
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(' activeUMich', '');
  }
  slides[slideIndex-1].style.display = 'block';
  dots[slideIndex-1].className += ' activeUMich';
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
              hideTooltip(); //change from original script, hides tooltip on mouse movement
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
              hideDots(); // another addition to original script, hides dots while scrolling
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
