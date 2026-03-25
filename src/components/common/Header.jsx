import styled from 'styled-components';
import { tokens } from '../../styles/theme';

function Header({ user, team, search, onSearch, onSignOut, onToggleTheme, isDark }) {
  return (
    <Wrap>
      <Logo>Taggle</Logo>
      <SearchInput
        type="text"
        placeholder="제목, 설명, 태그 검색..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <Right>
        <InviteCode onClick={() => navigator.clipboard.writeText(team.invite_code)}>
          코드 복사 · {team.invite_code}
        </InviteCode>
        <ThemeButton onClick={onToggleTheme}>{isDark ? '☀️' : '🌙'}</ThemeButton>
        <Avatar src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
        <SignOutButton onClick={onSignOut}>로그아웃</SignOutButton>
      </Right>
    </Wrap>
  );
}

const Wrap = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[16]};
  padding: 0 ${tokens.spacing[24]};
  height: 56px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const Logo = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.5px;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  max-width: 400px;
  height: 36px;
  padding: 0 ${tokens.spacing[12]};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  transition: border-color ${tokens.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.contrast};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const Right = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[12]};
`;

const InviteCode = styled.button`
  color: ${({ theme }) => theme.colors.text.contrast};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: 4px ${tokens.spacing[10]};
  border-radius: ${tokens.radius.full};
  transition: all ${tokens.transition.fast};
  letter-spacing: 0.05em;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.strong};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ThemeButton = styled.button`
  font-size: 18px;
  line-height: 1;
  padding: ${tokens.spacing[4]};
  border-radius: ${tokens.radius.sm};
  transition: background-color ${tokens.transition.fast};

  &:hover {
  }
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: ${tokens.radius.full};
  object-fit: cover;
`;

const SignOutButton = styled.button`
  color: ${({ theme }) => theme.colors.text.contrast};
  padding: ${tokens.spacing[4]} ${tokens.spacing[8]};
  border-radius: ${tokens.radius.sm};
  transition:
    color ${tokens.transition.fast},
    background-color ${tokens.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export default Header;
