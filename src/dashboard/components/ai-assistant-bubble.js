/**
 * AI Assistant Chat Bubble Component
 * Friendly assistant that provides contextual guidance
 */

class AIAssistantBubble {
  constructor(mode = 'vibe') {
    this.mode = mode;
    this.isOpen = false;
    this.messages = [];
    this.assistant = null;
  }

  /**
   * Initialize assistant
   */
  initialize(assistantInstance) {
    this.assistant = assistantInstance;
    this.createBubbleElement();
    this.showWelcomeMessage();
  }

  /**
   * Create bubble element
   */
  createBubbleElement() {
    const bubble = document.createElement('div');
    bubble.id = 'aiAssistantBubble';
    bubble.className = `ai-assistant-bubble ${this.mode}-mode`;
    bubble.innerHTML = `
      <div class="assistant-chat-window" style="display: none;">
        <div class="chat-header">
          <div class="assistant-info">
            <div class="assistant-avatar">${this.mode === 'vibe' ? '🤖' : '🎯'}</div>
            <div class="assistant-name">
              <span class="name">${this.mode === 'vibe' ? 'Zippy' : 'Code Assistant'}</span>
              <span class="status">Online</span>
            </div>
          </div>
          <button class="minimize-btn" id="minimizeChat">−</button>
        </div>
        <div class="chat-messages" id="chatMessages">
          <!-- Messages will appear here -->
        </div>
        <div class="chat-input-area">
          <input type="text" placeholder="${this.mode === 'vibe' ? 'Ask me anything...' : 'Enter command...'}" id="chatInput" />
          <button class="send-btn" id="sendMessage">
            <span>➤</span>
          </button>
        </div>
        <div class="quick-actions">
          <button class="quick-action-btn" data-action="help">Help</button>
          <button class="quick-action-btn" data-action="tips">Tips</button>
          <button class="quick-action-btn" data-action="fixes">Quick Fixes</button>
        </div>
      </div>
      <button class="assistant-toggle-btn" id="toggleAssistant">
        <span class="assistant-icon">${this.mode === 'vibe' ? '💬' : '🎯'}</span>
        <span class="notification-badge" style="display: none;">1</span>
      </button>
    `;

    document.body.appendChild(bubble);

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const toggleBtn = document.getElementById('toggleAssistant');
    const minimizeBtn = document.getElementById('minimizeChat');
    const sendBtn = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    toggleBtn.addEventListener('click', () => this.toggle());
    minimizeBtn.addEventListener('click', () => this.close());
    sendBtn.addEventListener('click', () => this.sendMessage());
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleQuickAction(btn.dataset.action));
    });
  }

  /**
   * Toggle chat window
   */
  toggle() {
    const chatWindow = document.querySelector('.assistant-chat-window');
    this.isOpen = !this.isOpen;
    chatWindow.style.display = this.isOpen ? 'flex' : 'none';
    
    if (this.isOpen) {
      document.getElementById('chatInput').focus();
      this.hideNotificationBadge();
    }
  }

  /**
   * Open chat window
   */
  open() {
    if (!this.isOpen) {
      this.toggle();
    }
  }

  /**
   * Close chat window
   */
  close() {
    if (this.isOpen) {
      this.toggle();
    }
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    if (this.assistant) {
      const welcomeMsg = this.assistant.getWelcomeMessage();
      this.addMessage('assistant', welcomeMsg);
      this.showNotificationBadge();
    }
  }

  /**
   * Add message to chat
   */
  addMessage(sender, text) {
    this.messages.push({ sender, text, timestamp: new Date() });
    
    const messagesContainer = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}-message`;
    
    if (sender === 'assistant') {
      messageEl.innerHTML = `
        <div class="message-avatar">${this.mode === 'vibe' ? '🤖' : '🎯'}</div>
        <div class="message-content">${this.formatMessage(text)}</div>
      `;
    } else {
      messageEl.innerHTML = `
        <div class="message-content">${this.formatMessage(text)}</div>
        <div class="message-avatar">👤</div>
      `;
    }

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Format message (support markdown-like formatting)
   */
  formatMessage(text) {
    // Simple formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  }

  /**
   * Send message
   */
  sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message
    this.addMessage('user', message);
    input.value = '';

    // Get assistant response
    if (this.assistant) {
      const response = this.assistant.respondTo(message);
      setTimeout(() => {
        this.addMessage('assistant', response);
      }, 500);
    }
  }

  /**
   * Handle quick actions
   */
  handleQuickAction(action) {
    const messages = {
      help: this.mode === 'vibe' 
        ? "I can help you understand your code audit! Just ask me about any issues, or click on things to learn more. 😊"
        : "Available commands: analyze, explain <term>, fix <issue>, history, export",
      tips: this.mode === 'vibe'
        ? "💡 Pro tip: Start with the Quick Wins! They're easy fixes that make a big difference. Click on the ⚡ Quick Wins section to see them!"
        : "Tip: Use keyboard shortcuts for faster navigation. Press '?' to see all shortcuts.",
      fixes: "Check out the Quick Wins section in your dashboard for easy fixes you can apply right away! ⚡"
    };

    this.addMessage('assistant', messages[action] || 'How can I help?');
    this.open();
  }

  /**
   * Show custom message
   */
  showMessage(text, autoOpen = true) {
    this.addMessage('assistant', text);
    if (autoOpen && !this.isOpen) {
      this.showNotificationBadge();
    }
  }

  /**
   * Show notification badge
   */
  showNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      badge.style.display = 'block';
    }
  }

  /**
   * Hide notification badge
   */
  hideNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      badge.style.display = 'none';
    }
  }

  /**
   * Update mode
   */
  setMode(mode) {
    this.mode = mode;
    const bubble = document.getElementById('aiAssistantBubble');
    if (bubble) {
      bubble.className = `ai-assistant-bubble ${mode}-mode`;
    }
  }

  /**
   * Show analysis tip
   */
  showAnalysisTip(stage, progress) {
    if (this.assistant) {
      const tip = this.assistant.getAnalysisTip(stage, progress);
      this.showMessage(`${tip.emoji} ${tip.message}`, false);
    }
  }

  /**
   * Show results summary
   */
  showResultsSummary(auditResults) {
    if (this.assistant) {
      const summary = this.assistant.getResultsSummary(auditResults);
      this.showMessage(summary, true);
    }
  }

  /**
   * Show next steps
   */
  showNextSteps(auditResults, quickWinsCount) {
    if (this.assistant) {
      const steps = this.assistant.getNextSteps(auditResults, quickWinsCount);
      
      if (this.mode === 'vibe') {
        let message = '**What would you like to do next?**\n\n';
        steps.forEach(step => {
          message += `${step.icon} **${step.title}**\n${step.description}\n\n`;
        });
        this.showMessage(message, true);
      } else {
        let message = '**Recommended Next Steps:**\n\n';
        steps.forEach(step => {
          message += `${step.step}. ${step.action}${step.count ? ` (${step.count})` : ''}${step.optional ? ' (optional)' : ''}\n`;
        });
        this.showMessage(message, true);
      }
    }
  }

  /**
   * Clear chat history
   */
  clearChat() {
    this.messages = [];
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIAssistantBubble;
}

