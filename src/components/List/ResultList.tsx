import React, { useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import {
  PortalLinkResult,
  PortalResultBlock,
  PortalTextResult,
  PortalMainStore,
} from '../../Types';

import LinkResultBlock from '../Block/LinkResultBlock';
import TextResultBlock from '../Block/TextResultBlock';
import usePortalStore from '../../store/store';
import TaskResultsBlock from '../Block/TaskResultBlock';

type SectionHeaderProps = {
  isWeb: boolean;
};

const StyledSectionHeaderDiv = styled.div<SectionHeaderProps>`
  padding-left: 1;
  cursor: ${(props) => (props.isWeb ? 'pointer' : 'default')};
  border: 0px;
  color: ${(props) => props.theme.accentColor};
  font-size: 14px;
  background: transparent;
  transition: all 300ms ease-in;
  padding-top: 7px;
  padding-bottom: 7px;
  padding-left: 5px;
  font-weight: 600;
  text-overflow: ellipsis;
  overflow-x: auto;

  &:hover {
    background: ${(props) => props.theme.blockHoverBackground};
  }
`;

const StyledBlockResultList = styled.div``;

type ResultListProps = {
  results: PortalResultBlock[],
  listHeader: string,
  showResults: boolean,
  onHeaderClicked: () => void,
};

const ResultList = ({
  results,
  listHeader,
  showResults,
  onHeaderClicked,
}: ResultListProps) => {
  const searchInstances = usePortalStore((state: PortalMainStore) => state.searchInstances);
  const accentColor = usePortalStore((state: PortalMainStore) => state.accentColor);
  const platformType = usePortalStore((state) => state.platformType);
  const getCurrentInstance = useCallback(() => searchInstances.filter((instance) => instance
    .instanceId === accentColor)[0], [searchInstances, accentColor]);

  return (
    <>
      <StyledSectionHeaderDiv
        isWeb={platformType === 'Web'}
        onClick={onHeaderClicked}
      >
        { listHeader }
      </StyledSectionHeaderDiv>
      <CSSTransition
        in={showResults}
        timeout={300}
        classNames="portal-card-settings"
        unmountOnExit
      >
        <StyledBlockResultList>
          {
          [...results]
            .map((result: PortalResultBlock) => (
              ((result as PortalTextResult).type === 'PortalTextResult') && (getCurrentInstance().filters.activeSearchViewType === 'All') && (
              <TextResultBlock
                enableDynamicTextSize={false}
                blockResult={result as PortalTextResult}
                key={result.id}
              />
              )) || (
              ((result as PortalTextResult).type === 'PortalTextResult') && (getCurrentInstance().filters.activeSearchViewType === 'Tasks') && (
              <TaskResultsBlock blockResult={result as PortalTextResult} key={result.id} />
              )) || (
              ((result as PortalTextResult).type === 'PortalTextResult') && (getCurrentInstance().filters.activeSearchViewType === 'Headers') && (
                <TextResultBlock
                  enableDynamicTextSize
                  blockResult={result as PortalTextResult}
                  key={result.id}
                />
              ))
            || (((result as PortalLinkResult).type === 'PortalLinkResult') && (getCurrentInstance().filters.activeSearchViewType === 'Links') && (
              <div>
                <LinkResultBlock blockResult={result as PortalLinkResult} key={result.id} />
              </div>
            )))
        }
        </StyledBlockResultList>
      </CSSTransition>
    </>
  );
};

export default ResultList;
