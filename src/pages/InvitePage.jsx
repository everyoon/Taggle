import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';
import Button from '../components/common/Button';
import TeamAvatar from '../components/common/TeamAvatar';
import { getStorageUrl } from '../lib/getStorageUrl';

function InvitePage({ user }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [status, setStatus] = useState('loading');
  const [issubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 컴포넌트가 언마운트되었을 때 상태 업데이트를 방지하기 위한 플래그
    let isCancelled = false;

    const loadTeamData = async () => {
      const { data: teamData, error } = await supabase.from('teams').select('*').eq('invite_code', code).single();

      if (isCancelled) return;

      if (error || !teamData) {
        setStatus('error');
        return;
      }

      setTeam(teamData);

      if (user) {
        const { data: existing } = await supabase
          .from('team_members')
          .select()
          .eq('team_id', teamData.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (isCancelled) return;

        if (existing) {
          setStatus('already');
          return;
        }
      }

      setStatus('idle');
    };

    loadTeamData();

    return () => {
      isCancelled = true;
    };
  }, [code, user]);

  const handleJoin = async () => {
    if (!user) {
      sessionStorage.setItem('pending_invite_code', code);
      alert('팀에 참여하려면 로그인이 필요합니다.');
      navigate('/');
      return;
    }

    setIsSubmitting(true);

    // 중복 체크
    const { data: existing } = await supabase
      .from('team_members')
      .select()
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      setStatus('already');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'member',
    });

    if (error) {
      alert('팀 참여에 실패했습니다.');
      setIsSubmitting(false);
    } else {
      setStatus('success');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  // 로딩 중 화면
  if (status === 'loading') {
    return (
      <Container>
        <Message>초대 정보를 확인하고 있어요...</Message>
      </Container>
    );
  }

  // 에러 화면
  if (status === 'error') {
    return (
      <Container>
        <Card>
          <Emoji>🚫</Emoji>
          <Message>
            유효하지 않거나 만료된 <br />
            초대 링크입니다.
          </Message>
          <Button onClick={() => navigate('/')} style={{ width: '100%' }}>
            홈으로 가기
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        {status === 'success' ? (
          <>
            <Emoji>🎉</Emoji>
            <Message>
              {team?.name} 팀에
              <br />
              성공적으로 합류했습니다!
            </Message>
            <small>잠시 후 메인 화면으로 이동합니다.</small>
          </>
        ) : (
          <>
            <TeamProfileSection>
              {/* 2. TeamAvatar에 전달하기 전 avatar_url에 캐시 무효화 적용 */}
              <TeamAvatar
                team={{
                  ...team,
                  avatar_url: team?.avatar_url ? getStorageUrl(team.avatar_url) : null,
                }}
                size={80}
              />
              <TeamName>{team?.name}</TeamName>
              <InviteText>팀으로 당신을 초대했습니다.</InviteText>
            </TeamProfileSection>

            {status === 'already' ? (
              <AlreadyBadge>이미 참여 중인 팀입니다.</AlreadyBadge>
            ) : (
              <ButtonGroup>
                <Button $variant="secondary" onClick={() => navigate('/')} style={{ flex: 1 }}>
                  취소
                </Button>
                <Button $variant="primary" onClick={handleJoin} disabled={issubmitting} style={{ flex: 1 }}>
                  {issubmitting ? '처리 중...' : '참가하기'}
                </Button>
              </ButtonGroup>
            )}
          </>
        )}
      </Card>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  padding: ${({ theme }) => theme.spacing[4]};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.radius[4]};
  padding: ${({ theme }) => theme.spacing[10]};
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows[3]};
  text-align: center;
  small {
    color: ${({ theme }) => theme.colors.text.contrast};
  }
`;

const TeamProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TeamName = styled.h2`
  ${({ theme }) => theme.typography.Title['KR-Large']};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InviteText = styled.p`
  ${({ theme }) => theme.typography.Body['KR-Midium']};
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const Message = styled.p`
  ${({ theme }) => theme.typography.Title['KR-Medium']};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.5;
`;

const Emoji = styled.div`
  font-size: 48px;
  margin-bottom: -10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const AlreadyBadge = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  background-color: ${({ theme }) => theme.colors.surface.secondary};
  color: ${({ theme }) => theme.colors.text.contrast};
  border-radius: ${({ theme }) => theme.radius[2]};
  width: 100%;
  ${({ theme }) => theme.typography.Label['KR-Midium']};
`;

export default InvitePage;
