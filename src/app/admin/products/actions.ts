'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServerRSC } from '@/lib/supabaseServerRSC';
import type { PostgrestError } from '@supabase/supabase-js';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export async function createProduct(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const base_cost = Number(formData.get('base_cost') ?? 0);
  const slugInput = String(formData.get('slug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const active = formData.get('active') != null;

  if (!name) throw new Error('Name is required');
  if (!Number.isFinite(base_cost) || base_cost < 0) throw new Error('Base cost is invalid');

  const supabase = await supabaseServerRSC();

  // robust-ish unique slug
  let proposed = slugInput || slugify(name);
  if (!proposed) proposed = `product-${Math.random().toString(36).slice(2, 8)}`;
  const withSuffix = `${proposed}-${Math.random().toString(36).slice(2, 5)}`;

  const { data, error } = await supabase
    .from('base_products')
    .insert({
      name,
      base_cost,
      slug: withSuffix,
      description,
      active,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/admin/products');
  redirect(`/admin/products/${data!.id}/edit`);
}

export async function updateProduct(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const base_cost = Number(formData.get('base_cost') ?? 0);
  const slugInput = String(formData.get('slug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const active = formData.get('active') != null;

  if (!id) throw new Error('Missing id');
  if (!name) throw new Error('Name is required');
  if (!Number.isFinite(base_cost) || base_cost < 0) throw new Error('Base cost is invalid');

  const supabase = await supabaseServerRSC();

  const finalSlug = slugInput ? slugify(slugInput) : slugify(name);

  const { error } = await supabase
    .from('base_products')
    .update({
      name,
      base_cost,
      slug: finalSlug || null,
      description,
      active,
    })
    .eq('id', id);

  if (error) {
    const pgErr = error as PostgrestError | null;
    // 23505 = unique_violation (Postgres)
    if (pgErr?.code === '23505') {
      throw new Error('Slug already in use. Choose another one.');
    }
    throw new Error(error.message);
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}/edit`);
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) throw new Error('Missing id');

  const supabase = await supabaseServerRSC();

  const { error } = await supabase.from('base_products').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/products');
  redirect('/admin/products');
}
