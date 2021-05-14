import {
  getRandomErrorGif,
  getRandomFailedGif,
  getRandomInstalledGif,
  getRandomSuccessGif,
  getSpotifySearchUrl,
} from '.';
import { Dialog } from '../interfaces';

const hideDialog = (): void => {
  const dialog: Dialog = {
    behavior: { autoHide: true },
    showDonation: true,
    message: {
      title: '',
      text: '',
    },
  };
  chrome.runtime.sendMessage({
    type: 'hideDialog',
    data: dialog,
  });
};

const errorInGeneral = (): void => {
  const dialog: Dialog = {
    behavior: { autoHide: true, hideTimeout: 4000 },
    message: {
      title: 'Ops!',
      text: `Something went wrong. Please try again later`,
      image: { url: getRandomErrorGif() },
    },
  };

  chrome.runtime.sendMessage({
    type: 'showDialog',
    data: dialog,
  });
};

const showNoTitle = (): void => {
  const dialog: Dialog = {
    behavior: { autoHide: true },
    message: {
      title: 'Title Not Found',
      text: `No played song/video clip found.`,
    },
  };

  chrome.runtime.sendMessage({
    type: 'showDialog',
    data: dialog,
  });
};

const confirmationDialog = (
  confirmationText: string,
  playlist: string,
): void => {
  const playlistDialog: Dialog = {
    behavior: { autoHide: false },
    message: {
      title: 'Playlist found',
    },
    confirmation: {
      text: confirmationText,
      data: playlist,
      dataType: 'playlist',
    },
  };

  chrome.runtime.sendMessage({
    type: 'showDialog',
    data: playlistDialog,
  });
};

const saved = (title: string, text: string, playlistUrl: string): void => {
  const dialog: Dialog = {
    behavior: { autoHide: true },
    showDonation: true,
    message: {
      title,
      text,
      image: { url: getRandomSuccessGif() },
      link: { href: playlistUrl, text: 'Open your playlist' },
    },
  };

  chrome.runtime.sendMessage({
    type: 'showDialog',
    data: dialog,
  });
};

const notSaved = (q: string): void => {
  const dialog: Dialog = {
    behavior: { autoHide: true },
    message: {
      title: 'Not Found',
      text: `The video was not found in Spotify.`,
      image: { url: getRandomFailedGif() },
      link: {
        href: getSpotifySearchUrl(q),
        text: 'Search on Spotify page instead',
      },
    },
  };

  chrome.runtime.sendMessage({
    type: 'showDialog',
    data: dialog,
  });
};

const welcome = (): void => {
  const dialog: Dialog = {
    behavior: { autoHide: true, hideTimeout: 6000 },
    message: {
      title: 'You made it!',
      text: 'Enjoy using Paradify',
      image: { url: getRandomInstalledGif() },
    },
  };

  chrome.runtime.sendMessage({
    type: 'showDialog',
    data: dialog,
  });
};

const dialogUtils = {
  hideDialog,
  errorInGeneral,
  showNoTitle,
  confirmationDialog,
  saved,
  notSaved,
  welcome,
};
export default dialogUtils;
