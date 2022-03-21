import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import * as E from 'fp-ts/Either';
import * as T from 'io-ts';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import smoothscroll from 'smoothscroll-polyfill';
import { BottomSheet } from 'react-spring-bottom-sheet';

import {
  PortalMainStore,
  SessionData,
  SessionDataType,
  Theme,
} from './Types';

import usePortalStore from './store/store';
import SearchFilter from './components/SearchFilter';
import { useTheme } from './theme/theme';
import CraftAPIHelper from './api/craftAPIHelper';
import SearchResults from './components/SearchResults';
import About from './components/About';
import getBlocksInCurrentPage from './search/blockSearch';
import Header from './components/Header';
import { LOCAL_STORAGE_KEY } from './config/config';
import FrequencyResults from './components/FrequencyResults';
import MediaPlayer from './components/MediaPlayer/MediaPlayer';
import ArticleReader from './components/Article/ArticleReader';
import Notification from './components/Notification/Notification';
import withOpacity from './utils/colors';
import ArticleHeader from './components/Article/ArticleHeader';
import Constants from './utils/constants';

const GlobalStyles = createGlobalStyle`
  html, body, #react-root {
    height: 100%;
    scroll-behavior: smooth;
    position: relative;
    overflow-x: hidden;
    user-select: none;
  }

  body {
    --rsbs-backdrop-bg: rgba(0, 0, 0, 0.6);
    --rsbs-bg: ${(props) => props.theme.mediaPlayerBackground};
    --rsbs-handle-bg: ${(props) => withOpacity(props.theme.accentColor, 60)};
    --rsbs-max-w: auto;
    --rsbs-ml: env(safe-area-inset-left);
    --rsbs-mr: env(safe-area-inset-right);
    --rsbs-overlay-rounded: 16px;

    -webkit-font-smoothing: antialiased;
    text-rendering: optimizelegibility;
    font-variant-numeric: lining-nums;
    -moz-font-feature-settings: "lnum" 1;
    -webkit-font-feature-settings: "lnum" 1;
    font-feature-settings: "lnum" 1;
    transition: background 300ms ease-in;
    background: ${(props) => props.theme.primaryBackground}
  }

  [data-rsbs-header] {
    padding-bottom: 0px;
  }

  [data-rsbs-header]:hover {
    --rsbs-handle-bg: ${(props) => withOpacity(props.theme.accentColor, 90)};
  }

  html, body {
    padding: 0;
    margin: 0;
    font-family: system-ui, -apple-system;
  }

  .portal-card-settings-enter {
    opacity: 0;
    position: relative;
    max-height: 0;
    transform: scale(0.9);
  }

  .portal-card-settings-enter-active {
    opacity: 1;
    max-height: 400px;
    transition-duration: 300ms;
    transform: translateX(0);
    transition: opacity 300ms, transform 300ms top 300ms;
  }

  .portal-card-settings-exit {
    max-height: 400px;
    opacity: 1;
  }

  .portal-card-settings-exit-active {
    opacity: 0;
    max-height: 0px;
    transform: scale(0.9);
    transition-duration: 0.5s;
    transition: all 300ms;
  }

  .article-sheet {
    background: ${(props) => props.theme.primaryBackground};
  }

  /* To ensure that the article sheet is below the media sheet */
  [data-rsbs-has-header="true"] > div {
    z-index: 2!important;
  }

  [data-rsbs-has-header='false'] [data-rsbs-header] {
    padding-bottom: 10px;
  }
}
`;

const ExtensionContainer = styled.div`
  user-select: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: .3s;
  display: flex;
  flex-direction: column;
`;

const ExtensionBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 8px;
  padding-right: 8px;
  height: 100%;
  overflow: auto;
`;

const StyledFilterContainer = styled.div`
  padding-top: 10px;
  padding-left: 8px;
  padding-right: 8px;
`;

const App = () => {
  const accentColor = usePortalStore((state: PortalMainStore) => state.accentColor);
  const setAccentColor = usePortalStore((state: PortalMainStore) => state.setAccentColor);
  const searchInstances = usePortalStore((state: PortalMainStore) => state.searchInstances);
  const starredBlocks = usePortalStore((state: PortalMainStore) => state.starredBlocks);
  const setStarredBlocks = usePortalStore((state: PortalMainStore) => state.setStarredBlocks);
  const setMedia = usePortalStore((state: PortalMainStore) => state.setMedia);
  const setArticle = usePortalStore((state: PortalMainStore) => state.setArticle);
  const mediaPlayer = usePortalStore((state: PortalMainStore) => state.mediaPlayer);
  const article = usePortalStore((state: PortalMainStore) => state.article);
  const version = usePortalStore((state: PortalMainStore) => state.version);
  const setSearchInstances = usePortalStore((state: PortalMainStore) => state.setSearchInstances);
  const notificaiton = usePortalStore((state: PortalMainStore) => state.notificaiton);
  const setResultsExistAcrossMultipleBlocks = usePortalStore(
    (state: PortalMainStore) => state.setResultsAcrossMultipleBlocks,
  );
  const [sessionDataLoaded, setSessionDataLoaded] = useState(false);
  const { theme, themeLoaded } = useTheme();
  const setResults = usePortalStore((state: PortalMainStore) => state.setResults);
  const [showHelp, setShowHelp] = useState(false);
  const [height, setHeight] = useState(0);

  const snapPointsArray = useCallback(({ maxHeight }) => [
    maxHeight - 300,
    maxHeight - 45], [height]);

  const defaultSnapPoint = useCallback(({ lastSnap, snapPoints }) => lastSnap
    ?? Math.max(...snapPoints), [height]);

  const savePreferences = useCallback(() => {
    if (sessionDataLoaded) {
      const sessionData: SessionDataType = {
        accentColor,
        searchInstances,
        version,
        starredBlocks,
        mediaPlayer,
        article,
      };

      const instances = JSON.stringify(sessionData);

      CraftAPIHelper.saveToSession(LOCAL_STORAGE_KEY, instances);
    }
  }, [searchInstances, accentColor, starredBlocks, mediaPlayer, article]);

  const getDataFromStorage = useCallback(() => {
    const onExtensionLoaded = async () => {
      const response = await CraftAPIHelper.getFromSession(LOCAL_STORAGE_KEY);
      if (response.status === 'success') {
        const data: SessionDataType = JSON.parse(response.data);
        const decoded: E.Either<T.Errors, SessionDataType> = SessionData.decode(data);
        if (data && E.isRight(decoded)) {
          setSearchInstances(data.searchInstances);
          setAccentColor(data.accentColor);
          setStarredBlocks(data.starredBlocks);
          setTimeout(() => {
            setMedia(data.mediaPlayer);
          }, 500);
          setTimeout(() => {
            setArticle(data.article);
          }, 500);
          setSessionDataLoaded(true);
        }
      } else {
        setSessionDataLoaded(true);
      }
    };

    window.setTimeout(() => {
      onExtensionLoaded();
    }, 50);
  }, []);

  const getCurrentInstance = useCallback(
    () => searchInstances.filter((instance) => instance.instanceId === accentColor)[0],
    [searchInstances, accentColor],
  );

  const updateSearchResults = useCallback(() => {
    const getNewResults = async () => {
      const response = await getBlocksInCurrentPage(
        new CraftAPIHelper(),
        getCurrentInstance().filters,
      );
      setResults(response.blocks);
      setResultsExistAcrossMultipleBlocks(response.acrossMultipleBlocks);
    };

    getNewResults();
  }, [searchInstances, accentColor]);

  useLayoutEffect(() => {
    let timer: number | undefined;
    const debounce = (func: () => void) => (event: Event) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(func, 400, event);
    };

    const onWindowResized = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', debounce(onWindowResized));
    return () => window.removeEventListener('resize', onWindowResized);
  }, []);

  const surpressedErrorMessages = (event: ErrorEvent) => {
    const messages = ['ResizeObserver loop completed with undelivered notifications.', 'Script error.'];

    if (messages.includes(event.message)) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    smoothscroll.polyfill();
    getDataFromStorage();
    window.addEventListener('error', surpressedErrorMessages);

    if (!(window as any).craftDev) {
      window.onerror = () => {
      };
    }
    return () => window.removeEventListener('error', surpressedErrorMessages);
  }, []);

  useEffect(() => {
    updateSearchResults();
    savePreferences();
  }, [searchInstances, accentColor, starredBlocks, mediaPlayer, article]);

  const extensionContent = (
    <ThemeProvider theme={theme as Theme}>
      <GlobalStyles />
      {
        (sessionDataLoaded) && (
          <ExtensionContainer>
            <Header onHeaderClicked={(e) => {
              e.stopPropagation();
              setShowHelp((state) => !state);
            }}
            />
            <CSSTransition
              in={notificaiton.isShown}
              timeout={300}
              classNames="portal-card-settings"
              unmountOnExit
            >
              <Notification />
            </CSSTransition>
            { !showHelp
              && (
                <StyledFilterContainer>
                  <SearchFilter onRefreshButtonClicked={() => updateSearchResults()} />
                </StyledFilterContainer>
              )}
            { !showHelp && (getCurrentInstance().filters.activeViewType === 'SearchView')
              && (
                <ExtensionBodyContainer>
                  <SearchResults />
                </ExtensionBodyContainer>
              )}
            { !showHelp && (getCurrentInstance().filters.activeViewType === 'FrequencyView')
              && (
                <ExtensionBodyContainer>
                  <FrequencyResults />
                </ExtensionBodyContainer>
              )}
            { showHelp
              && (
                <ExtensionBodyContainer>
                  <About />
                </ExtensionBodyContainer>
              )}
            <BottomSheet
              className={Constants.ARTICLE_SHEEET_CLAS_NAME}
              maxHeight={height}
              defaultSnap={defaultSnapPoint}
              header={(
                <ArticleHeader />
              )}
              blocking={false}
              onDismiss={() => setArticle({ isActive: false, activeUrl: undefined })}
              open={article.isActive}
              snapPoints={snapPointsArray}
            >
              <ArticleReader />
            </BottomSheet>
            <BottomSheet
              className={Constants.MEDIA_SHEEET_CLAS_NAME}
              blocking={false}
              onDismiss={() => setMedia({ isActive: false, onlyAudio: false })}
              open={mediaPlayer.isActive}
            >
              <MediaPlayer />
            </BottomSheet>
          </ExtensionContainer>
        )
      }
    </ThemeProvider>
  );

  return (
    <div>
      {
        (themeLoaded && extensionContent)
      }
    </div>
  );
};

export default function initApp() {
  ReactDOM.render(<App />, document.getElementById('react-root'));
}
