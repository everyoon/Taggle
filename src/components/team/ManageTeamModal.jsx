import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

function ManageTeamModal({ open, onClose, userId, teams, onTeamsUpdated }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam.id);
  }, [selectedTeam]);

  const fetchMembers = async (teamId) => {
    setLoading(true);
    const { data } = await supabase
      .from('team_members')
      .select('*, profiles:user_id(id, name, avatar_url, email)')
      .eq('team_id', teamId);
    setMembers(data ?? []);
    setLoading(false);
  };

  const handleKick = async (memberId) => {
    await supabase.from('team_members').delete().eq('team_id', selectedTeam.id).eq('user_id', memberId);
    setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
  };

  const handleLeave = async (teamId) => {
    await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId);
    onTeamsUpdated();
    setSelectedTeam(null);
  };

  const handleCopyInvite = (inviteCode) => {
    const link = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(link);
  };

  if (!open) return null;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        <ModalHeader>
          {selectedTeam ? (
            <>
              <BackBtn onClick={() => setSelectedTeam(null)}>←</BackBtn>
              <ModalTitle>{selectedTeam.name}</ModalTitle>
            </>
          ) : (
            <ModalTitle>팀 관리</ModalTitle>
          )}
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </ModalHeader>

        <ModalBody>
          {!selectedTeam ? (
            // 팀 목록
            teams.length === 0 ? (
              <Empty>참여 중인 팀이 없어요</Empty>
            ) : (
              <TeamList>
                {teams.map((team) => (
                  <TeamRow key={team.id} onClick={() => setSelectedTeam(team)}>
                    <TeamAvatar>
                      {team.avatar_url ? (
                        <img src={team.avatar_url} alt="" />
                      ) : (
                        <TeamInitial>{team.name[0]}</TeamInitial>
                      )}
                    </TeamAvatar>
                    <TeamInfo>
                      <TeamName>{team.name}</TeamName>
                      <TeamRole>{team.role === 'owner' ? '팀장' : '팀원'}</TeamRole>
                    </TeamInfo>
                    <ChevronIcon>›</ChevronIcon>
                  </TeamRow>
                ))}
              </TeamList>
            )
          ) : (
            // 팀 상세 — 멤버 목록
            <>
              {selectedTeam.role === 'owner' && (
                <InviteRow>
                  <InviteLabel>초대 링크</InviteLabel>
                  <CopyBtn onClick={() => handleCopyInvite(selectedTeam.invite_code)} type="button">
                    링크 복사
                  </CopyBtn>
                </InviteRow>
              )}

              <MemberList>
                {loading ? (
                  <Empty>불러오는 중...</Empty>
                ) : (
                  members.map((m) => (
                    <MemberRow key={m.user_id}>
                      <MemberAvatar>
                        {m.profiles?.avatar_url ? (
                          <img src={m.profiles.avatar_url} alt="" />
                        ) : (
                          <MemberInitial>{m.profiles?.name?.[0] ?? '?'}</MemberInitial>
                        )}
                      </MemberAvatar>
                      <MemberInfo>
                        <MemberName>{m.profiles?.name ?? '알 수 없음'}</MemberName>
                        <MemberEmail>{m.profiles?.email}</MemberEmail>
                      </MemberInfo>
                      <MemberRole>{m.role === 'owner' ? '팀장' : '팀원'}</MemberRole>
                      {selectedTeam.role === 'owner' && m.user_id !== userId && (
                        <KickBtn onClick={() => handleKick(m.user_id)} type="button">
                          내보내기
                        </KickBtn>
                      )}
                    </MemberRow>
                  ))
                )}
              </MemberList>

              {selectedTeam.role !== 'owner' && (
                <LeaveBtn onClick={() => handleLeave(selectedTeam.id)} type="button">
                  팀 나가기
                </LeaveBtn>
              )}
            </>
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
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

const ModalTitle = styled.h2`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BackBtn = styled.button`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.contrast};
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.radius[2]};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
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
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  max-height: 480px;
  overflow-y: auto;
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const TeamRow = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[3]};
  text-align: left;
  transition: background-color ${({ theme }) => theme.transition.fast};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const TeamAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TeamInitial = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.contrast};
  background-color: ${({ theme }) => theme.colors.surface.secondary};
`;

const TeamInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TeamName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TeamRole = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ChevronIcon = styled.span`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InviteRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const InviteLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const CopyBtn = styled.button`
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

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[3]};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const MemberAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MemberInitial = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.contrast};
  background-color: ${({ theme }) => theme.colors.surface.secondary};
`;

const MemberInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const MemberName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MemberEmail = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberRole = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  flex-shrink: 0;
`;

const KickBtn = styled.button`
  height: 28px;
  padding: 0 ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius[2]};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.negative};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  flex-shrink: 0;
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const LeaveBtn = styled.button`
  width: 100%;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.negative};
  margin-top: ${({ theme }) => theme.spacing[2]};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

const Empty = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]} 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default ManageTeamModal;
