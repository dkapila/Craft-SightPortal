import { IconDefinition, text } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';

import usePortalStore from '../../store/store';
import withOpacity from '../../utils/colors';
import ControlledInput from './ControlledInput';

type IProps = {
  $showRefreshPending: boolean
};

const StyledFilterTextBoxContainer = styled.div`
  display: flex;
  flex-grow: 1.1;
  align-items: center;
  flex-direction: row;
  position: relative;
  padding-bottom: 5px;
  gap: 5px;
  height: 36px;
`;

export const StyledFilterIcon = styled(FontAwesomeIcon)<IProps>`
  color: ${(props) => props.theme.iconColor};
  height 14px;
  transition: color 200ms ease-in;

  ${({ $showRefreshPending, theme }) => $showRefreshPending && `
    color: ${withOpacity(theme.accentColor, 70)};
  `}
`;

type FilterIconProps = {
  isWeb: boolean;
};

const StyledFilterIconContainer = styled.div<FilterIconProps>`
  align-items: center;
  cursor: ${(props) => (props.isWeb ? 'pointer' : 'default')};
  display: flex;
  width: 30px;
  height:28px;
  justify-content: center;
  border-radius: 5px;

  &:hover {
    background: ${(props) => props.theme.blockHoverBackground};
  }
`;

type FilterTextProps = {
  textValue: string,
  refreshIcon: IconDefinition,
  showRefreshPending: boolean
  onRefreshIconClick: () => void,
  onTextChange: (newString: string) => void,
  placeHolder: string
};

const FilterTextBox = ({
  refreshIcon,
  textValue,
  showRefreshPending,
  onRefreshIconClick,
  onTextChange,
  placeHolder,
} : FilterTextProps) => {
  const platformType = usePortalStore((state) => state.platformType);
  const accentColor = usePortalStore((state) => state.accentColor);
  const debouncedCallback = useCallback(debounce(onTextChange, 100), [accentColor, textValue]);

  useEffect(() => () => {
    debouncedCallback.cancel();
  }, []);

  const onInputUpdated = useCallback((newString: string) => {
    debouncedCallback(newString);
  }, [accentColor, text]);

  return (
    <StyledFilterTextBoxContainer>
      <ControlledInput onChange={onInputUpdated} value={textValue} placeholder={placeHolder} />
      <StyledFilterIconContainer isWeb={platformType === 'Web'} onClick={() => onRefreshIconClick()}>
        <StyledFilterIcon
          $showRefreshPending={showRefreshPending}
          icon={refreshIcon}
        />
      </StyledFilterIconContainer>
    </StyledFilterTextBoxContainer>
  );
};

export default FilterTextBox;
