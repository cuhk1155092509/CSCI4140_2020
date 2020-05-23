$(function() {
    $(document).on("click", "#btnGIFCap", function() {
        //console.log("Select area button clicked");
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {msg: "startSelection"});
        });
    });
    
    $(document).on("click", "#btnOptions", function() {
        console.log("Options button clicked");
    });
});
