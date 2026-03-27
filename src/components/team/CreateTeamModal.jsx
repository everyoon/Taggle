import { useState, useRef } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';
import { getTeamColor } from '../../lib/teamColor';
import Button from '../common/Button';
import { MdClose, MdContentCopy, MdCheck, MdAdd } from 'react-icons/md';

function CreateTeamModal({ open, onClose, userId, onCreated }) {
  const [name, setName] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const teamColor = getTeamColor(name);

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
    if (name.length > 15) return setError('팀 이름은 15자 이하로 입력해주세요.');

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

    setInviteLink(`${window.location.origin}/invite/${newTeam.invite_code}`);
    setLoading(false);
    onCreated(newTeam);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <ModalTitle>{inviteLink ? '팀 생성 완료' : '새 팀 만들기'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <MdClose />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {!inviteLink ? (
            <>
              <AvatarSection>
                <AvatarWrapper onClick={() => fileRef.current?.click()}>
                  {preview ? (
                    <AvatarImg src={preview} alt="" />
                  ) : (
                    <AvatarPlaceholder>
                      <MdAdd size={32} />
                    </AvatarPlaceholder>
                  )}
                  <AvatarOverlay>
                    <MdAdd size={32} />
                  </AvatarOverlay>
                </AvatarWrapper>

                <AvatarInfo>
                  <UploadBtn onClick={() => fileRef.current?.click()} type="button">
                    팀 프로필 추가하기
                  </UploadBtn>
                  <AvatarHint>JPG, PNG, WEBP · 최대 2MB</AvatarHint>
                  {preview && (
                    <RemoveBtn
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setFile(null);
                      }}
                    >
                      사진 제거
                    </RemoveBtn>
                  )}
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
                  placeholder="팀 이름을 입력해주세요. (최대 15자)"
                  maxLength={15}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
              </Field>

              {error && <ErrorMsg>{error}</ErrorMsg>}
            </>
          ) : (
            <SuccessSection>
              <SuccessAvatarWrap>
                {preview ? (
                  <AvatarImg src={preview} alt="" style={{ borderRadius: '50%' }} />
                ) : (
                  <AvatarInitial $bg={teamColor.bg} $text={teamColor.text}>
                    {name[0]}
                  </AvatarInitial>
                )}
              </SuccessAvatarWrap>

              <SuccessInfo>
                <SuccessTeamName>{name}</SuccessTeamName>
                <SuccessDesc>
                  팀이 생성되었습니다!
                  <br /> 초대 링크를 복사하여 팀원들에게 공유해보세요.
                </SuccessDesc>
              </SuccessInfo>

              <LinkBox>
                <LinkText>{inviteLink}</LinkText>
                <CopyBtn onClick={handleCopy} type="button" $copied={copied}>
                  {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
                  {copied ? '복사됨' : '복사'}
                </CopyBtn>
              </LinkBox>
            </SuccessSection>
          )}
        </ModalBody>

        <ModalFooter>
          {!inviteLink ? (
            <Button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              type="button"
              $invert
              style={{ width: '100%', height: '48px' }}
            >
              {loading ? '생성 중...' : '팀 만들기'}
            </Button>
          ) : (
            <Button onClick={onClose} type="button" $invert style={{ width: '100%', height: '48px' }}>
              확인
            </Button>
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
`;

const ModalTitle = styled.h2`
  ${({ theme }) => theme.typography.Title['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
  padding-left: ${({ theme }) => theme.spacing[2]};
`;

const CloseButton = styled.button`
  display: flex;
  padding: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover {
    color: ${({ theme }) => theme.colors.text.contrast};
  }
  svg {
    font-size: 24px;
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  color: ${({ theme }) => theme.colors.icon.contrast};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const AvatarInitial = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.invert};
  opacity: 0;
  transition: opacity 0.2s;
  ${AvatarWrapper}:hover & {
    opacity: 1;
  }
`;

const AvatarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const UploadBtn = styled.button`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radius[1]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  ${({ theme }) => theme.typography.Label['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const RemoveBtn = styled.button`
  ${({ theme }) => theme.typography.Label['KR-Small']}
  width: fit-content;
  color: ${({ theme }) => theme.colors.text.negative};
  padding-left: ${({ theme }) => theme.spacing[1]};
  opacity: 0.8;
  &:hover {
    opacity: 1;
  }
`;

const AvatarHint = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  padding-left: ${({ theme }) => theme.spacing[1]};
  opacity: 0.7;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing[1]};
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: transparent;
  &:focus {
    border-color: ${({ theme }) => theme.colors.border.contrast};
    outline: none;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.contrast};
    opacity: 0.5;
  }
`;

const SuccessSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  text-align: center;
`;

const SuccessAvatarWrap = styled.div`
  width: 80px;
  height: 80px;
`;

const SuccessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const SuccessTeamName = styled.h3`
  ${({ theme }) => theme.typography.Title['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SuccessDesc = styled.p`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  color: ${({ theme }) => theme.colors.text.contrast};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const LinkBox = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const LinkText = styled.span`
  flex: 1;
  ${({ theme }) => theme.typography.Body['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;

const CopyBtn = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radius[1]};
  background-color: ${({ theme, $copied }) => ($copied ? theme.colors.surface.primary : 'transparent')};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  ${({ theme }) => theme.typography.Label['KR-Small']}
  color: ${({ theme, $copied }) => ($copied ? theme.colors.text.positive : theme.colors.text.primary)};
  transition: all 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.primary};
  }
`;

const ErrorMsg = styled.p`
  ${({ theme }) => theme.typography.Label['KR-Small']}
  color: ${({ theme }) => theme.colors.text.negative};
  text-align: center;
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

export default CreateTeamModal;
