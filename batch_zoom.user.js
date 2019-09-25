// ==UserScript==
// @name         Batch Acquire Zoom
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  For Slate Batch Acquire; to zoom-in: press left mouse click, "=", or "+" on numpad. To zoom-out: press right mouse click, "-", or "-" on numpad. Needs Tampermonkey for Chrome or Greasemonkey for Firefox. 
// @author       University of Michigan OUA Processing (Theodore Ma)
// @match        https://*/manage/database/acquire
// @match        https://*/manage/lookup/* 
// @updateURL    https://github.com/FranzSpohr/Batch-Acquire-Zoom/blob/master/batch-zoom.user.js
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

var i = 0
var Zoom_Levels = [72, 108, 144, 180, 216];

window.addEventListener('keydown', Toggle_Zoom, true)
window.addEventListener('click', Add_Listener, true)

function Toggle_Zoom (event) {
    if (event.code == 'NumpadAdd'||event.code == 'Equal'||event.type == 'click') {
        event.preventDefault();
        if (i == 4) {return};
        const elements = document.querySelectorAll('.batch_page_container > img');
        elements.forEach(function(el) {
            if (el.src.includes(`z=${Zoom_Levels[i]}`)) {
                el.src = el.src.replace(`z=${Zoom_Levels[i]}`, `z=${Zoom_Levels[i+1]}`);
            }
        });
        i++;
        var targetNode = document.getElementsByClassName('batch_zoomer boxshadow')[0];
        if (targetNode) {
            //--- Simulate a natural mouse-click sequence.
            triggerMouseEvent (targetNode, "mousedown");
            triggerMouseEvent (targetNode, "mouseup");
            triggerMouseEvent (targetNode, "click");
        }
        else {
            console.log ("*** Target node not found!");
        }

        function triggerMouseEvent (node, eventType) {
            var clickEvent = document.createEvent ('MouseEvents');
            clickEvent.initEvent (eventType, true, true);
            node.dispatchEvent (clickEvent);
        }
    } else if (event.code == 'NumpadSubtract'||event.code == 'Minus'||event.type == 'contextmenu') {
        event.preventDefault();
        if (i == 0) {return};
        const elements = document.querySelectorAll('.batch_page_container > img');
        elements.forEach(function(el) {
            if (el.src.includes(`z=${Zoom_Levels[i]}`)) {
                el.src = el.src.replace(`z=${Zoom_Levels[i]}`, `z=${Zoom_Levels[i-1]}`);
            }
        });
        i--;
    }
}

function Add_Listener () {
    const elements = document.querySelectorAll('.batch_page_container > img');
    elements.forEach(function(el) {
        el.addEventListener('click', Toggle_Zoom, true)
        el.addEventListener('contextmenu', Toggle_Zoom, true)
    })
}
