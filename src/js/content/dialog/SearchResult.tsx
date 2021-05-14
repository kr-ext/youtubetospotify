import React, { FC, useEffect, useState } from 'react';
import root from 'react-shadow';
import classNames from 'classnames';
import paradifyLogo from '../../../img/paradify_logo.png';
import dialogClose from '../../../img/dialog_close.png';
import { ReactComponent as AddButtonSvg } from '../../../img/round-add-button.svg';
import style from './searchResultDialog.shadowcss';
import { URLS } from '../../utils/constants';
import AudioPlayer from './AudioPlayer';

interface Props {
  result: any;
  addTrack(ids: string[], type: string): Promise<any>;
  close(): void;
  reSearch(q: string): void;
  filteredQuery: string;
  showResultDialog: boolean;
}
const SearchResult: FC<Props> = (props: Props) => {
  const {
    result: result,
    addTrack,
    close,
    reSearch,
    filteredQuery,
    showResultDialog,
  } = props;
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedQueryList, setSelectedQueryList] = useState<string[]>([]);

  const renderClose = () => {
    return (
      <button
        className="p-d-btn-close outline-none focus:outline-none"
        onClick={() => close()}
      >
        <img
          src={chrome.runtime.getURL(dialogClose)}
          height="10"
          width="10"
          className="p-d-ml-1"
        />
      </button>
    );
  };

  const onClickAddTrack = async (id: string, type: string) => {
    try {
      setIsSaving(true);
      await addTrack([id], type);
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
    } finally {
      setIsSaving(false);
      close();
    }
  };

  useEffect(() => {
    if (!filteredQuery) return;
    const list = filteredQuery.split(' ');
    if (list) {
      setSelectedQueryList(list);
    }
  }, []);

  const reSearchStart = (tempSelectedQueryList: string[]) => {
    if (tempSelectedQueryList && tempSelectedQueryList.length > 0) {
      reSearch(tempSelectedQueryList.join(' '));
    }
  };

  const renderFilter = () => {
    return (
      <div className="text-gray-400 mb-2">
        {filteredQuery ? (
          <>
            <div className="text-base">
              <span className="px-3 text-gray-200">filter:</span>
              {filteredQuery.split(' ').map((q: string, i: number) => {
                const selected = selectedQueryList.find((item) => item === q);

                return (
                  <button
                    key={i}
                    className={classNames(
                      'm-1 px-2 rounded-2xl outline-none focus:outline-none',
                      { 'bg-gray-600 text-gray-400': !selected },
                      { 'bg-red-600 text-gray-100': selected },
                    )}
                    onClick={() => {
                      const tempSelectedQueryList = [...selectedQueryList];

                      if (selected) {
                        tempSelectedQueryList.splice(
                          tempSelectedQueryList.indexOf(q),
                          1,
                        );
                      } else {
                        tempSelectedQueryList.push(q);
                      }
                      setSelectedQueryList(tempSelectedQueryList);
                      reSearchStart(tempSelectedQueryList);
                    }}
                    title="de-select this to filter"
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          ''
        )}
      </div>
    );
  };

  const renderPlaylists = (playlists: any) => {
    if (playlists && playlists.items) {
      return playlists.items.map((item: any, i: number) => (
        <div key={i} className="flex items-center mb-3 justify-between">
          <div className="flex items-center justify-start">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                title={item.name}
                style={{ width: '35px', height: '35px' }}
                className="rounded-full"
              />
            )}
            <div className="flex flex-col ml-2" style={{ width: '215px' }}>
              <div className="truncate text-gray-400" title={item.name}>
                {item.name}
              </div>

              <div title={item.ownerName} className="text-gray-600">
                {item.tracks ? `${item.tracks.total} tracks - ` : ''}
                {item.ownerName && <>{item.ownerName}</>}
              </div>
            </div>
          </div>
          <span className="ml-2 flex items-center justify-end">
            <button
              disabled={isSaving}
              onClick={() => {
                onClickAddTrack(item.id, item.type);
              }}
              className="outline-none focus:outline-none"
            >
              <AddButtonSvg width="30" height="30" />
            </button>
          </span>
        </div>
      ));
    }
    return null;
  };

  const renderTracks = (tracks: any) => {
    if (tracks && tracks.items) {
      return tracks.items.map((item: any, i: number) => (
        <div key={i} className="flex items-center mb-3 justify-between">
          <div className="flex items-center justify-start">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                title={item.name}
                style={{ width: '35px', height: '35px' }}
                className="rounded-full"
              />
            )}
            <div className="flex flex-col ml-2" style={{ width: '184px' }}>
              <div className="truncate text-gray-400" title={item.name}>
                {item.name}
              </div>
              {item.artistName && (
                <div title={item.artistName} className="text-gray-600">
                  {item.artistName}
                </div>
              )}
            </div>
          </div>
          <span className="ml-2 flex items-center justify-end">
            {item.preview_url && <AudioPlayer url={item.preview_url} />}
            <button
              disabled={isSaving}
              onClick={() => {
                onClickAddTrack(item.id, item.type);
              }}
              className="outline-none focus:outline-none"
            >
              <AddButtonSvg width="30" height="30" />
            </button>
          </span>
        </div>
      ));
    }
    return null;
  };

  return (
    <>
      <root.div className="quote">
        <style type="text/css">{style}</style>
        <div
          className={classNames(
            {
              'p-d-paradify-search-result-in-youtube-show transition-all duration-500 ease-in-out': showResultDialog,
            },
            { 'p-d-paradify-search-result-in-youtube-hide': !showResultDialog },
          )}
        >
          {showResultDialog && (
            <>
              <div
                className={classNames(
                  'p-d-paradify-search-result-in-youtube-inner',
                  'p-d-mx-auto p-d-px-4 p-d-py-4',
                  'bg-gray-900 text-white',
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
                      {URLS.EXTENSION_NAME}
                    </div>
                  </div>
                  <div>{renderClose()}</div>
                </div>
              </div>
              <div
                className={classNames(
                  'p-d-paradify-search-result-in-youtube-inner',
                  'p-d-mx-auto p-d-px-4 p-d-py-4',
                  'p-d-items-center p-d-py-2 p-d-line-h-22px p-d-mt-5',
                  'text-xl bg-gray-900',
                )}
              >
                {result && (
                  <>
                    {renderFilter()}
                    {result.error ? (
                      <div className="text-white text-center mt-2">
                        {result.error.message}{' '}
                      </div>
                    ) : (
                      <>
                        {renderTracks(result.tracks)}
                        {renderPlaylists(result.playlists)}
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </root.div>
    </>
  );
};

export default SearchResult;
