/**
 * readiness command
 *
 * Runs an evidence-oriented readiness assessment from an inventory JSON file and
 * a declarative rules JSON file.
 */

const fs = require('fs-extra');
const path = require('path');
const {
  runReadinessAssessment,
  validateRulePack
} = require('../../readiness/ReadinessEngine');

async function readinessCommand(options) {
  const inventoryPath = path.resolve(options.inventory);
  const rulesPath = path.resolve(options.rules);

  const [inventory, rulesDocument] = await Promise.all([
    fs.readJson(inventoryPath),
    fs.readJson(rulesPath)
  ]);

  const rulePack = validateRulePack(rulesDocument);
  const assessment = runReadinessAssessment({
    inventory,
    rules: rulePack.rules,
    rulePack: {
      name: rulePack.name,
      version: rulePack.version
    }
  });

  const format = options.format || 'json';
  let output;

  if (format === 'json') {
    output = JSON.stringify(assessment, null, 2);
  } else if (format === 'markdown') {
    output = formatMarkdown(assessment);
  } else {
    throw new Error(`Unsupported readiness output format: ${format}`);
  }

  if (options.output) {
    await fs.outputFile(path.resolve(options.output), output, 'utf8');
  } else {
    process.stdout.write(`${output}\n`);
  }

  // FAIL means evidence established a rule violation. UNKNOWN/PARTIAL are not
  // process failures because they are valid assessment outcomes.
  if (assessment.summary.FAIL > 0) {
    process.exitCode = 2;
  }

  return assessment;
}

function formatMarkdown(assessment) {
  const lines = [
    '# ZippyCodeAudit Readiness Assessment',
    '',
    `Generated: ${assessment.generatedAt}`,
    ''
  ];

  if (assessment.rulePack) {
    lines.push(
      `Rule pack: ${assessment.rulePack.name}${
        assessment.rulePack.version ? ` (${assessment.rulePack.version})` : ''
      }`,
      ''
    );
  }

  lines.push(
    '## Summary',
    '',
    `- PASS: ${assessment.summary.PASS || 0}`,
    `- FAIL: ${assessment.summary.FAIL || 0}`,
    `- PARTIAL: ${assessment.summary.PARTIAL || 0}`,
    `- UNKNOWN: ${assessment.summary.UNKNOWN || 0}`,
    `- NOT_APPLICABLE: ${assessment.summary.NOT_APPLICABLE || 0}`,
    '',
    '## Results',
    ''
  );

  for (const result of assessment.results) {
    lines.push(`### [${result.status}] ${result.title}`);
    lines.push(`- Rule: \`${result.id}\``);
    lines.push(`- Severity: ${result.severity}`);
    if (result.reason) lines.push(`- Evidence state: ${result.reason}`);
    if (result.remediation) lines.push(`- Remediation: ${result.remediation}`);
    lines.push('');
  }

  return lines.join('\n');
}

module.exports = readinessCommand;
