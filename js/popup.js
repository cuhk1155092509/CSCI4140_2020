$(function() {
    $(document).on("click", "#btnGIFCap", function() {
        //console.log("Select Area to Capture Button Clicked");
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {msg: "startSelection"});
        });
    });
    
    $(document).on("click", "#btnOptions", function() {
        //console.log("Options Button Clicked");
        chrome.tabs.create({url: chrome.runtime.getURL("../html/options.html")});
    });
});
