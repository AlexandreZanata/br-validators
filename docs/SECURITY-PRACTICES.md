# Security practices

> Guidance for **maintainers**, **contributors**, and **integrators** of BR Validators.
> Reporting vulnerabilities: [SECURITY.md](../SECURITY.md) (private — not public issues).

---

## Threat model (validation library)

This library is **pure logic** — no auth, no database, no network in core. Primary risks:

| Threat | Impact | Mitigation |
|--------|--------|------------|
| **Incorrect validation** | Invalid CPF/CNPJ accepted → fraud, compliance failure | Official algorithms + golden tests |
| **False rejection** | Valid documents rejected → UX/business blockage | Same + regression suite |
| **ReDoS** | Crafted input hangs CPU | Linear-time algorithms; avoid nested quantifiers |
| **Supply chain** | Malicious npm publish | 2FA on npm, provenance, CI-only publish |
| **PII in tests** | Leaked real taxpayer IDs | Synthetic vectors only |
| **Misleading docs** | Insecure integration patterns | SECURITY-PRACTICES + LIBRARY-API |

---

## Maintainer checklist

### Every PR touching `core/`

- [ ] Matches [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md)
- [ ] Golden vector test added/updated
- [ ] No real CPF/CNPJ from production
- [ ] CHANGELOG entry (Security section if validation fix)
- [ ] Version impact per [VERSIONING.md](VERSIONING.md)

### Every release

- [ ] `pnpm audit --prod --audit-level=high` (also runs in CI — see [SECURITY.md](../SECURITY.md#dependency-audit-ci))
- [ ] Tag matches CHANGELOG version
- [ ] GitHub Release notes include security-relevant changes
- [ ] No secrets in published tarball

### Official spec updates (RFB, Bacen, etc.)

- [ ] Monitor SERPRO/RFB notices during CNPJ 2026 rollout
- [ ] Patch within SLA in [SECURITY.md](../SECURITY.md)
- [ ] Migration guide if behavior changes

---

## Contributor checklist

- Never commit `.env`, tokens, or real PII
- Use `Signed-off-by` for commits (DCO recommended)
- Security bugs → private advisory first ([SECURITY.md](../SECURITY.md))
- MIT-compatible code only ([OPEN-SOURCE.md](OPEN-SOURCE.md))

---

## Integrator guidance

How to use this library **safely** in your application:

### 1. Validate server-side

Client-side validation is UX only. **Always re-validate on the server** before persisting or transacting.

```typescript
// Good
const result = validateCnpj(req.body.cnpj);
if (!result.ok) return 400;

// Bad — trusting client-only validation
```

### 2. Store as string

CNPJ alphanumeric **requires** string storage:

```sql
-- Good
cnpj VARCHAR(14) NOT NULL

-- Bad — breaks July 2026
cnpj BIGINT
```

See [CNPJ-ALPHANUMERIC.md](CNPJ-ALPHANUMERIC.md).

### 3. Do not log full documents

CPF/CNPJ are sensitive personal/business data (LGPD).

- Log validation **result** (`ok: false`, `code`), not raw input
- Mask in logs: `12.345.678/****-**`

### 4. Pin library version

Especially pre-1.0:

```json
"br-validators": "0.1.0"
```

Subscribe to GitHub releases for security patches.

### 5. Handle errors by code

Use `ValidationErrorCode`, not message strings — see [LIBRARY-API.md](LIBRARY-API.md).

### 6. Online verification is separate

This library checks **format and check digits** only. Existence/status at Receita/Bacen requires official APIs — out of scope.

Do not build "verify CPF is active" on check-digit alone.

### 7. Keep updated during CNPJ migration

Homologation **April 2026**, production **July 2026**. Upgrade to latest `br-validators` before go-live.

---

## OWASP mapping (library context)

| OWASP 2025 | Relevance |
|------------|-----------|
| A04 Insecure design | Wrong algorithm = insecure design — primary focus |
| A06 Vulnerable components | Dependency hygiene |
| A08 Data integrity | Correct validation preserves integrity at boundary |
| A09 Logging | Integrators must not log PII |

Agentic AI (ASI) — if AI agents write validators: require human review + official source citation per [AGENTS.md](../AGENTS.md).

---

## npm package security (planned)

When publishing:

- `@latest` tag on stable only
- Provenance / Sigstore (goal)
- No postinstall scripts
- Minimal runtime dependencies

---

## Related

| Document | Purpose |
|----------|---------|
| [SECURITY.md](../SECURITY.md) | Report vulnerabilities |
| [CONTRIBUTING.md](../CONTRIBUTING.md#security-contributions) | Secure contributions |
| [OPEN-SOURCE.md](OPEN-SOURCE.md) | License and supply chain |
| [VERSIONING.md](VERSIONING.md) | Patch releases for security fixes |
