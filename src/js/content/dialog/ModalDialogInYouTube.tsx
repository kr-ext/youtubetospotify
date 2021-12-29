import React, { FC, useEffect, useState } from 'react';
import { TIMEOUT_MS, URLS } from '../../utils/constants';

import { Dialog } from '../../interfaces';
import classNames from 'classnames';
import coffee from '../../../img/buy-me-a-coffee.png';
import dialogClose from '../../../img/dialog_close.png';
import { getRandomNumber } from '../../utils';
import paradifyLogo from '../../../img/paradify_logo.png';
import rateUs from '../../../img/rate-us.png';
import root from 'react-shadow';
import storageUtil from '../../utils/storageUtil';
import style from './dialog.shadowcss';

const ModalDialogInYouTube: FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [isGifDisabled, setIsGifDisabled] = useState<boolean>(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    chrome.runtime.onMessage.addListener(async (event) => {
      if (event.type === 'showDialog') {
        const isGifDisabled: boolean = await storageUtil.isGifDisabled();

        setIsGifDisabled(isGifDisabled);

        setDialog(event.data);
        clearTimeout(timeout);
        if (event.data.behavior.autoHide) {
          timeout = setTimeout(() => {
            setShowDialog(false);
          }, event.data.behavior.hideTimeout || TIMEOUT_MS);
        }
        setShowDialog(true);
      } else if (event.type === 'hideDialog') {
        close();
      }
    });
  }, []);

  const close = () => {
    setShowDialog(false);
    setDialog(null);
  };

  const addAll = (data: any) => {
    close();

    chrome.runtime.sendMessage({
      type: 'dialogAddAll',
      data,
    });
  };

  const renderClose = () => {
    return (
      <button className="p-d-btn-close" onClick={() => close()}>
        <img
          src={chrome.runtime.getURL(dialogClose)}
          height="10"
          width="10"
          className="p-d-ml-1"
        />
      </button>
    );
  };

  return (
    <>
      {showDialog && (
        <root.div className="quote">
          <style type="text/css">{style}</style>

          <div
            className={classNames(
              { 'p-d-paradify-dialog-in-youtube-show': showDialog },
              { 'p-d-paradify-dialog-in-youtube-hide': !showDialog },
            )}
          >
            {dialog && dialog.message && (
              <>
                <div
                  className={classNames(
                    'p-d-paradify-dialog-in-youtube-inner',
                    'p-d-mx-auto p-d-px-4 p-d-py-4',
                  )}
                >
                  <div className="p-d-flex p-d-items-center p-d-mx-auto p-d-justify-between">
                    <div className="p-d-flex p-d-items-center">
                      <img
                        src={chrome.runtime.getURL(paradifyLogo)}
                        height="20"
                        width="29"
                        className="p-d-ml-1"
                      />
                      <div className="p-d-ml-4 p-d-text-2xl">
                        {dialog.message.title}
                      </div>
                    </div>
                    <div>{renderClose()}</div>
                  </div>
                </div>

                {dialog.message.image && isGifDisabled === false && (
                  <div
                    className={classNames(
                      'p-d-paradify-dialog-in-youtube-inner',
                      'p-d-mx-auto p-d-px-4 p-d-py-4',
                      'p-d-items-center p-d-py-2 p-d-text-xl p-d-text-center p-d-mt-5',
                    )}
                  >
                    <img
                      className="p-d-w-full"
                      src={dialog.message.image.url}
                    />
                  </div>
                )}
                <div
                  className={classNames(
                    'p-d-paradify-dialog-in-youtube-inner',
                    'p-d-mx-auto p-d-px-4 p-d-py-4',
                    'p-d-items-center p-d-py-2 p-d-text-2xl p-d-line-h-22px p-d-text-center p-d-mt-5',
                  )}
                >
                  {dialog.message.text && dialog.message.text}
                  {dialog.message.link && (
                    <>
                      <div className="p-d-mt-5">
                        <button
                          className="p-d-button"
                          onClick={() => {
                            chrome.runtime.sendMessage({
                              type: 'openTab',
                              data: { url: dialog.message.link.href },
                            });
                          }}
                        >
                          {dialog.message.link.text}
                        </button>
                      </div>
                    </>
                  )}
                  {dialog.confirmation && (
                    <>
                      <div>{dialog.confirmation.text}</div>
                      <div>
                        {' '}
                        <button
                          className="p-d-mt-5 p-d-button"
                          onClick={() => addAll(dialog.confirmation.data)}
                        >
                          Add
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {dialog.showDonation && getRandomNumber(5) > 2 && (
                  <div
                    className={classNames('p-d-donation-container', 'p-d-mt-5')}
                  >
                    <button
                      className="p-d-button-donation"
                      onClick={() => {
                        chrome.runtime.sendMessage({
                          type: 'openTab',
                          data: { url: URLS.DONATION_BUY_ME_A_COFFEE },
                        });

                        //GA
                        chrome.runtime.sendMessage({
                          type: 'buyMeACoffeeClicked',
                          data: {
                            pageName: 'YouTube',
                            eventCategory: 'Donation',
                            eventAction: 'Buy Me A Coffee Clicked',
                          },
                        });
                      }}
                    >
                      <img src={chrome.runtime.getURL(coffee)} />
                    </button>
                    <button
                      className="p-d-button-donation"
                      onClick={() => {
                        chrome.runtime.sendMessage({
                          type: 'openTab',
                          data: { url: URLS.RATE_US },
                        });
                      }}
                    >
                      <img src={chrome.runtime.getURL(rateUs)} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </root.div>
      )}
    </>
  );
};

export default ModalDialogInYouTube;
