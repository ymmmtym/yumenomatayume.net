import type { Frontmatter } from '../types';

const modules = import.meta.glob('../content/blog/*.md', { eager: true });

export interface LocalPost {
  title: string;
  pubDate: string;
  description: string;
  slug: string;
  link: string;
  source: string;
  icon: string;
}

export function getLocalPosts(): LocalPost[] {
  return Object.entries(modules).map(([path, module]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    return {
      title: module.frontmatter.title,
      pubDate: module.frontmatter.pubDate,
      description: module.frontmatter.description || '',
      slug,
      link: `/blog/${slug}`,
      source: '個人ブログ',
      icon: '📋',
    };
  });
}
