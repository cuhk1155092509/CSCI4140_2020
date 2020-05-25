
window.onload = function () {
    this.init();
}

function init() {
    // Get custom variable value
    chrome.storage.sync.get("gcFps", function (result) {
        var fps = result.gcFps;
        if (typeof fps !== 'undefined') {
            $("#gifFps").val(fps);
            console.log("[ChromeStorage] Get FPS: " + fps);
        } else {
            setFps($("#gifFps").val());
        }
    });
    chrome.storage.sync.get("gcOutputFilename", function (result) {
        var outputFilename = result.gcOutputFilename;
        if (typeof outputFilename !== 'undefined') {
            $("#outputFilename").val(outputFilename);
            console.log("[ChromeStorage] Get OutputFilename: " + outputFilename);
        } else {
            setOutputFilename($("#outputFilename").val());
        }
    });
}

function setFps(fps) {
    chrome.storage.sync.set({ "gcFps": fps }, function () {
        console.log("[ChromeStorage] Set FPS: " + fps);
    });
}

function setOutputFilename(outputFilename) {
    chrome.storage.sync.set({ "gcOutputFilename": outputFilename }, function () {
        console.log("[ChromeStorage] Set OutputFilename: " + outputFilename);
    });
}

$(function () {
    $(document).on("click", "#btnSave", function () {
        console.log("[GifCap] Save button clicked");
        var fps = $("#gifFps").val();
        var outputFilename = $("#outputFilename").val();
        setFps(fps);
        setOutputFilename(outputFilename);
    });
});
