// Consts of file location
const htmlInjectOverlay = "../html/inject_overlay.html";
const htmlInjectCapframe = "../html/inject_capframe.html";
const htmlEditor = "../html/editor.html";

// Inject empty gc-container into every webpage
var containerHtml = "<div id=\"gc-container\"></div>";
$("body").append(containerHtml);


// Message Listener from background.js
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {

    if (request.msg === "startSelection") {
      start_selection();
      //console.log("Start selection message received");
      //return true;

    } else if (request.msg === "gifRecordEnd") {
      console.log("GIF End Response received");
      reset_button();
      chrome.runtime.sendMessage({
        msg: "open_editor_gif",
        editorUrl: chrome.runtime.getURL(htmlEditor)
      });
    }

  }
);

// Variables
var gcStart = {};
var gcEnd = {};
var capX, capY, capDX, capDY;
var isSelecting = false;
var stopSelecting = true;

function getX() { return gcStart.x < gcEnd.x ? gcStart.x : gcEnd.x; }
function getY() { return gcStart.y < gcEnd.y ? gcStart.y : gcEnd.y; }
function getDX() { return Math.abs(gcStart.x - gcEnd.x); }
function getDY() { return Math.abs(gcStart.y - gcEnd.y); }

function start_selection() {
  $.get(chrome.runtime.getURL(htmlInjectOverlay), function(data) {
    $("#gc-container").html(data);
    //console.log("Injected overlay html");
    isSelecting = false;
    stopSelecting = false;
  });
}

function end_selection() {
  $("#gc-container").html("");
}

function submit_selection() {
  capX = getX();
  capY = getY();
  capDX = getDX();
  capDY = getDY();
  console.log('Start:(' + gcStart.x + ',' + gcStart.y + ') | End:(' + gcEnd.x + ',' + gcEnd.y + ') | X:'+capX+' | Y:'+capY+' | DX:'+capDX+' | DY:'+capDY);
  $.get(chrome.runtime.getURL(htmlInjectCapframe), function(data) {
    $("#gc-container").html(data);
    init_capframe();
  });
}

$(window)

  .on('mousedown', function($event) {
    if (stopSelecting) { return; }

    // Hide hint overlay
    $("#gc-hint-overlay").hide();

    $('#gc-selection').removeClass('selected');
    isSelecting = true;
    gcStart.x = $event.clientX;
    gcStart.y = $event.clientY;

    $('#gc-selection').css({
      left: gcStart.x,
      top: gcStart.y
    });

    // Debug
    $('#gc-start').text('(' + gcStart.x + ',' + gcStart.y + ')');
  })

  .on('mousemove', function($event) {
    // Ignore if we're not selecing
    if (!isSelecting) { return; }
    
    gcEnd.x = $event.clientX;
    gcEnd.y = $event.clientY;

    $('#gc-selection').css({
      left: getX(),
      top: getY(),
      width: getDX(),
      height: getDY()
    });
    $('.gc-selection-btn').css({
      left: getX(),
      top: getY() + getDY() - 31
    });
    
  })
  
  .on('mouseup', function($event) {
    $('#gc-selection').addClass('selected');
    $(".gc-selection-btn").show();
    isSelecting = false;
    stopSelecting = true;

    // Debug
    $('#gc-end').text('(' + gcEnd.x + ',' + gcEnd.y + ')');
  });

  
$(document).on("click", "#gc-selection-confirm", function(e) {
  stopSelecting = true;
  end_selection();
  submit_selection();
});

$(document).on("click", "#gc-selection-cancel", function(e) {
  stopSelecting = true;
  end_selection();
});


/* CAPFRAME */
function init_capframe() {
  $("#gc-capframe-border").css({
    "border-left": capX - 3,
    "border-right": $(window).width() - capX - capDX - 3,
    "border-top": capY - 39 - 3,
    "border-bottom": $(window).height() - capY - capDY - 3,
    "border-style": "solid",
    "border-color": "rgba(0, 0, 0, 0.2)"
  });
  $("#gc-capframe-toolbar").css({
    "width": capDX
  })
  $("#gc-capframe-frame").css({
    "width": capDX,
    "height": capDY
  })
  $("#gc-capframe").css({
    "width": capDX,
    "height": capDY
  })
}
var screenDataURL;
var gifDataURL = new Array();

function screenCapture() {
  chrome.runtime.sendMessage({
    msg: "capture",
    x: capX,
    y: capY,
    dx: capDX,
    dy: capDY
  }, function(response) {

    //console.log("Received screen capture dataURL");
    //console.log(response.data);
    chrome.runtime.sendMessage({
      msg: "open_editor",
      editorUrl: chrome.runtime.getURL(htmlEditor),
      dataUrl: response.data,
      w: response.w,
      h: response.h
    });
  });
}

/* GIF Recorder */
function startGifCap() {
  chrome.runtime.sendMessage({
    msg: "gifStart",
    x: capX,
    y: capY,
    dx: capDX,
    dy: capDY
  }, function(response) {

    //console.log("Received screen capture dataURL");
    console.log("background starts recording");
    /*
    chrome.runtime.sendMessage({
      msg: "open_editor",
      editorUrl: chrome.runtime.getURL(htmlEditor),
      dataUrl: response.data,
      w: response.w,
      h: response.h
    });
    */
  });
}

function stopGifCap() {
  chrome.runtime.sendMessage({
    msg: "gifStop"
  });
}


/* Button Listeners */
$(document).on("click", "#gc-capframe-btnGifStart", function(e) {
  console.log("GIF Start Button clicked");
  $(this).hide();
  $("#gc-capframe-btnGifStop").css({"display": "inline-block"});
  $("#gc-capframe-btnCap").hide();
  //$("#gc-gifcap-toolbar").css({"display": "inline-block"});
  startGifCap();
});

$(document).on("click", "#gc-capframe-btnGifStop", function(e) {
  console.log("GIF Stop Button clicked");
  reset_button();
  stopGifCap();
});

$(document).on("click", "#gc-capframe-btnCap", function(e) {
  console.log("Capture Button clicked");
  screenCapture();
});

$(document).on("click", "#gc-capframe-end", function(e) {
  console.log("END Button clicked");
  end_selection();
});

function reset_button() {
  $("#gc-capframe-btnGifStart").css({"display": "inline-block"});
  $("#gc-capframe-btnGifStop").hide();
  $("#gc-capframe-btnCap").css({"display": "inline-block"});
}
//console.log("Content Script Loaded");