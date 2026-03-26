import styled, { css } from 'styled-components';

const Button = styled.button`
  ${({ theme }) => theme.typography.Label['KR-Large']};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  transition: all 0.2s ease;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: ${({ theme }) => theme.colors.button.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows[1]};
  svg {
    font-size: 24px;
    color: inherit;
  }

  ${({ $invert }) =>
    $invert &&
    css`
      background-color: ${({ theme }) => theme.colors.button.invert};
      color: ${({ theme }) => theme.colors.text.invert};
      border: 1px solid transparent;
      &:hover {
        background-color: ${({ theme }) => theme.colors.button.hover};
      }
    `}

  ${({ $active }) =>
    $active &&
    css`
      background-color: ${({ theme }) => theme.colors.button.hover};
      color: ${({ theme }) => theme.colors.text.invert};
      border: 1px solid transparent;
    `}

  &:disabled {
    background-color: ${({ theme }) => theme.colors.button.disabled};
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: not-allowed;
    border: 1px solid transparent;
  }

  /* Hover & Focus */
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.button.hover};
    color: ${({ theme }) => theme.colors.text.invert};
    border: 1px solid transparent;
  }

  &:focus {
    background-color: ${({ theme }) => theme.colors.button.hover};
    color: ${({ theme }) => theme.colors.text.invert};
    border: 1px solid transparent;
  }
`;

export default Button;
