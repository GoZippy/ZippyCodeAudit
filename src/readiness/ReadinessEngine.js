/**
 * ReadinessEngine
 * Evidence-oriented rule evaluation for customer security/readiness assessments.
 *
 * The engine deliberately distinguishes PASS/FAIL/PARTIAL/UNKNOWN/NOT_APPLICABLE.
 * Missing evidence is never silently treated as success.
 */

const STATUSES = Object.freeze({
  PASS: 'PASS',
  FAIL: 'FAIL',
  PARTIAL: 'PARTIAL',
  UNKNOWN: 'UNKNOWN',
  NOT_APPLICABLE: 'NOT_APPLICABLE'
});

function getPath(obj, dottedPath) {
  if (!dottedPath) return obj;
  return dottedPath.split('.').reduce((value, key) => {
    if (value === null || value === undefined) return undefined;
    return value[key];
  }, obj);
}

function parseVersion(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:[.-]?(\d+))?/);
  if (!match) return null;
  return match.slice(1).map(part => Number(part || 0));
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return null;

  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const av = a[i] || 0;
    const bv = b[i] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function evaluateCondition(condition, inventory) {
  const actual = getPath(inventory, condition.path);

  if (actual === undefined || actual === null) {
    return { known: false, pass: false, actual };
  }

  switch (condition.op) {
    case 'exists':
      return { known: true, pass: Boolean(actual), actual };
    case 'equals':
      return { known: true, pass: actual === condition.value, actual };
    case 'notEquals':
      return { known: true, pass: actual !== condition.value, actual };
    case 'in':
      return {
        known: true,
        pass: Array.isArray(condition.value) && condition.value.includes(actual),
        actual
      };
    case 'contains':
      return {
        known: true,
        pass:
          (typeof actual === 'string' && actual.includes(condition.value)) ||
          (Array.isArray(actual) && actual.includes(condition.value)),
        actual
      };
    case 'semverGte': {
      const comparison = compareVersions(String(actual), String(condition.value));
      return {
        known: comparison !== null,
        pass: comparison !== null && comparison >= 0,
        actual
      };
    }
    case 'semverLt': {
      const comparison = compareVersions(String(actual), String(condition.value));
      return {
        known: comparison !== null,
        pass: comparison !== null && comparison < 0,
        actual
      };
    }
    default:
      throw new Error(`Unsupported readiness operator: ${condition.op}`);
  }
}

function normalizeRule(rule) {
  if (!rule || typeof rule !== 'object') {
    throw new Error('Readiness rule must be an object');
  }
  if (!rule.id || !rule.title) {
    throw new Error('Readiness rule requires id and title');
  }
  return {
    severity: 'medium',
    applicability: [],
    checks: [],
    ...rule
  };
}

function evaluateRule(rawRule, inventory) {
  const rule = normalizeRule(rawRule);

  const applicability = rule.applicability.map(condition => ({
    condition,
    ...evaluateCondition(condition, inventory)
  }));

  if (applicability.some(item => item.known && !item.pass)) {
    return {
      id: rule.id,
      title: rule.title,
      severity: rule.severity,
      status: STATUSES.NOT_APPLICABLE,
      applicability,
      checks: [],
      remediation: rule.remediation || null
    };
  }

  if (applicability.some(item => !item.known)) {
    return {
      id: rule.id,
      title: rule.title,
      severity: rule.severity,
      status: STATUSES.UNKNOWN,
      applicability,
      checks: [],
      remediation: rule.remediation || null,
      reason: 'Applicability could not be established from available evidence.'
    };
  }

  const checks = rule.checks.map(check => ({
    condition: check,
    ...evaluateCondition(check, inventory)
  }));

  const failures = checks.filter(item => item.known && !item.pass);
  const unknowns = checks.filter(item => !item.known);

  let status = STATUSES.PASS;
  if (failures.length > 0) {
    status = STATUSES.FAIL;
  } else if (unknowns.length > 0 && unknowns.length < checks.length) {
    status = STATUSES.PARTIAL;
  } else if (unknowns.length === checks.length && checks.length > 0) {
    status = STATUSES.UNKNOWN;
  }

  return {
    id: rule.id,
    title: rule.title,
    severity: rule.severity,
    status,
    applicability,
    checks,
    remediation: rule.remediation || null,
    evidence: rule.evidence || []
  };
}

function runReadinessAssessment({ inventory, rules }) {
  if (!inventory || typeof inventory !== 'object') {
    throw new Error('Inventory must be an object');
  }
  if (!Array.isArray(rules)) {
    throw new Error('Rules must be an array');
  }

  const results = rules.map(rule => evaluateRule(rule, inventory));
  const counts = Object.values(STATUSES).reduce((acc, status) => {
    acc[status] = results.filter(result => result.status === status).length;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalRules: results.length,
      ...counts
    },
    results
  };
}

module.exports = {
  STATUSES,
  getPath,
  compareVersions,
  evaluateCondition,
  evaluateRule,
  runReadinessAssessment
};
