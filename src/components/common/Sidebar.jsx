import styled from 'styled-components';
import { tokens } from '../../styles/theme';

const TAGS = ['레퍼런스', 'UI/UX', 'Color', 'Icon', 'Typography', 'Motion', 'Illustration', '3D', 'Branding', 'Tool'];

const FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'shared', label: '팀 공유' },
  { value: 'mine', label: '내가 올린' },
  { value: 'private', label: '나만 보기' },
  { value: 'favorited', label: '즐겨찾기' },
];

function Sidebar({ filter, onFilterChange, selectedTags, onTagToggle, onTagClear }) {
  return (
    <Wrap>
      <Section>
        <SectionLabel>범위</SectionLabel>
        {FILTERS.map((f) => (
          <FilterButton key={f.value} $active={filter === f.value} onClick={() => onFilterChange(f.value)}>
            {f.label}
          </FilterButton>
        ))}
      </Section>

      <Section>
        <SectionLabelRow>
          <SectionLabel>태그</SectionLabel>
          {selectedTags.length > 0 && <ClearButton onClick={onTagClear}>초기화</ClearButton>}
        </SectionLabelRow>
        <TagList>
          {TAGS.map((tag) => (
            <TagChip key={tag} $active={selectedTags.includes(tag)} $tag={tag} onClick={() => onTagToggle(tag)}>
              {tag}
            </TagChip>
          ))}
        </TagList>
      </Section>
    </Wrap>
  );
}

const Wrap = styled.aside`
  width: 200px;
  flex-shrink: 0;
  padding: ${tokens.spacing[20]} ${tokens.spacing[16]};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[24]};
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const SectionLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.contrast};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: ${tokens.spacing[4]};
`;

const SectionLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${tokens.spacing[4]};
`;

const ClearButton = styled.button`
  color: ${({ theme }) => theme.colors.text.contrast};
  transition: color ${tokens.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const FilterButton = styled.button`
  text-align: left;
  padding: ${tokens.spacing[8]} ${tokens.spacing[12]};
  border-radius: ${tokens.radius.md};
  color: ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.text.contrast)};
  transition:
    background-color ${tokens.transition.fast},
    color ${tokens.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${tokens.spacing[4]};
`;

const TagChip = styled.button`
  padding: 4px 10px;
  border-radius: ${tokens.radius.full};
  transition: opacity ${tokens.transition.fast};

  color: ${({ theme, $active, $tag }) =>
    $active ? (theme.colors.tag[$tag]?.text ?? theme.colors.text.secondary) : theme.colors.text.contrast};

  &:hover {
    opacity: 0.8;
  }
`;

export default Sidebar;
