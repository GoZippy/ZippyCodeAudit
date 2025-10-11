# 📚 ZippyCodeAudit API Reference

Complete API documentation for all ZippyMCP service tiers and client integrations.

## 🌐 Service Endpoints

### Base URLs

| Tier | Base URL | Description |
|------|----------|-------------|
| **Public** | `https://api.zippycodesaudit.com/public` | Free tier with rate limits |
| **Premium** | `https://api.zippycodesaudit.com/premium` | Paid tier with enhanced features |
| **Private** | `https://api.zippycodesaudit.com/private` | Enterprise tier with advanced capabilities |

## 🔐 Authentication

### API Key Authentication

All requests require an API key in the `Authorization` header:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Tier-Based Access

API keys are tied to specific service tiers:

```javascript
// Public tier key (free)
const publicKey = "zippy_public_xxxxxxxxxxxxxxxx";

// Premium tier key (paid)
const premiumKey = "zippy_premium_xxxxxxxxxxxxxxxx";

// Private tier key (enterprise)
const privateKey = "zippy_private_xxxxxxxxxxxxxxxx";
```

## 📊 Public API (Free Tier)

### Analysis Endpoints

#### `POST /analyze`
Perform basic code analysis on uploaded code.

**Request:**
```json
{
  "code": "function example() { console.log('hello'); }",
  "language": "javascript",
  "projectType": "web",
  "options": {
    "includePerformance": true,
    "includeSecurity": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "metrics": {
      "lines": 1,
      "characters": 42,
      "language": "javascript"
    },
    "issues": [
      {
        "type": "style",
        "severity": "low",
        "message": "Consider adding JSDoc comments",
        "file": null,
        "line": null,
        "suggestion": "Add documentation for better maintainability"
      }
    ],
    "score": 85,
    "recommendations": [
      {
        "type": "improvement",
        "message": "Add proper error handling",
        "priority": "medium"
      }
    ]
  },
  "timestamp": "2025-01-11T10:30:00Z",
  "tier": "public"
}
```

#### `GET /templates`
Retrieve community audit templates.

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "basic-js-audit",
      "name": "Basic JavaScript Audit",
      "description": "Essential checks for JavaScript projects",
      "language": "javascript",
      "category": "web",
      "popularity": 1250,
      "author": "ZippyCodeAudit Community"
    }
  ],
  "total": 15,
  "tier": "public"
}
```

### Rate Limits

| Endpoint | Requests | Window |
|----------|----------|--------|
| `/analyze` | 10 | 1 hour |
| `/templates` | 100 | 15 minutes |
| All others | 50 | 15 minutes |

## 💎 Premium API (Paid Tier)

### Enhanced Analysis

#### `POST /analyze`
Advanced analysis with AI insights and custom rules.

**Request:**
```json
{
  "code": "function complexAlgorithm(data) { /* complex logic */ }",
  "language": "javascript",
  "projectType": "web",
  "options": {
    "aiInsights": true,
    "performanceModeling": true,
    "customRules": ["my-custom-rule-1", "my-custom-rule-2"]
  },
  "context": {
    "projectName": "MyApp",
    "teamSize": 5,
    "deadline": "2025-02-01"
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "basic": { /* same as public tier */ },
    "enhanced": {
      "aiInsights": {
        "suggestions": [
          {
            "type": "architectural",
            "confidence": 0.92,
            "message": "Consider implementing microservices pattern",
            "impact": "high",
            "effort": "medium"
          }
        ],
        "patterns": ["MVC", "Observer", "Singleton"],
        "technicalDebt": {
          "score": 23,
          "categories": {
            "code": 15,
            "architecture": 30,
            "testing": 20
          }
        }
      },
      "performanceMetrics": {
        "timeComplexity": "O(n log n)",
        "spaceComplexity": "O(n)",
        "bottlenecks": [
          {
            "location": "nested loops",
            "impact": "high",
            "suggestion": "Use hash maps for O(1) lookups"
          }
        ]
      },
      "customRuleResults": [
        {
          "rule": "my-custom-rule-1",
          "violations": 2,
          "severity": "medium",
          "remediation": "Update code to follow team standards"
        }
      ]
    },
    "confidence": 0.95,
    "processingTime": 2000,
    "aiModel": "premium-v2.1"
  },
  "timestamp": "2025-01-11T10:30:00Z",
  "tier": "premium"
}
```

### Analytics & Reporting

#### `GET /analytics`
Get comprehensive analytics data.

**Query Parameters:**
- `timeframe`: `7d`, `30d`, `90d` (default: `30d`)
- `projectId`: Specific project ID (optional)
- `includeSubprojects`: `true`/`false` (default: `true`)

**Response:**
```json
{
  "success": true,
  "analytics": {
    "timeframe": "30d",
    "metrics": {
      "totalAnalyses": 45,
      "avgScore": 78,
      "improvementTrend": "up",
      "topIssues": ["security", "performance", "maintainability"]
    },
    "trends": [
      {
        "date": "2025-01-01",
        "score": 75,
        "issues": 12,
        "analyses": 3
      }
    ],
    "insights": [
      {
        "type": "improvement",
        "message": "Code quality improved by 15% this month",
        "confidence": 0.85
      }
    ]
  },
  "tier": "premium"
}
```

### Team Management

#### `GET /team`
Retrieve team information and permissions.

**Response:**
```json
{
  "success": true,
  "team": {
    "id": "team-123",
    "name": "Frontend Team",
    "members": [
      {
        "id": "user-456",
        "name": "John Doe",
        "role": "developer",
        "permissions": ["read", "write", "admin"]
      }
    ],
    "projects": ["project-1", "project-2"],
    "settings": {
      "autoAnalysis": true,
      "notificationPreferences": "email"
    }
  },
  "tier": "premium"
}
```

## 🔒 Private API (Enterprise Tier)

### AI-Enhanced Analysis

#### `POST /analyze/enhanced`
Advanced AI analysis with organization-specific models.

**Request:**
```json
{
  "code": "enterprise-scale-application-code",
  "language": "typescript",
  "projectType": "enterprise",
  "options": {
    "customAIModel": "enterprise-v3.0",
    "organizationRules": true,
    "predictiveAnalysis": true,
    "threatModeling": true
  },
  "context": {
    "organizationId": "org-789",
    "complianceFramework": "SOC2",
    "securityClassification": "confidential"
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "basic": { /* standard analysis */ },
    "enhanced": {
      "aiInsights": {
        "architecturalInsights": [
          "Service boundaries well-defined",
          "Data consistency maintained",
          "Error handling follows patterns"
        ],
        "predictiveAnalysis": {
          "maintainability": {
            "trend": "stable",
            "prediction": "Will remain stable for 6 months",
            "confidence": 0.85
          },
          "security": {
            "trend": "declining",
            "prediction": "Vulnerabilities likely to increase",
            "confidence": 0.82
          }
        },
        "codeGeneration": {
          "refactoring": [
            {
              "type": "extract-method",
              "original": "function calculateTotal(items) { /* 50 lines */ }",
              "suggested": "Extract into utility functions",
              "benefit": "Improved readability and testability"
            }
          ]
        }
      },
      "performanceModeling": {
        "scalability": {
          "currentLimit": "10,000 users",
          "suggestedLimit": "100,000 users",
          "improvements": ["Add caching", "Database optimization", "CDN integration"]
        }
      },
      "securityDeepScan": {
        "compliance": {
          "owasp": {
            "score": 7.2,
            "compliance": 85,
            "issues": ["A03:2021-Injection", "A07:2021-Identification"]
          },
          "soc2": {
            "score": 8.1,
            "compliance": 92,
            "controls": ["CC6.1", "CC6.7", "CC7.1"]
          }
        }
      }
    },
    "confidence": 0.98,
    "aiModel": "private-v3.0"
  },
  "timestamp": "2025-01-11T10:30:00Z",
  "tier": "private"
}
```

### Organization Management

#### `POST /custom-rules`
Create organization-specific audit rules.

**Request:**
```json
{
  "name": "Company Naming Convention",
  "description": "Enforce consistent variable and function naming",
  "language": "javascript",
  "pattern": "^[a-z][a-zA-Z0-9]*$",
  "message": "Variable names must start with lowercase letter",
  "severity": "medium",
  "category": "style"
}
```

**Response:**
```json
{
  "success": true,
  "rule": {
    "id": "rule-123",
    "name": "Company Naming Convention",
    "description": "Enforce consistent variable and function naming",
    "createdAt": "2025-01-11T10:30:00Z",
    "author": "org-admin",
    "active": true
  },
  "tier": "private"
}
```

## 🔗 Client Integration Examples

### JavaScript/Node.js

```javascript
import axios from 'axios';

class ZippyCodeAuditClient {
  constructor(apiKey, tier = 'public') {
    this.apiKey = apiKey;
    this.tier = tier;
    this.baseURL = this.getBaseURL(tier);
  }

  getBaseURL(tier) {
    const urls = {
      public: 'https://api.zippycodesaudit.com/public',
      premium: 'https://api.zippycodesaudit.com/premium',
      private: 'https://api.zippycodesaudit.com/private'
    };
    return urls[tier];
  }

  async analyzeCode(code, language, options = {}) {
    const response = await axios.post(`${this.baseURL}/analyze`, {
      code,
      language,
      options
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  async getAnalytics(timeframe = '30d') {
    const response = await axios.get(`${this.baseURL}/analytics`, {
      params: { timeframe },
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    return response.data;
  }
}

// Usage
const client = new ZippyCodeAuditClient('your-api-key', 'premium');
const analysis = await client.analyzeCode('your-code-here', 'javascript');
```

### Python

```python
import requests
import json

class ZippyCodeAuditClient:
    def __init__(self, api_key, tier='public'):
        self.api_key = api_key
        self.tier = tier
        self.base_url = self._get_base_url(tier)

    def _get_base_url(self, tier):
        urls = {
            'public': 'https://api.zippycodesaudit.com/public',
            'premium': 'https://api.zippycodesaudit.com/premium',
            'private': 'https://api.zippycodesaudit.com/private'
        }
        return urls[tier]

    def analyze_code(self, code, language, **options):
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        payload = {
            'code': code,
            'language': language,
            'options': options
        }

        response = requests.post(
            f'{self.base_url}/analyze',
            headers=headers,
            json=payload
        )

        return response.json()

    def get_analytics(self, timeframe='30d'):
        headers = {'Authorization': f'Bearer {self.api_key}'}
        params = {'timeframe': timeframe}

        response = requests.get(
            f'{self.base_url}/analytics',
            headers=headers,
            params=params
        )

        return response.json()

# Usage
client = ZippyCodeAuditClient('your-api-key', 'premium')
analysis = client.analyze_code('your_python_code', 'python')
```

## 📈 Response Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Missing or invalid API key |
| `403` | Forbidden - Insufficient tier permissions |
| `413` | Payload Too Large - Code exceeds tier limits |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server-side issue |

## 🔄 Webhook Integration

### Setup Webhook

```bash
curl -X POST https://api.zippycodesaudit.com/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhook",
    "events": ["analysis.complete", "report.generated"],
    "secret": "your-webhook-secret"
  }'
```

### Webhook Payload

```json
{
  "event": "analysis.complete",
  "timestamp": "2025-01-11T10:30:00Z",
  "data": {
    "analysisId": "analysis-123",
    "projectId": "project-456",
    "status": "completed",
    "score": 85,
    "issuesCount": 3,
    "reportUrl": "https://dashboard.zippycodesaudit.com/reports/analysis-123"
  }
}
```

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ANALYSIS_FAILED",
    "message": "Failed to analyze code",
    "details": "Code too large for current tier",
    "retryAfter": 3600,
    "support": "https://support.zippycodesaudit.com"
  },
  "timestamp": "2025-01-11T10:30:00Z"
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_CODE` | Code format not supported | Check language parameter |
| `TIER_LIMIT_EXCEEDED` | Tier usage limit reached | Upgrade tier or wait for reset |
| `AUTHENTICATION_FAILED` | Invalid API key | Check API key and permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait for rate limit reset |

## 📊 API Limits by Tier

| Feature | Public | Premium | Private |
|---------|--------|---------|---------|
| Requests/hour | 10 | 100 | 500 |
| Max code size | 100KB | 1MB | 10MB |
| Analysis depth | Basic | Enhanced | AI-Enhanced |
| Custom rules | ❌ | ⚠️ Limited | ✅ Full |
| Team features | ❌ | ✅ Basic | ✅ Advanced |
| Analytics | ❌ | ✅ Basic | ✅ Advanced |
| Webhooks | ✅ Basic | ✅ Enhanced | ✅ Enterprise |

## 🔒 Security Considerations

### API Key Management
- Store API keys securely (environment variables, secret management)
- Rotate keys regularly
- Use different keys for different environments

### Data Privacy
- All code analysis is performed server-side
- No code is stored permanently (except with explicit consent)
- GDPR-compliant data handling
- Enterprise customers can opt for on-premise deployment

## 📞 Support

### Getting Help

- **Documentation**: [docs.zippycodesaudit.com](https://docs.zippycodesaudit.com)
- **Community**: [Discord](https://discord.gg/zippy)
- **Support**: [support@zippycodesaudit.com](mailto:support@zippycodesaudit.com)
- **Enterprise**: [enterprise@zippycodesaudit.com](mailto:enterprise@zippycodesaudit.com)

### Response Times

| Tier | Support Channel | Response Time |
|------|----------------|---------------|
| **Public** | Community Discord | 24-48 hours |
| **Premium** | Email + Discord | 4-8 hours |
| **Private** | Dedicated support | 1-2 hours |

---

*"Building APIs that scale with your code quality journey."*

**Version:** 1.0.0
**Last Updated:** 2025-01-11
**Status:** Production Ready
