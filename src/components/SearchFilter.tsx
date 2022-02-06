import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { faRedo, faTable } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FilterButton from './Button/FilterButton';
import FilterTextBox from './TextBox/FilterTextBox';
import usePortalStore from '../store/store';
import { ActiveViewType, PortalMainStore } from '../Types';

const StyledSearchFilter = styled.div`
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
`;

const StyledFilterParentOptions = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  padding-top: 2px;
  gap: 2px;
  padding-bottom: 5px;
`;

export const StyledIcon = styled(FontAwesomeIcon)`
  color: ${(props) => props.theme.iconColor};
  width: 19px;
  transition: color 200ms ease-in;
`;

const StyledFilterTextBox = styled(FilterTextBox)`
  flex-grow: 1.1;
`;

const StyledFilterTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const StyledFilterIcon = styled(FontAwesomeIcon)<FilterIconProps>`
  color: ${(props) => props.theme.iconColor};
  height: 14px;
  transition: color 200ms ease-in;

  ${({ $isActive, theme }) => $isActive && `
    height: 16px;
    color: ${theme.invertedPrimaryTextColor};
  `}
`;

type FilterIconProps = {
  $isWeb: boolean;
  $isActive: boolean,
};

const StyledFilterIconContainer = styled.div<FilterIconProps>`
  align-items: center;
  cursor: ${(props) => (props.$isWeb ? 'pointer' : 'default')};
  display: flex;
  width: 30px;
  height: 28px;
  justify-content: center;
  margin-bottom: 5px;
  border-radius: 5px;
  transition: background 300ms ease-in;

  &:hover {
    background: ${(props) => props.theme.blockHoverBackground};
  }

  ${({ $isActive, theme }) => $isActive && `
    background: ${theme.invertedPrimaryBackground};

    &:hover {
      background: ${theme.invertedPrimaryBackground};
    }
  `}
`;

type SearchFilterProps = {
  onRefreshButtonClicked: () => void
};

const SearchFilter = ({ onRefreshButtonClicked }: SearchFilterProps) => {
  const refreshResultsPending = usePortalStore((state) => state.refreshResultsPending);
  const platformType = usePortalStore((state) => state.platformType);
  const searchPreferences = usePortalStore((state: PortalMainStore) => state.searchPreferences);
  const searchInstances = usePortalStore((state: PortalMainStore) => state.searchInstances);
  const accentColor = usePortalStore((state: PortalMainStore) => state.accentColor);
  const setTextFilter = usePortalStore((state: PortalMainStore) => state.setTextFilter);
  const setTaskFilter = usePortalStore((state: PortalMainStore) => state.setTaskFilter);
  const setHeaderFilter = usePortalStore((state: PortalMainStore) => state.setHeaderFilter);
  const setLinkFilter = usePortalStore((state: PortalMainStore) => state.setLinkFilter);
  const [filterText, setFilterText] = useState('');
  const setFilterType = usePortalStore((state: PortalMainStore) => state.setFilterType);
  const setView = usePortalStore((state: PortalMainStore) => state.setView);

  const getCurrentInstance = useCallback(() => searchInstances.filter((instance) => instance
    .instanceId === accentColor)[0], [searchInstances, accentColor]);

  const onFilterTextChanged = useCallback((newString: string) => {
    const updateText = newString;
    const instance = getCurrentInstance();
    setTextFilter(instance.instanceId, { filterApplied: true, text: updateText });
  }, [searchInstances, accentColor]);

  const resetFilters = useCallback(() => {
    const instance = getCurrentInstance();
    setLinkFilter(instance.instanceId, {
      filterApplied: false,
      showExternalLinks: false,
      showInternalLinks: false,
    });

    setTaskFilter(instance.instanceId, {
      filterApplied: false,
      showTaskBlocks: false,
      showDoneBlocks: false,
      showCancelledBlocks: false,
    });

    setHeaderFilter(instance.instanceId, {
      filterApplied: false,
      showHeaderBlocks: false,
    });

    setFilterType(instance.instanceId, 'All');
  }, [searchInstances, searchPreferences, accentColor]);

  const showLinkedFilters = useCallback(() => {
    const instance = getCurrentInstance();
    resetFilters();

    setLinkFilter(instance.instanceId, {
      filterApplied: true,
      showExternalLinks: true,
      showInternalLinks: true,
    });

    setFilterType(instance.instanceId, 'Links');
  }, [searchPreferences, searchInstances, accentColor]);

  const showHeaderFilters = useCallback(() => {
    const instance = getCurrentInstance();
    resetFilters();

    setHeaderFilter(instance.instanceId, {
      filterApplied: true,
      showHeaderBlocks: true,
    });

    setFilterType(instance.instanceId, 'Headers');
  }, [searchPreferences, searchInstances, accentColor]);

  const onTableViewClicked = useCallback(() => {
    const newView : ActiveViewType = getCurrentInstance().filters.activeViewType === 'SearchView' ? 'FrequencyView' : 'SearchView';
    setView(getCurrentInstance().instanceId, newView);
  }, [searchInstances, accentColor]);

  const showTaskFilters = useCallback(() => {
    const instance = getCurrentInstance();
    resetFilters();

    setTaskFilter(instance.instanceId, {
      filterApplied: true,
      showTaskBlocks: true,
      showDoneBlocks: true,
      showCancelledBlocks: true,
    });

    setFilterType(instance.instanceId, 'Tasks');
  }, [searchPreferences, searchInstances, accentColor]);

  const getFilterText = useCallback(() => {
    const currentInstance = getCurrentInstance();
    if (currentInstance.filters.textFilter?.text) {
      setFilterText(currentInstance.filters.textFilter.text);
      return;
    }

    setFilterText('');
  }, [searchInstances, accentColor]);

  useEffect(() => {
    getFilterText();
  }, [searchInstances, accentColor]);

  return (
    <StyledSearchFilter>
      <StyledFilterTextContainer>
        <StyledFilterTextBox
          refreshIcon={faRedo}
          showRefreshPending={refreshResultsPending}
          textValue={filterText}
          onRefreshIconClick={() => onRefreshButtonClicked()}
          onTextChange={(newString) => onFilterTextChanged(newString)}
          placeHolder="Filter Results"
        />
        <StyledFilterIconContainer $isActive={getCurrentInstance().filters.activeViewType === 'FrequencyView'} $isWeb={platformType === 'Web'} onClick={() => onTableViewClicked()}>
          <StyledFilterIcon
            $isActive={getCurrentInstance().filters.activeViewType === 'FrequencyView'}
            $isWeb={platformType === 'Web'}
            icon={faTable}
          />
        </StyledFilterIconContainer>
      </StyledFilterTextContainer>
      <StyledFilterParentOptions>
        <FilterButton isActive={getCurrentInstance().filters.activeSearchViewType === 'All'} onClick={() => { resetFilters(); }} label="All" />
        <FilterButton isActive={getCurrentInstance().filters.activeSearchViewType === 'Links'} onClick={() => { showLinkedFilters(); }} label="Links" />
        <FilterButton isActive={getCurrentInstance().filters.activeSearchViewType === 'Tasks'} onClick={() => { showTaskFilters(); }} label="Tasks" />
        <FilterButton isActive={getCurrentInstance().filters.activeSearchViewType === 'Headers'} onClick={() => { showHeaderFilters(); }} label="Headers" />
      </StyledFilterParentOptions>
    </StyledSearchFilter>
  );
};

export default SearchFilter;
