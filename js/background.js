// Variables
var img;
var gif = new Array();
var x, y, dx, dy;
var frame = 0;
var recording;
var maxFrame = 100;

// Consts of file location
const editorPath = chrome.runtime.getURL("../html/editor.html");

// Custom varibles and default values
var fps;
var defaultFps = 6

// Get FPS value from Chrome Storage
function getFps() {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get("gcFps", function (result) {
      if (typeof result.gcFps !== 'undefined') {
        fps = result.gcFps;
        console.log("[ChromeStorage] Get FPS:" + fps);
      } else {
        fps = defaultFps;
        chrome.storage.sync.set({ "gcFps": defaultFps }, function () {
          console.log("[ChromeStorage] Set FPS:" + defaultFps);
        });
      }
      resolve(fps);
    });
  })
}

// Method to stop recording and pass to editor
function stopRecording(type) {
  // type 1: stop by command | type 2: forced stop (max. frame)

  clearInterval(recording);
  
  if(type == 1) {
    console.log("[Debug] GIF capture success (end by command)");
  } else if(type == 2) {
    console.log("[Debug] GIF capture success (end by max frame)");
  }
  
  // Pass image/GIF to editor page
  passToEditor(2);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      msg: "gifRecordEnd",
      type: type
    });
  });
}

function passToEditor(type) {
  // type 1: screen capture | type 2: GIF capture
  var passObject = ["", "image", "GIF"];
  var msg;
  if(type == 1) {
    msg = {
      msg: "initEditor",
      type: 1,
      data: img,
      w: dx,
      h: dy
    };
  } if(type == 2) {
    msg = {
      msg: "initEditor",
      type: 2,
      data: gif,
      w: dx,
      h: dy,
      frame: frame,
      fps: fps
    };
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (curTab) {
    chrome.tabs.create({
      url: editorPath,
      index: curTab[0].index + 1
    }, function (tab) {
      //console.log("[Debug] Created editor(" + tab.id + ")");
  
      // Delay and send image to new tab
      setTimeout(function () {
        chrome.runtime.sendMessage(msg, function (response) {
          console.log("[Editor] Editor(" + tab.id + ") received " + passObject[response]);
        })
        //console.log("[Debug] Sent " + passObject[type] + " to editor(" + tab.id + ")")
      }, 500);

    });
  });
}

// Message listener from website (injected content js)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.msg === "capture") {

    console.log("[Debug] Received command: Screen capture");
    chrome.tabs.captureVisibleTab(null, {}, function (dataUrl) {
      x = request.x;
      y = request.y;
      dx = request.dx;
      dy = request.dy;

      //console.log("[Debug] Captured image (raw):");
      //console.log(dataUrl);

      var canvas = document.getElementById('myCanvas');
      canvas.width = dx;
      canvas.height = dy;
      var context = canvas.getContext('2d');

      var imageObj = new Image();
      imageObj.onload = function () {
        context.drawImage(this, x, y, dx, dy, 0, 0, dx, dy);
        img = canvas.toDataURL('image/jpeg');
        sendResponse(true);
        //console.log("[Debug] Captured image (cropped):");
        //console.log(img);
        console.log("[Debug] Screen capture success");
        
        passToEditor(1);
      };
      imageObj.src = dataUrl;
    });

  } else if (request.msg === "gifStart") {

    console.log("[Debug] Received command: Start GIF capture");
    sendResponse(true);

    const fpsPromise = getFps();
    fpsPromise.then(function (fps) {

      var interval = Math.round(1000 / fps);
      frame = 0;
      gif = new Array();

      x = request.x;
      y = request.y;
      dx = request.dx;
      dy = request.dy;

      var canvas = document.getElementById('myCanvas');
      canvas.width = dx;
      canvas.height = dy;
      var context = canvas.getContext('2d');
      console.log("[Debug] GIF recording starts");

      // Set up recorder
      recording = setInterval(function () {

        // Capture 1 frame
        chrome.tabs.captureVisibleTab(null, {}, function (dataUrl) {
          var imageObj = new Image();
          imageObj.onload = function () {
            context.drawImage(this, x, y, dx, dy, 0, 0, dx, dy);
            var newDataUrl = canvas.toDataURL('image/jpeg');
            gif.push(newDataUrl);
          };
          imageObj.src = dataUrl;
        });

        frame = frame + 1;
        console.log("[Debug] Captured GIF frame " + frame);
        if (frame >= maxFrame) {
          stopRecording(2);
        }
      }, interval);
    })

  } else if (request.msg === "gifStop") {

    console.log("[Debug] Received command: Stop GIF capture");
    stopRecording(1);

  }

  // Required for asynchronously use of sendResponse()
  return true;

});