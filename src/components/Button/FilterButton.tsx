import React from 'react';
import styled from 'styled-components';

import usePortalStore from '../../store/store';
import withOpacity from '../../utils/colors';

type IProps = {
  isActive?: boolean;
  isWeb: boolean
};

const StyledFilterButton = styled.div<IProps>`
  width: 100%;
  justify-content: center;
  display: flex;
  padding: 4px;
  border-radius: 3px;
  color: ${(props) => props.theme.primaryTextColor};
  cursor: ${(props) => (props.isWeb ? 'pointer' : 'default')};
  background: ${(props) => props.theme.secondaryBackground};
  transition: background 100ms ease-in;
  border: 1px solid ${(props) => props.theme.secondaryBackground};

  &:hover {
    background: ${(props) => withOpacity(props.theme.accentColor, 20)};
  }

  ${({ isActive, theme }) => isActive && `
    background: ${withOpacity(theme.accentColor, 40)};
    border: 1px solid ${theme.accentColor};
  `}
`;

const StyledLabelFilter = styled.div`
  font-size: 15px;
`;

type FilterButtonProps = {
  isActive: boolean
  label: string,
  onClick: (e: any) => void,
};

const FilterButton = ({
  isActive,
  label,
  onClick,
}: FilterButtonProps) => {
  const platformType = usePortalStore((state) => state.platformType);
  return (
    <StyledFilterButton isWeb={platformType === 'Web'} isActive={isActive} onClick={(e) => { onClick(e); }}>
      <StyledLabelFilter>
        { label }
      </StyledLabelFilter>
    </StyledFilterButton>
  );
};

export default FilterButton;
