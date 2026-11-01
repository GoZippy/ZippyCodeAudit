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

const SUPPORTED_OPERATORS = Object.freeze([
  'exists',
  'equals',
  'notEquals',
  'in',
  'contains',
  'semverGte',
  'semverLt'
]);

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

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function validateCondition(condition, label) {
  assertPlainObject(condition, label);

  if (typeof condition.path !== 'string' || condition.path.trim() === '') {
    throw new Error(`${label} requires a non-empty path`);
  }

  if (!SUPPORTED_OPERATORS.includes(condition.op)) {
    throw new Error(
      `${label} uses unsupported operator: ${String(condition.op)}`
    );
  }

  if (condition.op !== 'exists' && !Object.prototype.hasOwnProperty.call(condition, 'value')) {
    throw new Error(`${label} requires value for operator ${condition.op}`);
  }

  if (condition.op === 'in' && !Array.isArray(condition.value)) {
    throw new Error(`${label} requires an array value for operator in`);
  }

  return condition;
}

function validateRule(rule, index = 0) {
  assertPlainObject(rule, `Rule at index ${index}`);

  if (typeof rule.id !== 'string' || rule.id.trim() === '') {
    throw new Error(`Rule at index ${index} requires a non-empty id`);
  }
  if (typeof rule.title !== 'string' || rule.title.trim() === '') {
    throw new Error(`Rule ${rule.id} requires a non-empty title`);
  }

  for (const field of ['applicability', 'checks']) {
    if (rule[field] !== undefined && !Array.isArray(rule[field])) {
      throw new Error(`Rule ${rule.id} field ${field} must be an array`);
    }

    (rule[field] || []).forEach((condition, conditionIndex) => {
      validateCondition(
        condition,
        `Rule ${rule.id} ${field}[${conditionIndex}]`
      );
    });
  }

  if (rule.evidence !== undefined && !Array.isArray(rule.evidence)) {
    throw new Error(`Rule ${rule.id} field evidence must be an array`);
  }

  return rule;
}

function validateRulePack(document) {
  let rules;
  let metadata;

  if (Array.isArray(document)) {
    rules = document;
    metadata = {
      name: 'legacy-rule-array',
      version: null
    };
  } else {
    assertPlainObject(document, 'Rule pack');

    if (typeof document.name !== 'string' || document.name.trim() === '') {
      throw new Error('Rule pack requires a non-empty name');
    }
    if (typeof document.version !== 'string' || document.version.trim() === '') {
      throw new Error('Rule pack requires a non-empty version');
    }
    if (!Array.isArray(document.rules)) {
      throw new Error('Rule pack requires a rules array');
    }

    rules = document.rules;
    metadata = {
      name: document.name,
      version: document.version
    };
  }

  if (rules.length === 0) {
    throw new Error('Rule pack must contain at least one rule');
  }

  const seen = new Set();
  rules.forEach((rule, index) => {
    validateRule(rule, index);
    if (seen.has(rule.id)) {
      throw new Error(`Duplicate readiness rule id: ${rule.id}`);
    }
    seen.add(rule.id);
  });

  return {
    ...metadata,
    rules
  };
}

function evaluateCondition(condition, inventory) {
  const actual = getPath(inventory, condition.path);

  if (actual === undefined || actual === null) {
    return { known: false, pass: false, actual };
  }

  switch (condition.op) {
    case 'exists':
      return { known: true, pass: true, actual };
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
  validateRule(rule);
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

function runReadinessAssessment({ inventory, rules, rulePack = null }) {
  if (!inventory || typeof inventory !== 'object') {
    throw new Error('Inventory must be an object');
  }
  if (!Array.isArray(rules)) {
    throw new Error('Rules must be an array');
  }

  rules.forEach((rule, index) => validateRule(rule, index));

  const results = rules.map(rule => evaluateRule(rule, inventory));
  const counts = Object.values(STATUSES).reduce((acc, status) => {
    acc[status] = results.filter(result => result.status === status).length;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    rulePack,
    summary: {
      totalRules: results.length,
      ...counts
    },
    results
  };
}

module.exports = {
  STATUSES,
  SUPPORTED_OPERATORS,
  getPath,
  compareVersions,
  validateCondition,
  validateRule,
  validateRulePack,
  evaluateCondition,
  evaluateRule,
  runReadinessAssessment
};
