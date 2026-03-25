import { useState } from 'react';
import styled from 'styled-components';
import { tokens } from '../styles/theme';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BookmarkGrid from '../components/bookmark/BookmarkGrid';
import BookmarkModal from '../components/bookmark/BookmarkModal';
import { useBookmarks } from '../hooks/useBookmarks';

function MainPage({ user, team, onSignOut, onToggleTheme, isDark }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark, toggleFavorite } = useBookmarks(
    (user.id, team.id),
  );

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleEdit = (bookmark) => {
    setEditTarget(bookmark);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = async (form) => {
    if (editTarget) {
      return await updateBookmark(editTarget.id, form);
    } else {
      return await addBookmark(form);
    }
  };

  const filtered = bookmarks.filter((b) => {
    if (filter === 'private' && !(b.visibility === 'private' && b.user_id === user.id)) return false;
    if (filter === 'shared' && b.visibility !== 'shared') return false;
    if (filter === 'mine' && b.user_id !== user.id) return false;
    if (filter === 'favorited' && !b.is_favorited) return false;
    if (selectedTags.length > 0 && !selectedTags.every((t) => b.tags?.includes(t))) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit =
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.tags?.some((t) => t.toLowerCase().includes(q)) ||
        b.url?.toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  return (
    <Layout>
      <Header
        user={user}
        team={team}
        search={search}
        onSearch={setSearch}
        onSignOut={onSignOut}
        onToggleTheme={onToggleTheme}
        isDark={isDark}
      />
      <Body>
        <Sidebar
          filter={filter}
          onFilterChange={setFilter}
          selectedTags={selectedTags}
          onTagToggle={toggleTag}
          onTagClear={() => setSelectedTags([])}
        />
        <Main>
          <TopBar>
            <ResultCount>{filtered.length}개</ResultCount>
            <AddButton onClick={() => setModalOpen(true)}>+ 북마크 추가</AddButton>
          </TopBar>
          <BookmarkGrid
            bookmarks={filtered}
            loading={loading}
            currentUserId={user.id}
            onEdit={handleEdit}
            onDelete={deleteBookmark}
            onFavorite={toggleFavorite}
          />
        </Main>
      </Body>

      <BookmarkModal open={modalOpen} onClose={handleModalClose} onSubmit={handleSubmit} editTarget={editTarget} />
    </Layout>
  );
}
// 1. styled-components로 h1 태그 스타일링
const LogoTitle = styled.h1`
  font-family: 'Lugati v1', sans-serif; /* Lugati 폰트 적용! */
  font-size: 48px; /* 레퍼런스처럼 크게 (필요하면 수정해) */
  font-weight: 700;
  color: ${({ theme }) => theme.colors.surface.brand}; /* 아까 테마에 있던 브랜드 컬러(#90a1b8) 적용 */

  /* 만약 가운데 정렬이 필요하다면 */
  text-align: center;
`;

const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
`;

const Main = styled.main`
  flex: 1;
  padding: ${tokens.spacing[24]};
  overflow-y: auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${tokens.spacing[20]};
`;

const ResultCount = styled.span`
  color: ${({ theme }) => theme.colors.text.contrast};
`;

const AddButton = styled.button`
  height: 36px;
  padding: 0 ${tokens.spacing[16]};
  border-radius: ${tokens.radius.md};
  background-color: ${({ theme }) => theme.colors.text.primary};
  transition: opacity ${tokens.transition.fast};

  &:hover {
    opacity: 0.85;
  }
`;

export default MainPage;
