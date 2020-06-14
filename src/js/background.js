import '../img/16.png';
import '../img/48.png';
import '../img/128.png';

const onTokenCompleted = (token) => {
  chrome.storage.sync.set({ token: token });
};

function setBadgeText(text) {
  chrome.browserAction.setBadgeText({ text });
}

function clearBadge() {
  chrome.browserAction.setBadgeText({ text: '' });
}

const messageListener = (message, serder, callback) => {
  switch (message.type) {
    case 'onPopupOpened':
      console.log(message.data);
      break;
    case 'clearBadge':
      clearBadge();
      callback('OK');
    case 'setBadgeText':
      setBadgeText(message.data);
      callback('OK');
      break;
    case 'onTokenCompleted':
      onTokenCompleted(message.data.token, callback);
      break;
  }
};
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  messageListener(message, sender, sendResponse);
});

chrome.runtime.onMessageExternal.addListener(function (message, sender) {
  messageListener(message, sender, () => {});
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    chrome.tabs.create({
      url: 'http://www.paradify.com/home/Installed',
    });
  }
});
