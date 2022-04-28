// ==UserScript==
// @name         Batch Acquire Zoom
// @namespace    https://umich.edu/
// @version      2022.04.07
// @description  For Slate Batch Acquire. Requires latest stable Chrome release and Tampermonkey extension.
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/database/acquire
// @match        https://*/manage/lookup/*
// @match        https://*/manage/inbox/*
// @downloadURL  https://github.com/FranzSpohr/Slate_Tools/blob/master/batch_zoom.user.js
// @updateURL    https://github.com/FranzSpohr/Slate_Tools/blob/master/batch_zoom.user.js
// @grant        none
// ==/UserScript==

let zoomCount = 0; // stores current zoom level
let ListenerAdded = false; // stores whether event listeners were added
const zoom_Levels = [72, 108, 144, 180, 216]; // "z" value that Slate requires to determine size of the document render

const parentElement = window.document;
const mutationConfig = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: true,
};

const onMutate = () => {
  if (
    document.getElementById('batch_pages') !== null &&
    ListenerAdded == false
  ) {
    const docWindow = document.getElementById('batch_pages');
    docWindow.addEventListener('load', add_Listener, true);
  }
};

const observer = new MutationObserver(onMutate);
observer.observe(parentElement.body, mutationConfig);


parentElement.addEventListener('DOMNodeInserted', hideZoomer, true) // event listeners to detect when Slate's magnifier is triggered
parentElement.addEventListener('keypress', batchZoom, true); // event listener for detecting key presses for triggering the batchZoom function with key presses

// adds event listeners needed for userscript to function
function add_Listener() {
  if (ListenerAdded) {
    return;
  } else {
    // grabs image elements
    const elements = document.querySelectorAll('.batch_page_container > img');
    // and attaches unique listeners to each image elements
    elements.forEach((el) => {
      //el.addEventListener('click', batchZoom, true);
      el.addEventListener('contextmenu', batchZoom, true);
      el.addEventListener('mousedown', batchZoom, true);
    });
    // needed to detect when "next" buttons, etc. are pressed to reattach listeners to the new set of document images
    const buttons = document.querySelectorAll('button[type="button"]');
    buttons.forEach((el) => {
      el.addEventListener('click', () => {
        zoomCount = 0;
        ListenerAdded = false;
      });
    });
    ListenerAdded = true;
  }
}

// toggles between zoom levels
function batchZoom(event) {
  if (parentElement.activeElement.nodeName == 'INPUT') {
    return;
  } else {
    if (
      event.ctrlKey
    ) {
      return;
    } else if (
      event.button == 1 || event.which == 2
    ) {
      event.preventDefault();
      if (zoomCount == 0) {
        return;
      }
      const elements = document.querySelectorAll('.batch_page_container > img');
      elements.forEach((el) => {
        if (el.src.includes(`z=${zoom_Levels[zoomCount]}`)) {
          el.src = el.src.replace(
            `z=${zoom_Levels[zoomCount]}`,
            `z=${zoom_Levels[0]}`
          );
        }
      });
      zoomCount = 0;
      //console.log('Zoom Clear');
    } else if (
      event.code == 'NumpadAdd' ||
      event.code == 'Equal' ||
      event.button == 0 || event.which == 1
    ) {
      event.preventDefault();
      if (zoomCount == 4) {
        return;
      }
      // selects image elements loaded by batch acquire
      const elements = document.querySelectorAll('.batch_page_container > img');
      // replaces the existing "z" value in the URL of documents
      elements.forEach((el) => {
        if (el.src.includes(`z=${zoom_Levels[zoomCount]}`)) {
          el.src = el.src.replace(
            `z=${zoom_Levels[zoomCount]}`,
            `z=${zoom_Levels[zoomCount + 1]}`
          );
        }
      });
      zoomCount++;
      //console.log('Zoom In');
    } else if (
      event.code == 'NumpadSubtract' ||
      event.code == 'Minus' ||
      event.type == 'contextmenu'
    ) {
      event.preventDefault();
      event.stopImmediatePropagation()
      if (zoomCount == 0) {
        return;
      }
      const elements = document.querySelectorAll('.batch_page_container > img');
      elements.forEach((el) => {
        if (el.src.includes(`z=${zoom_Levels[zoomCount]}`)) {
          el.src = el.src.replace(
            `z=${zoom_Levels[zoomCount]}`,
            `z=${zoom_Levels[zoomCount - 1]}`
          );
        }
      });
      zoomCount--;
      //console.log('Zoom Out');
    }
  }
}

/* Looks for the DOM that gets created when Slate loads its useless magnifier tool in the document viwer and deletes it before it can be loaded. */
function hideZoomer() {
  const targetNode = document.getElementsByClassName(
    'batch_zoomer boxshadow'
  )[0];
  //console.log(targetNode);
  if (targetNode) {
    targetNode.parentNode.removeChild(targetNode);
  }
}
