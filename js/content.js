// Consts of file location
const htmlInjectOverlay = "../html/inject_overlay.html";
const htmlInjectCapframe = "../html/inject_capframe.html";
const htmlEditor = "../html/editor.html";

// Inject empty gc-container into every webpage
var containerHtml = "<div id=\"gc-container\"></div>";
$("body").append(containerHtml);


// Message Listener
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.msg === "startSelection") {
    // from popup.js
    start_selection();

  } else if (request.msg === "gifRecordEnd") {
    //from background.js
    if(request.type == 1) {
      console.log("[GifCap] GIF capture ends (by command) and success");
    } else if (request.type == 2){
      console.log("[GifCap] GIF capture ends (reaches max frame) and success");
    }
    reset_button();
    /*
    chrome.runtime.sendMessage({
      msg: "open_editor_gif",
      editorUrl: chrome.runtime.getURL(htmlEditor)
    });
    */
  }

});

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


/* ===== Overlay ===== */

function start_selection() {
  $.get(chrome.runtime.getURL(htmlInjectOverlay), function (data) {
    $("#gc-container").html(data);
    isSelecting = false;
    stopSelecting = false;
    console.log("[GifCap] Please drag and select an area to capture");
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
  console.log('[GifCap] Selected area [(' + gcStart.x + ',' + gcStart.y + '),(' + gcEnd.x + ',' + gcEnd.y + ')]');
  console.log('[GifCap] Area info (X:' + capX + ' | Y:' + capY + ' | DX:' + capDX + ' | DY:' + capDY + ')');
  $.get(chrome.runtime.getURL(htmlInjectCapframe), function (data) {
    $("#gc-container").html(data);
    init_capframe();
  });
}

$(window)

  .on('mousedown', function ($event) {
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
    //console.log('[GifCapDebug] Area selection start:(' + gcStart.x + ',' + gcStart.y + ')');
  })

  .on('mousemove', function ($event) {
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

  .on('mouseup', function ($event) {
    $('#gc-selection').addClass('selected');
    $(".gc-selection-btn").show();
    isSelecting = false;
    stopSelecting = true;
    //console.log('[GifCapDebug] Area selection end:(' + gcEnd.x + ',' + gcEnd.y + ')');
  });


$(document).on("click", "#gc-selection-confirm", function (e) {
  stopSelecting = true;
  end_selection();
  submit_selection();
});

$(document).on("click", "#gc-selection-cancel", function (e) {
  stopSelecting = true;
  end_selection();
});


/* ===== Capframe ===== */

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
  //console.log("[GifCapDebug]" Issued command: Screen capture");
  chrome.runtime.sendMessage({
    msg: "capture",
    x: capX,
    y: capY,
    dx: capDX,
    dy: capDY
  }, function (response) {
    console.log("[GifCap] Screen capture success");
  });
}

function startGifCap() {
  //console.log("[GifCapDebug] Issued command: Start GIF capture");
  chrome.runtime.sendMessage({
    msg: "gifStart",
    x: capX,
    y: capY,
    dx: capDX,
    dy: capDY
  }, function (response) {
    console.log("[GifCap] GIF capture starts")
  });
}

function stopGifCap() {
  //console.log("[GifCapDebug] Issued command: Stop GIF capture");
  chrome.runtime.sendMessage({ msg: "gifStop" });
}

function reset_button() {
  $("#gc-capframe-btnGifStart").css({ "display": "inline-block" });
  $("#gc-capframe-btnGifStop").hide();
  $("#gc-capframe-btnCap").css({ "display": "inline-block" });
  $("#gc-capframe-btnEnd").css({ "display": "inline-block" });
}

$(document).on("click", "#gc-capframe-btnGifStart", function (e) {
  $(this).hide();
  $("#gc-capframe-btnGifStop").css({ "display": "inline-block" });
  $("#gc-capframe-btnCap").hide();
  $("#gc-capframe-btnEnd").hide();
  startGifCap();
});

$(document).on("click", "#gc-capframe-btnGifStop", function (e) {
  stopGifCap();
});

$(document).on("click", "#gc-capframe-btnCap", function (e) {
  screenCapture();
});

$(document).on("click", "#gc-capframe-btnEnd", function (e) {
  end_selection();
});

//console.log("[GifCapDebug] Content script loaded");