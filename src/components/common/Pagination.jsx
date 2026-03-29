import styled from 'styled-components';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

function Pagination({ current, total, onPageChange }) {
  const PAGE_GROUP_SIZE = 5;

  const currentGroup = Math.ceil(current / PAGE_GROUP_SIZE);

  const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(currentGroup * PAGE_GROUP_SIZE, total);

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Container>
      <ArrowBtn disabled={current === 1} onClick={() => handlePageChange(current - 1)}>
        <MdChevronLeft size={20} />
      </ArrowBtn>

      <PageList>
        {pages.map((p) => (
          <PageBtn key={p} $active={p === current} onClick={() => handlePageChange(p)}>
            {p}
          </PageBtn>
        ))}
      </PageList>

      <ArrowBtn disabled={current === total} onClick={() => handlePageChange(current + 1)}>
        <MdChevronRight size={20} />
      </ArrowBtn>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const PageList = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const PageBtn = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius[2]};
  ${({ theme }) => theme.typography.Label['KR-Midium']};
  transition: all 0.2s;

  background-color: ${({ $active, theme }) => ($active ? theme.colors.surface.brand : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.invert : theme.colors.text.contrast)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.brand : theme.colors.border.secondary)};
  &:hover {
    border-color: ${({ theme }) => theme.colors.brand};
    color: ${({ $active, theme }) => ($active ? theme.colors.text.invert : theme.colors.brand)};
  }
`;

const ArrowBtn = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  color: ${({ theme }) => theme.colors.text.contrast};
  transition: all 0.2s;
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    border-color: ${({ theme }) => theme.colors.brand};
    background: ${({ theme }) => theme.colors.surface.brand};
    opacity: 0.5;
    color: ${({ theme }) => theme.colors.text.invert};
  }
`;

export default Pagination;
