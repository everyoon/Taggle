import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ProfileModal from '../profile/ProfileModal';
import CreateTeamModal from '../team/CreateTeamModal';
import ManageTeamModal from '../team/ManageTeamModal';
import { useTeam } from '../../hooks/useTeam';
import { MdSearch, MdPersonOutline, MdOutlineGroupAdd, MdOutlineGroups, MdLogout } from 'react-icons/md';

function Header({ user, search, onSearch, onToggleTheme, isDark, onSignOut }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [manageTeamOpen, setManageTeamOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { teams, refetch: refetchTeams } = useTeam(user.id);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Wrap>
      <Logo>
        <img src="/favicon.svg" alt="Taggle 심볼" />
      </Logo>
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
      </SearchWrap>
      <Right>
        <Toggle onClick={onToggleTheme} $isDark={isDark}>
          <ToggleThumb $isDark={isDark} />
        </Toggle>
        <ProfileWrap ref={dropdownRef}>
          <Avatar src={user.user_metadata?.avatar_url} alt="" onClick={() => setDropdownOpen((prev) => !prev)} />
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
                  setProfileOpen(true);
                }}
              >
                <MdPersonOutline />
                프로필 관리
              </DropdownItem>
              <Divider />
              <DropdownItem
                onClick={() => {
                  setDropdownOpen(false);
                  setCreateTeamOpen(true);
                }}
              >
                <MdOutlineGroupAdd />팀 만들기
              </DropdownItem>
              <Divider />
              <DropdownItem
                onClick={() => {
                  setDropdownOpen(false);
                  setManageTeamOpen(true);
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
                <MdLogout />
                로그아웃
              </DropdownItem>
            </Dropdown>
          )}
        </ProfileWrap>
      </Right>
      {/* 모달들 */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onUpdated={() => window.location.reload()}
      />
      <CreateTeamModal
        open={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        userId={user.id}
        onCreated={() => refetchTeams()}
      />
      <ManageTeamModal
        open={manageTeamOpen}
        onClose={() => setManageTeamOpen(false)}
        userId={user.id}
        teams={teams}
        onTeamsUpdated={() => refetchTeams()}
      />
    </Wrap>
  );
}

const Wrap = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[8]};
  height: 88px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  box-shadow: ${({ theme }) => theme.shadows[1]};
`;

const Logo = styled.span`
  display: inline-block;
  margin-right: ${({ theme }) => theme.spacing[2]};
`;

const SearchWrap = styled.div`
  display: flex;
  width: 480px;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.contrast};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  transition: border-color ${({ theme }) => theme.transition.fast};
  gap: ${({ theme }) => theme.spacing[1]};
`;
const IconInner = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    fill: ${({ theme }) => theme.colors.icon.contrast};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => theme.typography.Body['KR-Small']}
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.contrast};
  }
`;

const Right = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const Toggle = styled.button`
  width: 64px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ $isDark }) => ($isDark ? '#222222' : '#FAFAFA')};
  position: relative;
  transition: background-color ${({ theme }) => theme.transition.normal};
  flex-shrink: 0;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#FAFAFA' : '#222222')};
  box-shadow: ${({ theme }) => theme.shadows[1]};
`;

const ToggleThumb = styled.div`
  position: absolute;
  top: 2px;
  left: ${({ $isDark }) => ($isDark ? '34px' : '2px')};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $isDark }) => ($isDark ? '#FAFAFA' : '#222222')};
  transition: left ${({ theme }) => theme.transition.normal};
`;

const ProfileWrap = styled.div`
  position: relative;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};

  &:hover {
    opacity: 0.85;
  }
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
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[4]};
`;

const UserAvatar = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const UserDetail = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const UserName = styled.span`
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.secondary};
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  color: ${({ theme, $danger }) => ($danger ? theme.colors.text.negative : theme.colors.text.primary)};
  transition: background-color ${({ theme }) => theme.transition.fast};
  text-align: left;
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
  &:focus {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
  svg {
    width: 20px;
    height: 20px;
    fill: ${({ theme, $danger }) => ($danger ? theme.colors.text.negative : theme.colors.text.primary)};
  }
`;

export default Header;
