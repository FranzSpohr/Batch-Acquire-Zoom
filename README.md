# Batch Acquire Zoom and Reader Zoom for Slate
> Zoom in and out in Slate Reader and Slate Batch-Acquire with mouse and keyboard 

Currently, the vanilla document zoom functionalities offered by Slate in Reader and Batch Acquire is rather limited, especially when dealing with dense documents with small texts. These 2 Tampermonkey/Greasemonkey userscripts will give users more flexibility in how they view and interact with documents while viewing and handling them in Slate Reader or Slate Batch Acquire.

## **Slate Reader Zoom**
>Once installed, you'll see a button labeled "Display Larger Image" in the footer section of Slate Reader. Click on the button to display the document with higher zoom. 

##### **Controls**

**Mouse**
* Navigate between pages by ***left-clicking*** on arrows near the edges of the screen
* **Hold-Down Left Click & Drag:** scroll document
* **Left Click:** Toggle between the zoom levels
* **Right Click:** Return to reader

**Keyboard**
* **Left Arrow:** Previous page
* **Right Arrow:** Next page 
* **Esc:** Return to reader

## **Batch Acquire Zoom**
> Controls

##### To zoom-in:

* Left-click
* **=** in number row
* **+** in numpad


##### To zoom-out:

* Right-click
* **-** in number row
* **-** in numpad

![](header.png)

# Installation

## Notes
For use at any institution other than University of Michigan-Ann Arbor, the "@match" tag of the userscripts will have to be adjusted.  

## Requirements
Chrome (recommended by Technolutions):

```sh
Tampermonkey
```

Firefox:

```sh
Greasemonkey
```


# Release History

* 10.15.2019 - more stuff
* 10.1.2019 - improved efficiency
* 9.29.2019 - removed jQuery because I'm a dumdum

# Meta

Batch Acquire Zoom is based on a bookmarklet code by Jamie Davis @ U-M.

Reader Zoom uses [asvd's dragscroll](https://github.com/asvd/dragscroll) for mouse drag scroll functionality. 

Distributed under the GNU license. See ``LICENSE`` for more information.
