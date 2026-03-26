import { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BookmarkGrid from '../components/bookmark/BookmarkGrid';
import BookmarkModal from '../components/bookmark/BookmarkModal';
import { useBookmarks } from '../hooks/useBookmarks';
import Button from '../components/common/Button';
import { MdAdd } from 'react-icons/md';

function MainPage({ user, onSignOut, onToggleTheme, isDark }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [filter, setFilter] = useState('home');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark, toggleFavorite } = useBookmarks(
    user.id,
    null,
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
    if (editTarget) return await updateBookmark(editTarget.id, form);
    return await addBookmark(form);
  };

  const filtered = bookmarks.filter((b) => {
    if (filter === 'private' && !(b.visibility === 'private' && b.user_id === user.id)) return false;
    if (filter === 'teams' && b.visibility !== 'shared') return false;
    if (filter === 'favorites' && !b.is_favorited) return false;
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

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'favorited') {
      if (a.is_favorited === b.is_favorited) return new Date(b.created_at) - new Date(a.created_at);
      return a.is_favorited ? -1 : 1;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <Layout>
      <Header
        user={user}
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
            <Count>{sorted.length} 개</Count>
            <Button id="add-bookmark-btn" onClick={() => setModalOpen(true)}>
              <MdAdd />
              북마크 추가하기
            </Button>
          </TopBar>
          <BookmarkGrid
            bookmarks={sorted}
            loading={loading}
            currentUserId={user.id}
            filter={filter}
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

const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.primary};
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[16]};
  display: flex;
  flex: 1;
`;

const Main = styled.main`
  border-left: 1px solid${({ theme }) => theme.colors.border.secondary};
  flex: 1;
  padding: ${({ theme }) => theme.spacing[5]};
  overflow-y: auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const Count = styled.span`
  ${({ theme }) => theme.typography.Label['KR-Midium']};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default MainPage;
