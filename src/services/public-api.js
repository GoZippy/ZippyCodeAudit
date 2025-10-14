/**
 * ZippyMCP Public API Service
 * Free tier API for basic audit functionality
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');

const router = express.Router();

// Security middleware
router.use(helmet());
router.use(cors({
  origin: ['https://your-domain.com', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting for public tier
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 analysis requests per hour
  message: {
    error: 'Analysis rate limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  }
});

// Apply rate limiting
router.use('/analyze', analysisLimiter);
router.use(publicLimiter);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ZippyMCP Public API',
    tier: 'public',
    version: '1.0.0'
  });
});

/**
 * Basic code analysis endpoint
 */
router.post('/analyze', async (req, res) => {
  try {
    const { code, language, projectType } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: 'Missing required fields: code, language'
      });
    }

    // Basic validation
    if (code.length > 100000) { // 100KB limit for public tier
      return res.status(413).json({
        error: 'Code too large. Please reduce size or upgrade to premium tier.'
      });
    }

    // Simulate analysis (in real implementation, this would use AI services)
    const analysis = await performBasicAnalysis(code, language, projectType);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      tier: 'public'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed. Please try again.'
    });
  }
});

/**
 * Community templates endpoint
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await getCommunityTemplates();

    res.json({
      success: true,
      templates,
      total: templates.length,
      tier: 'public'
    });

  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({
      error: 'Failed to fetch templates'
    });
  }
});

/**
 * Basic audit report generation
 */
router.post('/reports', async (req, res) => {
  try {
    const { projectData } = req.body;

    if (!projectData) {
      return res.status(400).json({
        error: 'Missing project data'
      });
    }

    // Generate basic report
    const report = await generateBasicReport(projectData);

    res.json({
      success: true,
      report,
      tier: 'public'
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      error: 'Report generation failed'
    });
  }
});

/**
 * Webhook endpoint for CI/CD integration
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, repository, commit } = req.body;

    // Log webhook event
    console.log(`Webhook received: ${event} from ${repository?.name}`);

    // Process webhook (basic processing for public tier)
    await processWebhookEvent(event, repository, commit);

    res.json({
      success: true,
      message: 'Webhook processed',
      tier: 'public'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      error: 'Webhook processing failed'
    });
  }
});

/**
 * Basic analysis function (public tier)
 */
async function performBasicAnalysis(code, language, projectType) {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Basic metrics
  const lines = code.split('\n').length;
  const characters = code.length;
  const words = code.split(/\s+/).length;

  // Basic quality indicators
  const issues = [];

  // Check for common issues
  if (code.includes('console.log') && language === 'javascript') {
    issues.push({
      type: 'debug',
      severity: 'low',
      message: 'Debug console.log statements found',
      suggestion: 'Remove debug statements before production'
    });
  }

  if (code.includes('TODO') || code.includes('FIXME')) {
    issues.push({
      type: 'documentation',
      severity: 'medium',
      message: 'TODO/FIXME comments found',
      suggestion: 'Address pending tasks or create proper tickets'
    });
  }

  // Language-specific checks
  switch (language) {
    case 'javascript':
      if (!code.includes('use strict') && code.includes('function')) {
        issues.push({
          type: 'best-practice',
          severity: 'low',
          message: 'Consider using strict mode',
          suggestion: 'Add "use strict" for better error handling'
        });
      }
      break;

    case 'python':
      if (code.includes('import *') && !code.includes('__all__')) {
        issues.push({
          type: 'imports',
          severity: 'medium',
          message: 'Wildcard imports without __all__',
          suggestion: 'Specify imported functions explicitly'
        });
      }
      break;
  }

  return {
    metrics: {
      lines,
      characters,
      words,
      language,
      projectType: projectType || 'unknown'
    },
    issues,
    score: Math.max(0, 100 - (issues.length * 5)), // Simple scoring
    recommendations: generateBasicRecommendations(issues)
  };
}

/**
 * Get community templates
 */
async function getCommunityTemplates() {
  return [
    {
      id: 'basic-js-audit',
      name: 'Basic JavaScript Audit',
      description: 'Essential checks for JavaScript projects',
      language: 'javascript',
      category: 'web',
      popularity: 1250,
      author: 'ZippyCodeAudit Community',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'python-quality-check',
      name: 'Python Quality Check',
      description: 'Code quality and style checks for Python',
      language: 'python',
      category: 'general',
      popularity: 890,
      author: 'Python Community',
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'security-baseline',
      name: 'Security Baseline',
      description: 'Basic security checks for any language',
      language: 'multi',
      category: 'security',
      popularity: 2100,
      author: 'Security Experts',
      createdAt: '2023-12-01T00:00:00Z'
    }
  ];
}

/**
 * Generate basic report
 */
async function generateBasicReport(projectData) {
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    id: `report-${Date.now()}`,
    title: 'Basic Audit Report',
    generatedAt: new Date().toISOString(),
    summary: {
      filesAnalyzed: projectData.files?.length || 0,
      issuesFound: projectData.issues?.length || 0,
      overallScore: 75
    },
    sections: [
      {
        title: 'Code Quality',
        score: 80,
        issues: []
      },
      {
        title: 'Security',
        score: 70,
        issues: []
      }
    ]
  };
}

/**
 * Process webhook event
 */
async function processWebhookEvent(event, repository, commit) {
  // Basic webhook processing for public tier
  console.log(`Processing ${event} event for ${repository?.name}`);

  // In a real implementation, this would:
  // 1. Validate the webhook signature
  // 2. Queue analysis job
  // 3. Send notifications
  // 4. Update dashboards

  return true;
}

/**
 * Generate basic recommendations
 */
function generateBasicRecommendations(issues) {
  const recommendations = [];

  if (issues.length === 0) {
    recommendations.push({
      type: 'positive',
      message: 'Great! No major issues found in this code.',
      priority: 'info'
    });
  } else {
    recommendations.push({
      type: 'improvement',
      message: `Found ${issues.length} areas for improvement.`,
      priority: 'medium'
    });
  }

  return recommendations;
}

/**
 * API info endpoint
 */
router.get('/info', (req, res) => {
  res.json({
    name: 'ZippyMCP Public API',
    version: '1.0.0',
    tier: 'public',
    features: [
      'Basic code analysis',
      'Community templates',
      'Rate-limited requests',
      'Webhook integration'
    ],
    limits: {
      requestsPerHour: 10,
      maxCodeSize: '100KB',
      concurrentAnalyses: 1
    },
    upgradeUrl: '/pricing'
  });
});

/**
 * Project detection endpoint
 */
router.post('/projects/detect', async (req, res) => {
  try {
    const { projectPath } = req.body;

    if (!projectPath) {
      return res.status(400).json({ error: 'projectPath is required' });
    }

    const ProjectDetector = require('../core/ProjectDetector');
    const detector = new ProjectDetector(projectPath);
    const results = await detector.detect();

    res.json({
      success: true,
      detection: results,
      summary: detector.getSummary()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add project endpoint
 */
router.post('/projects/add', async (req, res) => {
  try {
    const { projectPath, metadata } = req.body;

    if (!projectPath) {
      return res.status(400).json({ error: 'projectPath is required' });
    }

    const ProjectRegistry = require('../core/ProjectRegistry');
    const registry = new ProjectRegistry();
    await registry.initialize();

    const project = await registry.registerProject(projectPath, metadata);

    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * List projects endpoint
 */
router.get('/projects', async (req, res) => {
  try {
    const ProjectRegistry = require('../core/ProjectRegistry');
    const registry = new ProjectRegistry();
    await registry.initialize();

    const projects = registry.listProjects();

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get project endpoint
 */
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ProjectRegistry = require('../core/ProjectRegistry');
    const registry = new ProjectRegistry();
    await registry.initialize();

    const project = registry.getProject(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Remove project endpoint
 */
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ProjectRegistry = require('../core/ProjectRegistry');
    const registry = new ProjectRegistry();
    await registry.initialize();

    await registry.unregisterProject(id);

    res.json({
      success: true,
      message: 'Project removed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Run progressive audit endpoint
 */
router.post('/projects/:id/audit/progressive', async (req, res) => {
  try {
    const { id } = req.params;
    const { testSuite = 'standard' } = req.body;

    const ProjectRegistry = require('../core/ProjectRegistry');
    const registry = new ProjectRegistry();
    await registry.initialize();

    const project = registry.getProject(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const AuditEngine = require('../core/AuditEngine');
    const engine = new AuditEngine({ projectPath: project.path });

    // Send SSE headers for progress updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const results = await engine.runProgressiveAudit(testSuite, (progress) => {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ phase: 'complete', results })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ phase: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * Get test suite builder endpoint
 */
router.post('/projects/test-suite', async (req, res) => {
  try {
    const { detection } = req.body;

    if (!detection) {
      return res.status(400).json({ error: 'detection results required' });
    }

    const TestSuiteBuilder = require('../core/TestSuiteBuilder');
    const builder = new TestSuiteBuilder(detection);

    const availableTests = builder.buildAvailableTests();
    const presets = builder.getPresets();
    const recommendations = builder.getRecommendations();

    res.json({
      success: true,
      availableTests,
      presets,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get AI assistant recommendation endpoint
 */
router.post('/assistant/recommend', async (req, res) => {
  try {
    const { detection, mode = 'vibe' } = req.body;

    if (!detection) {
      return res.status(400).json({ error: 'detection results required' });
    }

    const AuditAssistant = require('../core/AuditAssistant');
    const assistant = new AuditAssistant(detection, mode);

    const welcome = assistant.getWelcomeMessage();
    
    const TestSuiteBuilder = require('../core/TestSuiteBuilder');
    const builder = new TestSuiteBuilder(detection);
    const auditRecommendation = assistant.getAuditRecommendation(builder);

    res.json({
      success: true,
      welcome,
      recommendation: auditRecommendation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Import from ZIP endpoint
 */
router.post('/projects/import/zip', async (req, res) => {
  try {
    const { zipPath, projectName } = req.body;

    if (!zipPath) {
      return res.status(400).json({ error: 'zipPath is required' });
    }

    const ZipImporter = require('../services/zip-importer');
    const importer = new ZipImporter();

    const result = await importer.importZip(zipPath, projectName);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clone from GitHub endpoint
 */
router.post('/projects/import/github', async (req, res) => {
  try {
    const { repoUrl, accessToken, options = {} } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required' });
    }

    const GitHubIntegration = require('../services/github-integration');
    const github = new GitHubIntegration(accessToken);

    const result = await github.cloneRepository(repoUrl, options);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
