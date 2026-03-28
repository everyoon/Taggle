import { useState, useRef } from 'react';
import styled from 'styled-components';
import { fetchLinkPreview } from '../../hooks/useLinkPreview';
import Button from '../common/Button';
import { MdClose, MdPerson, MdGroups } from 'react-icons/md';
import { TAGS } from '../common/tags';
import TagChip from '../common/TagChip';

const INITIAL_FORM = {
  url: '',
  title: '',
  description: '',
  tags: [],
  visibility: 'private',
  selectedTeam: null,
};

const getInitialFormState = (target) => {
  if (!target) return INITIAL_FORM;

  let initialTeam = null;
  if (target.team_id) {
    initialTeam = target.team_id;
  } else if (Array.isArray(target.team_ids) && target.team_ids.length > 0) {
    initialTeam = target.team_ids[0];
  } else if (Array.isArray(target.bookmark_teams) && target.bookmark_teams.length > 0) {
    initialTeam = target.bookmark_teams[0].team_id;
  } else if (Array.isArray(target.teams) && target.teams.length > 0) {
    initialTeam = target.teams[0].id;
  }

  return {
    url: target.url || target.link || '',
    title: target.title || '',
    description: target.description || target.desc || '',
    tags: target.tags || [],
    visibility: target.visibility || 'private',
    selectedTeam: initialTeam,
  };
};

function BookmarkModal({ open, onClose, onSubmit, editTarget, teams = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);
  const [form, setForm] = useState(() => getInitialFormState(open ? editTarget : null));
  const modalBodyRef = useRef(null);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEditTarget, setPrevEditTarget] = useState(editTarget);

  if (open !== prevOpen || editTarget !== prevEditTarget) {
    setPrevOpen(open);
    setPrevEditTarget(editTarget);

    if (open) {
      setForm(getInitialFormState(editTarget));
      setError('');
      setFetching(false);
    } else {
      setForm(INITIAL_FORM);
    }
  }
  const scrollToTop = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!form.url.trim()) {
      setError('URL을 입력해주세요.');
      scrollToTop();
      return;
    }

    if (form.tags.length === 0) {
      setError('태그를 하나 이상 선택해주세요.');
      scrollToTop();
      return;
    }

    if (form.visibility === 'shared' && !form.selectedTeam) {
      setError('공유할 팀을 선택해주세요.');
      scrollToTop();
      return;
    }

    setLoading(true);
    setError('');

    const submitData = {
      ...(isEdit && { id: editTarget.id }),
      url: form.url,
      title: form.title,
      description: form.description,
      tags: form.tags,
      visibility: form.visibility,
      selectedTeams: form.selectedTeam ? [form.selectedTeam] : [],
    };

    const { error: submitError } = await onSubmit(submitData);
    setLoading(false);

    if (submitError) {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.');
      scrollToTop();
    } else {
      setForm(INITIAL_FORM);
      onClose();
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setError('');
    onClose();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag) => {
    const isSelected = form.tags.includes(tag);

    if (!isSelected && form.tags.length >= 5) {
      alert('태그는 최대 5개까지만 선택할 수 있습니다.');
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: isSelected ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
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

  const isEdit = !!editTarget;

  if (!open) return null;

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <ModalTitle>{isEdit ? '북마크 수정하기' : '북마크 추가하기'}</ModalTitle>
          <CloseButton onClick={handleClose}>
            <MdClose />
          </CloseButton>
        </ModalHeader>

        <ModalBody ref={modalBodyRef}>
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
              Tags <Required>* 최소 1개, 최대 5개 선택 가능</Required>
            </Label>
            <TagGrid>
              {TAGS.map((tag) => (
                <TagChip
                  key={tag}
                  $tag={tag}
                  $active={form.tags.includes(tag)}
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
                  <TeamSelectorTitle>팀 선택</TeamSelectorTitle>
                  <TeamList>
                    {teams.length === 0 ? (
                      <EmptyTeams>참여 중인 팀이 없어요.</EmptyTeams>
                    ) : (
                      teams.map((team) => (
                        <TeamItem key={team.id} onClick={() => handleChange('selectedTeam', team.id)}>
                          <Radio type="radio" name="team-selection" checked={form.selectedTeam === team.id} readOnly />
                          <TeamName>{team.name}</TeamName>
                        </TeamItem>
                      ))
                    )}
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
  z-index: 1000;
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
  @media (max-width: 504px) {
    max-height: 80vh;
  }
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

const VisibilityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const VisibilityTabList = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.secondary};
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
  color: ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.text.contrast)};
  background-color: ${({ theme, $active }) => ($active ? theme.colors.surface.primary : 'transparent')};
  box-shadow: ${({ theme, $active }) => ($active ? theme.shadows[1] : 'none')};

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
  gap: ${({ theme }) => theme.spacing[1]};
`;

const TeamItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radius[2]};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const EmptyTeams = styled.p`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  padding: ${({ theme }) => theme.spacing[2]} 0;
  text-align: center;
`;

const Radio = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.surface.invert};
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
