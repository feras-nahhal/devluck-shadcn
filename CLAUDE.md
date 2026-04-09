@AGENTS.md

# Coding Style Guide

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Validation:** Zod v4
- **Forms:** React Hook Form + @hookform/resolvers
- **Server State:** TanStack React Query v5
- **Testing:** Vitest + React Testing Library
- **Icons:** Lucide React
- **Theming:** next-themes (light/dark)

## Project Structure

```
src/
├── app/              # Next.js App Router (pages, layouts, route handlers)
│   ├── (marketing)/  # Route groups for public pages
│   └── dashboard/    # Authenticated pages
├── components/
│   ├── ui/           # shadcn/ui primitives (add via `npx shadcn@latest add <component>`, update via `--overwrite`, never run `shadcn add --all`)
│   ├── common/       # Shared, reusable components
│   └── layouts/      # Site header, footer, navigation
├── hooks/            # Custom React hooks (useDebounce, useMediaQuery, etc.)
├── lib/              # Utility functions (cn, formatters, helpers)
├── providers/        # React context providers (query, theme, tooltip)
├── config/           # App-wide configuration (site.ts)
└── types/            # Shared TypeScript type definitions
```

## TypeScript Conventions

- **Strict mode is mandatory** — never disable strict checks.
- **No `any`** — use `unknown` for untrusted data, then narrow.
- **Explicit types on exports** — all exported functions must have parameter and return types.
- **Infer locally** — let TypeScript infer obvious variable types inside functions.
- **Props:** Use named `interface` or `type` for component props. Do not use `React.FC`.
- **Prefer string literal unions** over `enum`.
- **Use `as const`** for configuration objects to preserve literal types.

```typescript
// --- DO: Props pattern used in this project ---
function MyComponent({ className, ...props }: React.ComponentProps<"div">) { ... }

// --- DO: Extended props with defaults ---
function MyComponent({ className, variant = "default", ...props }:
  React.ComponentProps<"div"> & { variant?: "default" | "compact" }) { ... }

// --- DON'T: Never use `any` ---
function handleData(data: any) { ... }          // BAD: loses all type safety

// --- DO: Use `unknown` and narrow ---
function handleData(data: unknown) {            // GOOD: forces you to check the type
  if (typeof data === "string") {
    console.log(data.toUpperCase())             // TypeScript knows it's a string here
  }
}

// --- DON'T: Don't use React.FC ---
const MyComponent: React.FC<Props> = () => { }  // BAD: outdated pattern

// --- DO: Use function declarations ---
function MyComponent({ title }: Props) { }      // GOOD: cleaner, hoisted
```

## Component Patterns

- **Function declarations** — use `function ComponentName()`, not arrow functions, for components.
- **Composition over configuration** — build compound components (Card, CardHeader, CardContent) rather than mega-components with many props.
- **`data-slot` attributes** — use `data-slot="component-name"` for parent-aware styling via `has-data-[slot=...]`.
- **`cn()` for class merging** — always use `cn()` from `@/lib/utils` to merge Tailwind classes. Never concatenate class strings manually.
- **Named exports** — export components by name at the bottom of the file, not inline. Exception: Next.js route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) must use `export default function`.
- **Spread remaining props** — always forward `...props` and `className` to the root element.

```typescript
function MyComponent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="my-component"
      className={cn("base-classes", className)}
      {...props}
    />
  )
}

export { MyComponent }
```

## Styling Rules

- **Tailwind only** — no CSS modules, styled-components, or inline styles.
- **Use design tokens** — reference CSS variables (`bg-card`, `text-muted-foreground`, `ring-foreground/10`) instead of raw colors.
- **Responsive design** — use Tailwind breakpoints (`sm:`, `md:`, `lg:`). Use container queries (`@container`) for component-level responsiveness.
- **Dark mode** — all UI must work in both light and dark themes. Use semantic color tokens, not hardcoded values.
- **No magic numbers** — use Tailwind spacing scale (`p-4`, `gap-3`) instead of arbitrary values (`p-[13px]`).
- **Group utilities** — use `group/name` and `group-data-[...]/name` for nested state-dependent styling.
- **Tailwind v4 font gotcha:** `@theme` block CSS variables resolve at `:root`, but Next.js font optimization sets font variables on `<body>`. Override `--font-sans` on `body` in `globals.css` where the font variable is available, not in `@theme`.

```typescript
// --- DON'T: No hardcoded colors ---
<div className="bg-[#1a1a2e] text-[#ffffff]">   // BAD: breaks dark mode, not themeable

// --- DO: Use semantic design tokens ---
<div className="bg-card text-card-foreground">   // GOOD: adapts to light/dark theme

// --- DON'T: No arbitrary spacing ---
<div className="p-[13px] mt-[7px]">             // BAD: inconsistent spacing

// --- DO: Use Tailwind's spacing scale ---
<div className="p-3 mt-2">                      // GOOD: consistent design system

// --- DON'T: Never concatenate classes manually ---
<div className={"base " + (active ? "active" : "")}>  // BAD: fragile, no deduplication

// --- DO: Always use cn() for conditional classes ---
<div className={cn("base", active && "active")}>       // GOOD: handles conflicts
```

## Immutability

- **Never mutate** objects, arrays, or state directly.
- **Spread to update:** `{ ...obj, field: newValue }` for objects, `[...arr, newItem]` for arrays.
- **Use `Readonly<T>`** for function parameters that should not be mutated.

```typescript
// --- DON'T: Never mutate state directly ---
user.name = "Ali"                               // BAD: mutation causes bugs with React
items.push(newItem)                             // BAD: mutates the original array

// --- DO: Create new objects/arrays ---
const updatedUser = { ...user, name: "Ali" }    // GOOD: new object, original unchanged
const updatedItems = [...items, newItem]         // GOOD: new array, original unchanged

// --- DO: Remove an item without mutation ---
const filtered = items.filter(item => item.id !== idToRemove)  // GOOD
```

## Error Handling

- **Try-catch with narrowing** — catch `unknown`, narrow with `instanceof Error`.
- **No silent failures** — always log errors server-side, show user-friendly messages client-side.
- **Validate at boundaries** — use Zod schemas for all external input (API requests, form data, env vars).

```typescript
// --- DON'T: Never silently ignore errors ---
try {
  await fetchData()
} catch (e) { }                                 // BAD: error disappears silently

// --- DO: Always handle errors explicitly ---
try {
  await fetchData()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Fetch failed:", error.message) // GOOD: log the actual error
  }
  throw new Error("Failed to load data")         // GOOD: re-throw with context
}

// --- DO: Validate external input with Zod ---
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
})
```

## State Management

- **Server state:** TanStack React Query for all async data (fetching, caching, mutations).
- **Client state:** `useState` / `useReducer` for local UI state.
- **Global client state:** React Context via providers in `src/providers/`.
- **No prop drilling** — lift shared state to the nearest common provider.
- **URL state:** Use search params for filterable/shareable UI state.

## File & Naming Conventions

- **Files:** `kebab-case.tsx` for components, `kebab-case.ts` for utilities.
- **Components:** `PascalCase` for component names.
- **Hooks:** `camelCase` with `use` prefix (`useDebounce`, `useMediaQuery`).
- **Constants:** `SCREAMING_SNAKE_CASE` for true constants, `camelCase` for config objects.
- **Types:** `PascalCase` for interfaces and type aliases.
- **Path aliases:** Always use `@/` imports (maps to `src/`). Never use relative paths like `../../`. Exception: test files in `__tests__/` directories should use relative imports to their parent module.

```
Examples:
  File:      user-profile.tsx        (kebab-case)
  Component: UserProfile             (PascalCase)
  Hook:      useUserProfile          (camelCase with "use" prefix)
  Constant:  MAX_RETRY_COUNT = 3     (SCREAMING_SNAKE_CASE)
  Type:      interface UserProfile   (PascalCase)

  Import: import { UserProfile } from "@/components/user-profile"   // GOOD
  Import: import { UserProfile } from "../../components/user-profile" // BAD
```

## Design Principles

### SOLID

- **Single Responsibility (SRP):** Each component, hook, or utility does one thing. A component renders UI. A hook manages state logic. A utility transforms data. If a file has multiple reasons to change, split it.
- **Open/Closed (OCP):** Extend behavior through composition and props, not by modifying existing components. Use compound components and render props over editing base components.
- **Liskov Substitution (LSP):** Components accepting `React.ComponentProps<"div">` must behave like a `<div>` — forward all props, support `className`, render the expected element.
- **Interface Segregation (ISP):** Keep prop interfaces small and focused. Don't force consumers to provide props they don't need. Split large interfaces into smaller, composable ones.
- **Dependency Inversion (DIP):** Components depend on abstractions (interfaces, context, hooks), not concrete implementations. Data fetching logic lives in hooks or query functions, not in components directly.

### DRY (Don't Repeat Yourself)

- Extract repeated logic into custom hooks (`src/hooks/`).
- Extract repeated UI into shared components (`src/components/common/`).
- Extract repeated utilities into `src/lib/`.
- Use component variants via `cva` (class-variance-authority) for repeated class combinations. Avoid `@apply` except in global styles.
- **But:** Three similar lines of code is better than a premature abstraction. Wait until a pattern appears three times before extracting.

### KISS (Keep It Simple)

- Prefer the simplest solution that works correctly.
- Avoid premature optimization — measure first, optimize second.
- No unnecessary abstractions, wrappers, or indirection layers.
- If a junior developer can't understand the code in 30 seconds, it's too complex.

### YAGNI (You Aren't Gonna Need It)

- Don't build features, utilities, or abstractions for hypothetical future needs.
- Don't add configuration options nobody asked for.
- Don't create generic frameworks when a specific solution suffices.

### Composition Over Inheritance

- Build complex UI from small, composable pieces.
- Use hooks to compose behavior (`useDebounce` + `useMediaQuery` in a component).
- Use React Context for cross-cutting concerns, not prop chains.

### Separation of Concerns

- **UI layer:** Components render markup and handle user events.
- **State layer:** Hooks and React Query manage data and state transitions.
- **Data layer:** API functions and query keys live in dedicated modules.
- **Validation layer:** Zod schemas define shape and constraints.
- Never mix data fetching, business logic, and rendering in the same function.

```typescript
// --- DON'T: Everything jammed into one component ---
function UserProfile() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    fetch("/api/users/1")                        // BAD: data fetching in component
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])
  const fullName = user?.first + " " + user?.last // BAD: business logic in component
  return <div>{fullName}</div>
}

// --- DO: Separate concerns ---
// In src/hooks/use-user.ts
function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),                // Data layer handles fetching
  })
}

// In src/components/user-profile.tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useUser(userId)         // Hook handles state
  return <div>{user?.fullName}</div>             // Component only renders
}
```

### Fail Fast

- Validate inputs at the boundary (API routes, form submissions, env vars).
- Throw early with clear error messages rather than passing bad data downstream.
- Use TypeScript's type system to catch errors at compile time, not runtime.

## Code Quality

- **Small files:** 200–400 lines typical, 800 max.
- **Small functions:** <50 lines per function.
- **No deep nesting:** max 4 levels of indentation.
- **No `console.log`** in production code — use proper logging.
- **No hardcoded secrets** — use environment variables.
- **No unused imports or variables** — clean up before committing.

## Testing

- **Framework:** Vitest + React Testing Library.
- **TDD workflow:** Write tests first (RED), implement (GREEN), refactor (IMPROVE).
- **Coverage target:** 80% minimum.
- **Test files:** Co-locate in `__tests__/` directories adjacent to source.
- **Test behavior, not implementation** — assert on rendered output and user interactions, not internal state.

## Git Conventions

- **Commit format:** `<type>: <description>` (feat, fix, refactor, docs, test, chore, perf, ci).
- **Small, focused commits** — one logical change per commit.
- **Branch naming:** `feature/description`, `fix/description`, `chore/description`.

## Security Checklist

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user input validated with Zod
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (no `dangerouslySetInnerHTML` without sanitization)
- [ ] Error messages do not leak sensitive data
- [ ] Environment variables validated at startup

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
