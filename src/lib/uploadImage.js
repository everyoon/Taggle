import { supabase } from './supabase';

export async function uploadImage(file, bucket, path) {
  if (file.size > 2 * 1024 * 1024) return { url: null, error: '이미지는 2MB 이하만 업로드 가능해요.' };

  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type))
    return { url: null, error: 'JPG, PNG, WEBP, GIF 형식만 업로드 가능해요.' };

  const ext = file.name.split('.').pop();
  const filePath = `${path}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });

  if (error) return { url: null, error: '업로드 중 오류가 발생했어요.' };

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { url: data.publicUrl, error: null };
}
