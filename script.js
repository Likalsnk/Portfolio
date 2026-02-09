document.addEventListener('DOMContentLoaded', () => {
  // --- 0. Env Loader ---
  const loadEnv = async () => {
    try {
      const response = await fetch('.env');
      if (!response.ok) {
        throw new Error('Failed to load .env file');
      }
      const text = await response.text();
      const config = {};
      
      text.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            config[key.trim()] = value.trim();
          }
        }
      });
      
      window.CONFIG = config;
      console.log('Environment variables loaded successfully');
    } catch (error) {
      console.warn('Could not load .env file:', error);
      // Fallback to existing window.CONFIG if available (from config.js)
    }
  };

  // --- 0. Theme & Image Setup ---
  const img = document.querySelector('.hero-full-image');
  const lightImage = 'src/Photo/Frame 1321315845.png';
  const darkImage = 'src/Photo/Black Mode.png';
  
  // Call loadEnv immediately, but don't block other sync initializations
  // We will wait for it before initializing the Chat Widget
  const envPromise = loadEnv();
  
  const themeKey = 'portfolio-theme';
  const savedTheme = localStorage.getItem(themeKey) || 'light';
  
  // Set initial image if dark mode
  if (img && savedTheme === 'dark') {
    img.src = darkImage;
  }

  // --- 1. Pixel Animation (Only for Home Page) ---
  if (img) {
    const runPixelAnimation = () => {
      // Check if image loaded correctly
      if (img.naturalWidth === 0) return;
  
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // Match dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Copy classes for layout consistency
      canvas.className = img.className;
      canvas.style.display = 'block';
      
      // Insert canvas before image
      img.parentNode.insertBefore(canvas, img);
      img.style.display = 'none';
  
      // Grid configuration
      const blockSize = 25;
      const cols = Math.ceil(canvas.width / blockSize);
      const rows = Math.ceil(canvas.height / blockSize);
      
      const blocks = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDist = Math.max(canvas.width, canvas.height) * 1.5;
  
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const targetX = x * blockSize;
          const targetY = y * blockSize;
  
          // Random start position (360 degrees around the center)
          const angle = Math.random() * Math.PI * 2;
          const dist = maxDist + Math.random() * 500; // Minimum distance + random
          
          blocks.push({
            targetX,
            targetY,
            startX: centerX + Math.cos(angle) * dist,
            startY: centerY + Math.sin(angle) * dist,
            // Random delay for each block to create a "swarm" effect
            delay: Math.random() * 800 
          });
        }
      }
  
      let startTime = null;
      const duration = 1500; // Animation duration per block
  
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
  
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        let allFinished = true;
  
        blocks.forEach(block => {
          // Calculate progress for this block based on its delay
          let progress = (elapsed - block.delay) / duration;
          
          if (progress < 0) {
            allFinished = false;
            return; // Hasn't started yet
          }
          if (progress > 1) progress = 1;
          else allFinished = false;
  
          const ease = easeOutCubic(progress);
  
          // Interpolate position
          const currentX = block.startX + (block.targetX - block.startX) * ease;
          const currentY = block.startY + (block.targetY - block.startY) * ease;
  
          // Draw block
          ctx.drawImage(
            img,
            block.targetX, block.targetY, blockSize, blockSize, // Source (always fixed)
            currentX, currentY, blockSize, blockSize            // Destination (moving)
          );
        });
  
        if (!allFinished) {
          requestAnimationFrame(animate);
        } else {
          // Cleanup
          img.style.display = 'block';
          canvas.remove();
        }
      };
  
      requestAnimationFrame(animate);
    };
  
    if (img.complete) {
      runPixelAnimation();
    } else {
      img.onload = runPixelAnimation;
    }
  }
  
  // --- 2. Sidebar Navigation (SPA Mode) ---
  const sidebarNav = document.querySelector('.sidebar-nav');
  const indicator = document.querySelector('.nav-indicator');
  const mainContent = document.querySelector('.main-content');
  
  // Function to move indicator to the active item
  const moveIndicator = (targetItem) => {
    if (!indicator || !targetItem) return;
    
    // Calculate position relative to the sidebar-nav
    const top = targetItem.offsetTop;
    
    // Move indicator
    indicator.style.transform = `translateY(${top}px)`;
    
    // Update active classes
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    targetItem.classList.add('active');
  };
  
  // Initialize indicator position on load
  if (sidebarNav && indicator) {
    const activeItem = sidebarNav.querySelector('.sidebar-item.active');
    if (activeItem) {
      // Temporarily disable transition to prevent sliding on page load
      indicator.style.transition = 'none';
      moveIndicator(activeItem);
      // Force reflow
      indicator.offsetHeight; 
      // Re-enable transition for subsequent interactions
      indicator.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  }

  // --- 4. Tabs Logic (Tools vs Skills) ---
  const initTabs = () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length === 0) return;

    tabButtons.forEach(btn => {
      // Check initialization flag to prevent duplicate listeners
      if (btn.dataset.tabsInitialized === 'true') return;
      btn.dataset.tabsInitialized = 'true';

      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        const nextContent = document.getElementById(`${tabId}-tab`);

        if (btn.classList.contains('active')) return;
        
        // Update buttons state immediately
        // Re-query buttons in case of dynamic changes, or just use the closure if stable.
        // Using querySelectorAll ensures we catch all current buttons.
        const allButtons = document.querySelectorAll('.tab-button');
        allButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update content state immediately (no animation)
        tabContents.forEach(c => c.classList.remove('active'));
        if (nextContent) {
          nextContent.classList.add('active');
        }
      });
    });
  };

  // Initialize tabs on load
  initTabs();
  
  // --- 5. 3D Tilt Effect for Cases Cards (Smart Animate) ---
  const initTilt = () => {
    // Select elements that have data-tilt. 
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    if (tiltElements.length === 0) return;

    tiltElements.forEach(wrapper => {
      // Prevent double binding
      if (wrapper.dataset.tiltInitialized === 'true') return;
      wrapper.dataset.tiltInitialized = 'true';
      
      const elementToTilt = wrapper; // The wrapper itself
      let rect = null;
      let isHovering = false;
      let animationFrameId = null;

      // Store absolute page coordinates to handle scroll without re-measuring
      let pageX = 0;
      let pageY = 0;

      const initHover = () => {
         isHovering = true;
         rect = wrapper.getBoundingClientRect();
         // Calculate absolute position
         pageX = rect.left + window.scrollX;
         pageY = rect.top + window.scrollY;
         
         // Remove transition for instant, responsive follow (Smart Animate feel)
         elementToTilt.style.transition = 'none';
      };

      const updateRect = () => {
        if (!wrapper.isConnected) {
           window.removeEventListener('resize', updateRect);
           return;
        }
        // Only update if we are hovering, otherwise we'll measure on next enter
        if (isHovering) {
            rect = wrapper.getBoundingClientRect();
            pageX = rect.left + window.scrollX;
            pageY = rect.top + window.scrollY;
        }
      };
      
      // Update on resize (layout changes)
      window.addEventListener('resize', updateRect, { passive: true });

      const updateTransform = (rotateX, rotateY) => {
        elementToTilt.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(1.05)
          translateY(-8px)
        `;
        animationFrameId = null;
      };

      wrapper.addEventListener('mouseenter', initHover);

      wrapper.addEventListener('mousemove', (e) => {
        // Handle case where mouse is already over element on load
        if (!isHovering) initHover();
        
        // Use cached absolute position - scrollY to get current viewport relative position
        // This avoids calling getBoundingClientRect() during animation/scroll
        const currentRectLeft = pageX - window.scrollX;
        const currentRectTop = pageY - window.scrollY;
        
        const x = e.clientX - currentRectLeft;
        const y = e.clientY - currentRectTop;
        
        // Calculate percentage from center (-1 to 1)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -8; // Increased rotation range
        const rotateY = ((x - centerX) / centerX) * 8;
        
        // Use requestAnimationFrame for performance
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(() => updateTransform(rotateX, rotateY));
        }
      });
      
      wrapper.addEventListener('mouseleave', () => {
        isHovering = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        // Revert to CSS transition for smooth snap-back
        elementToTilt.style.transition = '';
        elementToTilt.style.transform = ''; // Clears inline style, falling back to CSS :hover or default
        rect = null;
      });
    });
  };

  initTilt();

  // Handle Sidebar Links (SPA Content Swap)
  if (sidebarNav && mainContent) {
    sidebarNav.addEventListener('click', async (e) => {
      // Find closest sidebar item (in case click is on icon)
      const link = e.target.closest('.sidebar-item');
      
      if (!link) return;
      
      const href = link.getAttribute('href');
      
      // If anchor link (same page section), standard behavior
      if (href.startsWith('#')) return;

      // If linking to home page (index.html), let it do a full reload without SPA animation
      if (href === 'index.html' || href === '/' || href.endsWith('index.html')) return;
      
      // If link involves directory traversal (going up), do a full reload to ensure relative links remain valid
      if (href.startsWith('..')) return;
      
      e.preventDefault();
      
      // If clicking current page, do nothing
      if (link.classList.contains('active')) return;

      // 1. Animate Indicator immediately
      moveIndicator(link);

      // 2. Fetch Content
      try {
        // Fade out content slightly
        mainContent.style.opacity = '0.5';
        mainContent.style.transform = 'translateY(10px)';
        mainContent.style.transition = 'opacity 0.3s, transform 0.3s';
        
        const response = await fetch(href);
        const text = await response.text();
        
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const newContent = doc.querySelector('.main-content').innerHTML;
        const newTitle = doc.title;
        
        // Dynamically load missing stylesheets
        const newLinks = doc.querySelectorAll('link[rel="stylesheet"]');
        const currentLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href'));
        
        newLinks.forEach(link => {
            const cssHref = link.getAttribute('href');
            if (cssHref && !currentLinks.includes(cssHref)) {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = cssHref;
                document.head.appendChild(newLink);
            }
        });

        // Wait for fade out
        setTimeout(() => {
          // Replace Content
          mainContent.innerHTML = newContent;
          document.title = newTitle;
          
          // Update URL
          window.history.pushState({}, '', href);
          
          // Fade in
          mainContent.style.opacity = '1';
          mainContent.style.transform = 'translateY(0)';
          
          // Re-initialize any scripts if necessary (e.g., if there were specific page scripts)
          // For accordions, HTML <details> works automatically.
          initTabs();
          initTilt();

          // Re-apply translations
          const currentLang = localStorage.getItem('portfolio-lang') || 'en';
          if (window.updatePortfolioLanguage) {
            window.updatePortfolioLanguage(currentLang);
          }
          
        }, 300);
        
      } catch (err) {
        console.error('Navigation failed', err);
        window.location.href = href; // Fallback to full reload
      }
    });
    
    // Handle Browser Back/Forward
    window.addEventListener('popstate', () => {
      // For simplicity, reload to ensure correct state, or implement full hydration
      window.location.reload();
    });
  }

  // --- 3. Global Page Transition (Full Reloads) ---
  // Only for links that are NOT handled by SPA (e.g. Home button, or links on Home page)
  const globalLinks = document.querySelectorAll('a.nav-button, a.back-link');
  
  globalLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('javascript:')) {
      link.addEventListener('click', (e) => {
        if (href.startsWith('http') && link.target === '_blank') return;
        
        e.preventDefault();
        document.body.classList.add('exiting');
        
        setTimeout(() => {
          window.location.href = link.href;
        }, 600);
      });
    }
  });

  // --- 6. Social Media Popup Logic ---
  const socialTrigger = document.querySelector('.social-trigger');
  const socialGroup = document.querySelector('.sidebar-social-group');

  if (socialTrigger && socialGroup) {
    socialTrigger.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent document click from immediately closing it
      socialGroup.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!socialGroup.contains(e.target)) {
        socialGroup.classList.remove('active');
      }
    });
  }

  // --- 7. Burger Menu Logic ---
  const burgerBtn = document.querySelector('.burger-btn');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (burgerBtn && mobileNavOverlay) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      mobileNavOverlay.classList.toggle('active');
      
      // Prevent scrolling when menu is open
      if (mobileNavOverlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking a link
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- 8. Theme Toggle Logic ---
  const initTheme = () => {
    const themeKey = 'portfolio-theme';
    const savedTheme = localStorage.getItem(themeKey) || 'light';
    
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Create toggle button if it doesn't exist
    if (!document.querySelector('.theme-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'theme-toggle';
      toggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
      toggleBtn.setAttribute('aria-label', 'Toggle theme');
      
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(themeKey, newTheme);
        toggleBtn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';

        // Update Homepage Image if present
        if (img) {
          img.src = newTheme === 'dark' ? darkImage : lightImage;
        }
      });
      
      document.body.appendChild(toggleBtn);
    }
  };
  
  initTheme();

  // --- 8.5. Language Switcher Logic ---
  const initLanguage = () => {
    const langKey = 'portfolio-lang';
    const savedLang = localStorage.getItem(langKey) || 'en';
    
    // Function to update texts
    const updateTexts = (lang) => {
      // 1. Text Content
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
          el.innerHTML = translations[lang][key];
        }
      });
      
      // 2. Tooltips (data-tooltip attribute)
      document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
        const key = el.getAttribute('data-i18n-tooltip');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
          el.setAttribute('data-tooltip', translations[lang][key]);
        }
      });

      // 3. Placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
          el.setAttribute('placeholder', translations[lang][key]);
        }
      });

      // 4. Titles
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
          el.setAttribute('title', translations[lang][key]);
        }
      });

      // Update html lang attribute
      document.documentElement.lang = lang;
    };

    // Expose update function globally
    window.updatePortfolioLanguage = updateTexts;

    // Apply initial language
    updateTexts(savedLang);

    // Create toggle button if it doesn't exist
    if (!document.querySelector('.lang-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'lang-toggle';
      // Show target language
      toggleBtn.innerHTML = savedLang === 'en' ? 'UA' : 'EN';
      toggleBtn.setAttribute('aria-label', 'Switch language');
      
      toggleBtn.addEventListener('click', () => {
        const currentLang = localStorage.getItem(langKey) || 'en';
        const newLang = currentLang === 'en' ? 'ua' : 'en';
        
        localStorage.setItem(langKey, newLang);
        updateTexts(newLang);
        // Update button to show target language
        toggleBtn.innerHTML = newLang === 'en' ? 'UA' : 'EN';
      });
      
      document.body.appendChild(toggleBtn);
    }
  };

  // Ensure translations are loaded
  if (typeof translations !== 'undefined') {
    initLanguage();
  } else {
    window.addEventListener('load', () => {
       if (typeof translations !== 'undefined') initLanguage();
    });
  }

  // --- 9. Chat Widget Logic ---
  const initChatWidget = async () => {
    // Wait for env to load if it hasn't already
    if (typeof envPromise !== 'undefined') {
        await envPromise;
    }

    // Check if already exists to prevent duplicates
    if (document.querySelector('.chat-widget-btn')) return;

    // --- CONFIGURATION ---
    // Loaded from .env (via loadEnv)
    const config = window.CONFIG || {};
    console.log('Checking CONFIG...', config);

    const botToken = config.TELEGRAM_BOT_TOKEN || ''; 
    const chatId = config.TELEGRAM_CHAT_ID || '';
    
    if (!botToken || !chatId) {
        console.error('Telegram Bot configuration missing! Check .env file');
        console.log('botToken:', botToken, 'chatId:', chatId);
        return;
    }
    // ---------------------

    // Helper to get text based on current language
    const getText = (key) => {
        const lang = localStorage.getItem('portfolio-lang') || 'en';
        return (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) 
            ? translations[lang][key] 
            : key;
    };

    // Create Button
    const btn = document.createElement('div');
    btn.className = 'chat-widget-btn';
    btn.innerHTML = '💬';
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Open Chat');
    document.body.appendChild(btn);

    // Create Window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <span class="chat-title" data-i18n="chat.title">Chat with me</span>
        <div class="chat-controls">
            <button class="chat-end" title="End Chat" data-i18n-title="chat.end_btn">🗑️</button>
            <button class="chat-close">×</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages">
        <!-- Messages will be loaded here -->
      </div>
      <div class="chat-input-area">
        <textarea class="chat-input" placeholder="Type a message..." data-i18n-placeholder="chat.placeholder" rows="1"></textarea>
        <button class="chat-send">➤</button>
      </div>
    `;
    document.body.appendChild(chatWindow);

    // Apply translations immediately
    if (window.updatePortfolioLanguage) {
        window.updatePortfolioLanguage(localStorage.getItem('portfolio-lang') || 'en');
    }

    // Elements
    const closeBtn = chatWindow.querySelector('.chat-close');
    const endBtn = chatWindow.querySelector('.chat-end');
    const sendBtn = chatWindow.querySelector('.chat-send');
    const input = chatWindow.querySelector('.chat-input');
    const messagesContainer = chatWindow.querySelector('.chat-messages');

    // --- Helpers ---
    const playNotificationSound = () => {
        // Soft, elegant glass "ding"
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2864/2864-preview.mp3'); 
        audio.volume = 0.25; // Keep it quiet
        audio.play().catch(e => console.log('Audio play failed (interaction required first):', e));
    };

    const setUnread = (state) => {
        if (state) {
            btn.classList.add('unread');
            localStorage.setItem('chatUnread', 'true');
        } else {
            btn.classList.remove('unread');
            localStorage.removeItem('chatUnread');
        }
    };

    // --- Persistence Logic ---
    const saveHistory = () => {
        const messages = [];
        messagesContainer.querySelectorAll('.chat-message').forEach(el => {
            messages.push({
                text: el.textContent,
                sender: el.classList.contains('bot') ? 'bot' : 'user'
            });
        });
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    };

    const loadHistory = () => {
        const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        if (history.length === 0) {
            // Default welcome message
            addMessage(getText('chat.bot.welcome'), 'bot', false);
        } else {
            history.forEach(msg => addMessage(msg.text, msg.sender, false));
        }
    };

    // Toggle Visibility
    const toggleChat = () => {
      chatWindow.classList.toggle('active');
      if (chatWindow.classList.contains('active')) {
        input.focus();
        setUnread(false); // Remove badge and storage when opened
      }
    };

    btn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Create Confirmation Popup
    const confirmationOverlay = document.createElement('div');
    confirmationOverlay.className = 'chat-confirmation-overlay';
    confirmationOverlay.innerHTML = `
      <div class="chat-confirmation-modal">
        <div class="chat-confirmation-title" data-i18n="chat.confirm.title">End Chat?</div>
        <div class="chat-confirmation-text" data-i18n="chat.confirm.text">Are you sure you want to end the chat and clear history?</div>
        <div class="chat-confirmation-buttons">
          <button class="chat-confirm-btn cancel" data-i18n="chat.confirm.cancel">Cancel</button>
          <button class="chat-confirm-btn delete" data-i18n="chat.confirm.end">End Chat</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmationOverlay);
    
    // Apply translations to confirmation overlay
    if (window.updatePortfolioLanguage) {
        window.updatePortfolioLanguage(localStorage.getItem('portfolio-lang') || 'en');
    }

    const confirmCancelBtn = confirmationOverlay.querySelector('.cancel');
    const confirmDeleteBtn = confirmationOverlay.querySelector('.delete');

    const closeConfirmation = () => {
        confirmationOverlay.classList.remove('active');
    };

    const openConfirmation = () => {
        confirmationOverlay.classList.add('active');
    };

    confirmCancelBtn.addEventListener('click', closeConfirmation);

    confirmDeleteBtn.addEventListener('click', () => {
        localStorage.removeItem('chatHistory');
        messagesContainer.innerHTML = '';
        // Reset to welcome message
        addMessage(getText('chat.bot.ended'), 'bot', false);
        setTimeout(() => {
            messagesContainer.innerHTML = '';
            addMessage(getText('chat.bot.welcome'), 'bot', true); // Save this new state
        }, 1500);
        closeConfirmation();
    });

    // Close on click outside modal
    confirmationOverlay.addEventListener('click', (e) => {
        if (e.target === confirmationOverlay) {
            closeConfirmation();
        }
    });

    // End Chat Logic
    endBtn.addEventListener('click', openConfirmation);

    // Typing Indicator UI
    const showTypingIndicator = () => {
        if (messagesContainer.querySelector('.chat-typing')) return;
        const typing = document.createElement('div');
        typing.className = 'chat-typing';
        typing.innerHTML = `
            <div class="chat-typing-dot"></div>
            <div class="chat-typing-dot"></div>
            <div class="chat-typing-dot"></div>
        `;
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const hideTypingIndicator = () => {
        const typing = messagesContainer.querySelector('.chat-typing');
        if (typing) typing.remove();
    };

    // Add Message to UI
    const addMessage = (text, sender, save = true) => {
      hideTypingIndicator(); // Ensure typing is removed before adding message
      const msg = document.createElement('div');
      msg.className = `chat-message ${sender}`;
      msg.textContent = text;
      messagesContainer.appendChild(msg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      if (save) saveHistory();

      // Show unread badge if chat is closed and message is from bot
      // Only play sound and show badge for NEW messages (save=true)
      if (save && sender === 'bot') {
        playNotificationSound();
        if (!chatWindow.classList.contains('active')) {
            setUnread(true);
        }
      }
    };

    // Initialize History
    loadHistory();

    // Restore unread state
    if (localStorage.getItem('chatUnread') === 'true') {
        btn.classList.add('unread');
    }

    // --- Polling Logic ---
    let lastUpdateId = 0;
    const pollUpdates = async () => {
        if (!botToken || botToken === 'YOUR_BOT_TOKEN') return;

        try {
          // Use offset to ignore already processed messages
          const offsetParam = lastUpdateId ? `?offset=${lastUpdateId + 1}` : '';
          const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates${offsetParam}`);
          const data = await response.json();

          if (data.ok && data.result.length > 0) {
            data.result.forEach(update => {
              // Update the offset to the highest ID found
              if (update.update_id > lastUpdateId) {
                lastUpdateId = update.update_id;
              }

              // Check if the message is from the Site Owner (Chat ID)
              if (update.message && String(update.message.chat.id) === chatId) {
                 const text = update.message.text;
                 if (text) {
                   showTypingIndicator();
                   setTimeout(() => {
                     addMessage(text, 'bot');
                   }, 1500);
                 }
              }
            });
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
    };

    // Start polling
    setInterval(pollUpdates, 3000);

    // Send Message Logic
    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;

      addMessage(text, 'user');
      input.value = '';

      if (botToken === 'YOUR_BOT_TOKEN' || chatId === 'YOUR_CHAT_ID') {
         setTimeout(() => {
           addMessage('⚠️ Please configure the Bot Token and Chat ID in script.js to send messages.', 'bot');
         }, 500);
         return;
      }

      try {
        const fullMessage = `<b>📩 New Message from Portfolio</b>\n\n` +
                            `<b>📄 Page:</b> ${document.title}\n` +
                            `<b>💬 Message:</b>\n${text}`;

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: fullMessage,
            parse_mode: 'HTML'
          })
        });

        if (response.ok) {
           showTypingIndicator();
           setTimeout(() => {
             addMessage(getText('chat.bot.sent'), 'bot');
           }, 1500);
        } else {
           const errorData = await response.json();
           throw new Error(errorData.description || 'Failed to send');
        }
      } catch (error) {
        console.error(error);
        addMessage(`${getText('chat.bot.error')}: ${error.message}`, 'bot');
      }
    };

    // Typing Indicator Logic (Visitor -> Telegram)
    // Note: Displaying "Owner is typing" on the website is not supported by standard Telegram Bot API.
    // The Bot API does not provide events for when the bot owner is typing in a private chat.
    let isTyping = false;
    let typingTimeout;

    input.addEventListener('input', async () => {
      if (!botToken || botToken === 'YOUR_BOT_TOKEN') return;
      
      if (!isTyping) {
        isTyping = true;
        try {
          fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, action: 'typing' })
          }).catch(() => {});
        } catch (e) {}
      }
      
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        isTyping = false;
      }, 3000);
    });

    // Auto-resize textarea
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') {
            this.style.height = '';
        }
    });

    sendBtn.addEventListener('click', () => {
        sendMessage();
        input.style.height = ''; // Reset height after sending
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        input.style.height = ''; // Reset height after sending
      }
    });
  };

  initChatWidget();
});
