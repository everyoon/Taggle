import { useState, useRef } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';
import Button from '../common/Button';
import { MdClose } from 'react-icons/md';

function ProfileModal({ open, onClose, user, onUpdated }) {
  const [name, setName] = useState(user.user_metadata?.full_name ?? '');
  const [preview, setPreview] = useState(user.user_metadata?.avatar_url ?? '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return setError('이미지는 2MB 이하만 업로드 가능해요.');
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type))
      return setError('JPG, PNG, WEBP, GIF 형식만 업로드 가능해요.');
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleSave = async () => {
    if (!name.trim()) return setError('이름을 입력해주세요.');
    setLoading(true);
    setError('');

    let avatarUrl = user.user_metadata?.avatar_url ?? '';

    if (file) {
      const { url, error: uploadError } = await uploadImage(file, 'avatars', `${user.id}/avatar`);
      if (uploadError) {
        setError(uploadError);
        setLoading(false);
        return;
      }
      avatarUrl = url;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: name, avatar_url: avatarUrl },
    });

    await supabase.from('profiles').update({ name, avatar_url: avatarUrl }).eq('id', user.id);

    setLoading(false);
    if (authError) return setError('저장 중 오류가 발생했어요.');
    onUpdated();
    onClose();
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    await supabase.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', user.id);
    await supabase.auth.signOut();
    setLoading(false);
  };

  if (!open) return null;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        <ModalHeader>
          <ModalTitle>프로필 관리</ModalTitle>
          <CloseButton onClick={onClose}>
            <MdClose />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {!showDeleteConfirm ? (
            <>
              <AvatarSection>
                <AvatarPreview src={preview || `https://ui-avatars.com/api/?name=${name}`} alt="" />
                <AvatarButtons>
                  <UploadBtn onClick={() => fileRef.current?.click()} type="button">
                    사진 변경
                  </UploadBtn>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <AvatarHint>JPG, PNG, WEBP, GIF · 최대 2MB</AvatarHint>
                </AvatarButtons>
              </AvatarSection>

              <Field>
                <Label>이름</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력해주세요" />
              </Field>

              <Field>
                <Label>이메일</Label>
                <Input value={user.email} disabled />
              </Field>

              {error && <ErrorMsg>{error}</ErrorMsg>}
            </>
          ) : (
            <DeleteConfirm>
              <DeleteTitle>정말 탈퇴하시겠어요?</DeleteTitle>
              <DeleteDesc>탈퇴하면 내 북마크와 프로필 정보가 모두 삭제돼요. 팀 공유 북마크는 팀에 남아요.</DeleteDesc>
            </DeleteConfirm>
          )}
        </ModalBody>

        <ModalFooter>
          {!showDeleteConfirm ? (
            <FooterContent>
              <DeleteLink type="button" onClick={() => setShowDeleteConfirm(true)}>
                회원 탈퇴
              </DeleteLink>
              <ButtonGroup>
                <Button onClick={onClose} type="button" style={{ height: '40px' }}>
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  type="button"
                  $invert
                  style={{ height: '40px', padding: '0 24px' }}
                >
                  {loading ? '저장 중...' : '저장하기'}
                </Button>
              </ButtonGroup>
            </FooterContent>
          ) : (
            <ButtonGroup style={{ width: '100%' }}>
              <Button onClick={() => setShowDeleteConfirm(false)} type="button" style={{ flex: 1, height: '44px' }}>
                취소
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={loading}
                type="button"
                $active
                style={{ flex: 1, height: '44px', backgroundColor: '#FF4D4F', color: '#fff' }}
              >
                {loading ? '처리 중...' : '탈퇴하기'}
              </Button>
            </ButtonGroup>
          )}
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
  z-index: 300;
  padding: ${({ theme }) => theme.spacing[5]};
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.radius[4]};
  width: 100%;
  max-width: 480px;
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
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  overflow-y: auto;
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

const AvatarPreview = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const AvatarButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const UploadBtn = styled.button`
  width: fit-content;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: #fff;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const AvatarHint = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  opacity: 0.6;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Label = styled.label`
  padding-left: ${({ theme }) => theme.spacing[1]};
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme, disabled }) => (disabled ? theme.colors.surface.secondary : '#fff')};
  transition: border-color ${({ theme }) => theme.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.contrast};
    outline: none;
  }
`;

const ErrorMsg = styled.p`
  ${({ theme }) => theme.typography.Label['KR-Small']}
  color: ${({ theme }) => theme.colors.text.negative};
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const FooterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DeleteLink = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.contrast};
  text-decoration: underline;
  opacity: 0.6;
  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.text.negative};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const DeleteConfirm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

const DeleteTitle = styled.h3`
  ${({ theme }) => theme.typography.Title['KR-Small']}
  color: ${({ theme }) => theme.colors.text.negative};
`;

const DeleteDesc = styled.p`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  color: ${({ theme }) => theme.colors.text.contrast};
  line-height: 1.5;
`;

export default ProfileModal;
