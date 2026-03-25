import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { tokens } from '../../styles/theme';
import { fetchLinkPreview } from '../../hooks/useLinkPreview';

const TAGS = ['레퍼런스', 'UI/UX', 'Color', 'Icon', 'Typography', 'Motion', 'Illustration', '3D', 'Branding', 'Tool'];

const INITIAL_FORM = {
  url: '',
  title: '',
  description: '',
  tags: [],
  visibility: 'shared',
};

function BookmarkModal({ open, onClose, onSubmit, editTarget }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);

  // 편집 모드면 기존 데이터 채우기
  useEffect(() => {
    if (editTarget) {
      setForm({
        url: editTarget.url,
        title: editTarget.title,
        description: editTarget.description ?? '',
        tags: editTarget.tags ?? [],
        visibility: editTarget.visibility,
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setError('');
  }, [editTarget, open]);

  // 배경 클릭으로 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async () => {
    if (!form.url.trim()) return setError('URL을 입력해주세요.');
    if (!form.title.trim()) return setError('제목을 입력해주세요.');

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

  // URL 입력 필드 아래에 onBlur 핸들러 추가
  const handleUrlBlur = async () => {
    if (!form.url || !form.url.startsWith('http')) return;
    if (form.title) return; // 이미 제목 있으면 덮어쓰지 않음

    setFetching(true);
    const { title, thumbnail_url } = await fetchLinkPreview(form.url);
    setForm((prev) => ({
      ...prev,
      title: title || prev.title,
      thumbnail_url: thumbnail_url || prev.thumbnail_url,
    }));
    setFetching(false);
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <ModalHeader>
          <ModalTitle>{editTarget ? '북마크 편집' : '북마크 추가'}</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
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
          <Field>
            <Label>
              제목 <Required>*</Required>
            </Label>
            <Input
              type="text"
              placeholder={fetching ? '사이트 정보 불러오는 중...' : '사이트 이름이나 간단한 제목'}
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={fetching}
            />
          </Field>
          <Field>
            <Label>메모</Label>
            <Textarea
              placeholder="왜 저장했는지, 어떻게 활용하면 좋은지 적어주세요"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </Field>
          <Field>
            <Label>태그</Label>
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
            <Label>공개 범위</Label>
            <VisibilityRow>
              <VisibilityOption
                $active={form.visibility === 'shared'}
                onClick={() => handleChange('visibility', 'shared')}
                type="button"
              >
                <VisibilityTitle>팀 공유</VisibilityTitle>
                <VisibilityDesc>팀원 모두에게 보여요</VisibilityDesc>
              </VisibilityOption>
              <VisibilityOption
                $active={form.visibility === 'private'}
                onClick={() => handleChange('visibility', 'private')}
                type="button"
              >
                <VisibilityTitle>나만 보기</VisibilityTitle>
                <VisibilityDesc>나에게만 보여요</VisibilityDesc>
              </VisibilityOption>
            </VisibilityRow>
          </Field>

          {error && <ErrorMsg>{error}</ErrorMsg>}
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose} type="button">
            취소
          </CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={loading} type="button">
            {loading ? '저장 중...' : editTarget ? '수정 저장' : '추가'}
          </SubmitButton>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: ${tokens.spacing[20]};
`;

const Modal = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${tokens.radius.lg};
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.modal};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${tokens.spacing[20]} ${tokens.spacing[24]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: ${tokens.spacing[4]};
  border-radius: ${tokens.radius.sm};
  transition:
    color ${tokens.transition.fast},
    background-color ${tokens.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${tokens.spacing[24]};
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[20]};
  overflow-y: auto;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[8]};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Required = styled.span`
  color: #e05050;
`;

const Input = styled.input`
  height: 38px;
  padding: 0 ${tokens.spacing[12]};
  border-radius: ${tokens.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  transition: border-color ${tokens.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const Textarea = styled.textarea`
  padding: ${tokens.spacing[12]};
  border-radius: ${tokens.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  resize: vertical;
  line-height: 1.6;
  transition: border-color ${tokens.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${tokens.spacing[6]};
`;

const TagChip = styled.button`
  padding: 5px 12px;
  border-radius: ${tokens.radius.full};
  border: 1px solid
    ${({ theme, $active, $tag }) =>
      $active ? (theme.colors.tag[$tag]?.text ?? theme.colors.border.strong) : theme.colors.border.default};
  background-color: ${({ theme, $active, $tag }) =>
    $active ? (theme.colors.tag[$tag]?.surface ?? theme.colors.surface.tertiary) : 'transparent'};
  color: ${({ theme, $active, $tag }) =>
    $active ? (theme.colors.tag[$tag]?.text ?? theme.colors.text.primary) : theme.colors.text.tertiary};
  transition: all ${tokens.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.strong};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const VisibilityRow = styled.div`
  display: flex;
  gap: ${tokens.spacing[8]};
`;

const VisibilityOption = styled.button`
  flex: 1;
  padding: ${tokens.spacing[12]};
  border-radius: ${tokens.radius.md};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.border.strong : theme.colors.border.default)};
  background-color: ${({ theme, $active }) => ($active ? theme.colors.surface.tertiary : 'transparent')};
  text-align: left;
  transition: all ${tokens.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const VisibilityTitle = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`;

const VisibilityDesc = styled.p`
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const ErrorMsg = styled.p`
  color: #e05050;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: ${tokens.spacing[8]};
  padding: ${tokens.spacing[16]} ${tokens.spacing[24]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  flex-shrink: 0;
`;

const CancelButton = styled.button`
  flex: 1;
  height: 40px;
  border-radius: ${tokens.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: background-color ${tokens.transition.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const SubmitButton = styled.button`
  flex: 2;
  height: 40px;
  border-radius: ${tokens.radius.md};
  background-color: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.surface.primary};
  transition: opacity ${tokens.transition.fast};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;

export default BookmarkModal;
