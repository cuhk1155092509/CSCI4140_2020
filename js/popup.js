$(function () {
    $(document).on("click", "#btnGIFCap", function () {
        console.log("[Debug] Issued command: Select area selection");
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { msg: "startSelection" });
        });
    });

    $(document).on("click", "#btnOptions", function () {
        console.log("[Debug] Opened options page");
        chrome.tabs.create({ url: chrome.runtime.getURL("../html/options.html") });
    });
});
