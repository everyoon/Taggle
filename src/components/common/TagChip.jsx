import styled from 'styled-components';

const StyledTag = styled.button`
  ${({ theme }) => theme.typography.Label['EN-Large']};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]} 2px;
  border-radius: ${({ theme }) => theme.radius.full};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  border: none;

  background-color: ${({ theme, $active, $tag }) =>
    $active ? theme.colors.tag[$tag]?.bg || theme.colors.surface.secondary : '#EFEFEF'};

  color: ${({ theme, $active, $tag }) =>
    $active ? theme.colors.tag[$tag]?.text || theme.colors.text.primary : '#A0A0A0'};

  box-shadow: ${({ $active }) => ($active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none')};

  &:hover {
    background-color: ${({ theme, $tag }) => theme.colors.tag[$tag]?.bg || '#E5E5E5'};
    opacity: 0.8;
  }
`;

function TagChip({ children, $tag, $active, onClick, type = 'button', ...props }) {
  return (
    <StyledTag $tag={$tag} $active={$active} onClick={onClick} type={type} {...props}>
      {children}
    </StyledTag>
  );
}

export default TagChip;
