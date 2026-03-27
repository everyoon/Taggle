import { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';
import { getTeamColor } from '../../lib/teamColor';
import Button from '../common/Button';
import { getStorageUrl } from '../../lib/getStorageUrl';
import {
  MdClose,
  MdArrowBack,
  MdContentCopy,
  MdCheck,
  MdPersonRemove,
  MdExitToApp,
  MdSwapHoriz,
  MdSettings,
  MdPeople,
  MdPhotoCamera,
} from 'react-icons/md';

function ManageTeamModal({ open, onClose, userId, teams = [], onTeamsUpdated }) {
  // viewMode: 'list' | 'members' | 'profile'
  const [viewMode, setViewMode] = useState('list');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // 프로필 수정용 상태
  const [editName, setEditName] = useState('');
  const [editPreview, setEditPreview] = useState('');
  const [editFile, setEditFile] = useState(null);

  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef(null);

  const { leaveTeam, removeMember, deleteTeam, transferOwnership } = useTeam(userId);

  // 멤버 목록 가져오기
  const fetchMembers = useCallback(async (teamId) => {
    setLoadingMembers(true);
    try {
      const { data } = await supabase
        .from('team_members')
        .select('*, profiles!user_id(id, name, avatar_url, email)')
        .eq('team_id', teamId);

      // 데이터 정렬 로직
      const sortedMembers = (data ?? []).sort((a, b) => {
        // 1. role이 'owner'인 팀장을 최상단으로 정렬
        if (a.role === 'owner') return -1;
        if (b.role === 'owner') return 1;

        // 2. 그 외 멤버들은 이름순(가나다/ABC)으로 정렬
        const nameA = a.profiles?.name || '';
        const nameB = b.profiles?.name || '';
        return nameA.localeCompare(nameB);
      });

      setMembers(sortedMembers);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTeam && viewMode === 'members') {
      fetchMembers(selectedTeam.id);
    }
    if (selectedTeam && viewMode === 'profile') {
      setEditName(selectedTeam.name);
      setEditPreview('');
      setEditFile(null);
    }
  }, [selectedTeam, viewMode, fetchMembers]);

  const handleClose = () => {
    setViewMode('list');
    setSelectedTeam(null);
    setProcessing(false);
    onClose();
  };

  const handleBack = () => setViewMode('list');

  const enterMode = (team, mode) => {
    setSelectedTeam(team);
    setViewMode(mode);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setEditFile(f);
      setEditPreview(URL.createObjectURL(f));
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) return alert('팀 이름을 입력해주세요.');
    if (editName.length > 15) return alert('팀 이름은 15자 이하로 입력해주세요.');
    setProcessing(true);

    let avatarUrl = selectedTeam.avatar_url;
    if (editFile) {
      const { url } = await uploadImage(editFile, 'team-avatars', `${selectedTeam.id}/avatar`);
      if (url) avatarUrl = url;
    }

    const { error } = await supabase
      .from('teams')
      .update({ name: editName, avatar_url: avatarUrl })
      .eq('id', selectedTeam.id);

    if (!error) {
      alert('팀 프로필이 수정되었습니다.');
      await onTeamsUpdated();
      setSelectedTeam((prev) => ({ ...prev, name: editName, avatar_url: avatarUrl }));
      setViewMode('list'); // 수정 후 리스트로 복귀
    } else {
      alert('수정 실패: ' + error.message);
    }
    setProcessing(false);
  };

  // --- 멤버 관리 로직 ---
  const handleCopyInvite = (inviteCode) => {
    const link = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransferOwnership = async (targetId, targetName) => {
    if (!window.confirm(`'${targetName}'님에게 팀장 권한을 넘기시겠어요?\n넘긴 후에는 팀 설정을 변경할 수 없습니다.`))
      return;
    setProcessing(true);
    const { success } = await transferOwnership(selectedTeam.id, targetId);
    if (success) {
      alert('팀장 권한이 위임되었습니다.');
      await onTeamsUpdated();
      setSelectedTeam((prev) => ({ ...prev, role: 'member' }));
      setViewMode('list');
    }
    setProcessing(false);
  };

  const handleKick = async (memberId, memberName) => {
    if (!window.confirm(`${memberName}님을 팀에서 내보낼까요?`)) return;
    const { success } = await removeMember(selectedTeam.id, memberId);
    if (success) setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
  };

  const handleLeave = async () => {
    if (!window.confirm(`'${selectedTeam.name}' 팀에서 나갈까요?`)) return;
    setProcessing(true);
    const { success } = await leaveTeam(selectedTeam.id);
    if (success) {
      await onTeamsUpdated();
      handleClose();
    }
    setProcessing(false);
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm(`'${selectedTeam.name}' 팀을 삭제할까요?\n모든 데이터가 영구 삭제됩니다.`)) return;
    setProcessing(true);
    const { success } = await deleteTeam(selectedTeam.id);
    if (success) {
      await onTeamsUpdated();
      handleClose();
    }
    setProcessing(false);
  };

  if (!open) return null;

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <HeaderLeft>
            {viewMode !== 'list' && (
              <IconButton onClick={handleBack}>
                <MdArrowBack />
              </IconButton>
            )}
            <ModalTitle>{viewMode === 'list' ? '팀 관리' : selectedTeam?.name}</ModalTitle>
          </HeaderLeft>
          <CloseButton onClick={handleClose}>
            <MdClose />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {viewMode === 'list' ? (
            <TeamList>
              {teams.length === 0 ? (
                <EmptyState>참여 중인 팀이 없습니다.</EmptyState>
              ) : (
                teams.map((team) => (
                  <TeamRowItem key={team.id} onClick={() => enterMode(team, 'members')}>
                    <TeamAvatarWrap>
                      {team.avatar_url ? (
                        <AvatarImg src={getStorageUrl(team.avatar_url)} />
                      ) : (
                        <AvatarInitial $bg={getTeamColor(team.name).bg} $text={getTeamColor(team.name).text}>
                          {team.name[0]}
                        </AvatarInitial>
                      )}
                    </TeamAvatarWrap>
                    <TeamInfo>
                      <TeamName>{team.name}</TeamName>
                      <TeamRoleBadge $isOwner={team.role === 'owner'}>
                        {team.role === 'owner' ? '팀장' : '팀원'}
                      </TeamRoleBadge>
                    </TeamInfo>

                    <RowActionGroup onClick={(e) => e.stopPropagation()}>
                      {team.role === 'owner' && (
                        <SmallCircleBtn onClick={() => enterMode(team, 'profile')} $color="#3b82f6" title="수정">
                          <MdSettings size={18} />
                        </SmallCircleBtn>
                      )}
                      <SmallCircleBtn onClick={() => enterMode(team, 'members')} $color="#10b981" title="멤버">
                        <MdPeople size={18} />
                      </SmallCircleBtn>
                    </RowActionGroup>
                  </TeamRowItem>
                ))
              )}
            </TeamList>
          ) : viewMode === 'profile' ? (
            <ProfileEditForm>
              <AvatarEditSection>
                <BigAvatarWrapper onClick={() => fileRef.current.click()}>
                  {editPreview ? (
                    <BigAvatar src={editPreview} alt="" />
                  ) : selectedTeam.avatar_url ? (
                    <BigAvatar src={getStorageUrl(selectedTeam.avatar_url)} alt="" />
                  ) : (
                    <BigAvatarInitial
                      $bg={getTeamColor(selectedTeam.name).bg}
                      $text={getTeamColor(selectedTeam.name).text}
                    >
                      {selectedTeam.name[0]}
                    </BigAvatarInitial>
                  )}
                  <AvatarOverlay>
                    <MdPhotoCamera size={24} />
                  </AvatarOverlay>
                </BigAvatarWrapper>
                <input ref={fileRef} type="file" hidden onChange={handleFileChange} accept="image/*" />
              </AvatarEditSection>

              <Field>
                <Label>팀 이름</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="팀 이름을 입력하세요. (최대 15자)"
                  maxLength={15}
                />
              </Field>

              <Button
                $invert
                onClick={handleUpdateProfile}
                disabled={processing}
                style={{ height: '48px', marginTop: '8px' }}
              >
                {processing ? '수정 중...' : '수정하기'}
              </Button>
            </ProfileEditForm>
          ) : (
            <MemberListSection>
              {selectedTeam.role === 'owner' && (
                <InviteSection>
                  <SectionTitle>초대 링크 공유</SectionTitle>
                  <LinkBox>
                    <LinkText>{`${window.location.origin}/invite/${selectedTeam.invite_code}`}</LinkText>
                    <CopyBtn onClick={() => handleCopyInvite(selectedTeam.invite_code)} type="button" $copied={copied}>
                      {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
                      {copied ? '복사됨' : '복사'}
                    </CopyBtn>
                  </LinkBox>
                </InviteSection>
              )}

              <MemberList>
                <SectionTitle>멤버 {members.length}명</SectionTitle>
                {loadingMembers ? (
                  <EmptyState>불러오는 중...</EmptyState>
                ) : (
                  members.map((m) => (
                    <MemberRow key={m.user_id}>
                      <MemberAvatar
                        src={m.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${m.profiles?.name}`}
                      />
                      <MemberInfo>
                        <MemberName>
                          {m.profiles?.name} {m.role === 'owner' && <OwnerBadge>팀장</OwnerBadge>}
                        </MemberName>
                        <MemberEmail>{m.profiles?.email}</MemberEmail>
                      </MemberInfo>
                      {selectedTeam.role === 'owner' && m.user_id !== userId && (
                        <ActionGroup>
                          <TransferButton
                            onClick={() => handleTransferOwnership(m.user_id, m.profiles?.name)}
                            title="팀장 위임"
                          >
                            <MdSwapHoriz size={20} />
                          </TransferButton>
                          <KickButton onClick={() => handleKick(m.user_id, m.profiles?.name)} title="내보내기">
                            <MdPersonRemove size={18} />
                          </KickButton>
                        </ActionGroup>
                      )}
                    </MemberRow>
                  ))
                )}
              </MemberList>
            </MemberListSection>
          )}
        </ModalBody>

        {viewMode === 'members' && (
          <ModalFooter>
            {selectedTeam.role === 'owner' ? (
              <Button onClick={handleDeleteTeam} className="danger-btn">
                팀 삭제하기
              </Button>
            ) : (
              <Button onClick={handleLeave} className="danger-btn">
                <MdExitToApp size={20} style={{ marginRight: '8px' }} /> 팀 나가기
              </Button>
            )}
          </ModalFooter>
        )}
      </Modal>
    </Overlay>
  );
}

// --- Styled Components ---

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
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows[3]};
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const ModalTitle = styled.h2`
  ${({ theme }) => theme.typography.Title['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
  padding-left: ${({ theme }) => theme.spacing[2]};
`;

const IconButton = styled.button`
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
  overflow-y: auto;
  flex: 1;
`;

// --- Team List Mode ---
const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TeamRowItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const TeamAvatarWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarInitial = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
`;

const TeamInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const TeamName = styled.span`
  ${({ theme }) => theme.typography.Label['KR-Midium']}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TeamRoleBadge = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radius[1]};
  background-color: ${({ theme, $isOwner }) =>
    $isOwner ? theme.colors.surface.brand : theme.colors.surface.secondary};
  color: ${({ theme, $isOwner }) => ($isOwner ? theme.colors.text.invert : theme.colors.text.contrast)};
`;

const RowActionGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-left: auto;
`;

const SmallCircleBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  color: ${({ theme }) => theme.colors.text.contrast};
  transition: all 0.2s;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  &:hover {
    border-color: ${({ $color }) => $color};
    color: ${({ $color }) => $color};
    background-color: ${({ $color }) => $color + '15'};
  }
`;

// --- Profile Edit Mode ---
const ProfileEditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const AvatarEditSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const BigAvatarWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const BigAvatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BigAvatarInitial = styled.div`
  width: 100%;
  height: 100%;
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
  ${BigAvatarWrapper}:hover & {
    opacity: 1;
  }
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
  background-color: transparent;
  transition: border-color ${({ theme }) => theme.transition.fast};
  &:focus {
    border-color: ${({ theme }) => theme.colors.border.contrast};
    outline: none;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.contrast};
    opacity: 0.5;
  }
`;

// --- Member List Mode ---
const MemberListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const SectionTitle = styled.h4`
  ${({ theme }) => theme.typography.Label['KR-Small']}
  color: ${({ theme }) => theme.colors.text.contrast};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  padding-left: ${({ theme }) => theme.spacing[1]};
`;

const InviteSection = styled.div`
  display: flex;
  flex-direction: column;
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

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const MemberAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const MemberInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MemberName = styled.div`
  ${({ theme }) => theme.typography.Label['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const OwnerBadge = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  background: ${({ theme }) => theme.colors.surface.brand};
  color: ${({ theme }) => theme.colors.text.invert};
  padding: 2px 4px;
  border-radius: ${({ theme }) => theme.radius[1]};
  font-size: 10px;
`;

const MemberEmail = styled.span`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const TransferButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.text.contrast};
  border-radius: 50%;
  transition: all 0.2s;
  &:hover {
    color: #3b82f6;
    background-color: rgba(59, 130, 246, 0.1);
  }
`;

const KickButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.text.contrast};
  border-radius: 50%;
  transition: all 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.text.negative};
    background-color: #ff4d4f15;
  }
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing[6]} 0;
  text-align: center;
  ${({ theme }) => theme.typography.Body['KR-Small']}
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
  .danger-btn {
    width: 100%;
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

export default ManageTeamModal;
