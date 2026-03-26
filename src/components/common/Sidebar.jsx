import styled from 'styled-components';
import { MdOutlineHome, MdOutlineGroups, MdPersonOutline, MdArrowDropDown } from 'react-icons/md';
import { FaRegStar } from 'react-icons/fa';

const TAGS = [
  'UIUX',
  'Color',
  'Icon',
  'Typography',
  'AI',
  'Branding',
  'Motion',
  'Figma',
  'Photoshop',
  'Illustration',
  'Work',
  'Ref',
  'Etc',
];

const NAV_ITEMS = [
  { value: 'home', label: 'Home', icon: MdOutlineHome },
  { value: 'teams', label: 'Teams', icon: MdOutlineGroups, hasArrow: true },
  { value: 'private', label: 'Private', icon: MdPersonOutline },
  { value: 'favorites', label: 'Favorites', icon: FaRegStar },
];

function Sidebar({ filter, onFilterChange, selectedTags, onTagToggle }) {
  return (
    <Wrap>
      <Nav>
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavItem key={item.value} $active={filter === item.value} onClick={() => onFilterChange(item.value)}>
              <NavIcon>
                <IconComponent size={24} />
              </NavIcon>
              <NavLabel>{item.label}</NavLabel>
              {item.hasArrow && <MdArrowDropDown size={16} />}
            </NavItem>
          );
        })}
      </Nav>
      <Divider />

      <TagSection>
        <TagHeader>
          <TagTitle>Tags</TagTitle>
        </TagHeader>
        <TagList>
          {TAGS.map((tag) => (
            <TagChip key={tag} $active={selectedTags.includes(tag)} $tag={tag} onClick={() => onTagToggle(tag)}>
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
  top: ${({ theme }) => theme.spacing[8]};
  height: calc(100vh - 32px);
  gap: ${({ theme }) => theme.spacing[6]};
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
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
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  svg {
    font-size: 24px;
    color: inherit;
  }
`;

const NavLabel = styled.span`
  flex: 1;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.secondary};
  margin: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[1]};
`;

const TagSection = styled.div``;

const TagHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
`;

const TagTitle = styled.span`
  ${({ theme }) => theme.typography.Label['KR-Large']};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
`;

const TagChip = styled.button`
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
    background-color: ${({ theme, $tag }) => theme.colors.tag[$tag]?.bg};
    opacity: 5;
  }
`;
export default Sidebar;
