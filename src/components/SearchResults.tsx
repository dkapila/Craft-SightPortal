import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import styled from 'styled-components';
import { animated, useSpring } from '@react-spring/web';

import {
  PortalMainStore,
  PortalResultBlock,
} from '../Types';

import usePortalStore from '../store/store';
import ResultList from './List/ResultList';
import ScrollToTopButton from './Button/ScrollToTopButton';
import withOpacity from '../utils/colors';
import { applyFilters } from '../search/blockSearch';

const StyledResultsContainer = styled.div`
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  box-shadow: 0 0 rgba(0,0,0,0), 0 0 rgba(0,0,0,0), var(--tw-shadow);
  padding: 7px;
  margin-bottom: 8px;
  border-radius: 5px;
  background: transparent;
`;

const StyledTextSpan = styled.div`
  font-size: 13px;
  transition: color 600ms ease-in;
  text-overflow: ellipsis;
  overflow-x: auto;
  font-style: italic;
  line-height: 1.7;
  color: ${(props) => props.theme.disabledTextColor};
`;

const StyledScrollToTopButtonContainer = styled(animated.div)`
  position: fixed;
  backdrop-filter: blur(6px);
  bottom: 15px;
  right: 15px;
  background: #e7e7e7;
  opacity: 0.8;
  border-radius: 50px;
  transform: scale(0.75);
  background: ${(props) => withOpacity(props.theme.accentColor, 20)};

  &:hover {
    background: ${(props) => withOpacity(props.theme.accentColor, 40)};
  }
`;

const StyledContainer = styled(animated.div)`
  overflow-x: hidden;
`;

const SearchResults = () => {
  const blockResults = usePortalStore((state: PortalMainStore) => state.results);
  const starredBlocks = usePortalStore((state: PortalMainStore) => state.starredBlocks);
  const [starredResultBlocks, setStarredResultBlocks] = useState<PortalResultBlock[]>([]);
  const setRefreshResultsPending = usePortalStore((state) => state.setRefreshResultsPending);
  const searchPreferences = usePortalStore((state: PortalMainStore) => state.searchPreferences);
  const [currentPageResults, setCurrentPageResults] = useState<PortalResultBlock []>([]);
  const [subPageResults, setSubPageResults] = useState<PortalResultBlock []>([]);
  const searchInstances = usePortalStore((state: PortalMainStore) => state.searchInstances);
  const accentColor = usePortalStore((state: PortalMainStore) => state.accentColor);
  const node = useRef<HTMLDivElement>(null);
  const platformType = usePortalStore((state: PortalMainStore) => state.platformType);
  const resultsAcrossBlocks = usePortalStore((state: PortalMainStore) => state.resultsAcrossBlocks);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const setShowMainPageResults = usePortalStore(
    (state: PortalMainStore) => state.setShowMainPageResults,
  );

  const setShowSubPageResults = usePortalStore(
    (state: PortalMainStore) => state.setShowSubpageResults,
  );

  const setShowStarredBlockResults = usePortalStore(
    (state: PortalMainStore) => state.setShowStarredBlockResults,
  );

  const getCurrentInstance = useCallback(
    () => searchInstances.filter((instance) => instance.instanceId === accentColor)[0],
    [searchInstances, accentColor],
  );

  const onScrollTopButtonClicked = () => {
    if (node !== null && node.current !== null) {
      node.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onListScrolled = useCallback((e: React.UIEvent<HTMLElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setShowScrollToTopButton(true);
    } else {
      setShowScrollToTopButton(false);
    }
  }, []);

  useEffect(() => {
    setStarredResultBlocks(applyFilters(starredBlocks, getCurrentInstance().filters).blocks);
  }, [starredBlocks, searchInstances, accentColor]);

  useEffect(() => {
    setRefreshResultsPending(false);
    setCurrentPageResults([]);
    setSubPageResults([]);

    const currentPage = blockResults.filter((result) => result.level <= 1);
    const subPage = blockResults.filter((result) => result.level > 1);

    setCurrentPageResults(currentPage);
    setSubPageResults(subPage);
  }, [blockResults]);

  const [scrollButtonProps] = useSpring(() => ({
    from: { opacity: 0 },
    opacity: 1,
    config: { duration: 200 },
  }));

  const [props] = useSpring(() => ({
    from: { opacity: 0 },
    opacity: 1,
    config: { duration: 200 },
  }));

  return (
    <StyledContainer onScroll={(e) => onListScrolled(e)} ref={node} style={props}>
      <div>
        {
          (starredResultBlocks.length === 0)
          && (currentPageResults.length === 0)
          && (subPageResults.length === 0) && (
            <StyledResultsContainer>
              <StyledTextSpan>
                No Results :(
              </StyledTextSpan>
            </StyledResultsContainer>
          )
        }
        {
          (resultsAcrossBlocks) && (
            <StyledResultsContainer>
              <StyledTextSpan>
                <b>Note</b>
                : All words from this phrase exists in this page, but not in a single block.
                The following blocks contain words from this phrase.
              </StyledTextSpan>
            </StyledResultsContainer>
          )
        }
        {
          starredResultBlocks.length > 0 && (
          <ResultList
            results={starredResultBlocks}
            listHeader="In Saved Blocks"
            showResults={searchPreferences.showStarredBlockResults}
            onHeaderClicked={() => {
              setShowStarredBlockResults(!searchPreferences.showStarredBlockResults);
            }}
          />
          )
        }
        {
          currentPageResults.length > 0 && (
            <ResultList
              results={currentPageResults}
              listHeader="In current page"
              showResults={searchPreferences.showMainPageResults}
              onHeaderClicked={() => {
                setShowMainPageResults(!searchPreferences.showMainPageResults);
              }}
            />
          )
        }
        {
          subPageResults.length > 0 && (
            <ResultList
              results={subPageResults}
              listHeader="In subpages"
              showResults={searchPreferences.showSubPageResults}
              onHeaderClicked={() => {
                setShowSubPageResults(!searchPreferences.showSubPageResults);
              }}
            />
          )
        }
        {
        (showScrollToTopButton && platformType === 'Mac') && (
          <StyledScrollToTopButtonContainer style={scrollButtonProps}>
            <ScrollToTopButton onClick={() => onScrollTopButtonClicked()} />
          </StyledScrollToTopButtonContainer>
        )
      }
      </div>
    </StyledContainer>
  );
};

export default SearchResults;
