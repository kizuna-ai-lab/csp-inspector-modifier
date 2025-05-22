// CSP Test Script using Web Accessible Resources approach
console.log("%cCSP Tester Extension: Starting test", "color: blue; font-weight: bold");

/**
 * This script attempts to load an external script from the extension's
 * web accessible resources. If the script loads successfully, it means
 * the CSP has been modified/removed. If it fails to load, CSP is still active.
 */

// Create a flag to track load status
let scriptLoaded = false;

// Function to show the test results on the page
function showResults(success, error = null) {
  console.log(`%cCSP Test ${success ? 'PASSED ✅' : 'FAILED ❌'}: ${success ? 'Script loaded successfully' : 'Script blocked by CSP'}`,
    `color: ${success ? 'green' : 'red'}; font-weight: bold`);
  
  if (error) {
    console.error('CSP Test Error:', error);
  }
  
  // Create visual indicator if the test failed (the successful test creates its own indicator)
  if (!success) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.zIndex = '2147483647';
    overlay.style.background = 'rgba(0, 0, 0, 0.85)';
    overlay.style.padding = '15px';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'Arial, sans-serif';
    overlay.style.fontSize = '14px';
    overlay.style.borderRadius = '5px';
    overlay.style.maxWidth = '300px';
    overlay.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    overlay.style.lineHeight = '1.5';
    
    let resultHTML = `
      <div style="text-align: center; margin-bottom: 10px; font-weight: bold; font-size: 16px; padding-bottom: 5px; border-bottom: 1px solid #555;">
        CSP Header Test Results
      </div>
      <div style="margin: 10px 0;">
        <div><span style="color: #F44336">●</span> External Script: <span style="color: #F44336">BLOCKED</span></div>
      </div>
      <div style="margin-top: 10px; padding-top: 5px; border-top: 1px solid #555; font-weight: bold; color: #F44336;">
        Conclusion: CSP appears to be ACTIVE
      </div>
      <div style="font-size: 10px; margin-top: 10px; color: #AAA;">
        Chrome Extension CSP Test
      </div>
    `;
    
    overlay.innerHTML = resultHTML;
    
    // Add close button
    const closeBtn = document.createElement('div');
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '8px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = '#AAA';
    closeBtn.textContent = '×';
    closeBtn.onclick = function() { overlay.remove(); };
    overlay.appendChild(closeBtn);
    
    document.body.appendChild(overlay);
  }
}

// Try to load the test script from extension's web accessible resources
function loadTestScript() {
  try {
    // Get the URL to the test script
    const scriptURL = chrome.runtime.getURL('csp-test-manual.js');
    console.log('%cAttempting to load script from:', 'color: blue', scriptURL);
    
    // Create a script element to load the test script
    const script = document.createElement('script');
    script.src = scriptURL;
    
    // Set up success and failure handlers
    script.onload = () => {
      scriptLoaded = true;
      console.log('%cScript loaded successfully!', 'color: green; font-weight: bold');
      // We don't need to call showResults here as the loaded script will show its own results
    };
    
    script.onerror = (error) => {
      console.error('%cScript failed to load:', 'color: red', error);
      showResults(false, 'Script load error - CSP likely blocked it');
    };
    
    // Add the script to the page
    document.head.appendChild(script);
    
    // Set a timeout to check if the script loaded
    setTimeout(() => {
      if (!scriptLoaded && !window.CSP_TEST_PASSED) {
        showResults(false, 'Script load timeout - CSP likely blocked it');
      }
    }, 2000);
    
  } catch (e) {
    console.error('Error setting up test script:', e);
    showResults(false, e);
  }
}

// Wait for the page to be ready before running the test
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadTestScript, 500);
  });
} else {
  // Page already loaded
  setTimeout(loadTestScript, 500);
}