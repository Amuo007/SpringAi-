/**
 * SpringAI Guided Tour
 * An intelligent, nature-inspired guided tour for web applications
 */
(function() {
  // Configuration
  const CONFIG = {
    cursorSize: 28,
    tooltipMaxWidth: 280,
    tooltipOffset: 15,
    animationDuration: 1000,
    pauseDuration: 5000,
    zIndex: 9999
  };

  // SpringAI Theme Colors
  const THEME = {
    primaryGreen: '#3EB05B',
    lightGreen: '#8FD694',
    darkGreen: '#1A7740',
    accentGreen: '#C5EBC9',
    trunkBrown: '#706B44',
    white: '#FFFFFF',
    lightGray: '#F8F9FA'
  };

  // CSS Styles with SpringAI theming
  const styles = `
    .springai-cursor {
      position: fixed;
      width: ${CONFIG.cursorSize}px;
      height: ${CONFIG.cursorSize}px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${CONFIG.cursorSize}' height='${CONFIG.cursorSize}' viewBox='0 0 24 24' fill='%23FFFFFF' stroke='%233EB05B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 4l7.07 17 2.51-7.39L21 11.07z'%3E%3C/path%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      pointer-events: none;
      z-index: ${CONFIG.zIndex + 2};
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
      transition: transform 0.1s ease;
    }
    
    .springai-cursor.clicking {
      transform: scale(0.9);
    }
    
    .springai-tooltip {
      position: fixed;
      background: rgba(26, 119, 64, 0.95);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      font-weight: 400;
      pointer-events: none;
      z-index: ${CONFIG.zIndex + 1};
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      max-width: ${CONFIG.tooltipMaxWidth}px;
      font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      border-left: 4px solid ${THEME.lightGreen};
    }
    
    .springai-tooltip-title {
      color: ${THEME.lightGreen};
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 16px;
    }
    
    .springai-tooltip-arrow {
      position: absolute;
      width: 10px;
      height: 10px;
      background: rgba(26, 119, 64, 0.95);
      transform: rotate(45deg);
      z-index: ${CONFIG.zIndex};
    }
    
    .springai-highlight {
      position: absolute;
      pointer-events: none;
      z-index: ${CONFIG.zIndex - 1};
      border-radius: 8px;
      box-shadow: 0 0 0 3px ${THEME.primaryGreen}, 0 0 0 8px rgba(62, 176, 91, 0.2);
    }
    
    .springai-button-container {
      position: fixed;
      bottom: 25px;
      right: 0;
      left: 0;
      display: flex;
      justify-content: center;
      z-index: ${CONFIG.zIndex + 3};
    }
    
    .springai-next-button {
      padding: 10px 24px;
      background: ${THEME.primaryGreen};
      color: white;
      border: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .springai-next-button:hover {
      background: ${THEME.darkGreen};
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
    }
    
    .springai-pulse {
      position: absolute;
      width: 40px;
      height: 40px;
      margin-top: -20px;
      margin-left: -20px;
      background-color: rgba(62, 176, 91, 0.6);
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transform: scale(0);
      animation: springai-pulse-animation 2s infinite;
    }
    
    @keyframes springai-pulse-animation {
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

    .springai-tour-progress {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: ${CONFIG.zIndex + 3};
    }
    
    .springai-progress-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      border: 1px solid ${THEME.primaryGreen};
      transition: all 0.3s ease;
    }
    
    .springai-progress-dot.active {
      background-color: ${THEME.primaryGreen};
      transform: scale(1.2);
    }

    .springai-logo {
      position: fixed;
      top: 15px;
      right: 15px;
      z-index: ${CONFIG.zIndex + 3};
      font-family: 'Poppins', system-ui, sans-serif;
      font-weight: 600;
      font-size: 14px;
      color: ${THEME.darkGreen};
      display: flex;
      align-items: center;
      background: ${THEME.white};
      padding: 6px 12px;
      border-radius: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .springai-logo-icon {
      width: 18px;
      height: 18px;
      margin-right: 6px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' stroke='%233EB05B' stroke-width='2' d='M12,2 L12,9 M12,9 C8,9 5,12 5,16 C5,20 8,22 12,22 C16,22 19,20 19,16 C19,12 16,9 12,9 M8,15 L6,13 M16,15 L18,13'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
    }
  `;

  // Tour steps with SpringAI branded messaging
  const tourSteps = [
    {
      element: '.btn-primary.btn-sm', // Manage Signature button
      title: 'Upload Your Signature',
      content: 'First, you\'ll need to upload an image of your signature. This helps us create personalized applications that are ready to submit.',
      position: 'right',
      showClick: true,
      buttonText: 'Got It'
    },
    {
      element: '#checkSignatureBtn', // New Application button
      title: 'Create a New Application',
      content: 'After your signature is uploaded, you can create a new application. Select the type you need and complete the form with your information.',
      position: 'bottom',
      showClick: true,
      buttonText: 'Next Step'
    },
    {
      element: 'table', // My Applications section
      title: 'Manage Your Applications',
      content: 'Your submitted applications appear here. This is your centralized dashboard for tracking all your applications in one place.',
      position: 'top',
      showClick: false,
      buttonText: 'Continue'
    },
    {
      element: 'table td:contains("Status")', // Status column
      title: 'Track Application Status',
      content: 'Each application has a status that updates automatically as it progresses through the system. Keep an eye here for updates!',
      position: 'top',
      showClick: false,
      buttonText: 'I See'
    },
    {
      element: '.btn-sm.btn-outline-primary', // PDF button
      title: 'Download for Your Records',
      content: 'Need a copy of your application? Simply click here to download a PDF version for your personal records or sharing.',
      position: 'left',
      showClick: true,
      buttonText: 'Almost Done'
    },
    {
      element: '.btn-sm.btn-outline-info', // View/Eye button
      title: 'View Complete Details',
      content: 'Want to review your submission? Click this button to see all the details of your application at any time.',
      position: 'left',
      showClick: true,
      buttonText: 'Finish Tour'
    }
  ];

  class SpringAITour {
    constructor() {
      this.currentStep = 0;
      this.elements = {
        cursor: null,
        tooltip: null,
        highlight: null,
        pulse: null,
        button: null,
        progressDots: [],
        logo: null
      };
      this.timeoutId = null;
      this.animationId = null;
    }

    init() {
      this.addStyles();
      this.createElements();
      this.createProgressIndicator();
      this.addSpringAILogo();
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
      this.elements.cursor.classList.add('springai-cursor');
      
      // Create tooltip
      this.elements.tooltip = document.createElement('div');
      this.elements.tooltip.classList.add('springai-tooltip');
      
      // Create arrow
      this.elements.arrow = document.createElement('div');
      this.elements.arrow.classList.add('springai-tooltip-arrow');
      
      // Create highlight
      this.elements.highlight = document.createElement('div');
      this.elements.highlight.classList.add('springai-highlight');
      
      // Create pulse
      this.elements.pulse = document.createElement('div');
      this.elements.pulse.classList.add('springai-pulse');
      this.elements.pulse.style.display = 'none';
      
      // Create button container
      this.elements.buttonContainer = document.createElement('div');
      this.elements.buttonContainer.classList.add('springai-button-container');
      
      // Create next button
      this.elements.button = document.createElement('button');
      this.elements.button.classList.add('springai-next-button');
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

    createProgressIndicator() {
      // Create progress container
      const progressContainer = document.createElement('div');
      progressContainer.classList.add('springai-tour-progress');
      
      // Create progress dots
      for (let i = 0; i < tourSteps.length; i++) {
        const dot = document.createElement('div');
        dot.classList.add('springai-progress-dot');
        if (i === 0) dot.classList.add('active');
        
        progressContainer.appendChild(dot);
        this.elements.progressDots.push(dot);
      }
      
      document.body.appendChild(progressContainer);
    }
    
    addSpringAILogo() {
      // Create logo container
      const logo = document.createElement('div');
      logo.classList.add('springai-logo');
      
      // Create icon
      const icon = document.createElement('div');
      icon.classList.add('springai-logo-icon');
      
      // Create text
      const text = document.createElement('span');
      text.textContent = 'SpringAI Tour';
      
      // Assemble logo
      logo.appendChild(icon);
      logo.appendChild(text);
      
      document.body.appendChild(logo);
      this.elements.logo = logo;
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
      
      // Update progress dots
      this.updateProgressDots(index);
      
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

    updateProgressDots(activeIndex) {
      this.elements.progressDots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
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
        titleElement.classList.add('springai-tooltip-title');
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
      
      // Also need to handle the array of progress dots
      if (this.elements.progressDots) {
        this.elements.progressDots.forEach(dot => {
          if (dot.parentNode) {
            dot.parentNode.removeChild(dot);
          }
        });
      }
    }

    easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
  }

  // Initialize and start tour when page is ready
  const tour = new SpringAITour();
  tour.init();
})();