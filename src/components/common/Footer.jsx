import styled from 'styled-components';

function Footer() {
  return (
    <FooterWrapper>
      <Logo>Taggle</Logo>
      <Copyright>© {new Date().getFullYear()} Taggle. All rights reserved.</Copyright>
    </FooterWrapper>
  );
}

const FooterWrapper = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[5]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
  background-color: #222;
  @media (max-width: 504px) {
    display: none;
  }
`;

const Logo = styled.span`
  ${({ theme }) => theme.typography.Title['EN-Small']}
  color: #fafafa;
`;

const Copyright = styled.p`
  ${({ theme }) => theme.typography.Caption['KR']}
  color: ${({ theme }) => theme.colors.text.contrast};
  opacity: 0.7;
`;

export default Footer;
