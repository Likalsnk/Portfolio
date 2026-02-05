document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Pixel Animation (Only for Home Page) ---
  const img = document.querySelector('.hero-full-image');
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
      // Remove old listeners to prevent duplicates if function is called multiple times
      // Cloning the node is a simple way to remove all listeners
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });

    // Re-select fresh buttons
    const newTabButtons = document.querySelectorAll('.tab-button');
    
    newTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        const nextContent = document.getElementById(`${tabId}-tab`);

        if (btn.classList.contains('active')) return;
        
        // Update buttons state immediately
        newTabButtons.forEach(b => b.classList.remove('active'));
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
    // Now data-tilt is on .card-image-wrapper, so 'card' variable here is actually the wrapper.
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    if (tiltElements.length === 0) return;

    tiltElements.forEach(wrapper => {
      // Prevent double binding
      if (wrapper.dataset.tiltInitialized === 'true') return;
      wrapper.dataset.tiltInitialized = 'true';

      // If data-tilt is on the wrapper itself, we operate on it directly.
      // But we still want to move the image inside it? 
      // Actually, the tilt usually applies to the container, transforming it.
      // In CSS we had: .card-image-wrapper { transform: translateZ(0); ... }
      // So transforming the wrapper itself is correct.
      
      const elementToTilt = wrapper; // The wrapper itself
      
      wrapper.addEventListener('mouseenter', () => {
        // Remove transition for instant, responsive follow (Smart Animate feel)
        elementToTilt.style.transition = 'none';
      });

      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate percentage from center (-1 to 1)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -8; // Increased rotation range
        const rotateY = ((x - centerX) / centerX) * 8;
        
        // Apply transform to the wrapper
        // Note: We need to preserve the hover translateY if possible, or include it here.
        // CSS has .card-image-wrapper:hover { transform: translateY(-8px); }
        // JS inline style overrides CSS. So we MUST include translateY(-8px) here.
        elementToTilt.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(1.05)
          translateY(-8px)
        `;
      });
      
      wrapper.addEventListener('mouseleave', () => {
        // Revert to CSS transition for smooth snap-back
        elementToTilt.style.transition = '';
        elementToTilt.style.transform = ''; // Clears inline style, falling back to CSS :hover or default
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
      
      // If external or different layout (e.g. index.html is NOT in sidebar layout usually, 
      // but if we are on About page, index.html is the "Home" icon which is .back-link outside .sidebar-nav usually?
      // Wait, look at HTML: index.html is in sidebar-top as back-link.
      // But user said: "And from About Me page I should also get to Tools & Skills page"
      // So this listener is for .sidebar-nav items which are About, Skills, etc.
      
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
});
