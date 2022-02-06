import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { animated, useSpring } from '@react-spring/web';

import { FrequencyColumnNameType, FrequencyResult, PortalMainStore } from '../Types';
import usePortalStore from '../store/store';
import Switch from './Switch/Switch';
import getFrequencyData from '../search/frequencySearch';
import withOpacity from '../utils/colors';

const StyledRow = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  padding-top: 2px;
  padding-bottom: 2px;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.blockHoverBackground};
  }
`;

const StyledCell = styled.div`
  flex: 1;
`;

const StyledLabel = styled.div`
  font-size: 13px;
  color: ${(props) => props.theme.primaryTextColor};
  word-break: break-all;
  word-break: break-word;
  hyphens: auto;
  -webkit-hyphens: auto;
`;

const StyledHeaderRow = styled(StyledRow)`
  cursor: pointer;
  div {
    &:hover {
      color: ${(props) => withOpacity(props.theme.accentColor, 80)};
    }
  }

  &:hover {
    background: transparent;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const StyledContainer = styled(animated.div)`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const StyledLengthLabel = styled(StyledLabel)`
  text-align: start;
`;

const StyledFrequencyLabel = styled(StyledLabel)`
  text-align: start;
`;

const StyledHeaderCell = styled(StyledCell)``;

const StyledHeaderLabel = styled(StyledLabel)`
  color: ${(props) => props.theme.accentColor};
  font-size: 15px;
  padding-bottom: 5px;
  padding-top: 5px;
`;

const StyledWordCell = styled.div`
  flex: 1;
`;

const StyledFrequencyResultsContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

const StyledLengthCell = styled.div`
  flex: 1;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 50px;
`;

const StyledFrequencyCell = styled.div`
  flex: 1;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 45px;
`;

const StyledSortLabel = styled.div`
  text-align: start;
  transition: color 300ms ease-in;
  color: ${(props) => props.theme.accentColor};
`;

const FrequencyResults: React.FC = () => {
  const setTextFilter = usePortalStore((state: PortalMainStore) => state.setTextFilter);
  const blockResults = usePortalStore((state: PortalMainStore) => state.results);
  const searchInstances = usePortalStore((state: PortalMainStore) => state.searchInstances);
  const accentColor = usePortalStore((state: PortalMainStore) => state.accentColor);
  const setFrequencyFilter = usePortalStore((state: PortalMainStore) => state.setFrequencyFilter);
  const [frequencyData, setFrequencyData] = useState<FrequencyResult []>([]);
  const [props] = useSpring(() => ({
    from: { opacity: 0 },
    opacity: 1,
    config: { duration: 400 },
  }));

  const getCurrentInstance = useCallback(() => searchInstances.filter((instance) => instance
    .instanceId === accentColor)[0], [searchInstances, accentColor]);

  useEffect(() => {
    const { frequencyFilter } = getCurrentInstance().filters;

    const results = getFrequencyData(blockResults, frequencyFilter);
    setFrequencyData(results);
  }, [blockResults, searchInstances, accentColor]);

  const onRowClicked = useCallback((item: FrequencyResult) => {
    const { textFilter } = getCurrentInstance().filters;
    let updatedText = item.word;
    if (textFilter) {
      updatedText = `${textFilter.text} ${updatedText}`;
    }

    setTextFilter(getCurrentInstance().instanceId, { filterApplied: true, text: updatedText });
  }, [searchInstances, accentColor]);

  const getSortValue = useCallback((columnType: FrequencyColumnNameType) => {
    const { frequencyColumns } = getCurrentInstance().filters.frequencyFilter;
    const sortType = frequencyColumns.find((item) => item.type === columnType)?.sortOrder;

    switch (sortType) {
      case 'Ascending': {
        return '▲';
        break;
      }
      case 'Descending': {
        return '▼';
      }
      case 'None': {
        return '-';
      }
      default: {
        return '-';
      }
    }
  }, [searchInstances, accentColor]);

  const onColumnClicked = useCallback((columnType: FrequencyColumnNameType) => {
    let { frequencyColumns } = getCurrentInstance().filters.frequencyFilter;
    const { includeSubPages } = getCurrentInstance().filters.frequencyFilter;
    const { includeStopWords } = getCurrentInstance().filters.frequencyFilter;

    const clickedFilter = frequencyColumns.find((item) => item.type === columnType);
    if (!clickedFilter) {
      return;
    }

    if (clickedFilter.sortOrder === 'None') {
      clickedFilter.sortOrder = 'Ascending';
    } else if (clickedFilter.sortOrder === 'Ascending') {
      clickedFilter.sortOrder = 'Descending';
    } else {
      clickedFilter.sortOrder = 'None';
    }

    frequencyColumns = frequencyColumns.filter((item) => item.type !== columnType);
    frequencyColumns.push(clickedFilter);
    setFrequencyFilter(
      getCurrentInstance().instanceId,
      { includeSubPages, includeStopWords, frequencyColumns },
    );
  }, [searchInstances, accentColor]);

  const onIncludeStopwordsSwitchToggled = useCallback((isEnabled: boolean) => {
    const { frequencyFilter } = getCurrentInstance().filters;
    frequencyFilter.includeStopWords = isEnabled;

    setFrequencyFilter(getCurrentInstance().instanceId, frequencyFilter);
  }, [searchInstances, accentColor]);

  const onIncludeSubpagesSwitchToggled = useCallback((isEnabled: boolean) => {
    const { frequencyFilter } = getCurrentInstance().filters;
    frequencyFilter.includeSubPages = isEnabled;

    setFrequencyFilter(getCurrentInstance().instanceId, frequencyFilter);
  }, [searchInstances, accentColor]);

  return (
    <StyledContainer style={props}>
      <StyledHeader>
        <Switch
          enabled={getCurrentInstance().filters.frequencyFilter.includeStopWords}
          onToggled={(isEnabled) => { onIncludeStopwordsSwitchToggled(isEnabled); }}
          label="Include Common Words"
        />
        <Switch
          enabled={getCurrentInstance().filters.frequencyFilter.includeSubPages}
          onToggled={(isEnabled) => { onIncludeSubpagesSwitchToggled(isEnabled); }}
          label="Include Subpages"
        />
        <StyledHeaderRow>
          <StyledHeaderCell onClick={() => onColumnClicked('word')}>
            <StyledHeaderLabel>Word</StyledHeaderLabel>
            <StyledSortLabel>{ getSortValue('word') }</StyledSortLabel>
          </StyledHeaderCell>
          <StyledFrequencyCell onClick={() => onColumnClicked('frequency')}>
            <StyledHeaderLabel>Count</StyledHeaderLabel>
            <StyledSortLabel>{ getSortValue('frequency') }</StyledSortLabel>
          </StyledFrequencyCell>
          <StyledLengthCell onClick={() => onColumnClicked('length')}>
            <StyledHeaderLabel>Length</StyledHeaderLabel>
            <StyledSortLabel>{ getSortValue('length') }</StyledSortLabel>
          </StyledLengthCell>
        </StyledHeaderRow>
      </StyledHeader>
      <StyledFrequencyResultsContainer>
        {
        frequencyData.map((item: FrequencyResult) => (
          <StyledRow key={item.id} onClick={() => onRowClicked(item)}>
            <StyledWordCell>
              <StyledLabel>{item.word}</StyledLabel>
            </StyledWordCell>
            <StyledFrequencyCell>
              <StyledFrequencyLabel>{item.frequency}</StyledFrequencyLabel>
            </StyledFrequencyCell>
            <StyledLengthCell>
              <StyledLengthLabel>{item.length}</StyledLengthLabel>
            </StyledLengthCell>
          </StyledRow>
        ))
      }
      </StyledFrequencyResultsContainer>
    </StyledContainer>
  );
};

export default FrequencyResults;
