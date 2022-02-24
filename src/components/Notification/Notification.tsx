import React, { useCallback } from 'react';
import styled from 'styled-components';
import {
  faWindowClose,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import usePortalStore from '../../store/store';
import withOpacity from '../../utils/colors';

const StyledFilterIconContainer = styled.div`
  align-items: center;
  display: flex;
  width: 30px;
  height: 28px;
  justify-content: center;
  border-radius: 5px;
`;

const StyledFilterIcon = styled(FontAwesomeIcon)`
  color: ${(props) => props.theme.iconColor};
  height: 14px;
  transition: color 200ms ease-in;
`;

const StyledLabelContainer = styled.div`
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  padding: 4px;
  border-radius: 3px;
  cursor: pointer;
  background: ${(props) => props.theme.secondaryBackground};
  transition: background 100ms ease-in;
  border: 1px solid ${(props) => props.theme.secondaryBackground};

  &:hover {
    background: ${(props) => withOpacity(props.theme.accentColor, 20)};
  }
`;

const StyledLabelFilter = styled.div`
  color: ${(props) => props.theme.primaryTextColor};
  font-size: 13px;
`;

const Notification = () => {
  const notificaiton = usePortalStore((state) => state.notificaiton);
  const clearNotification = usePortalStore((state) => state.clearNotification);

  const onNotificationClicked = useCallback(() => {
    clearNotification();
  }, []);

  return (
    <StyledLabelContainer onClick={() => onNotificationClicked()}>
      <StyledLabelFilter>
        { notificaiton.text }
      </StyledLabelFilter>
      <StyledFilterIconContainer>
        <StyledFilterIcon
          icon={faWindowClose}
        />
      </StyledFilterIconContainer>
    </StyledLabelContainer>
  );
};

export default Notification;
