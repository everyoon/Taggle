import { useState } from 'react';
import styled from 'styled-components';
import { tokens } from '../../styles/theme';

function TeamSetup({ onCreateTeam, onJoinTeam }) {
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) return setError('내용을 입력해주세요.');
    setLoading(true);
    setError('');

    const { error } = mode === 'create' ? await onCreateTeam(value) : await onJoinTeam(value);

    setLoading(false);
    if (error) setError(error);
  };

  return (
    <Container>
      <Card>
        <Title>Taggle</Title>
        <Desc>팀을 만들거나 초대 코드로 참여해요</Desc>

        {!mode ? (
          <ButtonRow>
            <OptionButton onClick={() => setMode('create')}>
              <OptionTitle>팀 만들기</OptionTitle>
              <OptionDesc>새로운 팀을 만들고 동료를 초대해요</OptionDesc>
            </OptionButton>
            <OptionButton onClick={() => setMode('join')}>
              <OptionTitle>팀 참여하기</OptionTitle>
              <OptionDesc>초대 코드로 기존 팀에 참여해요</OptionDesc>
            </OptionButton>
          </ButtonRow>
        ) : (
          <>
            <BackButton
              onClick={() => {
                setMode(null);
                setValue('');
                setError('');
              }}
            >
              ← 뒤로
            </BackButton>
            <Input
              type="text"
              placeholder={mode === 'create' ? '팀 이름을 입력해주세요' : '초대 코드를 입력해주세요'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <SubmitButton onClick={handleSubmit} disabled={loading}>
              {loading ? '처리 중...' : mode === 'create' ? '팀 만들기' : '참여하기'}
            </SubmitButton>
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
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${tokens.radius.lg};
  padding: ${tokens.spacing[40]};
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[16]};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.5px;
  text-align: center;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.text.contrast};
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[8]};
  margin-top: ${tokens.spacing[8]};
`;

const OptionButton = styled.button`
  padding: ${tokens.spacing[16]};
  border-radius: ${tokens.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  text-align: left;
  transition: all ${tokens.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const OptionTitle = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const OptionDesc = styled.p`
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const BackButton = styled.button`
  color: ${({ theme }) => theme.colors.text.contrast};
  text-align: left;
  transition: color ${tokens.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Input = styled.input`
  height: 40px;
  padding: 0 ${tokens.spacing[12]};
  border-radius: ${tokens.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  transition: border-color ${tokens.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.contrast};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const ErrorMsg = styled.p`
  color: #e05050;
`;

const SubmitButton = styled.button`
  height: 40px;
  border-radius: ${tokens.radius.md};
  background-color: ${({ theme }) => theme.colors.text.primary};
  transition: opacity ${tokens.transition.fast};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;

export default TeamSetup;
