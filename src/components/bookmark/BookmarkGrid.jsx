import styled from 'styled-components';
import { MdAdd, MdOutlineGroups } from 'react-icons/md'; // 사용할 아이콘 임포트
import BookmarkCard from './BookmarkCard';
import Button from '../common/Button';

const EMPTY_CONFIG = {
  home: {
    title: 'Taggle에 첫 번째 북마크를 채워주세요!',
    desc: '나만 보고 싶은 디자인부터 팀원과 공유할 레퍼런스까지,<br />태그를 달아 자유롭게 저장해 보세요.',
    btnText: '첫 북마크 추가하기',
    icon: MdAdd,
    action: 'add',
  },
  private: {
    title: '나만 알고 싶은 사이트를 저장해보세요!',
    desc: '외부에 공개되지 않는 개인용 북마크를<br />안전하게 보관해 보세요.',
    btnText: '개인 북마크 추가하기',
    icon: MdAdd,
    action: 'add',
  },
  teams: {
    title: '팀원들과 북마크를 공유해보세요!',
    desc: '팀을 만들고 팀원들과 함께 북마크를 공유해 보세요.<br />협업의 시작은 공유부터!',
    btnText: '새 팀 생성하기',
    icon: MdOutlineGroups,
    action: 'team',
  },
  favorites: {
    title: '자주 보는 북마크가 아직 없어요.',
    desc: '별 아이콘을 눌러 자주 방문하는 사이트를<br />즐겨찾기에 추가해 보세요.',
    btnText: null,
    icon: null,
    action: null,
  },
};

function BookmarkGrid({ bookmarks, loading, currentUserId, filter, onEdit, onDelete, onFavorite }) {
  if (loading)
    return (
      <Empty>
        <EmptyText>불러오고 있어요...</EmptyText>
      </Empty>
    );

  if (bookmarks.length === 0) {
    const config = EMPTY_CONFIG[filter] || EMPTY_CONFIG.home;
    const IconComponent = config.icon;
    return (
      <Empty>
        <EmptyTextInner>
          <EmptyTitle>{config.title}</EmptyTitle>
          <EmptyDesc dangerouslySetInnerHTML={{ __html: config.desc }} />
        </EmptyTextInner>
        {config.btnText && (
          <Button
            $invert
            onClick={() => {
              if (config.action === 'add') {
                document.getElementById('add-bookmark-btn')?.click();
              } else if (config.action === 'team') {
                alert('팀 생성 기능은 준비 중입니다!');
              }
            }}
          >
            {IconComponent && <IconComponent size={24} />}
            {config.btnText}
          </Button>
        )}
      </Empty>
    );
  }

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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[16]} 0;
  gap: ${({ theme }) => theme.spacing[8]};
  text-align: center;
`;
const EmptyTextInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;
const EmptyTitle = styled.p`
  ${({ theme }) => theme.typography.Title['KR-Large']};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmptyDesc = styled.p`
  ${({ theme }) => theme.typography.Body['KR-Midium']};
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const EmptyText = styled.p`
  ${({ theme }) => theme.typography.Body['KR-Midium']};
  color: ${({ theme }) => theme.colors.text.contrast};
`;

export default BookmarkGrid;
