# Analyse de l'arbre source

> **Projet :** C'EST NICOLAS QUI PAYE
> **Date :** 2026-02-28
> **Scan :** Exhaustif

## Arbre complet annote

```
CestNicolasQuiPaye/
├── .env                        # Variables d'environnement (DB, auth, OAuth)
├── .env.example                # Template des variables requises
├── .gitignore                  # Exclusions Git
├── .prettierrc                 # Configuration Prettier
├── CLAUDE.md                   # Memoire projet pour Claude Code
├── CONTRIBUTING.md             # Guide de contribution
├── LICENSE                     # Licence MIT
├── README.md                   # Documentation principale du projet
├── components.json             # Configuration shadcn/ui
├── docker-compose.dev.yml      # PostgreSQL 16 Alpine (port 5433)
├── drizzle.config.ts           # Configuration Drizzle Kit (schema, migrations)
├── eslint.config.mjs           # Configuration ESLint (Next.js)
├── next-env.d.ts               # Types Next.js auto-generes
├── next.config.ts              # Config Next.js (headers securite, Turbopack)
├── package.json                # Dependances et scripts NPM
├── package-lock.json           # Lockfile NPM
├── postcss.config.mjs          # Configuration PostCSS (Tailwind)
├── railway.toml                # Configuration deploiement Railway
├── tsconfig.json               # Configuration TypeScript (strict, paths @/*)
├── vitest.config.ts            # Configuration Vitest (jsdom, react)
│
├── .github/                    # Infrastructure GitHub
│   ├── ISSUE_TEMPLATE/         # Templates d'issues (bug, feature, contenu)
│   │   ├── bug_report.yml
│   │   ├── content.yml
│   │   └── feature_request.yml
│   └── prompts/                # Prompts BMAD (agents IA)
│
├── public/                     # Assets statiques (images, OG)
│
├── scripts/
│   └── seed.ts                 # ★ Script de seed DB (50+ depenses reelles)
│
├── docs/                       # ★ Documentation du projet (ce dossier)
│
├── src/                        # ═══ CODE SOURCE PRINCIPAL ═══
│   ├── middleware.ts            # ★ Middleware Next.js (protection routes admin/profil)
│   ├── test-setup.ts           # Setup Vitest (@testing-library/jest-dom)
│   │
│   ├── app/                    # ═══ ROUTES (App Router) ═══
│   │   ├── layout.tsx          # ★ Layout racine (providers, nav, footer, fonts)
│   │   ├── page.tsx            # / → Redirect vers /feed/hot
│   │   ├── error.tsx           # Boundary d'erreur global
│   │   ├── global-error.tsx    # Boundary d'erreur fatal
│   │   ├── not-found.tsx       # Page 404 humoristique
│   │   ├── loading.tsx         # Skeleton de chargement global
│   │   │
│   │   ├── (auth)/             # ── Groupe de routes auth (layout centre) ──
│   │   │   ├── layout.tsx      # Layout auth (formulaire centre + logo)
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # /login — Connexion email/Google
│   │   │   ├── register/
│   │   │   │   └── page.tsx    # /register — Inscription
│   │   │   └── onboarding/
│   │   │       └── page.tsx    # /onboarding — Choix pseudonyme
│   │   │
│   │   ├── feed/
│   │   │   └── [sort]/         # ── Flux principal ──
│   │   │       ├── page.tsx    # ★ /feed/hot|new|top — SSR + ISR 60s
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │   │
│   │   ├── s/
│   │   │   └── [id]/           # ── Detail soumission ──
│   │   │       ├── page.tsx    # ★ /s/{uuid} — SSR + ISR 300s + OG dynamique
│   │   │       ├── loading.tsx
│   │   │       ├── error.tsx
│   │   │       └── not-found.tsx
│   │   │
│   │   ├── submit/
│   │   │   ├── page.tsx        # /submit — Formulaire de soumission
│   │   │   └── confirmation/
│   │   │       └── [id]/
│   │   │           └── page.tsx # /submit/confirmation/{id}
│   │   │
│   │   ├── stats/
│   │   │   ├── page.tsx        # /stats — Tableau de bord statistiques
│   │   │   └── loading.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── page.tsx        # /profile — Profil personnel (auth)
│   │   │   ├── settings/
│   │   │   │   └── page.tsx    # /profile/settings — Parametres
│   │   │   └── [userId]/
│   │   │       ├── page.tsx    # /profile/{userId} — Profil public
│   │   │       └── loading.tsx
│   │   │
│   │   ├── leaderboard/
│   │   │   ├── page.tsx        # /leaderboard — Classement karma
│   │   │   └── loading.tsx
│   │   │
│   │   ├── contribuer/
│   │   │   └── page.tsx        # /contribuer — Guide de contribution
│   │   │
│   │   ├── features/
│   │   │   └── page.tsx        # /features — Vote fonctionnalites
│   │   │
│   │   ├── methodologie/
│   │   │   └── page.tsx        # /methodologie — Formules de calcul
│   │   │
│   │   ├── data-status/
│   │   │   └── page.tsx        # /data-status — Fraicheur des donnees
│   │   │
│   │   ├── admin/              # ── Panneau d'administration ──
│   │   │   ├── layout.tsx      # Layout admin (sidebar + auth check)
│   │   │   ├── page.tsx        # /admin — Dashboard (metriques, activite)
│   │   │   ├── moderation/
│   │   │   │   └── page.tsx    # /admin/moderation — File de moderation
│   │   │   ├── flags/
│   │   │   │   └── page.tsx    # /admin/flags — Contenu signale
│   │   │   ├── broadcast/
│   │   │   │   └── page.tsx    # /admin/broadcast — Publication Twitter/X
│   │   │   └── features/
│   │   │       └── page.tsx    # /admin/features — Gestion propositions
│   │   │
│   │   └── api/                # ═══ ENDPOINTS REST ═══
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts  # NextAuth handlers
│   │       │   └── register/route.ts       # POST — Inscription
│   │       ├── feed/route.ts               # GET — Flux pagine
│   │       ├── submissions/
│   │       │   ├── route.ts                # POST — Creer soumission
│   │       │   └── [id]/
│   │       │       ├── route.ts            # PATCH — Editer
│   │       │       ├── vote/route.ts       # POST/DELETE — Voter
│   │       │       ├── comments/route.ts   # GET/POST — Commentaires
│   │       │       ├── sources/route.ts    # GET/POST — Sources
│   │       │       ├── notes/route.ts      # GET/POST — Notes communautaires
│   │       │       ├── solutions/route.ts  # GET/POST — Solutions
│   │       │       ├── flag/route.ts       # POST/GET — Signaler
│   │       │       ├── share/route.ts      # POST — Tracker partage
│   │       │       └── cost/route.ts       # GET — Calculer cout
│   │       ├── votes/batch/route.ts        # GET — Votes par lot
│   │       ├── comments/[id]/vote/route.ts # POST/DELETE — Voter commentaire
│   │       ├── notes/[id]/vote/route.ts    # POST — Voter note
│   │       ├── solutions/[id]/vote/route.ts # POST — Voter solution
│   │       ├── sources/[id]/validate/route.ts # POST — Valider source
│   │       ├── features/
│   │       │   ├── route.ts                # GET/POST — Fonctionnalites
│   │       │   └── [id]/
│   │       │       ├── route.ts            # PATCH — Maj statut (admin)
│   │       │       └── vote/route.ts       # POST — Voter
│   │       ├── leaderboard/route.ts        # GET — Classement
│   │       ├── og/[id]/route.tsx           # GET — Image OG dynamique
│   │       ├── page-views/route.ts         # POST — Analytics
│   │       ├── user/
│   │       │   ├── display-name/route.ts   # PATCH — Pseudonyme
│   │       │   └── delete/route.ts         # POST — Supprimer compte
│   │       ├── v1/
│   │       │   ├── denominators/route.ts   # GET — Denominateurs caches
│   │       │   └── users/[userId]/
│   │       │       ├── route.ts            # GET — Profil
│   │       │       ├── submissions/route.ts # GET — Soumissions
│   │       │       └── votes/route.ts      # GET — Historique votes
│   │       └── admin/
│   │           ├── dashboard/route.ts      # GET — Metriques admin
│   │           ├── submissions/
│   │           │   ├── route.ts            # GET — File moderation
│   │           │   └── [id]/moderate/route.ts # POST — Moderer
│   │           ├── flags/route.ts          # GET — Signalements
│   │           └── broadcast/route.ts      # GET/POST — Diffusion Twitter
│   │
│   ├── components/             # ═══ COMPOSANTS REACT ═══
│   │   ├── ui/                 # ── Composants de base (shadcn/ui) ──
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── skeleton-card.tsx
│   │   │   ├── sonner.tsx      # Notifications toast
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   │
│   │   ├── layout/             # ── Mise en page ──
│   │   │   ├── DesktopNav.tsx  # Navigation desktop (auth, dropdown)
│   │   │   ├── MobileHeader.tsx # Header mobile
│   │   │   ├── MobileTabBar.tsx # Barre d'onglets mobile
│   │   │   ├── Footer.tsx      # Pied de page desktop
│   │   │   └── Providers.tsx   # Providers (Auth, QueryClient, Sonner)
│   │   │
│   │   └── features/           # ── Composants metier (19 domaines) ──
│   │       ├── admin/          # Administration (7 composants)
│   │       ├── auth/           # Authentification (6 composants)
│   │       ├── comments/       # Commentaires (6 composants)
│   │       ├── common/         # Communs (1 composant)
│   │       ├── consequences/   # Consequences cout (2 composants)
│   │       ├── data-status/    # Statut donnees (3 composants)
│   │       ├── feature-voting/ # Vote fonctionnalites (4 composants)
│   │       ├── feed/           # Flux principal (8 composants)
│   │       ├── leaderboard/    # Classement (3 composants)
│   │       ├── methodology/    # Methodologie (3 composants)
│   │       ├── notes/          # Notes communautaires (4 composants)
│   │       ├── profile/        # Profil utilisateur (7 composants)
│   │       ├── sharing/        # Partage social (1 composant)
│   │       ├── solutions/      # Solutions (3 composants)
│   │       ├── sources/        # Sources (3 composants)
│   │       ├── stats/          # Statistiques (6 composants)
│   │       ├── submissions/    # Soumissions (7 composants)
│   │       ├── tweets/         # Embed Twitter (3 composants)
│   │       └── voting/         # Boutons de vote (2 composants)
│   │
│   ├── hooks/                  # ═══ HOOKS PERSONNALISES ═══
│   │   ├── useAuth.ts          # Gate d'authentification
│   │   ├── useVote.ts          # ★ Vote soumission (optimistic UI + Zustand)
│   │   ├── useVoteHydration.ts # Chargement batch des etats de vote
│   │   ├── use-comment-vote.ts # Vote commentaire
│   │   ├── useComments.ts      # Commentaires files (infinite scroll)
│   │   ├── useCommunityNotes.ts # Notes communautaires CRUD
│   │   ├── useSolutions.ts     # Solutions CRUD + vote
│   │   ├── useSources.ts       # Sources CRUD + validation
│   │   ├── useInfiniteScroll.ts # Intersection Observer + pagination
│   │   ├── use-share.ts        # Partage multi-plateforme
│   │   └── use-page-view.ts    # Tracking analytics
│   │
│   ├── lib/                    # ═══ LOGIQUE METIER ═══
│   │   ├── utils.ts            # cn() — Fusion classes Tailwind
│   │   ├── metadata.ts         # Constantes SEO (URL, nom, Twitter)
│   │   ├── analytics.ts        # Tracking Plausible/Umami
│   │   │
│   │   ├── api/                # ── Couche API ──
│   │   │   ├── errors.ts       # ★ Classe ApiError standardisee
│   │   │   ├── response.ts     # ★ Fonctions apiSuccess/apiError
│   │   │   ├── rate-limit.ts   # 8 buckets Upstash Redis
│   │   │   ├── submissions.ts  # ★ Requetes feed (hot/new/top, curseurs)
│   │   │   ├── submission-detail.ts # Detail avec visibilite par role
│   │   │   ├── votes.ts        # Cast/remove vote (transactions)
│   │   │   ├── ip-votes.ts     # Votes anonymes (hash IP)
│   │   │   ├── users.ts        # Profils, karma, classement
│   │   │   ├── stats.ts        # Statistiques plateforme (agregations)
│   │   │   ├── cost-engine.ts  # Client microservice calcul (FastAPI)
│   │   │   ├── cost-cache.ts   # ★ Cache multi-niveaux (mem→Redis→API→seed)
│   │   │   └── denominators.ts # API denominateurs haut niveau
│   │   │
│   │   ├── auth/               # ── Authentification ──
│   │   │   ├── index.ts        # ★ Config NextAuth (Google, Credentials, JWT)
│   │   │   └── helpers.ts      # getUser, requireAuth, requireAdmin
│   │   │
│   │   ├── db/                 # ── Base de donnees ──
│   │   │   ├── index.ts        # ★ Connexion PostgreSQL (pool 10)
│   │   │   ├── schema.ts       # ★ Schema Drizzle (22 tables, relations)
│   │   │   └── helpers.ts      # Generateur anonymousId "Nicolas #XXXX"
│   │   │
│   │   ├── constants/
│   │   │   └── categories.ts   # 16 categories avec icones et couleurs
│   │   │
│   │   ├── utils/              # ── Utilitaires ──
│   │   │   ├── format.ts       # Formatage FR (EUR, dates, nombres)
│   │   │   ├── validation.ts   # ★ Schemas Zod API (~15 schemas)
│   │   │   ├── hot-score.ts    # Algorithme de classement hot
│   │   │   ├── karma.ts        # Calcul karma + paliers
│   │   │   ├── cost-calculator.ts # Moteur de calcul pur TypeScript
│   │   │   ├── ip-hash.ts      # Hash IP SHA-256 (RGPD)
│   │   │   ├── share.ts        # UTM, URLs partage, clipboard
│   │   │   ├── tweet-detector.ts # Detection URLs Twitter/X
│   │   │   ├── sanitize.ts     # Anti-XSS (stripHtmlTags)
│   │   │   ├── user-display.ts # Resolution pseudonyme + masquage email
│   │   │   ├── denominator-labels.ts # Labels denominateurs FR
│   │   │   └── denominator-freshness.ts # Fraicheur donnees
│   │   │
│   │   ├── validators/         # ── Validation Zod (formulaires) ──
│   │   │   ├── auth.ts         # Schemas login/register
│   │   │   ├── display-name.ts # Schema pseudonyme (mots interdits)
│   │   │   └── delete-account.ts # Confirmation "SUPPRIMER"
│   │   │
│   │   └── twitter/
│   │       └── client.ts       # Client Twitter/X API v2 (postTweet)
│   │
│   ├── stores/
│   │   └── vote-store.ts       # ★ Zustand — Cache votes (optimistic UI)
│   │
│   └── types/                  # ═══ TYPES TYPESCRIPT ═══
│       ├── submission.ts       # SubmissionCardData, SubmissionDetailData
│       ├── user.ts             # UserProfile, UserSubmission, UserVote
│       ├── stats.ts            # StatsData
│       ├── cost-engine.ts      # DenominatorData, CostToNicolasResult
│       └── next-auth.d.ts      # Augmentation types NextAuth
```

## Repertoires critiques

| Repertoire | Description | Fichiers |
|------------|-------------|----------|
| `src/app/api/` | Tous les endpoints REST | ~30 routes |
| `src/lib/db/schema.ts` | Schema complet de la BDD | 22 tables |
| `src/lib/api/` | Logique metier cote serveur | 11 fichiers |
| `src/components/features/` | Composants metier | ~75 fichiers |
| `src/hooks/` | Hooks React Query + votes | 11 hooks |
| `src/lib/utils/validation.ts` | Tous les schemas Zod API | ~15 schemas |
| `src/middleware.ts` | Protection des routes | 1 fichier |

## Points d'entree

| Point d'entree | Fichier | Description |
|----------------|---------|-------------|
| Application | `src/app/layout.tsx` | Layout racine (providers, nav) |
| Middleware | `src/middleware.ts` | Routage et protection |
| Base de donnees | `src/lib/db/index.ts` | Connexion PostgreSQL |
| Auth | `src/lib/auth/index.ts` | Configuration NextAuth |
| Seed | `scripts/seed.ts` | Peuplement initial BDD |
