import { useState } from 'react';
import styled from 'styled-components';
import { MdOutlineHome, MdOutlineGroups, MdPersonOutline, MdClose } from 'react-icons/md';
import { FaRegStar } from 'react-icons/fa';
import TeamAvatar from '../common/TeamAvatar'; // 기존에 있던 아바타 컴포넌트 활용

const BottomNav = ({ filter, onFilterChange, teams = [] }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleTeamClick = () => {
    if (teams.length > 0) {
      setIsSheetOpen(true);
    } else {
      onFilterChange('teams');
    }
  };

  const selectTeam = (teamId) => {
    onFilterChange(`team_${teamId}`);
    setIsSheetOpen(false);
  };

  return (
    <>
      <NavWrapper>
        <NavItem $active={filter === 'home'} onClick={() => onFilterChange('home')}>
          <MdOutlineHome size={24} />
          <span>Home</span>
        </NavItem>

        <NavItem $active={filter.includes('team')} onClick={handleTeamClick}>
          <MdOutlineGroups size={24} />
          <span>Teams</span>
        </NavItem>

        <NavItem $active={filter === 'private'} onClick={() => onFilterChange('private')}>
          <MdPersonOutline size={24} />
          <span>Private</span>
        </NavItem>

        <NavItem $active={filter === 'favorites'} onClick={() => onFilterChange('favorites')}>
          <FaRegStar size={20} />
          <span>Favorites</span>
        </NavItem>
      </NavWrapper>

      {isSheetOpen && (
        <>
          <Backdrop onClick={() => setIsSheetOpen(false)} />
          <Sheet>
            <SheetHeader>
              <SheetTitle>팀 선택</SheetTitle>
              <CloseButton onClick={() => setIsSheetOpen(false)}>
                <MdClose size={24} />
              </CloseButton>
            </SheetHeader>
            <TeamList>
              <TeamOption
                onClick={() => {
                  onFilterChange('teams');
                  setIsSheetOpen(false);
                }}
              >
                <AllTeamsIcon>
                  <MdOutlineGroups size={20} />
                </AllTeamsIcon>
                <span>모든 팀 북마크 보기</span>
              </TeamOption>
              {teams.map((team) => (
                <TeamOption key={team.id} onClick={() => selectTeam(team.id)}>
                  <TeamAvatar team={team} size={32} />
                  <span>{team.name}</span>
                </TeamOption>
              ))}
            </TeamList>
          </Sheet>
        </>
      )}
    </>
  );
};

const NavWrapper = styled.div`
  display: none;
  @media (max-width: 504px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 64px;
    background: ${({ theme }) => theme.colors.surface.primary};
    border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
    justify-content: space-around;
    align-items: center;
    z-index: 500;
    padding-bottom: env(safe-area-inset-bottom);
  }
`;

const NavItem = styled.button`
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: none;
  border: none;
  color: ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.text.contrast)};
  span {
    ${({ theme }) => theme.typography.Caption['KR']};
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.surface.modal_background};
  z-index: 510;
`;

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.radius[5]} ${({ theme }) => theme.radius[5]} 0 0;
  z-index: 520;
  padding: ${({ theme }) => theme.spacing[6]};
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const SheetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SheetTitle = styled.h3`
  ${({ theme }) => theme.typography.Title['KR-Medium']};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  max-height: 300px;
  overflow-y: auto;
`;

const TeamOption = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[3]};
  width: 100%;
  border-radius: ${({ theme }) => theme.radius[2]};
  transition: background 0.2s;

  span {
    ${({ theme }) => theme.typography.Label['KR-Medium']};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const AllTeamsIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default BottomNav;
