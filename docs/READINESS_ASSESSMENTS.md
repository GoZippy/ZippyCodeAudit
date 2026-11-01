# Readiness Assessments

ZippyCodeAudit readiness assessments turn the Zippy Technology Intelligence
rule corpus into evidence-oriented customer reports.

## Evidence states

Every rule produces exactly one result:

- `PASS` — collected evidence proves the check passed.
- `FAIL` — collected evidence proves the check failed.
- `PARTIAL` — some required evidence is present and no failure is proven, but
  the result is incomplete.
- `UNKNOWN` — required evidence is unavailable or cannot be interpreted.
- `NOT_APPLICABLE` — collected evidence proves the rule does not apply.

Missing evidence is never silently treated as success.

## CLI

```bash
zippy-audit readiness \
  --inventory inventory.json \
  --rules rules.json \
  --format markdown \
  --output readiness-report.md
```

The inventory file contains authorized, read-only evidence gathered for the
customer environment.

The rules file should normally be a **named, versioned rule pack**:

```json
{
  "name": "ZTI security readiness starter pack",
  "version": "2026-11-01",
  "rules": []
}
```

Legacy raw rule arrays remain accepted for compatibility, but customer-facing
packs should carry stable `name` and `version` metadata.

Before any assessment runs, rule packs are validated. The CLI fails closed on:

- missing pack name/version metadata;
- missing or empty rule arrays;
- duplicate rule IDs;
- unsupported condition operators;
- malformed applicability/check arrays;
- missing condition paths;
- invalid `in` values.

This keeps malformed rule content from silently becoming customer evidence.

## Rule shape

```json
{
  "id": "vendor.product.rule",
  "title": "Product is on a fixed version",
  "severity": "high",
  "applicability": [
    { "path": "product.name", "op": "equals", "value": "Example Product" }
  ],
  "checks": [
    { "path": "product.version", "op": "semverGte", "value": "2.0.0" }
  ],
  "remediation": "Upgrade to the vendor-supported fixed release.",
  "evidence": ["vendor-advisory-id"]
}
```

Supported operators are `exists`, `equals`, `notEquals`, `in`,
`contains`, `semverGte`, and `semverLt`.

## Rule-pack provenance

Customer-facing packs should be treated as versioned security content:

1. keep rule IDs stable across revisions;
2. update the pack version whenever applicability/remediation semantics change;
3. retain primary evidence/source identifiers with each rule;
4. reject duplicate rule IDs;
5. preserve old pack versions when a prior assessment must be reproduced;
6. do not reinterpret a historical report using newer rules without explicitly
   running a new assessment.

The generated JSON/Markdown report includes the rule-pack name and version so
the assessment can be traced to the exact evaluation content used.

## Safety boundary

Readiness rules are designed for non-destructive evidence collection. They
should not exploit a target, collect plaintext secrets, or infer compromise from
version/configuration applicability alone.

Customer-facing rule packs should distinguish:

1. applicability,
2. effective configuration,
3. remediation requirements,
4. remediation verification,
5. unknown or unavailable evidence.

## Next rule packs

The current execution queue calls for rule packs covering:

- agent/MCP effective authorization and credential boundaries,
- Atlassian MCP endpoint migration and permission conformance,
- developer-toolchain and lifecycle readiness,
- selected vendor advisories where exact applicability can be established from
  authorized inventory.

Each rule pack should include deterministic fixtures before it is marketed as a
supported assessment.
