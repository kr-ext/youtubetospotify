// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const youTubeTitle = (cb: any) => {
  const titleEl = document.getElementsByTagName('title')[0];
  const docEl = document.documentElement;
  if (docEl && docEl.addEventListener) {
    docEl.addEventListener(
      'DOMSubtreeModified',
      (evt) => {
        const t: any = evt.target;
        if (t === titleEl || (t.parentNode && t.parentNode === titleEl)) {
          cb();
        }
      },
      false,
    );
  }
};

const contentUtil = { youTubeTitle };
export default contentUtil;
