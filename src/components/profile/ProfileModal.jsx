import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';
import Button from '../common/Button';
import { MdClose, MdPhotoCamera, MdErrorOutline, MdWarning } from 'react-icons/md';

function ProfileModal({ open, onClose, user, onUpdated }) {
  const [name, setName] = useState(user.user_metadata?.full_name ?? '');
  const [preview, setPreview] = useState(user.user_metadata?.avatar_url ?? '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ownedTeams, setOwnedTeams] = useState([]);
  const [isAgreed, setIsAgreed] = useState(false);
  const fileRef = useRef(null);
  useEffect(() => {
    if (open) {
      // 모달이 열릴 때 초기화 로직
      setIsAgreed(false);
      setShowDeleteConfirm(false);
      setError(''); // 추가: 에러 메시지 초기화

      setName(user.user_metadata?.full_name ?? '');
      setPreview(user.user_metadata?.avatar_url ?? '');
      setFile(null);
    }
  }, [open, user]);

  // 소유 팀 조회 (기존과 동일)
  useEffect(() => {
    if (showDeleteConfirm) {
      const fetchOwnedTeams = async () => {
        const { data } = await supabase.from('teams').select('id, name').eq('owner_id', user.id);
        if (data) setOwnedTeams(data);
      };
      fetchOwnedTeams();
    }
  }, [showDeleteConfirm, user.id]);

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
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) throw new Error(await res.text());

      await supabase.auth.signOut();
      onClose();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError('탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <ModalTitle>프로필 관리</ModalTitle>
          <CloseButton onClick={onClose}>
            <MdClose />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && (
            <ErrorBanner>
              <MdErrorOutline />
              {error}
            </ErrorBanner>
          )}

          {!showDeleteConfirm ? (
            <>
              <AvatarSection>
                <AvatarWrapper onClick={() => fileRef.current?.click()}>
                  <AvatarPreview src={preview || `https://ui-avatars.com/api/?name=${name}`} alt="" />
                  <AvatarOverlay>
                    <MdPhotoCamera size={20} />
                  </AvatarOverlay>
                </AvatarWrapper>
                <AvatarInfo>
                  <UploadBtn onClick={() => fileRef.current?.click()} type="button">
                    사진 변경하기
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
                <Label>이름</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력해주세요" />
              </Field>

              <Field>
                <Label>이메일</Label>
                <Input value={user.email} disabled />
                <VisibilityHint>이메일은 변경할 수 없습니다.</VisibilityHint>
              </Field>
            </>
          ) : (
            <DeleteConfirm>
              <DeleteTitle>정말 탈퇴하시겠어요?</DeleteTitle>
              <DeleteDesc>탈퇴 시 프로필 정보와 북마크는 즉시 삭제되며 복구할 수 없습니다.</DeleteDesc>

              {ownedTeams.length > 0 && (
                <>
                  <WarningBox>
                    <WarningHeader>
                      <MdWarning size={18} />
                      <span>팀장 권한 안내</span>
                    </WarningHeader>
                    <WarningText>
                      현재 <strong>{ownedTeams.length}개</strong> 팀의 팀장입니다. 탈퇴 시 해당 팀의 모든 데이터가 함께{' '}
                      <strong>영구 삭제</strong>됩니다.
                    </WarningText>
                    <TeamList>
                      {ownedTeams.map((team) => (
                        <li key={team.id}>• {team.name}</li>
                      ))}
                    </TeamList>

                    {/* 팀장을 넘기러 갈 수 있는 버튼 (예시 경로: /settings/teams) */}
                    <GoToTransfer onClick={onClose} href="/settings/teams">
                      팀장 권한 위임하러 가기
                    </GoToTransfer>
                  </WarningBox>

                  <CheckboxLabel>
                    <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                    <span>관리 중인 팀이 삭제됨을 확인했으며, 이에 동의합니다.</span>
                  </CheckboxLabel>
                </>
              )}
            </DeleteConfirm>
          )}
        </ModalBody>

        <ModalFooter>
          {!showDeleteConfirm ? (
            <FooterLayout>
              <DeleteLink type="button" onClick={() => setShowDeleteConfirm(true)}>
                탈퇴하기
              </DeleteLink>
              <ButtonGroup>
                <Button onClick={onClose} type="button" style={{ height: '48px', padding: '0 20px' }}>
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  type="button"
                  $invert
                  style={{ height: '48px', padding: '0 32px' }}
                >
                  {loading ? '저장 중...' : '수정하기'}
                </Button>
              </ButtonGroup>
            </FooterLayout>
          ) : (
            <ButtonGroup style={{ width: '100%' }}>
              <Button onClick={() => setShowDeleteConfirm(false)} type="button" style={{ flex: 1, height: '48px' }}>
                취소
              </Button>
              <Button className="danger-btn" onClick={handleDeleteAccount} disabled={loading} type="button" $active>
                {loading ? '처리 중...' : '탈퇴 하기'}
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
  padding-bottom: ${({ theme }) => theme.spacing[2]};
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  cursor: pointer;
`;

const AvatarPreview = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const AvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
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
  width: fit-content;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  ${({ theme }) => theme.typography.Label['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const AvatarHint = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  opacity: 0.7;
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
  background-color: ${({ theme, disabled }) => (disabled ? theme.colors.surface.secondary : 'transparent')};
  transition: border-color ${({ theme }) => theme.transition.fast};
  &:focus {
    border-color: ${({ theme }) => theme.colors.border.contrast};
  }
`;

const VisibilityHint = styled.p`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  padding-left: ${({ theme }) => theme.spacing[1]};
  margin-top: 2px;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${({ theme }) => theme.spacing[3]};
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: ${({ theme }) => theme.radius[2]};
  color: ${({ theme }) => theme.colors.text.negative};
  ${({ theme }) => theme.typography.Label['KR-Small']}
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const FooterLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DeleteLink = styled.button`
  ${({ theme }) => theme.typography.Label['KR-Small']}
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.text.contrast};
  &:hover {
    color: ${({ theme }) => theme.colors.text.negative};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  .danger-btn {
    flex: 1;
    height: 48px;
    color: ${({ theme }) => theme.colors.text.negative || '#ff4d4f'};
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.colors.border.negative || '#ff4d4f'};
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.negative || '#ff4d4f'};
      color: ${({ theme }) => theme.colors.text.invert || '#ffffff'}; /* 호버 시 글씨는 흰색으로 */
    }
  }
`;

const DeleteConfirm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

const DeleteTitle = styled.h3`
  ${({ theme }) => theme.typography.Title['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DeleteDesc = styled.p`
  ${({ theme }) => theme.typography.Body['KR-Small']}
  color: ${({ theme }) => theme.colors.text.contrast};
`;

export default ProfileModal;
