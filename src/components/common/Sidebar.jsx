import { useState } from 'react';
import styled from 'styled-components';
import { MdOutlineHome, MdOutlineGroups, MdPersonOutline, MdArrowDropDown } from 'react-icons/md';
import { FaRegStar } from 'react-icons/fa';
import TeamAvatar from '../team/TeamAvatar';
import { TAGS } from './tags';
import TagChip from './TagChip';
import { getStorageUrl } from '../../lib/getStorageUrl';

function Sidebar({ filter, onFilterChange, selectedTags, onTagToggle, onClearTags, teams = [] }) {
  const [teamsOpen, setTeamsOpen] = useState(true);

  return (
    <Wrap>
      <Nav>
        {/* Home */}
        <NavItem $active={filter === 'home'} onClick={() => onFilterChange('home')}>
          <NavIcon>
            <MdOutlineHome size={24} />
          </NavIcon>
          <NavLabel>Home</NavLabel>
        </NavItem>

        {/* Teams — 드롭다운 */}
        <NavItem
          $active={filter === 'teams'}
          onClick={() => {
            onFilterChange('teams');
            setTeamsOpen((prev) => !prev);
          }}
        >
          <NavIcon>
            <MdOutlineGroups size={24} />
          </NavIcon>
          <NavLabel>Teams</NavLabel>
          <ArrowIcon $open={teamsOpen && teams.length > 0}>
            <MdArrowDropDown size={20} />
          </ArrowIcon>
        </NavItem>

        {/* 팀 목록 */}
        {teamsOpen && teams.length > 0 && (
          <TeamList>
            {teams.map((team) => {
              const updatedTeam = {
                ...team,
                avatar_url: team.avatar_url ? getStorageUrl(team.avatar_url) : null,
              };

              return (
                <TeamItem
                  key={team.id}
                  $active={filter === `team_${team.id}`}
                  onClick={() => onFilterChange(`team_${team.id}`)}
                >
                  <TeamAvatar team={updatedTeam} size={24} />
                  <TeamName>{team.name}</TeamName>
                  {team.role === 'owner' && <OwnerBadge>팀장</OwnerBadge>}
                </TeamItem>
              );
            })}
          </TeamList>
        )}
        {/* Private */}
        <NavItem $active={filter === 'private'} onClick={() => onFilterChange('private')}>
          <NavIcon>
            <MdPersonOutline size={24} />
          </NavIcon>
          <NavLabel>Private</NavLabel>
        </NavItem>

        {/* Favorites */}
        <NavItem $active={filter === 'favorites'} onClick={() => onFilterChange('favorites')}>
          <NavIcon>
            <FaRegStar size={20} />
          </NavIcon>
          <NavLabel>Favorites</NavLabel>
        </NavItem>
      </Nav>
      <Divider />

      <TagSection>
        <TagHeader>
          <TagTitle>Tags</TagTitle>
          {selectedTags.length > 0 && <ClearButton onClick={onClearTags}>Reset</ClearButton>}
        </TagHeader>
        <TagList>
          {TAGS.map((tag) => (
            <TagChip key={tag} $tag={tag} $active={selectedTags.includes(tag)} onClick={() => onTagToggle(tag)}>
              {tag}
            </TagChip>
          ))}
        </TagList>
      </TagSection>
    </Wrap>
  );
}

const Wrap = styled.aside`
  width: 300px;
  padding: ${({ theme }) => theme.spacing[6]} 0;
  margin-right: ${({ theme }) => theme.spacing[4]};
  position: sticky;
  top: 88px;
  height: 100%;
  gap: ${({ theme }) => theme.spacing[6]};

  @media (max-width: 1024px) {
    width: 100px;
    margin-right: ${({ theme }) => theme.spacing[2]};
  }

  @media (max-width: 504px) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
  @media (max-width: 1024px) {
    align-items: center;
  }
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  ${({ theme }) => theme.typography.Label['KR-Large']};
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
  color: ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.text.contrast)};
  background-color: ${({ theme, $active }) => ($active ? theme.colors.surface.secondary : 'transparent')};
  text-align: left;
  transition: background-color ${({ theme }) => theme.transition.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
  @media (max-width: 1024px) {
    width: 48px;
    height: 48px;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[3]};
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  svg {
    color: inherit;
  }
`;

const NavLabel = styled.span`
  flex: 1;
  @media (max-width: 1024px) {
    display: none;
  }
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
  transform: ${({ $open }) => ($open ? 'rotate(0deg)' : 'rotate(-90deg)')};
  transition: transform ${({ theme }) => theme.transition.fast};
  color: ${({ theme }) => theme.colors.text.contrast};
  @media (max-width: 1024px) {
    display: none;
  }
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: ${({ theme }) => theme.spacing[4]};
  @media (max-width: 1024px) {
    padding-left: 0;
  }
`;

const TeamItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  ${({ theme }) => theme.typography.Label['KR-Midium']};
  color: ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.text.contrast)};
  background-color: ${({ theme, $active }) => ($active ? theme.colors.surface.secondary : 'transparent')};
  text-align: left;
  transition: background-color ${({ theme }) => theme.transition.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
  @media (max-width: 1024px) {
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[2]};
  }
`;

const TeamName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text.primary};
  @media (max-width: 1024px) {
    display: none;
  }
`;

const OwnerBadge = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  flex-shrink: 0;
  @media (max-width: 1024px) {
    display: none;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.secondary};
  margin: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[1]};
`;

const TagSection = styled.div``;

const TagHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  @media (max-width: 1024px) {
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[2]};
  }
`;

const TagTitle = styled.span`
  ${({ theme }) => theme.typography.Label['KR-Large']};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  @media (max-width: 1024px) {
    display: none;
  }
`;

const ClearButton = styled.button`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.negative};
  border-radius: ${({ theme }) => theme.radius[1]};
  transition: all 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.text.negative};
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    height: 30vh;
    overflow-y: auto;
    overflow-x: hidden;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[1]};
    -ms-overflow-style: none;
    scrollbar-width: none;
    overflow-y: scroll;
    .scroll-container::-webkit-scrollbar {
      display: none;
    }
    button {
      ${({ theme }) => theme.typography.Label['EN-Small']};
      flex-shrink: 0;
      width: fit-content;
    }
  }
`;

export default Sidebar;
