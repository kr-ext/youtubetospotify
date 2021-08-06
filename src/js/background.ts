import '../img/16.png';
import '../img/48.png';
import '../img/128.png';
import {
  DEPLOYMENT,
  DEPLOYMENT_VERSION,
  getRedirectAuthUrl,
  URLS,
  ENVIRONMENTS,
} from './utils/constants';
import {
  consoleLog,
  getRandomFailedGif,
  getRandomSuccessGif,
  storageUtil,
} from './utils';
import { SpotifyOption } from './enums';
import { Dialog } from './interfaces';

const { UNINSTALL_URL } = URLS;

const gaSendEvent = (data: any) => {
  if (process.env.NODE_ENV !== ENVIRONMENTS.PRODUCTION) return;
  const { eventCategory, eventAction, eventLabel } = data;
  // Standard Google Universal Analytics code
  // noinspection OverlyComplexFunctionJS
  (function (i: any, s: any, o: any, g: any, r: any, a?: any, m?: any) {
    i['GoogleAnalyticsObject'] = r;
    const dateNow = +new Date();
    // noinspection CommaExpressionJS
    (i[r] =
      i[r] ||
      function () {
        // eslint-disable-next-line prefer-rest-params
        (i[r].q = i[r].q || []).push(arguments);
      }),
      (i[r].l = 1 * dateNow);
    // noinspection CommaExpressionJS
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(
    window,
    document,
    'script',
    'https://www.google-analytics.com/analytics.js',
    'ga',
  );
  // eslint-disable-next-line no-undef
  ga('create', 'UA-3218083-16', 'auto');
  // see: http://stackoverflow.com/a/22152353/1958200
  // eslint-disable-next-line no-undef
  ga('set', 'anonymizeIp', true);
  // eslint-disable-next-line no-undef
  ga('set', 'checkProtocolTask', function () {});
  // eslint-disable-next-line no-undef
  ga('send', {
    hitType: 'event',
    eventCategory,
    eventAction,
    eventLabel,
  });
};

const onTokenCompleted = (token: any) => {
  storageUtil.setSpotifyToken(token);

  const dialog: Dialog = {
    behavior: { autoHide: true },
    message: {
      title: 'Login Successful',
      text: 'You have logged in successfully',
      image: { url: getRandomSuccessGif() },
    },
  };

  const data = {
    data: dialog,
    type: 'showDialog',
  };

  sendMessageToRuntime(data);
};

const onTokenFailed = () => {
  storageUtil.removeSpotifyToken();

  const dialog: Dialog = {
    behavior: { autoHide: true },
    message: {
      title: 'Login Failed',
      text: 'Please try again. ',
      image: { url: getRandomFailedGif() },
    },
  };

  const data = {
    data: dialog,
    type: 'showDialog',
  };

  sendMessageToRuntime(data);
};

const setBadgeText = (text: string) => {
  // eslint-disable-next-line no-undef
  chrome.browserAction.setBadgeText({ text });
  setTimeout(() => clearBadge(), 5000);
};

const clearBadge = () => {
  // eslint-disable-next-line no-undef
  chrome.browserAction.setBadgeText({ text: '' });
};

const sendMessageToContentScript = (tabId: number, message: any) => {
  chrome.tabs.sendMessage(tabId, { ...message });
};

const sendMessageToRuntime = (message: any) => {
  chrome.runtime.sendMessage({ ...message });
};

const showDialog = (message: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    sendMessageToContentScript(tabs[0].id, { ...message, type: 'showDialog' });
  });
};

const hideDialog = (message: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    sendMessageToContentScript(tabs[0].id, { ...message, type: 'hideDialog' });
  });
};

const openTab = (url: string) => {
  //eslint-disable-next-line no-undef
  chrome.tabs.create({
    url,
  });
};

const openTabInPopup = (url: string) => {
  chrome.windows.create({
    url: url,
    focused: true,
    type: 'popup',
    // top: Math.floor(window.screen.availHeight / 1.2),
    // left: Math.floor(window.screen.availWidth / 1.2),
    height: Math.floor(window.screen.availHeight / 1.2),
    width: Math.floor(window.screen.availWidth / 1.2),
  });
};

const openAuthRedirectUrl = () => {
  openTabInPopup(getRedirectAuthUrl());
};

const dialogAddAll = (data: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { data: data, type: 'dialogAddAll' });
  });
};

const messageListener = (event: any, serder: any, callback: any) => {
  switch (event.type) {
    case 'gaSendEvent':
      gaSendEvent(event.data);
      break;
    case 'clearBadge':
      clearBadge();
      callback('OK');
      break;
    case 'setBadgeText':
      setBadgeText(event.data);
      callback('OK');
      break;
    case 'onTokenCompleted':
      onTokenCompleted(event.data.token);
      break;
    case 'onTokenFailed':
      onTokenFailed();
      break;
    case 'showDialog':
      showDialog(event);
      break;
    case 'hideDialog':
      hideDialog(event);
      break;
    case 'openAuthRedirectUrl':
      openAuthRedirectUrl();
      break;
    case 'dialogAddAll':
      dialogAddAll(event.data);
      break;
    case 'openTab':
      openTab(event.data.url);
      break;
    case 'buyMeACoffeeClicked':
      gaSendEvent(event.data);
      break;
    case 'spotifyIconCannotLoaded':
      gaSendEvent(event.data);
      break;
    case 'searchResultCannotLoaded':
      gaSendEvent(event.data);
      break;
  }
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  messageListener(message, sender, sendResponse);
});

chrome.runtime.onMessageExternal.addListener(function (
  message,
  sender,
  sendResponse,
) {
  messageListener(message, sender, sendResponse);
});

chrome.runtime.setUninstallURL(UNINSTALL_URL);

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == 'install') {
    storageUtil.setSpotifyIconClickActionOption(SpotifyOption.Search);
    try {
      const deploymentVersion = await storageUtil.getStorage(DEPLOYMENT);
      if (!deploymentVersion || deploymentVersion < DEPLOYMENT_VERSION) {
        storageUtil.setStorage(DEPLOYMENT, DEPLOYMENT_VERSION);
        openTab(`chrome-extension://${chrome.runtime.id}/options.html`);
      }
    } catch {}
    gaSendEvent({
      pageName: 'Chrome Backgroud',
      eventCategory: 'Extension',
      eventAction: 'Extension Installed',
      eventLabel: '',
    });
  } else if (details.reason == 'update') {
    try {
      const deploymentVersion = await storageUtil.getStorage(DEPLOYMENT);
      if (!deploymentVersion || deploymentVersion < DEPLOYMENT_VERSION) {
        storageUtil.setStorage(DEPLOYMENT, DEPLOYMENT_VERSION);
        openTab(`chrome-extension://${chrome.runtime.id}/options.html`);
      }
    } catch (error) {
      consoleLog({ error });
    }

    gaSendEvent({
      pageName: 'Chrome Backgroud',
      eventCategory: 'Extension',
      eventAction: 'Extension Updated',
      eventLabel: '',
    });
  }
});

const spotifyIconClickAction = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0)
      chrome.tabs.sendMessage(tabs[0].id, { type: 'SpotifyIconClickAction' });
  });
};

chrome.commands.onCommand.addListener(function (command) {
  if (command === 'add-to-spotify') {
    spotifyIconClickAction();
  }
});

chrome.browserAction.onClicked.addListener(() => {
  spotifyIconClickAction();
});
