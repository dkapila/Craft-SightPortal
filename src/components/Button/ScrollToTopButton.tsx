import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import usePortalStore from '../../store/store';

type IProps = {
  isWeb: boolean,
};

const StyledFilterIconContainer = styled.div<IProps>`
  align-items: center;
  cursor: ${(props) => (props.isWeb ? 'pointer' : 'default')};
  display: flex;
  width: 40px;
  height: 40px;
  justify-content: center;
`;

const StyledFilterIcon = styled(FontAwesomeIcon)`
  color: ${(props) => props.theme.accentColor};
  width: 19px;
`;

type ButtonProps = {
  onClick: () => void,
};

const ScrollToTopButton = ({ onClick }: ButtonProps) => {
  const platformType = usePortalStore((state) => state.platformType);

  return (
    <StyledFilterIconContainer isWeb={platformType === 'Web'} onClick={() => onClick()}>
      <StyledFilterIcon icon={faArrowUp} />
    </StyledFilterIconContainer>
  );
};

export default ScrollToTopButton;
