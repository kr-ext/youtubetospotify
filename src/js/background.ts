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
import { consoleLog, getRandomSuccessGif, storageUtil } from './utils';
import { SpotifyOption } from './enums';
import { Dialog } from './interfaces';
import { browser } from 'webextension-polyfill-ts';

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

  browser.tabs.query(
    {
      url: '*://*.youtube.com/*',
    },
    function (tabs) {
      tabs.forEach((tab) => {
        sendMessageToContentScript(tab.id, {
          data: dialog,
          type: 'showDialog',
        });
      });
    },
  );

  sendMessageToRuntime({
    data: dialog,
    type: 'showDialog',
  });
};

const setBadgeText = (text: string) => {
  // eslint-disable-next-line no-undef
  browser.browserAction.setBadgeText({ text });
  setTimeout(() => clearBadge(), 5000);
};

const clearBadge = () => {
  // eslint-disable-next-line no-undef
  browser.browserAction.setBadgeText({ text: '' });
};

const sendMessageToContentScript = (tabId: number, message: any) => {
  browser.tabs.sendMessage(tabId, { ...message });
};

const sendMessageToRuntime = (message: any) => {
  browser.runtime.sendMessage({ ...message });
};

const showDialog = (message: any) => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    sendMessageToContentScript(tabs[0].id, { ...message, type: 'showDialog' });
  });
};

const hideDialog = (message: any) => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    sendMessageToContentScript(tabs[0].id, { ...message, type: 'hideDialog' });
  });
};

const openTab = (url: string) => {
  //eslint-disable-next-line no-undef
  browser.tabs.create({
    url,
  });
};

const openAuthRedirectUrl = () => {
  openTab(getRedirectAuthUrl());
};

const dialogAddAll = (data: any) => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.tabs.sendMessage(tabs[0].id, { data: data, type: 'dialogAddAll' });
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

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  messageListener(message, sender, sendResponse);
});

browser.runtime.onMessageExternal.addListener(function (
  message,
  sender,
  sendResponse,
) {
  messageListener(message, sender, sendResponse);
});

browser.runtime.setUninstallURL(UNINSTALL_URL);

browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == 'install') {
    storageUtil.setSpotifyIconClickActionOption(SpotifyOption.Search);
    try {
      const deploymentVersion = await storageUtil.getStorage(DEPLOYMENT);
      if (!deploymentVersion || deploymentVersion < DEPLOYMENT_VERSION) {
        storageUtil.setStorage(DEPLOYMENT, DEPLOYMENT_VERSION);
        openTab(`chrome-extension://${browser.runtime.id}/options.html`);
      }
    } catch {}
    gaSendEvent({
      pageName: 'Chrome Backgroud',
      eventCategory: 'Extension',
      eventAction: 'Extension Installed',
      eventLabel: '',
    });
  } else if (details.reason == 'update') {
    storageUtil.setSpotifyIconClickActionOption(SpotifyOption.Search);
    try {
      const deploymentVersion = await storageUtil.getStorage(DEPLOYMENT);
      if (!deploymentVersion || deploymentVersion < DEPLOYMENT_VERSION) {
        storageUtil.setStorage(DEPLOYMENT, DEPLOYMENT_VERSION);
        openTab(`chrome-extension://${browser.runtime.id}/options.html`);
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
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0)
      browser.tabs.sendMessage(tabs[0].id, { type: 'SpotifyIconClickAction' });
  });
};

browser.commands.onCommand.addListener(function (command) {
  if (command === 'add-to-spotify') {
    spotifyIconClickAction();
  }
});

browser.browserAction.onClicked.addListener(() => {
  spotifyIconClickAction();
});
