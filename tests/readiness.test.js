const {
  STATUSES,
  compareVersions,
  evaluateRule,
  runReadinessAssessment
} = require('../src/readiness/ReadinessEngine');

describe('ReadinessEngine', () => {
  test('compares dotted versions', () => {
    expect(compareVersions('1.2.3', '1.2.2')).toBe(1);
    expect(compareVersions('1.2.3', '1.2.3')).toBe(0);
    expect(compareVersions('1.2.3', '1.3.0')).toBe(-1);
  });

  test('returns NOT_APPLICABLE when applicability evidence excludes the rule', () => {
    const result = evaluateRule(
      {
        id: 'example',
        title: 'Example',
        applicability: [{ path: 'product.name', op: 'equals', value: 'Target' }],
        checks: [{ path: 'product.version', op: 'semverGte', value: '2.0.0' }]
      },
      { product: { name: 'Other', version: '1.0.0' } }
    );

    expect(result.status).toBe(STATUSES.NOT_APPLICABLE);
  });

  test('returns UNKNOWN when required evidence is absent', () => {
    const result = evaluateRule(
      {
        id: 'example',
        title: 'Example',
        applicability: [{ path: 'product.name', op: 'equals', value: 'Target' }],
        checks: [{ path: 'product.version', op: 'semverGte', value: '2.0.0' }]
      },
      { product: { name: 'Target' } }
    );

    expect(result.status).toBe(STATUSES.UNKNOWN);
  });

  test('returns FAIL when evidence proves a check failed', () => {
    const result = evaluateRule(
      {
        id: 'example',
        title: 'Example',
        severity: 'high',
        applicability: [{ path: 'product.name', op: 'equals', value: 'Target' }],
        checks: [{ path: 'product.version', op: 'semverGte', value: '2.0.0' }]
      },
      { product: { name: 'Target', version: '1.9.0' } }
    );

    expect(result.status).toBe(STATUSES.FAIL);
  });

  test('summarizes all evidence states without collapsing UNKNOWN into PASS', () => {
    const assessment = runReadinessAssessment({
      inventory: { a: 1, b: 2 },
      rules: [
        { id: 'pass', title: 'Pass', checks: [{ path: 'a', op: 'equals', value: 1 }] },
        { id: 'fail', title: 'Fail', checks: [{ path: 'b', op: 'equals', value: 3 }] },
        { id: 'unknown', title: 'Unknown', checks: [{ path: 'missing', op: 'exists' }] }
      ]
    });

    expect(assessment.summary.PASS).toBe(1);
    expect(assessment.summary.FAIL).toBe(1);
    expect(assessment.summary.UNKNOWN).toBe(1);
  });
});
