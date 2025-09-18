/**
 * WaterLoo Admin Dashboard Guided Tour
 * Follows specific sequence with clear instructions
 */
(function() {
  // Configuration
  const CONFIG = {
    cursorSize: 28,
    tooltipMaxWidth: 250,
    tooltipOffset: 15,
    animationDuration: 1000,
    pauseDuration: 5000,
    zIndex: 9999
  };

  // CSS Styles
  const styles = `
    .wl-cursor {
      position: fixed;
      width: ${CONFIG.cursorSize}px;
      height: ${CONFIG.cursorSize}px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${CONFIG.cursorSize}' height='${CONFIG.cursorSize}' viewBox='0 0 24 24' fill='%23ffffff' stroke='%23000000' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 4l7.07 17 2.51-7.39L21 11.07z'%3E%3C/path%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      pointer-events: none;
      z-index: ${CONFIG.zIndex + 2};
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
      transition: transform 0.1s ease;
    }
    
    .wl-cursor.clicking {
      transform: scale(0.9);
    }
    
    .wl-tooltip {
      position: fixed;
      background: rgba(15, 23, 42, 0.95);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
      font-weight: 500;
      pointer-events: none;
      z-index: ${CONFIG.zIndex + 1};
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      max-width: ${CONFIG.tooltipMaxWidth}px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .wl-tooltip-title {
      color: #f97316;
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 15px;
    }
    
    .wl-tooltip-arrow {
      position: absolute;
      width: 8px;
      height: 8px;
      background: rgba(15, 23, 42, 0.95);
      transform: rotate(45deg);
      z-index: ${CONFIG.zIndex};
    }
    
    .wl-highlight {
      position: absolute;
      pointer-events: none;
      z-index: ${CONFIG.zIndex - 1};
      border-radius: 6px;
      box-shadow: 0 0 0 3px #2563eb, 0 0 0 8px rgba(37, 99, 235, 0.2);
    }
    
    .wl-button-container {
      position: fixed;
      bottom: 20px;
      right: 0;
      left: 0;
      display: flex;
      justify-content: center;
      z-index: ${CONFIG.zIndex + 3};
    }
    
    .wl-next-button {
      padding: 8px 16px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .wl-next-button:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .wl-pulse {
      position: absolute;
      width: 40px;
      height: 40px;
      margin-top: -20px;
      margin-left: -20px;
      background-color: rgba(59, 130, 246, 0.6);
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transform: scale(0);
      animation: wl-pulse-animation 2s infinite;
    }
    
    @keyframes wl-pulse-animation {
      0% {
        transform: scale(0);
        opacity: 0.5;
      }
      50% {
        opacity: 0;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;

  // Tour steps
  const tourSteps = [
    {
      element: '.navbar-brand',
      title: 'Welcome to WaterLoo',
      content: 'This is the admin dashboard for the WaterLoo system. Let\'s take a quick tour to help you get started.',
      position: 'bottom',
      showClick: false,
      buttonText: 'Let\'s Start'
    },
    {
      element: '.nav-link.active',
      title: 'Dashboard Overview',
      content: 'This is your main dashboard where you can see an overview of all system activities and manage users.',
      position: 'bottom',
      showClick: true,
      buttonText: 'Next'
    },
    {
      element: '.nav-link:contains("Application Approvals")',
      title: 'Application Approvals',
      content: 'Click here to review and approve pending applications submitted by users.',
      position: 'bottom',
      showClick: true,
      buttonText: 'Continue'
    },
    {
      element: '.nav-link:contains("Applications")',
      title: 'Application Management',
      content: 'Access all applications in the system, including completed, pending, and rejected applications.',
      position: 'bottom',
      showClick: true,
      buttonText: 'Next'
    },
    {
      element: 'h3:contains("Enabled Users")',
      title: 'User Management',
      content: 'Here you can see all active users in the system. As an admin, you can manage their roles and permissions.',
      position: 'bottom',
      showClick: false,
      buttonText: 'Continue'
    },
    {
      element: '#table-0',
      title: 'Active Users Table',
      content: 'This table displays all enabled users in the system. You can view their details and modify their access rights.',
      position: 'top',
      showClick: false,
      buttonText: 'Next'
    },
    {
      element: 'h3:contains("Disabled Users")',
      title: 'Disabled Users',
      content: 'This section shows users whose accounts have been deactivated. You can reactivate them if needed.',
      position: 'top',
      showClick: false,
      buttonText: 'Next'
    },
    {
      element: '.btn.btn-danger',
      title: 'Logging Out',
      content: 'When you\'re done with your administrative tasks, click here to safely log out of the system.',
      position: 'left',
      showClick: true,
      buttonText: 'Finish Tour'
    }
  ];

  class SimpleTour {
    constructor() {
      this.currentStep = 0;
      this.elements = {
        cursor: null,
        tooltip: null,
        highlight: null,
        pulse: null,
        button: null
      };
      this.timeoutId = null;
      this.animationId = null;
    }

    init() {
      this.addStyles();
      this.createElements();
      this.startTour();
    }

    addStyles() {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }

    createElements() {
      // Create cursor
      this.elements.cursor = document.createElement('div');
      this.elements.cursor.classList.add('wl-cursor');
      
      // Create tooltip
      this.elements.tooltip = document.createElement('div');
      this.elements.tooltip.classList.add('wl-tooltip');
      
      // Create arrow
      this.elements.arrow = document.createElement('div');
      this.elements.arrow.classList.add('wl-tooltip-arrow');
      
      // Create highlight
      this.elements.highlight = document.createElement('div');
      this.elements.highlight.classList.add('wl-highlight');
      
      // Create pulse
      this.elements.pulse = document.createElement('div');
      this.elements.pulse.classList.add('wl-pulse');
      this.elements.pulse.style.display = 'none';
      
      // Create button container
      this.elements.buttonContainer = document.createElement('div');
      this.elements.buttonContainer.classList.add('wl-button-container');
      
      // Create next button
      this.elements.button = document.createElement('button');
      this.elements.button.classList.add('wl-next-button');
      this.elements.button.addEventListener('click', () => this.nextStep());
      
      // Add elements to document
      document.body.appendChild(this.elements.cursor);
      document.body.appendChild(this.elements.tooltip);
      this.elements.tooltip.appendChild(this.elements.arrow);
      document.body.appendChild(this.elements.highlight);
      document.body.appendChild(this.elements.pulse);
      document.body.appendChild(this.elements.buttonContainer);
      this.elements.buttonContainer.appendChild(this.elements.button);
    }

    startTour() {
      this.showStep(0);
    }

    showStep(index) {
      if (index >= tourSteps.length) {
        this.endTour();
        return;
      }

      this.currentStep = index;
      const step = tourSteps[index];
      
      // Find target element
      const targetElement = this.findElement(step.element);
      if (!targetElement) {
        console.warn(`Element not found: ${step.element}`);
        this.nextStep();
        return;
      }
      
      // Get element position
      const rect = targetElement.getBoundingClientRect();
      
      // Move cursor to element
      this.moveCursorTo(rect.left + rect.width / 2, rect.top + rect.height / 2);
      
      // Update tooltip content
      this.updateTooltip(step, rect);
      
      // Update button text
      this.elements.button.textContent = step.buttonText || 'Next';
      
      // Highlight element
      this.highlightElement(rect);
      
      // Scroll element into view if needed
      this.scrollIntoViewIfNeeded(targetElement);
      
      // Show click animation if needed
      if (step.showClick) {
        setTimeout(() => {
          this.simulateClick();
        }, CONFIG.animationDuration + 500);
      }
    }

    findElement(selector) {
      if (selector.includes(':contains')) {
        // Handle :contains pseudo-selector
        const [tagName, text] = selector.split(':contains("');
        const searchText = text.slice(0, -2);
        
        // Find all elements of this tag type
        const elements = document.querySelectorAll(tagName);
        
        // Find the one with matching text
        for (const element of elements) {
          if (element.textContent.includes(searchText)) {
            return element;
          }
        }
        
        return null;
      }
      
      return document.querySelector(selector);
    }

    moveCursorTo(x, y) {
      // Clear any existing animation
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      
      const startX = parseFloat(this.elements.cursor.style.left) || window.innerWidth / 2;
      const startY = parseFloat(this.elements.cursor.style.top) || window.innerHeight / 2;
      
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed >= CONFIG.animationDuration) {
          this.elements.cursor.style.left = `${x}px`;
          this.elements.cursor.style.top = `${y}px`;
          return;
        }
        
        const progress = elapsed / CONFIG.animationDuration;
        const easedProgress = this.easeInOutQuad(progress);
        
        const currentX = startX + (x - startX) * easedProgress;
        const currentY = startY + (y - startY) * easedProgress;
        
        this.elements.cursor.style.left = `${currentX}px`;
        this.elements.cursor.style.top = `${currentY}px`;
        
        this.animationId = requestAnimationFrame(animate);
      };
      
      this.animationId = requestAnimationFrame(animate);
    }

    updateTooltip(step, rect) {
      // Clear existing content
      this.elements.tooltip.innerHTML = '';
      
      // Add title if present
      if (step.title) {
        const titleElement = document.createElement('div');
        titleElement.classList.add('wl-tooltip-title');
        titleElement.textContent = step.title;
        this.elements.tooltip.appendChild(titleElement);
      }
      
      // Add content
      if (step.content) {
        const contentElement = document.createElement('div');
        contentElement.textContent = step.content;
        this.elements.tooltip.appendChild(contentElement);
      }
      
      // Re-add arrow
      this.elements.tooltip.appendChild(this.elements.arrow);
      
      // Position tooltip based on position
      const position = step.position || 'right';
      
      let tooltipX, tooltipY;
      
      switch (position) {
        case 'top':
          tooltipX = rect.left + rect.width / 2;
          tooltipY = rect.top - CONFIG.tooltipOffset;
          this.elements.tooltip.style.transform = 'translate(-50%, -100%)';
          this.elements.arrow.style.top = '100%';
          this.elements.arrow.style.left = '50%';
          this.elements.arrow.style.transform = 'translate(-50%, -50%) rotate(45deg)';
          break;
        case 'bottom':
          tooltipX = rect.left + rect.width / 2;
          tooltipY = rect.bottom + CONFIG.tooltipOffset;
          this.elements.tooltip.style.transform = 'translate(-50%, 0)';
          this.elements.arrow.style.top = '0';
          this.elements.arrow.style.left = '50%';
          this.elements.arrow.style.transform = 'translate(-50%, -50%) rotate(45deg)';
          break;
        case 'left':
          tooltipX = rect.left - CONFIG.tooltipOffset;
          tooltipY = rect.top + rect.height / 2;
          this.elements.tooltip.style.transform = 'translate(-100%, -50%)';
          this.elements.arrow.style.top = '50%';
          this.elements.arrow.style.left = '100%';
          this.elements.arrow.style.transform = 'translate(-50%, -50%) rotate(45deg)';
          break;
        case 'right':
        default:
          tooltipX = rect.right + CONFIG.tooltipOffset;
          tooltipY = rect.top + rect.height / 2;
          this.elements.tooltip.style.transform = 'translate(0, -50%)';
          this.elements.arrow.style.top = '50%';
          this.elements.arrow.style.left = '0';
          this.elements.arrow.style.transform = 'translate(-50%, -50%) rotate(45deg)';
          break;
      }
      
      this.elements.tooltip.style.left = `${tooltipX}px`;
      this.elements.tooltip.style.top = `${tooltipY}px`;
    }

    highlightElement(rect) {
      this.elements.highlight.style.left = `${rect.left}px`;
      this.elements.highlight.style.top = `${rect.top}px`;
      this.elements.highlight.style.width = `${rect.width}px`;
      this.elements.highlight.style.height = `${rect.height}px`;
    }

    simulateClick() {
      // Add clicking class
      this.elements.cursor.classList.add('clicking');
      
      // Show pulse at cursor position
      const x = parseFloat(this.elements.cursor.style.left) || 0;
      const y = parseFloat(this.elements.cursor.style.top) || 0;
      
      this.elements.pulse.style.display = 'block';
      this.elements.pulse.style.left = `${x}px`;
      this.elements.pulse.style.top = `${y}px`;
      
      // Remove clicking class after animation
      setTimeout(() => {
        this.elements.cursor.classList.remove('clicking');
        
        // Hide pulse after animation completes
        setTimeout(() => {
          this.elements.pulse.style.display = 'none';
        }, 2000);
      }, 300);
    }

    scrollIntoViewIfNeeded(element) {
      const rect = element.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
      
      if (!isInViewport) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }

    nextStep() {
      this.showStep(this.currentStep + 1);
    }

    endTour() {
      // Remove all elements
      Object.values(this.elements).forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    }

    easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
  }

  // Initialize and start tour when page is ready
  const tour = new SimpleTour();
  tour.init();
})();