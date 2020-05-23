
var drawer;
var pageLoaded = false;
var type;
var imgWidth, imgHeight;
var imgFrame;
var gifArray;
var gifArrayEdited = new Array();

/* User variable */
var outputFileName = "gifcap";

// Can add method to change from settings page
var fps = 5;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg === "initEditor") {

            // Check if this editor page is loaded or not
            if(!pageLoaded) {
                pageLoaded = true;

                // Check type of editing
                if(request.type == 1) {

                    // Capture
                    console.log("[Cap] Received");
                    sendResponse({status: 1});
                    type = 1;
                    imgWidth = request.w;
                    imgHeight = request.h;
                    createCanvas(request.dataUrl, request.w, request.h);

                } else if(request.type == 2) {

                    // Gif
                    console.log("[GIF] Received");
                    sendResponse({status: 2})
                    type = 2;
                    imgWidth = request.w;
                    imgHeight= request.h;
                    imgFrame = request.frame;
                    gifArray = request.gifArray;
                    createCanvas(gifArray[0], request.w, request.h);
                    createPreviews();

                }
                
            }
        }
    }
);

function createCanvas(dataUrl, width, height) {
    drawer = new DrawerJs.Drawer(null, {
        texts: customLocalization,
        plugins: drawerPlugins,
        transparentBackground: true,
        defaultImageUrl: '/assets/transparent.png',
        defaultActivePlugin : { name : 'Pencil', mode : 'lastUsed'},
    }, width, height);
    $('#canvas-editor').append(drawer.getHtml());
    drawer.onInsert();
    drawer.api.startEditing();
    drawer.api.stopEditing();
    var rawImgHtml = "<img id='rawImg' src='" + dataUrl + "' style='position: fixed;top: 0px;left: 0px;user-select: none;z-index: -1;'>";
    $(".editable-canvas-image").parent().append(rawImgHtml);
}

function createPreviews() {
    for(const frame in gifArray) {
        var previewHtml = "<div class='gifFramePreview' data-index='" + frame + "'><img src='" + gifArray[frame] + "'></img></div>";
        $("#preview-box").append(previewHtml);
    }
}

function outputCapture() {
    return new Promise(function(resolve, reject) {
        var imgLoaded = 0;
        function checkload(e) {
            imgLoaded++;
            console.log("loaded 1");
            if(imgLoaded < 2) {
                return;
            }
            var canvas = document.querySelector("#merge-canvas");
            canvas.width  = imgWidth;
            canvas.height = imgHeight;
            var context = canvas.getContext('2d');
            context.drawImage(raw, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);
            context.drawImage(edit, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);

            var merged = new Image;
            mergedDataUrl = canvas.toDataURL('image/jpeg');

            console.log(mergedDataUrl);
            resolve(mergedDataUrl);
        }
        var raw = new Image;
        raw.onload = checkload;
        raw.src = $("#rawImg").attr("src");

        var edit = new Image;
        edit.onload = checkload;
        edit.src = $(".editable-canvas-image").attr("src");
    })
}

function outputGifFrame(frame) {
    return new Promise(function(resolve, reject) {
        var imgLoaded = 0;
        function checkload(e) {
            imgLoaded++;
            console.log("loaded 1");
            if(imgLoaded < 2) {
                return;
            }
            var canvas = document.querySelector("#merge-canvas");
            canvas.width  = imgWidth;
            canvas.height = imgHeight;
            var context = canvas.getContext('2d');
            context.drawImage(raw, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);
            context.drawImage(edit, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);

            var merged = new Image;
            mergedDataUrl = canvas.toDataURL('image/jpeg');

            //console.log(mergedDataUrl);
            resolve(context);
        }
        var raw = new Image;
        raw.onload = checkload;
        raw.src = gifArray[frame];

        var edit = new Image;
        edit.onload = checkload;
        edit.src = $(".editable-canvas-image").attr("src");
    })
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

/* drawerLocalization */
var customLocalization = {
    'Add Drawer': 'Add Drawer',
    'Insert Drawer': 'Insert Drawer',
    'Insert': 'Insert',
    'Free drawing mode': 'Free drawing mode',
    'SimpleWhiteEraser': 'SimpleWhiteEraser',
    'Eraser': 'Eraser',
    'Delete this canvas': 'Delete this canvas',
    'Are you sure want to delete this canvas?': 'Are you sure want to delete this canvas?',
    
    // Canvas properties popup
    'Size (px)': 'Size (px)',
    'Position': 'Position',
    'Inline': 'Inline',
    'Left': 'Left',
    'Center': 'Center',
    'Right': 'Right',
    'Floating': 'Floating',
    'Canvas properties': 'Canvas properties',
    'Background': 'Background',
    'transparent': 'transparent',
    'Cancel': 'Cancel',
    'Save': 'Save',
    
    // Fullscreen plugin
    'Enter fullscreen mode': 'Enter fullscreen mode',
    'Exit fullscreen mode': 'Exit fullscreen mode',
    
    // Shape context menu plugin
    'Bring forward': 'Bring forward',
    'Send backwards': 'Send backwards',
    'Bring to front': 'Bring to front',
    'Send to back': 'Send to back',
    'Duplicate': 'Duplicate',
    'Remove': 'Remove',
    
    // Brush size plugin
    'Size:': 'Size:',
    
    // Color picker plugin
    'Fill:': 'Fill:',
    'Transparent': 'Transparent',
    // shape border plugin
    'Border:': 'Border:',
    'None': 'None',
    
    // Arrow plugin
    'Draw an arrow': 'Draw an arrow',
    'Draw a two-sided arrow': 'Draw a two-sided arrow',
    'Lines and arrows': 'Lines and arrows',
    
    // Circle plugin
    'Draw a circle': 'Draw a circle',
    
    // Line plugin
    'Draw a line': 'Draw a line',
    
    // Rectangle plugin
    'Draw a rectangle': 'Draw a rectangle',
    
    // Triangle plugin
    'Draw a triangle': 'Draw a triangle',
    
    // Polygon plugin
    'Draw a Polygon': 'Draw a Polygon',
    'Stop drawing a polygon': 'Stop drawing a polygon (esc)',
    'Click to start a new line': 'Click to start a new line',
    
    // Text plugin
    'Draw a text': 'Draw a text',
    'Click to place a text': 'Click to place a text',
    'Font:': 'Font:',
    
    // Movable floating mode plugin
    'Move canvas': 'Move canvas',
    
    // Base shape
    'Click to start drawing a ': 'Click to start drawing a '
};

/* DrawerJSConfig */
var drawerPlugins = [
    'Pencil',
    'Eraser',
    'Line',
    'ArrowOneSide',
    'ArrowTwoSide',
    'Triangle',
    'Rectangle',
    'Circle',
    'Polygon',
    'Color',
    'ShapeBorder',
    'BrushSize',
    'ShapeContextMenu',
    'BackgroundImage'
];

$(document).ready(function () {
    /*
    var drawer = new DrawerJs.Drawer(null, {
        texts: customLocalization,
        plugins: drawerPlugins,
        defaultImageUrl: '/drawerJs/drawerDefaultImage.jpg',
        defaultActivePlugin : { name : 'Pencil', mode : 'lastUsed'},
    }, 600, 600);
    $('#canvas-editor').append(drawer.getHtml());
    drawer.onInsert();
    */
    
    /* Full DrawerJS configuration for reference */
    /*
    window.drawer = new DrawerJs.Drawer(null, {
        plugins: drawerPlugins,
        corePlugins: [
            'Zoom' // use null here if you want to disable Zoom completely
        ],
        pluginsConfig: {
            Image: {
                scaleDownLargeImage: true,
                maxImageSizeKb: 10240, //1MB
                cropIsActive: true
            },
            BackgroundImage: {
                scaleDownLargeImage: true,
                maxImageSizeKb: 10240, //1MB
                //fixedBackgroundUrl: '/examples/redactor/images/vanGogh.jpg',
                imagePosition: 'center',  // one of  'center', 'stretch', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
                acceptedMIMETypes: ['image/jpeg', 'image/png', 'image/gif'] ,
                dynamicRepositionImage: true,
                dynamicRepositionImageThrottle: 100,
                cropIsActive: false
            },
            Text: {
                editIconMode : false,
                editIconSize : 'large',
                defaultValues : {
                    fontSize: 72,
                    lineHeight: 2,
                    textFontWeight: 'bold'
                },
                predefined: {
                    fontSize: [8, 12, 14, 16, 32, 40, 72],
                    lineHeight: [1, 2, 3, 4, 6]
                }
            },
            Zoom: {
                enabled: true, 
                showZoomTooltip: true, 
                useWheelEvents: true,
                zoomStep: 1.05, 
                defaultZoom: 1, 
                maxZoom: 32,
                minZoom: 1, 
                smoothnessOfWheel: 0,
                //Moving:
                enableMove: true,
                enableWhenNoActiveTool: true,
                enableButton: true
            }
        },
        toolbars: {
            drawingTools: {
                position: 'top',         
                positionType: 'outside',
                customAnchorSelector: '#custom-toolbar-here',  
                compactType: 'scrollable',   
                hidden: false,     
                toggleVisibilityButton: false,
                fullscreenMode: {
                    position: 'top', 
                    hidden: false,
                    toggleVisibilityButton: false
                }
            },
            toolOptions: {
                position: 'bottom', 
                positionType: 'inside',
                compactType: 'popup',
                hidden: false,
                toggleVisibilityButton: false,
                fullscreenMode: {
                    position: 'bottom', 
                    compactType: 'popup',
                    hidden: false,
                    toggleVisibilityButton: false
                }
            },
            settings : {
                position : 'right', 
                positionType: 'inside',					
                compactType : 'scrollable',
                hidden: false,	
                toggleVisibilityButton: false,
                fullscreenMode: {
                    position : 'right', 
                    hidden: false,
                    toggleVisibilityButton: false
                }
            }
        },
            defaultImageUrl: '/examples/redactor/images/drawer.jpg',
        defaultActivePlugin : { name : 'Pencil', mode : 'lastUsed'},
        debug: true,
        activeColor: '#a1be13',
        transparentBackground: true,
        align: 'floating',  //one of 'left', 'right', 'center', 'inline', 'floating'
        lineAngleTooltip: { enabled: true, color: 'blue',  fontSize: 15}
    }, 400, 400);

    $('#canvas-editor').append(window.drawer.getHtml());
    window.drawer.onInsert();
    */

    $(document).on("click", "#btnDownload", function(e) {
        console.log("Download Button clicked");

        drawer.api.stopEditing();
        if(type == 1) {
            // Capture
            const uriPromise = outputCapture();
            uriPromise.then(function(uri) {
                console.log(uri);
                downloadURI(uri, outputFileName);
            })
        } else if(type == 2){
            // Gif
            var encoder = new GIFEncoder();
            encoder.setRepeat(0);
            var interval = Math.round(1000 / fps);
            encoder.setDelay(interval);
            encoder.start();

            gifArrayEdited = new Array();
            var i;
            for(i = 0; i < imgFrame; i++) {
                const uriPromise = outputGifFrame(i);
                /*uriPromise.then(function(uri) {
                    //console.log(uri);
                    gifArrayEdited.push(uri);
                    encoder.addFrame(uri, true);
                })*/
                uriPromise.then(function(cxt) {
                    //console.log(uri);
                    //gifArrayEdited.push(uri);
                    encoder.addFrame(cxt);
                })
            }
            /*
            const uriPromise = outputGif();
            uriPromise.then(function(uri) {
                console.log(uri);
                downloadURI(uri, outputFileName);
            })*/
            setTimeout(function() {
                console.log("gif output done");
                encoder.finish();
                var gifDataUrl = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
                console.log(gifDataUrl);
                encoder.download(outputFileName + ".gif");
            }, 1000);
        }
    });

    $(document).on("click", ".gifFramePreview", function(e) {
        var index = $(this).data("index");
        console.log("Frame" + index + " Preview Clicked");
        $("#rawImg").attr("src", $(this).children().attr("src"));
    });

});

    