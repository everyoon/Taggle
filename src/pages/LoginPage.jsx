import styled from 'styled-components';
import { supabase } from '../lib/supabase';
import { tokens } from '../styles/theme';
import { TbHeadset } from 'react-icons/tb';

function LoginPage({ onToggleTheme, isDark }) {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <Wrapper>
      <Header>
        <HeaderLogo>
          <img src="/favicon.svg" alt="Taggle 심볼" />
        </HeaderLogo>
        <Toggle onClick={onToggleTheme} $isDark={isDark}>
          <ToggleThumb $isDark={isDark} />
        </Toggle>
      </Header>
      <Container>
        <Logo>
          <img src="/Logo.svg" alt="Taggle 로고" />
        </Logo>
        <TextInner>
          <Desc>흩어진 레퍼런스, 태그로 쉽고 빠르게</Desc>
          <GoogleButton onClick={handleGoogleLogin}>
            <GoogleIcon />
            Google로 시작하기
          </GoogleButton>
        </TextInner>
      </Container>
    </Wrapper>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.primary};
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[8]};
  height: 88px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  box-shadow: ${({ theme }) => theme.shadows[1]};
`;

const HeaderLogo = styled.span`
  display: inline-block;
`;

const Toggle = styled.button`
  width: 64px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ $isDark }) => ($isDark ? '#222222' : '#FAFAFA')};
  position: relative;
  transition: background-color ${({ theme }) => theme.transition.normal};
  flex-shrink: 0;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#FAFAFA' : '#222222')};
  box-shadow: ${({ theme }) => theme.shadows[1]};
`;

const ToggleThumb = styled.div`
  position: absolute;
  top: 2px;
  left: ${({ $isDark }) => ($isDark ? '34px' : '2px')};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $isDark }) => ($isDark ? '#FAFAFA' : '#222222')};
  transition: left ${({ theme }) => theme.transition.normal};
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.h1`
  margin-top: 4%;
  width: 500px;
  padding-right: ${tokens.spacing[9]};
`;

const TextInner = styled.div`
  margin-top: ${tokens.spacing[14]};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${tokens.spacing[11]};
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => theme.typography.Headline['KR-H3']}
  text-align: center;
  margin-bottom: ${tokens.spacing[2]};
`;

const GoogleButton = styled.button`
  width: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${tokens.spacing[6]};
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  border-radius: ${tokens.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  ${({ theme }) => theme.typography.Title['KR-Small']}
  color: ${({ theme }) => theme.colors.text.primary};
  transition: background-color ${tokens.transition.fast};
  box-shadow: ${tokens.shadows[1]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.button.hover};
    color: ${({ theme }) => theme.colors.text.invert};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
  }
  &:focus {
    background-color: ${({ theme }) => theme.colors.button.focus};
    color: ${({ theme }) => theme.colors.text.invert};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.button.active};
    color: ${({ theme }) => theme.colors.text.invert};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
  }
`;

export default LoginPage;
