// supabase/functions/delete-account/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const supabaseUser = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await supabaseUser.auth.getUser();
  if (error || !user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  // 1. 오너인 팀 ID 조회
  const { data: ownedMembers } = await supabaseAdmin
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .eq('role', 'owner');

  const ownedTeamIds = ownedMembers?.map((m) => m.team_id) ?? [];

  // 2. 오너인 팀의 bookmark_teams 삭제
  if (ownedTeamIds.length > 0) {
    await supabaseAdmin.from('bookmark_teams').delete().in('team_id', ownedTeamIds);
  }

  // 3. 오너인 팀의 team_members 삭제
  if (ownedTeamIds.length > 0) {
    await supabaseAdmin.from('team_members').delete().in('team_id', ownedTeamIds);
  }

  // 4. 오너인 팀 삭제
  if (ownedTeamIds.length > 0) {
    await supabaseAdmin.from('teams').delete().in('id', ownedTeamIds);
  }

  // 5. 유저 북마크 ID 조회
  const { data: bookmarks } = await supabaseAdmin.from('bookmarks').select('id').eq('user_id', user.id);

  const bookmarkIds = bookmarks?.map((b) => b.id) ?? [];

  // 6. 유저 북마크의 bookmark_teams 삭제
  if (bookmarkIds.length > 0) {
    await supabaseAdmin.from('bookmark_teams').delete().in('bookmark_id', bookmarkIds);
  }

  // 7. 유저 북마크 삭제
  await supabaseAdmin.from('bookmarks').delete().eq('user_id', user.id);

  // 8. 팀원으로 참여한 team_members 삭제
  await supabaseAdmin.from('team_members').delete().eq('user_id', user.id);

  // 9. 프로필 삭제
  await supabaseAdmin.from('profiles').delete().eq('id', user.id);

  // 10. Auth 계정 삭제
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteError) return new Response(deleteError.message, { status: 500, headers: corsHeaders });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
