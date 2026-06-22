import { DOCUMENT_ROUTES, PLATFORM_ROUTES, type DocumentSlug, type PlatformSlug } from './nav';

const DOCUMENT_SLUGS = new Set<string>(DOCUMENT_ROUTES.map((route) => route.slug));
const PLATFORM_SLUGS = new Set<string>(PLATFORM_ROUTES.map((route) => route.slug));

export type PlaygroundRoute =
  | { kind: 'home' }
  | { kind: 'document'; slug: DocumentSlug }
  | { kind: 'platform'; slug: PlatformSlug };

export function resolvePlaygroundRoute(pathname: string): PlaygroundRoute {
  if (pathname === '/' || pathname === '') {
    return { kind: 'home' };
  }

  const segment = pathname.replace(/^\//, '').split('/')[0] ?? '';
  if (segment === 'cartao-credito') {
    return { kind: 'document', slug: 'cartao' };
  }
  if (DOCUMENT_SLUGS.has(segment)) {
    return { kind: 'document', slug: segment as DocumentSlug };
  }
  if (PLATFORM_SLUGS.has(segment)) {
    return { kind: 'platform', slug: segment as PlatformSlug };
  }

  return { kind: 'home' };
}

export function playgroundRouteKey(route: PlaygroundRoute): string {
  if (route.kind === 'home') {
    return 'home';
  }
  return `${route.kind}:${route.slug}`;
}
