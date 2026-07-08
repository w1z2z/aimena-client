# Aimena Frontend

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 marketplace frontend.

## Architecture (Feature-Sliced Design)

```
src/
├── app/              # Next.js App Router routes
├── entities/         # Domain models (listing, etc.)
├── features/         # Business features (auth, home-search)
├── widgets/          # Page sections (hero, listings grid, header)
└── shared/           # API, UI kit, config, providers
```

**Dependency direction:** `app → widgets → features → entities → shared`

## Key modules

| Module | Purpose |
|--------|---------|
| `entities/listing` | Listing types, condition mappings, `ListingCard`, React Query hooks |
| `features/home-search` | Hero + filter state, catalog bootstrap |
| `features/auth` | Auth context, registration gate modal |
| `shared/config/tokens.ts` | Design tokens (colors, layout) |
| `shared/providers/QueryProvider.tsx` | TanStack React Query |

## Design tokens

Tokens live in `shared/config/tokens.ts` and are mirrored in Tailwind via `@theme` in `globals.css`:

- `text-brand`, `bg-accent`, `text-accent`, `bg-surface`, `bg-lime`
- `max-w-container-home` (1441px)
- Listing card width: 342px (`--spacing-card`)

Component styles for listing cards: `src/styles/listing-card.css`

## Scripts

```bash
pnpm dev      # development server
pnpm build    # production build
pnpm lint     # ESLint
```

## Environment

Set `NEXT_PUBLIC_API_URL` to the backend API base URL (see `shared/api/http.ts`).
