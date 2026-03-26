import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchLinkPreview } from '../../hooks/useLinkPreview';
import Button from '../common/Button';
import { MdClose, MdPerson, MdGroups } from 'react-icons/md';

// Mock data for teams
const MOCK_TEAMS = [
  { id: 1, name: '돼지원정단', selected: false },
  { id: 2, name: '피그마 싫어', selected: false },
  { id: 3, name: '애옹애옹애옹', selected: false },
];

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

const INITIAL_FORM = {
  url: '',
  title: '',
  description: '',
  tags: [],
  visibility: 'private',
  selectedTeams: [],
};

function BookmarkModal({ open, onClose, onSubmit, editTarget }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (editTarget) {
      setForm({
        url: editTarget.url,
        title: editTarget.title,
        description: editTarget.description ?? '',
        tags: editTarget.tags ?? [],
        visibility: editTarget.visibility,
        selectedTeams: editTarget.selectedTeams ?? [],
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setError('');
  }, [editTarget, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const toggleTeamSelection = (teamId) => {
    setForm((prev) => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter((id) => id !== teamId)
        : [...prev.selectedTeams, teamId],
    }));
  };

  const handleUrlBlur = async () => {
    if (!form.url || !form.url.startsWith('http')) return;
    if (form.title) return;
    setFetching(true);
    const { title, thumbnail_url } = await fetchLinkPreview(form.url);
    setForm((prev) => ({
      ...prev,
      title: title || prev.title,
      thumbnail_url: thumbnail_url || prev.thumbnail_url,
    }));
    setFetching(false);
  };

  const handleSubmit = async () => {
    if (!form.url.trim()) return setError('URL을 입력해주세요.');
    if (form.tags.length === 0) return setError('태그를 하나 이상 선택해주세요.');

    setLoading(true);
    setError('');
    const { error } = await onSubmit(form);
    setLoading(false);

    if (error) {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.');
    } else {
      onClose();
    }
  };

  if (!open) return null;

  const isEdit = !!editTarget;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        <ModalHeader>
          <ModalTitle>{isEdit ? '북마크 수정하기' : '북마크 추가하기'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <MdClose />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Field>
            <Label>
              URL <Required>*</Required>
            </Label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
              onBlur={handleUrlBlur}
              autoFocus
            />
          </Field>
          {isEdit && (
            <Field>
              <Label>
                Title <Required>*</Required>
              </Label>
              <Input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={fetching}
              />
            </Field>
          )}
          <Field>
            <Label>Desc</Label>
            <Textarea
              placeholder="사이트의 용도나 주요 특징을 적어두면 나중에 찾기 편해요."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
            />
          </Field>
          <Field>
            <Label>
              Tags <Required>* 1개 이상 선택해주세요.</Required>
            </Label>
            <TagGrid>
              {TAGS.map((tag) => (
                <TagChip
                  key={tag}
                  $active={form.tags.includes(tag)}
                  $tag={tag}
                  onClick={() => toggleTag(tag)}
                  type="button"
                >
                  {tag}
                </TagChip>
              ))}
            </TagGrid>
          </Field>
          <Field>
            <Label>
              Privacy Settings <Required>*</Required>
            </Label>
            <VisibilityContainer>
              <VisibilityTabList>
                <VisibilityTab
                  $active={form.visibility === 'private'}
                  onClick={() => handleChange('visibility', 'private')}
                  type="button"
                >
                  <MdPerson size={20} />
                  Private
                </VisibilityTab>
                <VisibilityTab
                  $active={form.visibility === 'shared'}
                  onClick={() => handleChange('visibility', 'shared')}
                  type="button"
                >
                  <MdGroups size={20} />
                  Teams
                </VisibilityTab>
              </VisibilityTabList>
              {form.visibility === 'shared' && (
                <TeamSelector>
                  <TeamSelectorTitle>팀선택</TeamSelectorTitle>
                  <TeamList>
                    {MOCK_TEAMS.map((team) => (
                      <TeamItem key={team.id}>
                        <Checkbox
                          type="checkbox"
                          checked={form.selectedTeams.includes(team.id)}
                          onChange={() => toggleTeamSelection(team.id)}
                        />
                        <TeamName>{team.name}</TeamName>
                      </TeamItem>
                    ))}
                  </TeamList>
                </TeamSelector>
              )}
            </VisibilityContainer>
            <VisibilityHint>공개 범위는 언제든지 수정할 수 있습니다.</VisibilityHint>
          </Field>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            type="button"
            $invert
            style={{ width: '100%', height: '48px' }}
          >
            {loading ? '저장 중...' : isEdit ? '수정하기' : '추가하기'}
          </Button>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.surface.modal_background};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: ${({ theme }) => theme.spacing[5]};
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.radius[4]};
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows[3]};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  ${({ theme }) => theme.typography.Title['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing[3]};
  transition: background-color ${({ theme }) => theme.transition.fast};
  svg {
    font-size: 24px;
    color: inherit;
  }
  &:hover {
    color: ${({ theme }) => theme.colors.text.contrast};
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  overflow-y: auto;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Label = styled.label`
  padding-left: ${({ theme }) => theme.spacing[2]};
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Required = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.negative};
`;

const Input = styled.input`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color ${({ theme }) => theme.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.contrast};
    opacity: 0.4;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.contrast};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 120px;
  transition: border-color ${({ theme }) => theme.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.contrast};
    opacity: 0.4;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.contrast};
  }
`;

const TagGrid = styled.div`
  padding: ${({ theme }) => theme.spacing[2]} 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TagChip = styled.button`
  ${({ theme }) => theme.typography.Label['EN-Small']}
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme, $active, $tag }) =>
    $active ? theme.colors.tag[$tag]?.bg || theme.colors.surface.secondary : '#EFEFEF'};
  color: ${({ theme, $active, $tag }) =>
    $active ? theme.colors.tag[$tag]?.text || theme.colors.text.primary : '#A0A0A0'};
  transition: all ${({ theme }) => theme.transition.fast};

  &:hover {
    background-color: ${({ theme, $tag }) => theme.colors.tag[$tag]?.bg};
    opacity: 5;
  }
`;

const VisibilityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const VisibilityTabList = styled.div`
  background-color: #f2f2f2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  border-radius: 8px;
`;

const VisibilityTab = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  color: ${({ theme, $active }) => (!$active ? theme.colors.text.contrast : theme.colors.text.primary)};
  background-color: ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};

  svg {
    color: ${({ theme, $active }) => ($active ? theme.colors.icon.primary : theme.colors.icon.contrast)};
  }
`;

const TeamSelector = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.radius[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  box-shadow: ${({ theme }) => theme.shadows[1]};
`;

const TeamSelectorTitle = styled.h4`
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const TeamList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TeamItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const TeamName = styled.span`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const VisibilityHint = styled.p`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  margin-top: ${({ theme }) => theme.spacing[2]};
  padding-left: ${({ theme }) => theme.spacing[2]};
`;

const ErrorMsg = styled.p`
  ${({ theme }) => theme.typography.Label['KR-Small']}
  color: ${({ theme }) => theme.colors.text.negative};
  text-align: center;
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
  flex-shrink: 0;
`;

export default BookmarkModal;
