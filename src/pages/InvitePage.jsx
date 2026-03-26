import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';

function InvitePage({ user }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error | already

  useEffect(() => {
    if (!user) {
      // 로그인 안 된 상태면 로그인 후 다시 초대 링크로
      sessionStorage.setItem('invite_code', code);
      navigate('/');
      return;
    }
    handleJoin();
  }, [user]);

  const handleJoin = async () => {
    const { data: team } = await supabase.from('teams').select().eq('invite_code', code).single();

    if (!team) {
      setStatus('error');
      return;
    }

    const { data: existing } = await supabase
      .from('team_members')
      .select()
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      setStatus('already');
      return;
    }

    await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'member',
    });
    setStatus('success');
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <Container>
      <Card>
        {status === 'loading' && <Message>팀 참여 중...</Message>}
        {status === 'success' && <Message>팀에 참여했어요! 잠시 후 이동해요.</Message>}
        {status === 'already' && <Message>이미 참여한 팀이에요.</Message>}
        {status === 'error' && <Message>유효하지 않은 초대 링크예요.</Message>}
        <BackBtn onClick={() => navigate('/')}>홈으로 가기</BackBtn>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface.primary};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.radius[4]};
  padding: ${({ theme }) => theme.spacing[10]};
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[5]};
  box-shadow: ${({ theme }) => theme.shadows[2]};
`;

const Message = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const BackBtn = styled.button`
  height: 36px;
  padding: 0 ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radius[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.secondary};
  }
`;

export default InvitePage;
