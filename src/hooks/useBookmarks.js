import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBookmarks(userId, teamId) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchBookmarks();
  }, [userId, teamId]);

  const fetchBookmarks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookmarks')
      .select(
        `
      *,
      profiles:user_id (
        name,
        avatar_url
      )
    `,
      )
      .order('created_at', { ascending: false });

    if (error) console.error('fetchBookmarks 에러:', error); // ← 추가
    if (!error) setBookmarks(data);
    setLoading(false);
  };

  const addBookmark = async (payload) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ ...payload, user_id: userId, team_id: teamId })
      .select(
        `
      *,
      profiles:user_id (
        name,
        avatar_url
      )
    `,
      )
      .single();

    if (error) console.error('addBookmark 에러:', error); // ← 추가
    if (!error) setBookmarks((prev) => [data, ...prev]);
    return { error };
  };

  const updateBookmark = async (id, payload) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .update(payload)
      .eq('id', id)
      .select(
        `
        *,
        profiles:user_id (
          name,
          avatar_url
        )
      `,
      )
      .single();

    if (!error) setBookmarks((prev) => prev.map((b) => (b.id === id ? data : b)));
    return { error };
  };

  const deleteBookmark = async (id) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);

    if (!error) setBookmarks((prev) => prev.filter((b) => b.id !== id));
    return { error };
  };

  const toggleFavorite = async (id, current) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .update({ is_favorited: !current })
      .eq('id', id)
      .select(
        `
      *,
      profiles:user_id (
        name,
        avatar_url
      )
    `,
      )
      .single();

    if (!error) setBookmarks((prev) => prev.map((b) => (b.id === id ? data : b)));
    return { error };
  };

  return { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark, toggleFavorite, refetch: fetchBookmarks };
}
