var pageLoaded = false;
var drawer;
var gifPlaying, playIndex;

var type;
var imgWidth, imgHeight;
var imgFrame, imgFps;
var gifArray;
var gifArrayEdited = new Array();

// Custom varibles and default values
var outputFileName;
var defaultOutputFilename = "gifcap";

// Get outputFilename from Chrome Storage
function getOutputFilename() {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.get("gcOutputFilename", function (result) {
            if (typeof result.gcOutputFilename !== 'undefined') {
                outputFilename = result.gcOutputFilename;
                console.log("[ChromeStorage] Get OutputFilename: " + outputFilename);
            } else {
                outputFilename = defaultOutputFilename;
                chrome.storage.sync.set({ "gcOutputFilename": outputFilename }, function () {
                    console.log("[ChromeStorage] Set OutputFilename: " + outputFilename);
                });
            }
            resolve(outputFilename);
        });
    })
}

// Simulate GIF playing
function startGifPlaying() {
    var interval = Math.round(1000 / imgFps);
    playIndex = 0;
    gifPlaying = setInterval(function () {
        $("#rawImg").attr("src", gifArray[playIndex]);
        if(playIndex + 1 == imgFrame) {
            playIndex = 0;
        } else {
            playIndex = playIndex + 1;
        }
        
    }, interval);
}

function stopGifPlaying() {
    clearInterval(gifPlaying);
}

// Message listener from background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg === "initEditor") {

        // Check if this editor page is loaded or not
        if (!pageLoaded) {
            pageLoaded = true;
            type = request.type;
            var passObject = ["", "image", "GIF"];
            console.log("[Debug] Received " + passObject[type]);
            sendResponse(type);

            imgWidth = request.w;
            imgHeight = request.h;
            createCanvas(imgWidth, imgHeight);

            if (type == 1) {
                var rawImgHtml = "<img id='rawImg' src='" + request.data + "'>";
                $(".editable-canvas-image").parent().append(rawImgHtml);
            } else if (type == 2) {
                gifArray = request.data;
                imgFrame = request.frame;
                imgFps = request.fps;
                var rawImgHtml = "<img id='rawImg' src='" + gifArray[0] + "'>";
                $(".editable-canvas-image").parent().append(rawImgHtml);
                createPreviews();
                startGifPlaying();
            }
            console.log("[Debug] Successfully load " + passObject[type]);
        }
    }
});

function createCanvas(width, height) {
    drawer = new DrawerJs.Drawer(null, {
        texts: customLocalization,
        plugins: drawerPlugins,
        transparentBackground: true,
        defaultImageUrl: '/assets/transparent.png',
        defaultActivePlugin: { name: 'Pencil', mode: 'lastUsed' },
    }, width, height);
    $('#canvas-editor').append(drawer.getHtml());
    drawer.onInsert();
    drawer.api.startEditing();
    drawer.api.stopEditing();
}

function createPreviews() {
    $("#footer").show();
    for (const frame in gifArray) {
        var previewHtml = "<div class='gifFramePreview' data-index='" + frame + "'><img src='" + gifArray[frame] + "'></img></div>";
        $("#preview-box").append(previewHtml);
    }
}

function outputCapture() {
    return new Promise(function (resolve, reject) {
        var imgLoaded = 0;
        function checkload(e) {
            imgLoaded++;
            if (imgLoaded < 2) {
                return;
            }
            var canvas = document.querySelector("#merge-canvas");
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            var context = canvas.getContext('2d');
            context.drawImage(raw, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);
            context.drawImage(edit, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);

            var merged = new Image;
            mergedDataUrl = canvas.toDataURL('image/jpeg');

            //console.log("[Debug] Merged image:");
            //console.log(mergedDataUrl);
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
    return new Promise(function (resolve, reject) {
        var imgLoaded = 0;
        function checkload(e) {
            imgLoaded++;
            if (imgLoaded < 2) {
                return;
            }
            var canvas = document.querySelector("#merge-canvas");
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            var context = canvas.getContext('2d');
            context.drawImage(raw, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);
            context.drawImage(edit, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);

            var merged = new Image;
            mergedDataUrl = canvas.toDataURL('image/jpeg');

            //console.log("[Debug] Merged 1 frame:");
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
    'ShapeContextMenu'
];

$(document).ready(function () {
    
    $(document).on("click", "#btnDownload", function (e) {

        // Download
        drawer.api.stopEditing();
        if (type == 1) {
            // Capture
            const uriPromise = outputCapture();
            uriPromise.then(function (uri) {
                //console.log("[Debug] Output image:");
                //console.log(uri);
                const filenamePromise = getOutputFilename();
                filenamePromise.then(function (outputFilename) {
                    var name = outputFilename + ".jpg";
                    downloadURI(uri, name);
                    console.log("[Debug] Downloaded image: " + name);
                })
            })
        } else if (type == 2) {
            // Gif
            var encoder = new GIFEncoder();
            encoder.setRepeat(0);
            var interval = Math.round(1000 / imgFps);
            encoder.setDelay(interval);
            encoder.start();

            gifArrayEdited = new Array();
            var i;
            for (i = 0; i < imgFrame; i++) {
                const uriPromise = outputGifFrame(i);
                uriPromise.then(function (cxt) {
                    encoder.addFrame(cxt);
                })
            }
            setTimeout(function () {
                encoder.finish();
                var gifDataUrl = 'data:image/gif;base64,' + encode64(encoder.stream().getData());
                //console.log("[Debug] Output GIF:");
                //console.log(gifDataUrl);
                const filenamePromise = getOutputFilename();
                filenamePromise.then(function (outputFilename) {
                    var name = outputFilename + ".gif";
                    encoder.download(name);
                    console.log("[Debug] Downloaded GIF: " + name);
                })
            }, 1000);
        }
    });

    $(document).on("click", ".gifFramePreview", function (e) {
        var index = $(this).data("index");
        console.log("Frame" + index + " Preview Clicked");
        
        if(!$(this).hasClass("selected")) {
            $(".gifFramePreview").removeClass("selected");
            $(this).addClass("selected");
            stopGifPlaying();
            $("#rawImg").attr("src", $(this).children().attr("src"));
        } else {
            $(this).removeClass("selected");
            startGifPlaying();
        }
        
    });

});

