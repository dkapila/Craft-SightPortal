import React, {
  useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import withOpacity from '../../utils/colors';

const StyledInput = styled.input`
  padding: 0.5rem;
  font-size: .8125rem;
  border-radius: 3px;
  font-size: 14px;
  flex-grow: 1.1;
  max-width: 100%;
  font-weight: 400;
  color: rgb(31, 34, 37);
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  appearance: none;
  width: 100%;
  transition: background 300ms ease-in;
  color: ${(props) => props.theme.primaryTextColor};
  background: ${(props) => props.theme.primaryBackground};
  border: 1px solid ${(props) => props.theme.inputTextBorderColor};
  ::placeholder,
  ::-webkit-input-placeholder {
    color: ${(props) => props.theme.placeholderTextColor};
  }

  &:focus {
    outline: 2px solid transparent;
    border: 1px solid ${(props) => withOpacity(props.theme.accentColor, 40)};
  }
`;

const ControlledInput = (props: { value: string; onChange: any; placeholder: string }) => {
  const { value, onChange, placeholder } = props;
  const [cursor, setCursor] = useState<number | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const onInputUpdated = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCursor(e.target.selectionStart);
    const updatedString = e.currentTarget.value;
    setInputValue(updatedString);
    onChange(updatedString);
  }, [props]);

  useEffect(() => {
    const input = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, value]);

  return <StyledInput placeholder={placeholder} type="search" ref={ref} value={inputValue} onChange={onInputUpdated} />;
};

export default ControlledInput;
