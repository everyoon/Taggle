import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBookmarks(userId, filter, selectedTags) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bookmarks')
        .select(
          `
          *,
          profiles!user_id (name, avatar_url),
          teams (name),
          bookmark_teams (team_id)
        `,
        )
        .order('created_at', { ascending: false });

      // 서버 사이드 필터링
      if (filter === 'teams') {
        query = query.eq('visibility', 'shared');
      } else if (filter === 'private') {
        query = query.eq('visibility', 'private');
      } else if (filter === 'favorites') {
        query = query.eq('is_favorited', true);
      } else if (filter && filter.startsWith('team_')) {
        const specificTeamId = filter.replace('team_', '');
        query = query.eq('team_id', specificTeamId);
      }

      if (selectedTags && selectedTags.length > 0) {
        query = query.overlaps('tags', selectedTags);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted =
        data?.map((b) => ({
          ...b,
          selectedTeams: b.bookmark_teams?.map((bt) => bt.team_id) || [],
        })) ?? [];

      setBookmarks(formatted);
    } catch (error) {
      console.error('fetchBookmarks 에러:', error.message);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedTags]);

  useEffect(() => {
    if (userId) fetchBookmarks();
  }, [userId, fetchBookmarks]);

  // 업데이트 후 리스트 관리 로직 (공통)
  const updateLocalState = (updatedItem) => {
    setBookmarks((prev) => {
      let shouldKeep = true;
      if (filter === 'favorites' && !updatedItem.is_favorited) shouldKeep = false;
      if (filter === 'private' && updatedItem.visibility !== 'private') shouldKeep = false;
      if (filter === 'teams' && updatedItem.visibility !== 'shared') shouldKeep = false;
      if (filter.startsWith('team_') && updatedItem.team_id !== filter.replace('team_', '')) shouldKeep = false;

      if (!shouldKeep) {
        return prev.filter((b) => b.id !== updatedItem.id);
      }
      return prev.map((b) => (b.id === updatedItem.id ? updatedItem : b));
    });
  };

  const toggleFavorite = async (id, currentStatus) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .update({ is_favorited: !currentStatus })
      .eq('id', id)
      .select(`*, profiles!user_id (name, avatar_url), teams (name), bookmark_teams (team_id)`)
      .single();

    if (!error) {
      const formatted = {
        ...data,
        selectedTeams: data.bookmark_teams?.map((bt) => bt.team_id) || [],
      };
      updateLocalState(formatted);
    }
    return { error };
  };

  const updateBookmark = async (id, payload) => {
    try {
      const { selectedTeams, ...updateData } = payload;
      const { data, error } = await supabase
        .from('bookmarks')
        .update({
          ...updateData,
          team_id: payload.visibility === 'shared' && selectedTeams?.length > 0 ? selectedTeams[0] : null,
        })
        .eq('id', id)
        .select(`*, profiles!user_id (name, avatar_url), teams (name), bookmark_teams (team_id)`)
        .single();

      if (error) throw error;

      await supabase.from('bookmark_teams').delete().eq('bookmark_id', id);
      if (payload.visibility === 'shared' && selectedTeams?.length > 0) {
        const teamData = selectedTeams.map((tId) => ({ bookmark_id: id, team_id: tId }));
        await supabase.from('bookmark_teams').insert(teamData);
      }

      updateLocalState({ ...data, selectedTeams: selectedTeams || [] });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // 3. 북마크 추가
  const addBookmark = async (form) => {
    try {
      const { selectedTeams, ...insertData } = form;

      const { data: newBookmark, error: bookmarkError } = await supabase
        .from('bookmarks')
        .insert({
          ...insertData,
          user_id: userId,
          team_id: selectedTeams.length > 0 ? selectedTeams[0] : null,
          title: insertData.title || '제목 없음',
        })
        .select(
          `
          *,
          profiles!user_id (name, avatar_url),
          teams (name),
          bookmark_teams (team_id)
        `,
        )
        .single();

      if (bookmarkError) throw bookmarkError;

      if (form.visibility === 'shared' && selectedTeams?.length > 0) {
        const teamData = selectedTeams.map((tId) => ({
          bookmark_id: newBookmark.id,
          team_id: tId,
        }));
        await supabase.from('bookmark_teams').insert(teamData);
      }

      // 로컬 상태 가공해서 추가
      const formattedNew = {
        ...newBookmark,
        selectedTeams: selectedTeams || [],
      };

      setBookmarks((prev) => [formattedNew, ...prev]);
      return { error: null };
    } catch (error) {
      console.error('addBookmark 에러:', error.message);
      return { error };
    }
  };

  // 5. 북마크 삭제
  const deleteBookmark = async (id) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (!error) setBookmarks((prev) => prev.filter((b) => b.id !== id));
    return { error };
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
    refetch: fetchBookmarks,
  };
}
