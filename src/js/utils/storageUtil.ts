import {
  DEPLOYMENT_VERSION,
  EXTENSION_INSTALLED,
  IS_GIF_DISABLED,
  OPTION_HIGHLIGHTED,
  SAVED_COUNT,
  SPOTIFY_ICON_CLICK_ACTION_OPTION,
  SPOTIFY_TOKEN,
} from './constants';

import { Token } from '../interfaces';

const getStorage = async (key: string): Promise<unknown> =>
  new Promise<unknown>((resolve) => {
    chrome.storage.sync.get([key], (data) => {
      resolve(data[key]);
    });
  });

const setStorage = (key: string, value: unknown): void => {
  new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      resolve();
    });
  });
};

const getSpotifyToken = async (): Promise<Token> =>
  getStorage(SPOTIFY_TOKEN) as Promise<Token>;

const setSpotifyToken = async (token: Token): Promise<void> =>
  setStorage(SPOTIFY_TOKEN, token);

const getSpotifyOption = async (): Promise<string> =>
  getStorage(SPOTIFY_ICON_CLICK_ACTION_OPTION) as Promise<string>;

const getOptionHighlightedVersion = async (): Promise<number> =>
  getStorage(OPTION_HIGHLIGHTED) as Promise<number>;

const isGifDisabled = async (): Promise<boolean> => {
  const result = (await getStorage(IS_GIF_DISABLED)) as Promise<boolean>;
  return result ?? false;
};

const setOptionHighlightedVersion = async (): Promise<void> => {
  setStorage(OPTION_HIGHLIGHTED, DEPLOYMENT_VERSION);
};
const setGifDisabled = async (value: boolean): Promise<void> =>
  setStorage(IS_GIF_DISABLED, value);

const getSavedCount = async (): Promise<number> => {
  try {
    const count = (await getStorage(SAVED_COUNT)) as Promise<number>;

    return count ?? 0;
  } catch {
    return 0;
  }
};

const isInstalled = async (): Promise<boolean> => {
  const installedInfo: string = (await getStorage(
    EXTENSION_INSTALLED,
  )) as string;
  return installedInfo ? true : false;
};
const setIsInstalled = async (): Promise<void> =>
  setStorage(EXTENSION_INSTALLED, 1);

const setSpotifyIconClickActionOption = async (option: string): Promise<void> =>
  setStorage(SPOTIFY_ICON_CLICK_ACTION_OPTION, option);

const increaseSavedCount = async (): Promise<void> => {
  const count: number = await getSavedCount();
  setStorage(SAVED_COUNT, count + 1);
};

const removeStorage = (key: string) => {
  new Promise<void>((resolve) => {
    chrome.storage.sync.remove(key, () => {
      resolve();
    });
  });
};

const removeSpotifyToken = async (): Promise<void> =>
  removeStorage(SPOTIFY_TOKEN);

const removeSpotifyOption = async (): Promise<void> =>
  removeStorage(SPOTIFY_ICON_CLICK_ACTION_OPTION);

const waitAndGetFirstLoginResponse = async (): Promise<Token | null> => {
  let token: Token | null;

  for (let i = 0; i < 10; i++) {
    token = await new Promise<Token | null>((resolve) => {
      setTimeout(async () => {
        const tokenStorage: Token = await getSpotifyToken();
        if (tokenStorage) {
          resolve(tokenStorage);
        } else resolve(null);
      }, 3000);
    });

    if (token) {
      break;
    }
  }

  return token;
};

const storageUtil = {
  getSpotifyToken,
  getSpotifyOption,
  getSavedCount,
  setSpotifyIconClickActionOption,
  setSpotifyToken,
  increaseSavedCount,
  removeSpotifyToken,
  removeSpotifyOption,
  waitAndGetFirstLoginResponse,
  getStorage,
  setStorage,
  isInstalled,
  setIsInstalled,
  getOptionHighlightedVersion,
  setOptionHighlightedVersion,
  isGifDisabled,
  setGifDisabled,
};

export default storageUtil;
