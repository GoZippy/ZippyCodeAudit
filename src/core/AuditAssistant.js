/**
 * AI Assistant Recommendation Engine
 * Provides context-aware suggestions and guidance
 */

class AuditAssistant {
  constructor(detectionResults, userMode = 'vibe') {
    this.detection = detectionResults;
    this.mode = userMode; // 'vibe' or 'tech'
    this.conversationHistory = [];
  }

  /**
   * Get welcome message for new project
   */
  getWelcomeMessage() {
    const { projectType, frameworks, metadata, complexity, fileCount } = this.detection;
    const primaryFramework = frameworks[0]?.name;
    const primaryLanguage = metadata.primaryLanguage;

    if (this.mode === 'vibe') {
      let message = `👋 Hey there! I just checked out your project and it looks ${this.getComplimentForComplexity(complexity)}!\n\n`;
      
      if (primaryFramework) {
        message += `I see you're using ${primaryFramework} - that's awesome! `;
      } else if (primaryLanguage) {
        message += `Nice ${primaryLanguage} project you've got! `;
      }

      message += `\n\nI found ${fileCount} files to look at. `;
      
      if (complexity === 'simple' || complexity === 'moderate') {
        message += `This should be quick! ⚡`;
      } else {
        message += `This might take a few minutes, but I'll keep you updated! 🚀`;
      }

      return message;
    } else {
      // Tech mode
      let message = `Project Analysis Complete\n\n`;
      message += `Type: ${projectType || 'Unknown'}\n`;
      if (primaryFramework) {
        message += `Primary Framework: ${primaryFramework}\n`;
      }
      message += `Language: ${primaryLanguage || 'Multiple'}\n`;
      message += `Files: ${fileCount}\n`;
      message += `Complexity: ${complexity}\n`;

      return message;
    }
  }

  /**
   * Get audit recommendation
   */
  getAuditRecommendation(testSuiteBuilder) {
    const presets = testSuiteBuilder.getPresets();
    const recommendations = testSuiteBuilder.getRecommendations();
    
    if (this.mode === 'vibe') {
      let message = `🤔 What would you like me to do?\n\n`;
      
      // Suggest based on complexity
      if (this.detection.complexity === 'simple') {
        message += `Since this is a smaller project, I'd recommend the **Quick Health Check** (30 seconds) to get started. `;
        message += `It'll catch the important stuff without taking forever! ⚡`;
      } else if (this.detection.complexity === 'moderate') {
        message += `For a project like this, the **Standard Audit** (2 minutes) is perfect! `;
        message += `It's thorough but won't make you wait too long. ⚖️`;
      } else {
        message += `This is a bigger project! I'd suggest starting with a **Quick Health Check** (30 seconds) `;
        message += `to get a feel for things, then you can always run a deeper scan later. 🔬`;
      }

      // Add warnings if any
      if (recommendations.some(r => r.priority === 'high')) {
        message += `\n\n⚠️ Heads up: I noticed some things that might need attention. `;
        message += `I'll point them out when we're done!`;
      }

      return message;
    } else {
      // Tech mode
      let message = `Available Audit Presets:\n\n`;
      
      Object.entries(presets).forEach(([key, preset]) => {
        message += `**${preset.name}** (${preset.estimatedTime}s)\n`;
        message += `  ${preset.description}\n`;
        message += `  Tests: ${preset.tests.length}\n\n`;
      });

      if (recommendations.length > 0) {
        message += `\nRecommendations:\n`;
        recommendations.forEach(rec => {
          message += `- [${rec.priority.toUpperCase()}] ${rec.title}\n`;
        });
      }

      return message;
    }
  }

  /**
   * Get contextual tips during analysis
   */
  getAnalysisTip(stage, currentProgress) {
    const tips = this.getStageSpecificTips(stage);
    
    if (this.mode === 'vibe') {
      return {
        message: tips.vibe[Math.floor(Math.random() * tips.vibe.length)],
        emoji: tips.emoji,
        encouragement: this.getEncouragement(currentProgress)
      };
    } else {
      return {
        message: tips.tech[0],
        stage: stage,
        progress: currentProgress
      };
    }
  }

  /**
   * Get stage-specific tips
   */
  getStageSpecificTips(stage) {
    const tipMap = {
      'scanning': {
        vibe: [
          "I'm looking through all your files... 🔍",
          "Checking out what you've built... 👀",
          "Scanning your code... this is exciting! 🎯"
        ],
        tech: ["File system scan in progress - indexing project structure"],
        emoji: "🔍"
      },
      'analyzing': {
        vibe: [
          "Now I'm digging deeper into your code... 🤓",
          "Analyzing the good stuff... 💡",
          "Checking for any sneaky issues... 🕵️"
        ],
        tech: ["Running static analysis on codebase"],
        emoji: "🤓"
      },
      'security': {
        vibe: [
          "Making sure everything is secure... 🔒",
          "Checking for any security oopsies... 🛡️",
          "Keeping your secrets safe... 🤫"
        ],
        tech: ["Security scan - checking for vulnerabilities and exposed credentials"],
        emoji: "🔒"
      },
      'quality': {
        vibe: [
          "Checking code quality... ✨",
          "Looking for ways to make it even better... 🌟",
          "Quality check in progress... 💎"
        ],
        tech: ["Code quality analysis - complexity, duplication, maintainability"],
        emoji: "✨"
      },
      'linting': {
        vibe: [
          "Running the linter... 📝",
          "Checking your style... 👔",
          "Making sure everything follows the rules... 📋"
        ],
        tech: ["Linter execution - validating code standards"],
        emoji: "📝"
      }
    };

    return tipMap[stage] || tipMap.analyzing;
  }

  /**
   * Get encouragement based on progress
   */
  getEncouragement(progress) {
    if (progress < 25) {
      return ["Just getting started! 🚀", "Off to a great start! 🎉", "Let's do this! 💪"];
    } else if (progress < 50) {
      return ["Making good progress! 👍", "Halfway there! 🎯", "Looking good so far! ✨"];
    } else if (progress < 75) {
      return ["Almost there! 🏃", "So close! 💨", "You're doing great! 🌟"];
    } else {
      return ["Final stretch! 🎊", "Nearly done! 🎉", "Wrapping up! 🎁"];
    }
  }

  /**
   * Get compliment for complexity
   */
  getComplimentForComplexity(complexity) {
    const compliments = {
      'simple': ['neat and tidy', 'super clean', 'well organized', 'nicely structured'],
      'moderate': ['solid', 'well-built', 'impressive', 'professional'],
      'complex': ['sophisticated', 'ambitious', 'feature-rich', 'comprehensive'],
      'very complex': ['massive', 'enterprise-level', 'seriously impressive', 'extensive']
    };

    const options = compliments[complexity] || compliments.moderate;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get results summary message
   */
  getResultsSummary(auditResults) {
    const { issues } = auditResults;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    const lowIssues = issues.filter(i => i.severity === 'low').length;

    if (this.mode === 'vibe') {
      let message = '';
      
      if (issues.length === 0) {
        message = `🎉 Awesome! Your code is looking fantastic! No issues found!\n\n`;
        message += `Keep up the great work! You're doing amazing! 🌟`;
      } else if (highIssues === 0 && mediumIssues === 0) {
        message = `✨ Nice work! I found ${lowIssues} tiny thing${lowIssues === 1 ? '' : 's'} that could be better, `;
        message += `but nothing serious at all!\n\nYour code is in great shape! 💪`;
      } else if (highIssues === 0) {
        message = `👍 Pretty good! I found ${mediumIssues} medium thing${mediumIssues === 1 ? '' : 's'} to look at `;
        if (lowIssues > 0) message += `and ${lowIssues} small thing${lowIssues === 1 ? '' : 's'}`;
        message += `.\n\nNothing critical though! Want to tackle the easy wins first? ⚡`;
      } else {
        message = `⚠️ Heads up! Found ${highIssues} important thing${highIssues === 1 ? '' : 's'} that need${highIssues === 1 ? 's' : ''} attention`;
        if (mediumIssues > 0) message += `, plus ${mediumIssues} medium`;
        if (lowIssues > 0) message += ` and ${lowIssues} minor`;
        message += `.\n\nDon't worry! I can help you fix these. Let's start with the critical ones! 🔧`;
      }

      return message;
    } else {
      // Tech mode
      let message = `Audit Results Summary\n\n`;
      message += `Total Issues: ${issues.length}\n`;
      message += `  High: ${highIssues}\n`;
      message += `  Medium: ${mediumIssues}\n`;
      message += `  Low: ${lowIssues}\n\n`;
      
      const healthScore = this.calculateHealthScore(auditResults);
      message += `Health Score: ${healthScore}/100\n`;

      if (highIssues > 0) {
        message += `\nRecommendation: Address high-severity issues immediately.`;
      } else if (mediumIssues > 5) {
        message += `\nRecommendation: Consider refactoring to reduce medium-severity issues.`;
      } else {
        message += `\nStatus: Project is in good condition.`;
      }

      return message;
    }
  }

  /**
   * Get next steps suggestion
   */
  getNextSteps(auditResults, quickWinsAvailable) {
    const { issues } = auditResults;
    const highIssues = issues.filter(i => i.severity === 'high');

    if (this.mode === 'vibe') {
      let steps = [];

      if (quickWinsAvailable && quickWinsAvailable > 0) {
        steps.push({
          icon: '⚡',
          title: 'Quick Wins',
          description: `Fix ${quickWinsAvailable} easy thing${quickWinsAvailable === 1 ? '' : 's'} in under 5 minutes!`,
          action: 'Show me',
          priority: 1
        });
      }

      if (highIssues.length > 0) {
        steps.push({
          icon: '🔴',
          title: 'Important Fixes',
          description: `${highIssues.length} critical issue${highIssues.length === 1 ? '' : 's'} need your attention`,
          action: 'See details',
          priority: 2
        });
      }

      steps.push({
        icon: '📊',
        title: 'Full Report',
        description: 'Check out all the details',
        action: 'View report',
        priority: 3
      });

      steps.push({
        icon: '⚙️',
        title: 'Schedule Audits',
        description: 'Set up automatic checks',
        action: 'Configure',
        priority: 4
      });

      return steps.sort((a, b) => a.priority - b.priority);
    } else {
      // Tech mode
      return [
        { step: 1, action: 'Review high-severity issues', count: highIssues.length },
        { step: 2, action: 'Address medium-severity issues', count: issues.filter(i => i.severity === 'medium').length },
        { step: 3, action: 'Configure automated audits', optional: true },
        { step: 4, action: 'Export results for team review', optional: true }
      ];
    }
  }

  /**
   * Get framework-specific advice
   */
  getFrameworkAdvice() {
    const { frameworks, languages } = this.detection;
    const advice = [];

    frameworks.forEach(framework => {
      switch (framework.name) {
        case 'React':
          advice.push({
            framework: 'React',
            tips: this.mode === 'vibe' ? [
              'Use functional components and hooks for cleaner code! 🪝',
              'Remember to add keys to your lists! 🔑',
              'Keep components small and focused! 📦'
            ] : [
              'Utilize React.memo for performance optimization',
              'Implement proper error boundaries',
              'Follow hooks rules of usage'
            ]
          });
          break;
        
        case 'Vue.js':
          advice.push({
            framework: 'Vue.js',
            tips: this.mode === 'vibe' ? [
              'Use composition API for better code organization! 🎯',
              'Don\'t forget to validate your props! ✅'
            ] : [
              'Leverage computed properties for reactive data',
              'Use provide/inject for deep component communication',
              'Implement proper prop validation'
            ]
          });
          break;
      }
    });

    return advice;
  }

  /**
   * Calculate health score
   */
  calculateHealthScore(auditResults) {
    const { issues, metadata } = auditResults;
    const files = metadata?.totalFilesAnalyzed || 1;
    
    const highWeight = 10;
    const mediumWeight = 5;
    const lowWeight = 1;

    const penalty = issues.reduce((sum, issue) => {
      if (issue.severity === 'high') return sum + highWeight;
      if (issue.severity === 'medium') return sum + mediumWeight;
      return sum + lowWeight;
    }, 0);

    const maxPenalty = files * 5; // Assume 5 points per file as max
    const score = Math.max(0, Math.round(100 - (penalty / maxPenalty) * 100));

    return Math.min(100, score);
  }

  /**
   * Get conversation response
   */
  respondTo(userMessage) {
    this.conversationHistory.push({ role: 'user', message: userMessage });

    // Simple pattern matching for common questions
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      response = this.mode === 'vibe' 
        ? "I'm here to help you check your code and make it better! I can run audits, explain issues, and suggest fixes. Just ask me anything! 😊"
        : "Available commands: analyze project, explain issue, recommend fixes, configure tests, view history.";
    } else if (lowerMessage.includes('how') && lowerMessage.includes('fix')) {
      response = this.mode === 'vibe'
        ? "Great question! I can show you exactly what to change. Just click on any issue and I'll explain it step-by-step! 🔧"
        : "Issue details include code location, explanation, and suggested remediation. Access via issue detail view.";
    } else if (lowerMessage.includes('thank')) {
      response = this.mode === 'vibe'
        ? "Aw, you're welcome! I'm always happy to help! 🎉"
        : "You're welcome. Happy to assist with code quality improvements.";
    } else {
      response = this.mode === 'vibe'
        ? "I'm not sure about that, but I'm always learning! Try asking me about running an audit or fixing issues! 💡"
        : "Command not recognized. Type 'help' for available commands.";
    }

    this.conversationHistory.push({ role: 'assistant', message: response });
    return response;
  }
}

module.exports = AuditAssistant;

