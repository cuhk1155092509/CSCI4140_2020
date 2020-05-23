var recording;
var frame = 0;
var gif = new Array();
var x, y, dx, dy;

// Can add method to change from settings page
var fps = 5;
var maxFrame = 100;

function stopRecording() {
  clearInterval(recording);
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      msg: "gifRecordEnd"
    });
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.msg === "capture") {

      // Received capture message
      chrome.tabs.captureVisibleTab(
        null,
        {},
        function(dataUrl)
        {
          var x = request.x;
          var y = request.y;
          var dx = request.dx;
          var dy = request.dy;
          
          //console.log(dataUrl);
          var canvas = document.getElementById('myCanvas');
          canvas.width = dx;
          canvas.height = dy;
          var context = canvas.getContext('2d');
          
          var newDataUrl;
          var imageObj = new Image();
          imageObj.onload = function() {
            context.drawImage(this, x, y, dx, dy, 0, 0, dx, dy);
            var newDataUrl = canvas.toDataURL('image/jpeg');
            sendResponse({
              data:newDataUrl,
              w: dx,
              h: dy
            });
          };
          imageObj.src = dataUrl;
        }
      );

    } else if(request.msg === "gifStart") {
      
      // Recevied start recording message
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
      console.log("Gif starts recording");

      // set up recorder
      recording = setInterval(function() {

        // code to record 1 frame
        chrome.tabs.captureVisibleTab(
          null,
          {},
          function(dataUrl)
          {
            
            var imageObj = new Image();
            imageObj.onload = function() {
              context.drawImage(this, x, y, dx, dy, 0, 0, dx, dy);
              var newDataUrl = canvas.toDataURL('image/jpeg');
              gif.push(newDataUrl);
              sendResponse({
                frame: frame
              });
            };
            imageObj.src = dataUrl;
          }
        );

        frame = frame + 1;
        console.log("frame:"+ frame)
        if(frame >= maxFrame) {
          stopRecording();
          console.log("gifRecordEnd sent (auto stop)");
        }
      }, interval);
      
    } else if(request.msg === "gifStop") {

      stopRecording();
      console.log("gifRecordEnd sent (command stop)");

    } else if(request.msg === "open_editor") {
      chrome.tabs.query({active: true, currentWindow: true}, function(curTab) {
        chrome.tabs.create({
          url: request.editorUrl,
          index: curTab[0].index + 1
        }, function(tab){
          console.log("Opened Editor Tab - ID:" + tab.id);

          // Delay and send image to new tab
          setTimeout(function(){
            chrome.runtime.sendMessage({
              msg: "initEditor",
              dataUrl: request.dataUrl,
              type: 1,
              w: request.w,
              h: request.h
            }, function(response){
              if(response.status == 1) {
                console.log("Editor received image's dataURL");
              }
            })
          }, 1000);
          
        });
      });
    } else if(request.msg === "open_editor_gif") {
      chrome.tabs.query({active: true, currentWindow: true}, function(curTab) {
        chrome.tabs.create({
          url: request.editorUrl,
          index: curTab[0].index + 1
        }, function(tab){
          console.log("[GIF] Opened Editor Tab - ID:" + tab.id);

          // Delay and send image to new tab
          setTimeout(function(){
            chrome.runtime.sendMessage({
              msg: "initEditor",
              gifArray: gif,
              type: 2,
              w: dx,
              h: dy,
              frame: frame
            }, function(response){
              if(response.status == 2) {
                console.log("Editor received GIF Array");
              }
            })
          }, 1000);
          
        });
      });
    }
    
    return true;
  }
);