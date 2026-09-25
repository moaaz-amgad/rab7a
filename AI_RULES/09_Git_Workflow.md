# 09 — Git Workflow & Branching Standards

> Version control standards, branching strategy, pull requests, and commit guidelines.

---

## 1. Branching Strategy (Git Flow / Trunk-Based Hybrid)

| Branch Name       | Purpose                                        | Protection Rules                             |
| ----------------- | ---------------------------------------------- | -------------------------------------------- |
| `main`            | Production-ready code                          | Require PR, 2 approvals, clean CI            |
| `develop`         | Integration branch for current release cycle   | Require PR, 1 approval, clean CI             |
| `feature/*`       | New features or module enhancements            | Derived from `develop`, merges to `develop`  |
| `fix/*`           | Bug fixes for development/staging              | Derived from `develop`, merges to `develop`  |
| `hotfix/*`        | Critical production bug fixes                  | Derived from `main`, merges to `main` & `dev`|
| `release/*`       | Release candidate preparation and staging test | Derived from `develop`, merges to `main`     |

---

## 2. Commit Naming Convention (Conventional Commits)

Format: `<type>(<scope>): <short description>`

### 2.1 Commit Types

- `feat`: A new feature for the user or module
- `fix`: A bug fix
- `docs`: Documentation changes only
- `style`: Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process, tooling, or auxiliary dependencies

### 2.2 Scopes

Use module codes or key infrastructure areas: `hr`, `att`, `pay`, `inv`, `pur`, `sup`, `cust`, `sales`, `pos`, `exp`, `acc`, `rpt`, `set`, `auth`, `db`, `deps`, `ui`.

### 2.3 Examples

```bash
feat(pos): add support for split payment methods
fix(payroll): adjust overtime multiplier calculation for night shifts
refactor(accounting): optimize trial balance query indexing
docs(api): update OpenAPI spec for customer loyalty endpoints
```

---

## 3. Pull Request (PR) Requirements

Every PR submitted to `develop` or `main` must meet the following mandatory checklist:

- [ ] **Title**: Follows Conventional Commits standard.
- [ ] **Description**: Includes a summary of changes, motivation, and issue link.
- [ ] **Test Coverage**: All unit tests pass, new feature has unit/feature tests.
- [ ] **Static Analysis**: Clean run of PHPStan / Larastan (level 8+) and ESLint.
- [ ] **Code Formatting**: Formatted via Laravel Pint and Prettier.
- [ ] **Security**: No secrets, API keys, or raw SQL injections introduced.
- [ ] **Migration Check**: Database migrations are safe and reversible.
- [ ] **Audit Trail**: Financial/data-modifying actions trigger proper audit logs.

---

## 4. Code Review Rules

1. **No Self-Merges**: Authors cannot merge their own pull requests without explicit team authorization.
2. **Review Speed**: Code reviews must be completed within 24 hours of submission.
3. **Constructive Feedback**: Comments must specify rationale and alternative implementations.
4. **Automated Blocking**: Automated CI pipelines must pass before approval can be granted.
