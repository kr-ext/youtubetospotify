import React, { FC, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { SpotifyOption } from '../enums';
import { Token } from '../interfaces';
import { dialogUtils, storageUtil } from '../utils';
import '../../css/index.css';
import './option.css';
import paradifyLogo from '../../img/paradify_logo.png';
import spotifyImageUrl from '../../img/spotify.png';
import ModalDialogInYouTube from '../content/dialog/ModalDialogInYouTube';
import ReactGA from 'react-ga';
import { initializeReactGA } from '../utils';
import launch from '../../img/launch.png';
import coffee from '../../img/buy-me-a-coffee.png';
import { DEPLOYMENT_VERSION, URLS } from '../utils/constants';
import classNames from 'classnames';

const Option: FC = () => {
  const [tokenState, setTokenState] = useState<Token>(null);
  const [spotifyOptionState, setSpotifyOptionState] = useState(null);
  const [
    tempOutlineForDefaultOption,
    setTempOutlineForDefaultOption,
  ] = useState(false);

  const loadStorageAndUpdateStates = async () => {
    const spotifyTokenData = await storageUtil.getSpotifyToken();

    setTokenState(spotifyTokenData);

    const spotifyOption: string = await storageUtil.getSpotifyOption();
    setSpotifyOptionState(spotifyOption);

    const optionDefaultOutlined: number = await storageUtil.getOptionHighlightedVersion();
    if (!optionDefaultOutlined || optionDefaultOutlined < DEPLOYMENT_VERSION) {
      setTempOutlineForDefaultOption(true);
      setTimeout(() => {
        setTempOutlineForDefaultOption(false);
        storageUtil.setOptionHighlightedVersion();
      }, 12000);
    }
  };

  const loadWelcomeMessage = async () => {
    const installed = await storageUtil.isInstalled();

    if (!installed) {
      dialogUtils.welcome();
      storageUtil.setIsInstalled();
    }
  };

  useEffect(() => {
    loadStorageAndUpdateStates();
    injectDialogWindow();
    loadWelcomeMessage();
    initializeReactGA(ReactGA, 'options');
  }, []);

  const saveOption = async (option: SpotifyOption) => {
    await storageUtil.setSpotifyIconClickActionOption(option);
    setSpotifyOptionState(option);
    ReactGA.event({
      category: 'Options',
      action: `Option Changed ${option.toString()}`,
      label: option.toString(),
    });
  };

  const logoutSpotify = async () => {
    await storageUtil.removeSpotifyToken();
    setTokenState(null);
    ReactGA.event({
      category: 'Options',
      action: 'Logout Clicked',
      label: '',
    });
  };

  const loginSpotify = async () => {
    chrome.runtime.sendMessage({
      type: 'openAuthRedirectUrl',
    });

    const token = await storageUtil.waitAndGetFirstLoginResponse();
    if (token) {
      setTokenState(token);
    }
  };

  const renderLoginContainer = () => {
    return (
      <>
        <li className="w-full sm:w-1/3 py-5 border-dotted border-b border-t">
          {tokenState && tokenState.access_token && (
            <div>You are logged in</div>
          )}
          {(!tokenState || !tokenState.access_token) && (
            <div>You are not logged in</div>
          )}
        </li>
        <li className="w-full sm:w-2/3 py-5 border-dotted border-b border-t">
          {tokenState && tokenState.access_token && (
            <div>
              <button className="underline" onClick={() => logoutSpotify()}>
                Logout
              </button>
            </div>
          )}
          {(!tokenState || !tokenState.access_token) && (
            <div>
              <button className="underline flex" onClick={() => loginSpotify()}>
                Login with Spotify{' '}
                <img
                  src={chrome.runtime.getURL(spotifyImageUrl)}
                  width="20"
                  height="20"
                  title="Login with Spotify"
                  className="ml-1 img-spotify-icon"
                />
              </button>
            </div>
          )}
        </li>
      </>
    );
  };

  const renderInputLabel = (htmlFor: string, text: string) => {
    return (
      <label htmlFor={htmlFor}>
        <span className="font-bold">{text}</span>
      </label>
    );
  };

  const renderSpotifyIconActionClick_Option = () => {
    return (
      <>
        <div
          className={classNames(
            'p-4 hover:bg-green-200 rounded-lg',
            { 'bg-green-200': spotifyOptionState === SpotifyOption.Search },
            { 'bg-gray-200': spotifyOptionState !== SpotifyOption.Search },
            { 'outline-forDefaultOption': tempOutlineForDefaultOption },
          )}
        >
          <div>
            <input
              type="radio"
              id="Search"
              name="SpotifyOption"
              value="Search"
              checked={spotifyOptionState === SpotifyOption.Search}
              onChange={() => saveOption(SpotifyOption.Search)}
              className="mr-2"
            />
            {renderInputLabel('Search', 'Default (Login Needed) (Recommended)')}
          </div>
          <div>
            <p className="mt-2 text-gray-700">
              Paradify shows a search result. So, you can choose which tracks to
              add.
            </p>
          </div>
        </div>
        <div
          className={classNames(
            'mt-5 p-4 hover:bg-green-200 rounded-lg',
            { 'bg-green-200': spotifyOptionState === SpotifyOption.AutoSave },
            { 'bg-gray-200': spotifyOptionState !== SpotifyOption.AutoSave },
          )}
        >
          <div>
            <input
              type="radio"
              id="AutoSave"
              name="SpotifyOption"
              value="AutoSave"
              checked={spotifyOptionState === SpotifyOption.AutoSave}
              onChange={() => saveOption(SpotifyOption.AutoSave)}
              className="mr-2"
            />
            {renderInputLabel('AutoSave', 'Auto Save (Login Needed)')}
          </div>
          <div className="mt-2 text-gray-700">
            <p>Paradify tries to find and add the tracks automatically.</p>
            <p className="text-xs text-gray-600">
              Less likely(30%), it might add the wrong tracks. In this case,
              recommended to choose the option{' '}
              <span className="font-bold">{'"Default"'}</span>.
            </p>
          </div>
        </div>
        <div
          className={classNames(
            'mt-5 p-4 hover:bg-green-200 rounded-lg',
            { 'bg-green-200': spotifyOptionState === SpotifyOption.OpenNewTab },
            { 'bg-gray-200': spotifyOptionState !== SpotifyOption.OpenNewTab },
          )}
        >
          <div>
            <input
              type="radio"
              id="OpenNewTab"
              name="SpotifyOption"
              value="OpenNewTab"
              checked={spotifyOptionState === SpotifyOption.OpenNewTab}
              onChange={() => saveOption(SpotifyOption.OpenNewTab)}
              className="mr-2"
            />
            {renderInputLabel('OpenNewTab', 'Open in Spotify')}
          </div>
          <div>
            <p className="mt-2 text-sm text-gray-700">
              Paradify opens {'"Spotify Web Player"'} to search. Does not add
              the tracks on behalf of you.
            </p>
            <p className="text-xs text-gray-600">
              PS: Spotify does NOT allow neither you nor Paradify to open
              Spotify apllication on your computer. This option only opens
              Spotify Web Player
            </p>
          </div>
        </div>
      </>
    );
  };

  const injectDialogWindow = () => {
    const dialogName = 'p-d-paradify-dialog-in-youtube';

    const dialog = window.document.createElement('div');
    dialog.className = dialogName;
    dialog.id = dialogName;

    window.document.body.appendChild(dialog);
    render(
      <ModalDialogInYouTube />,
      window.document.getElementById(dialogName),
    );
  };

  const renderTopAnnouncement = () =>
    tempOutlineForDefaultOption ? (
      <>
        <div className="h-10 bg-red-600 text-white w-full text-center flex items-center justify-center text-sm ">
          <img src={launch} className="mr-2" />
          Paradify now has a new option {'"Default"'}.
        </div>
      </>
    ) : null;

  return (
    <>
      {renderTopAnnouncement()}
      <div className="max-w-700 mx-auto text-sm text-gray-800">
        <div className="my-5">
          <ul className="flex flex-wrap my-5">
            <li className="w-full sm:w-3/3 text-2xl flex items-center py-5 text-gray-600 border-dotted border-b">
              <img
                src={chrome.runtime.getURL(paradifyLogo)}
                className="mr-3 h-6"
              />
              Paradify - Options
            </li>
            {renderLoginContainer()}
            {(!tokenState || !tokenState.access_token) && (
              <>
                <li className="w-full sm:w-1/3 py-5  border-dotted border-b border-t">
                  Why login?
                </li>
                <li className="w-full sm:w-2/3 py-5  border-dotted border-b border-t">
                  <div className="text-xs">
                    You need to login and allow Paradify app in Spotify.
                    Therefore, Paradify can add tracks into your Spotify
                    playlist on behalf of you.
                    <p className="text-gray-600">
                      Note: Paradify does NOT collect any information from your
                      Spotify account. You can always remove the permission
                      under {'"Profile > Account > App"'}.
                    </p>
                  </div>
                </li>
              </>
            )}

            <li className="w-full sm:w-1/3 py-5 border-dotted border-b border-t">
              <div>Spotify Icon Action</div>
              <p className="text-xs mt-2 text-gray-700">
                When you click on Spotify icon in Youtube...
              </p>
            </li>
            <li className="w-full sm:w-2/3 py-5 border-dotted border-b border-t">
              <div>{renderSpotifyIconActionClick_Option()}</div>
            </li>
            <li className="w-full sm:w-1/3 py-5 border-dotted border-b border-t">
              <div>Feedback</div>
            </li>
            <li className="w-full sm:w-2/3 py-5 border-dotted border-b border-t">
              <div>
                Feel free to{' '}
                <a
                  href="https://forms.gle/6V5hVCQhGxP6s9No7"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                  onClick={() => {
                    ReactGA.event({
                      category: 'Options',
                      action: 'Contact Clicked',
                      label: '',
                    });
                  }}
                >
                  ask/share/report
                </a>{' '}
                any question/feedback/report
              </div>
            </li>
            <li className="w-full sm:w-1/3 py-5 border-dotted border-b border-t">
              <div>Donation</div>
            </li>
            <li className="w-full sm:w-2/3 py-5 border-dotted border-b border-t">
              <div>
                <button
                  onClick={() => {
                    window.location.href = URLS.DONATION_BUY_ME_A_COFFEE;
                    ReactGA.event({
                      category: 'Options',
                      action: 'Buy Me a Coffe Clicked',
                      label: '',
                    });
                  }}
                >
                  <div className="flex items-baseline">
                    <img
                      src={chrome.runtime.getURL(coffee)}
                      className="buy-me-a-coffee"
                    />
                  </div>
                </button>
              </div>
            </li>
          </ul>
          <div className="text-center text-xs ">
            <a href="https://www.paradify.com">paradify.com</a>
            <br />
            <br />
            <a href="http://www.youtube2spotify.com">youtube2spotify.com</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Option;
