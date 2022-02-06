import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import * as E from 'fp-ts/Either';
import * as T from 'io-ts';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import smoothscroll from 'smoothscroll-polyfill';

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
import getBlocks from './search/blockSearch';
import Header from './components/Header';
import { LOCAL_STORAGE_KEY } from './config/config';
import FrequencyResults from './components/FrequencyResults';

const GlobalStyles = createGlobalStyle`
  html, body, #react-root {
    height: 100%;
    scroll-behavior: smooth;
    position: relative;
    overflow-x: hidden;
  }

  body {
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizelegibility;
    font-variant-numeric: lining-nums;
    -moz-font-feature-settings: "lnum" 1;
    -webkit-font-feature-settings: "lnum" 1;
    font-feature-settings: "lnum" 1;
    transition: background 300ms ease-in;
    background: ${(props) => props.theme.primaryBackground}
  }

  html, body {
    padding: 0;
    margin: 0;
    font-family: system-ui, -apple-system;
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
  const version = usePortalStore((state: PortalMainStore) => state.version);
  const setSearchInstances = usePortalStore((state: PortalMainStore) => state.setSearchInstances);
  const setResultsExistAcrossMultipleBlocks = usePortalStore(
    (state: PortalMainStore) => state.setResultsAcrossMultipleBlocks,
  );
  const [sessionDataLoaded, setSessionDataLoaded] = useState(false);
  const { theme, themeLoaded } = useTheme();
  const setResults = usePortalStore((state: PortalMainStore) => state.setResults);
  const [showHelp, setShowHelp] = useState(false);

  const savePreferences = useCallback(() => {
    if (sessionDataLoaded) {
      const sessionData: SessionDataType = {
        accentColor,
        searchInstances,
        version,
        starredBlocks,
      };

      const instances = JSON.stringify(sessionData);

      CraftAPIHelper.saveToSession(LOCAL_STORAGE_KEY, instances);
    }
  }, [searchInstances, accentColor, starredBlocks]);

  const getDataFromStorage = useCallback(() => {
    const onExtensionLoaded = async () => {
      const response = await CraftAPIHelper.getFromSession(LOCAL_STORAGE_KEY);
      setSessionDataLoaded(true);
      if (response.status === 'success') {
        const data: SessionDataType = JSON.parse(response.data);
        const decoded: E.Either<T.Errors, SessionDataType> = SessionData.decode(data);
        if (data && E.isRight(decoded)) {
          setSearchInstances(data.searchInstances);
          setAccentColor(data.accentColor);
          setStarredBlocks(data.starredBlocks);
        }
      }
    };

    onExtensionLoaded();
  }, []);

  const getCurrentInstance = useCallback(
    () => searchInstances.filter((instance) => instance.instanceId === accentColor)[0],
    [searchInstances, accentColor],
  );

  const updateSearchResults = useCallback(() => {
    const getNewResults = async () => {
      const response = await getBlocks(new CraftAPIHelper(), getCurrentInstance().filters);
      setResults(response.blocks);
      setResultsExistAcrossMultipleBlocks(response.acrossMultipleBlocks);
    };

    getNewResults();
  }, [searchInstances, accentColor]);

  useEffect(() => {
    smoothscroll.polyfill();
    getDataFromStorage();
  }, []);

  useEffect(() => {
    updateSearchResults();
    savePreferences();
  }, [searchInstances, accentColor, starredBlocks]);

  const extensionContent = (
    <ThemeProvider theme={theme as Theme}>
      <GlobalStyles />
      <ExtensionContainer>
        <Header onHeaderClicked={(e) => {
          e.stopPropagation();
          setShowHelp((state) => !state);
        }}
        />
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
      </ExtensionContainer>
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
