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


describe('starter rule pack', () => {
  const fs = require('fs');
  const path = require('path');
  const pack = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'rules', 'zti-security-2026-11-01.json'), 'utf8')
  );

  test('flags affected Strands release and passes fixed release', () => {
    const affected = runReadinessAssessment({
      inventory: { packages: { 'strands-agents-tools': { version: '0.8.5' } } },
      rules: [pack.rules[0]]
    });
    const fixed = runReadinessAssessment({
      inventory: { packages: { 'strands-agents-tools': { version: '0.8.6' } } },
      rules: [pack.rules[0]]
    });

    expect(affected.results[0].status).toBe(STATUSES.FAIL);
    expect(fixed.results[0].status).toBe(STATUSES.PASS);
  });

  test('requires AgentCore artifact regeneration evidence in addition to package fix', () => {
    const assessment = runReadinessAssessment({
      inventory: {
        packages: { 'bedrock-agentcore-starter-toolkit': { version: '0.3.14' } },
        artifacts: { agentcore: { reimportedWithFixedTooling: true } }
      },
      rules: [pack.rules[1]]
    });

    expect(assessment.results[0].status).toBe(STATUSES.PARTIAL);
  });

  test('flags the compromised LiteLLM release exactly', () => {
    const assessment = runReadinessAssessment({
      inventory: { packages: { litellm: { version: '1.107.0' } } },
      rules: [pack.rules[2]]
    });

    expect(assessment.results[0].status).toBe(STATUSES.FAIL);
  });
});
