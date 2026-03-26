import { useState, useRef } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';

function CreateTeamModal({ open, onClose, userId, onCreated }) {
  const [name, setName] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState(null);
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

  const handleCreate = async () => {
    if (!name.trim()) return setError('팀 이름을 입력해주세요.');
    setLoading(true);
    setError('');

    let avatarUrl = null;
    if (file) {
      const tempId = crypto.randomUUID();
      const { url, error: uploadError } = await uploadImage(file, 'team-avatars', `${tempId}/avatar`);
      if (uploadError) {
        setError(uploadError);
        setLoading(false);
        return;
      }
      avatarUrl = url;
    }

    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({ name: name.trim(), created_by: userId, avatar_url: avatarUrl })
      .select()
      .single();

    if (teamError) {
      setError('팀 생성 중 오류가 발생했어요.');
      setLoading(false);
      return;
    }

    await supabase.from('team_members').insert({
      team_id: newTeam.id,
      user_id: userId,
      role: 'owner',
    });

    const link = `${window.location.origin}/invite/${newTeam.invite_code}`;
    setInviteLink(link);
    setLoading(false);
    onCreated(newTeam);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  const handleClose = () => {
    setName('');
    setPreview(null);
    setFile(null);
    setError('');
    setInviteLink(null);
    onClose();
  };

  if (!open) return null;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <Modal>
        <ModalHeader>
          <ModalTitle>팀 만들기</ModalTitle>
          <CloseBtn onClick={handleClose}>✕</CloseBtn>
        </ModalHeader>

        <ModalBody>
          {!inviteLink ? (
            <>
              <AvatarSection>
                <AvatarPreview onClick={() => fileRef.current?.click()}>
                  {preview ? <AvatarImg src={preview} alt="" /> : <AvatarPlaceholder>+</AvatarPlaceholder>}
                </AvatarPreview>
                <AvatarInfo>
                  <UploadBtn onClick={() => fileRef.current?.click()} type="button">
                    팀 프로필 사진 추가
                  </UploadBtn>
                  <AvatarHint>JPG, PNG, WEBP, GIF · 최대 2MB</AvatarHint>
                </AvatarInfo>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </AvatarSection>

              <Field>
                <Label>팀 이름</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="팀 이름을 입력해주세요"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
              </Field>

              {error && <ErrorMsg>{error}</ErrorMsg>}

              <BtnRow>
                <CancelBtn onClick={handleClose} type="button">
                  취소
                </CancelBtn>
                <SaveBtn onClick={handleCreate} disabled={loading} type="button">
                  {loading ? '생성 중...' : '팀 만들기'}
                </SaveBtn>
              </BtnRow>
            </>
          ) : (
            <InviteResult>
              <SuccessIcon>✓</SuccessIcon>
              <SuccessTitle>팀이 만들어졌어요!</SuccessTitle>
              <SuccessDesc>아래 링크를 팀원에게 공유해주세요. 링크를 통해서만 팀에 참여할 수 있어요.</SuccessDesc>
              <LinkBox>
                <LinkText>{inviteLink}</LinkText>
                <CopyBtn onClick={handleCopy} type="button">
                  복사
                </CopyBtn>
              </LinkBox>
              <SaveBtn onClick={handleClose} type="button">
                완료
              </SaveBtn>
            </InviteResult>
          )}
        </ModalBody>
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
  max-width: 440px;
  box-shadow: ${({ theme }) => theme.shadows[3]};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseBtn = styled.button`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.radius[2]};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const AvatarPreview = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 1px dashed ${({ theme }) => theme.colors.border.secondary};
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color ${({ theme }) => theme.transition.fast};
  &:hover {
    border-color: ${({ theme }) => theme.colors.border.contrast};
  }
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AvatarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const UploadBtn = styled.button`
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const AvatarHint = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const Input = styled.input`
  height: 38px;
  padding: 0 ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.colors.border.contrast};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ErrorMsg = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.negative};
`;

const BtnRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  height: 36px;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.contrast};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const SaveBtn = styled.button`
  height: 36px;
  padding: 0 ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radius[3]};
  background-color: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.text.invert};
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;

const InviteResult = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text.positive};
`;

const SuccessTitle = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SuccessDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.contrast};
  line-height: 1.6;
`;

const LinkBox = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: ${({ theme }) => theme.colors.surface.secondary};
`;

const LinkText = styled.span`
  flex: 1;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.contrast};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyBtn = styled.button`
  flex-shrink: 0;
  height: 28px;
  padding: 0 ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

export default CreateTeamModal;
