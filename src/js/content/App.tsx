import React, { FC } from 'react';
import SpotifyIconInYouTube from './SpotifyIconInYouTube';
// import SearchResult from './SearchResult';
// import { ParadifyContext } from './ParadifyContext';

const App: FC = () => {
  // const reducer = (state: any, action: any) => {
  //   switch (action.type) {
  //     case 'increment':
  //       return { count: state.count + 1 };

  //     default:
  //       return state;
  //   }
  // };
  // const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <>
      {/* <ParadifyContext.Provider value={{ count: state.count }}> */}
      <SpotifyIconInYouTube />,
      {/* <SearchResult />,
        <button onClick={() => dispatch({ type: 'increment' })}>
          Increment: {state.count}
        </button> */}
      {/* </ParadifyContext.Provider> */}
    </>
  );
};

export default App;
