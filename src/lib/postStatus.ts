export const POST_STATUSES = ['draft', 'in_review', 'rework', 'published'] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export function normalizeStatus(status: string | undefined | null): PostStatus {
  if (!status) return 'draft';
  return (POST_STATUSES as readonly string[]).includes(status) ? (status as PostStatus) : 'draft';
}

export function isPublished(status: string | undefined | null): boolean {
  return normalizeStatus(status) === 'published';
}

export function statusLabel(status: string | undefined | null, lang: 'cs' | 'en' = 'cs'): string {
  const normalized = normalizeStatus(status);
  const labels = {
    cs: {
      draft: 'Draft',
      in_review: 'Ke schválení',
      rework: 'Vráceno k přepracování',
      published: 'Publikováno',
    },
    en: {
      draft: 'Draft',
      in_review: 'In review',
      rework: 'Needs rework',
      published: 'Published',
    },
  } as const;

  return labels[lang][normalized];
}
