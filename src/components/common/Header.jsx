import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { MdSearch, MdPersonOutline, MdOutlineGroupAdd, MdOutlineGroups, MdLogout, MdClose } from 'react-icons/md';

function Header({
  user,
  search,
  onSearch,
  onToggleTheme,
  isDark,
  onSignOut,
  onOpenProfile,
  onOpenCreateTeam,
  onOpenManageTeam,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Wrap>
      <Logo>
        <img src="/favicon.svg" alt="Taggle 심볼" />
      </Logo>

      {user && (
        <SearchWrap>
          <IconInner>
            <MdSearch />
          </IconInner>
          <SearchInput
            type="text"
            placeholder="사이트, 설명, 태그를 검색하세요."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <ClearSearchButton onClick={() => onSearch('')} title="검색어 지우기">
              <MdClose />
            </ClearSearchButton>
          )}
        </SearchWrap>
      )}

      <Right>
        <Toggle onClick={onToggleTheme} $isDark={isDark}>
          <ToggleThumb $isDark={isDark} />
        </Toggle>

        {user && (
          <ProfileWrap ref={dropdownRef}>
            <Avatar
              src={user.user_metadata?.avatar_url}
              alt="프로필"
              onClick={() => setDropdownOpen((prev) => !prev)}
            />

            {dropdownOpen && (
              <Dropdown>
                <UserInfo>
                  <UserAvatar src={user.user_metadata?.avatar_url} alt="" />
                  <UserDetail>
                    <UserName>{user.user_metadata?.full_name}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </UserDetail>
                </UserInfo>
                <Divider />
                <DropdownItem
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenProfile();
                  }}
                >
                  <MdPersonOutline /> 프로필 관리
                </DropdownItem>
                <Divider />
                <DropdownItem
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenCreateTeam();
                  }}
                >
                  <MdOutlineGroupAdd />팀 만들기
                </DropdownItem>
                <Divider />
                <DropdownItem
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenManageTeam();
                  }}
                >
                  <MdOutlineGroups />팀 관리
                </DropdownItem>
                <Divider />
                <DropdownItem
                  $danger
                  onClick={() => {
                    setDropdownOpen(false);
                    onSignOut();
                  }}
                >
                  <MdLogout /> 로그아웃
                </DropdownItem>
              </Dropdown>
            )}
          </ProfileWrap>
        )}
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
  padding: 0 ${({ theme }) => theme.spacing[8]};
  height: 88px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  box-shadow: ${({ theme }) => theme.shadows[1]};
  gap: ${({ theme }) => theme.spacing[6]};

  @media (max-width: 504px) {
    flex-wrap: wrap;
    height: auto;
    padding: ${({ theme }) => theme.spacing[4]};
    gap: ${({ theme }) => theme.spacing[4]};
  }
`;

const Logo = styled.span`
  flex-shrink: 0;
  img {
    width: 32px;
    height: 32px;
  }

  @media (max-width: 504px) {
    order: 1;
  }
`;

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 480px;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.contrast};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  gap: ${({ theme }) => theme.spacing[1]};

  @media (max-width: 504px) {
    order: 3;
    width: 100%;
    max-width: none;
    flex: none;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-left: auto;

  @media (max-width: 504px) {
    order: 2;
    margin-left: auto;
    gap: ${({ theme }) => theme.spacing[2]};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => theme.typography.Body['KR-Small']}
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.contrast};
  }
`;

const IconInner = styled.div`
  display: flex;
  align-items: center;
  svg {
    fill: ${({ theme }) => theme.colors.icon.contrast};
    font-size: 20px;
  }
`;

const ClearSearchButton = styled.button`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.contrast};
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Toggle = styled.button`
  width: 64px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ $isDark }) => ($isDark ? '#222222' : '#FAFAFA')};
  position: relative;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#FAFAFA' : '#222222')};
  @media (max-width: 504px) {
    width: 52px;
    height: 26px;
  }
`;

const ToggleThumb = styled.div`
  position: absolute;
  top: 2px;
  left: ${({ $isDark }) => ($isDark ? '34px' : '2px')};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $isDark }) => ($isDark ? '#FAFAFA' : '#222222')};
  transition: left 0.2s;
  @media (max-width: 504px) {
    width: 18px;
    height: 18px;
    left: ${({ $isDark }) => ($isDark ? '28px' : '2px')};
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  @media (max-width: 504px) {
    width: 32px;
    height: 32px;
  }
`;

const ProfileWrap = styled.div`
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.radius[2]};
  box-shadow: ${({ theme }) => theme.shadows[2]};
  overflow: hidden;
  z-index: 200;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
`;

const UserAvatar = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
`;

const UserDetail = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const UserName = styled.span`
  ${({ theme }) => theme.typography.Label['KR-Midium']} color: ${({ theme }) => theme.colors.text.primary};
`;

const UserEmail = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']} color: ${({ theme }) => theme.colors.text.contrast};
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.secondary};
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  color: ${({ theme, $danger }) => ($danger ? theme.colors.text.negative : theme.colors.text.primary)};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
  svg {
    width: 20px;
    height: 20px;
  }
`;

export default Header;
