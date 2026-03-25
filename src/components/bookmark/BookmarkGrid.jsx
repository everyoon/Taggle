import styled from 'styled-components';
import { tokens } from '../../styles/theme';
import BookmarkCard from './BookmarkCard';

function BookmarkGrid({ bookmarks, loading, currentUserId, onEdit, onDelete, onFavorite }) {
  if (loading) return <Empty>불러오는 중...</Empty>;

  if (bookmarks.length === 0)
    return (
      <Empty>
        <EmptyIcon>◈</EmptyIcon>
        <EmptyText>북마크가 없어요</EmptyText>
        <EmptyDesc>위 버튼으로 첫 번째 북마크를 추가해보세요</EmptyDesc>
      </Empty>
    );

  return (
    <Grid>
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          onFavorite={onFavorite}
        />
      ))}
    </Grid>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${tokens.spacing[16]};
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: ${tokens.spacing[8]};
`;

const EmptyIcon = styled.span`
  font-size: 32px;
  color: ${({ theme }) => theme.colors.text.contrast};
  margin-bottom: ${tokens.spacing[4]};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyDesc = styled.p`
  color: ${({ theme }) => theme.colors.text.contrast};
`;

export default BookmarkGrid;
