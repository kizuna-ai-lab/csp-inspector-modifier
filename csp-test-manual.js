// Self-executing function to avoid polluting global namespace
(function() {
  console.log("CSP Header Verification Test Running...");
  
  // Test if inline scripts are allowed (indicating CSP is removed or modified)
  function testCSPInlineScript() {
    try {
      const script = document.createElement('script');
      script.textContent = 'window.cspTestPassed = true;';
      document.head.appendChild(script);
      
      return window.cspTestPassed === true;
    } catch (e) {
      console.error("Error executing test script:", e);
      return false;
    }
  }
  
  // Test if eval is allowed (usually blocked by CSP)
  function testCSPEval() {
    try {
      eval('window.evalTestPassed = true;');
      return window.evalTestPassed === true;
    } catch (e) {
      console.error("Error executing eval:", e);
      return false;
    }
  }
  
  // Global variable to track Data URI test status
  window.dataURITestResult = 'UNKNOWN';
  
  // Test if loading resources from data: URI is allowed (usually blocked by CSP)
  // This returns a promise that resolves when the test completes
  function testCSPDataURI() {
    try {
      // Create an image with a data URI - this is often blocked by CSP
      const img = document.createElement('img');
      img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg==';
      img.style.display = 'none';
      
      // If the image has already loaded synchronously (rare but possible)
      if (img.complete && img.naturalWidth > 0) {
        console.log('Data URI image loaded immediately - CSP allows data: URIs');
        window.dataURITestResult = true;
        return true;
      }
      
      // Set up event listeners to detect when the image loads or fails
      img.onload = function() {
        console.log('Data URI image loaded successfully - CSP allows data: URIs');
        window.dataURITestResult = true;
        
        // Update the UI with the new result
        updateUIWithDataURIResult(true);
      };
      
      img.onerror = function() {
        console.log('Data URI image failed to load - CSP likely blocks data: URIs');
        window.dataURITestResult = false;
        
        // Update the UI with the new result
        updateUIWithDataURIResult(false);
      };
      
      document.body.appendChild(img);
      
      // Initially return 'UNKNOWN' status
      return 'UNKNOWN';
    } catch (e) {
      console.error("Error with data URI test:", e);
      window.dataURITestResult = false;
      return false;
    }
  }
  
  // Function to update the UI when data URI test completes
  function updateUIWithDataURIResult(result) {
    // Get the overlay container
    const overlay = document.getElementById('csp-test-overlay');
    if (!overlay) return;
    
    // Find the data URI result element
    const dataURIElement = overlay.querySelector('[data-test="datauri"]');
    if (!dataURIElement) return;
    
    // Update the result
    const dotSpan = dataURIElement.querySelector('span:first-child');
    const resultSpan = dataURIElement.querySelector('span:last-child');
    
    const color = result ? '#4CAF50' : '#F44336';
    if (dotSpan) dotSpan.style.color = color;
    if (resultSpan) {
      resultSpan.style.color = color;
      resultSpan.textContent = result ? 'ALLOWED' : 'BLOCKED';
    }
    
    // Recalculate overall result
    const inlineAllowed = overlay.querySelector('[data-test="inline"] span:last-child').textContent === 'ALLOWED';
    const evalAllowed = overlay.querySelector('[data-test="eval"] span:last-child').textContent === 'ALLOWED';
    const overallResult = inlineAllowed || evalAllowed || result;
    
    // Update conclusion using DOM API
    const conclusion = overlay.querySelector('[data-test="conclusion"]');
    if (conclusion) {
      conclusion.style.color = overallResult ? '#4CAF50' : '#F44336';
      
      // Clear existing content
      while (conclusion.firstChild) {
        conclusion.removeChild(conclusion.firstChild);
      }
      
      // Add new content using text nodes
      const conclusionText = document.createTextNode('CSP appears to be ' + 
        (overallResult ? 'REMOVED/MODIFIED ' : 'ACTIVE '));
      conclusion.appendChild(conclusionText);
      
      // Add emoji as text node
      const emoji = document.createTextNode(overallResult ? '✅' : '❌');
      conclusion.appendChild(emoji);
    }
  }
  
  // Test all CSP aspects
  const inlineScriptResult = testCSPInlineScript();
  const evalResult = testCSPEval();
  const dataURIResult = testCSPDataURI();
  
  // Create formatted output
  console.log("%c===== CSP Header Test Results =====", "font-weight: bold; font-size: 14px; color: blue;");
  console.log("%cInline Scripts: %c" + (inlineScriptResult ? "✅ ALLOWED (CSP removed/modified)" : "❌ BLOCKED (CSP active)"), 
    "font-weight: bold", inlineScriptResult ? "color: green; font-weight: bold" : "color: red; font-weight: bold");
  console.log("%cEval Function: %c" + (evalResult ? "✅ ALLOWED (CSP removed/modified)" : "❌ BLOCKED (CSP active)"), 
    "font-weight: bold", evalResult ? "color: green; font-weight: bold" : "color: red; font-weight: bold");
  console.log("%cData URI in iframe: %c" + (dataURIResult ? "✅ ALLOWED (CSP removed/modified)" : "❌ BLOCKED (CSP active)"), 
    "font-weight: bold", dataURIResult ? "color: green; font-weight: bold" : "color: red; font-weight: bold");
  
  // Overall result
  const overallResult = inlineScriptResult || evalResult || dataURIResult;
  console.log("%c===== CONCLUSION =====", "font-weight: bold; font-size: 14px; color: blue;");
  console.log("%c" + (overallResult ? 
    "CSP appears to be REMOVED or MODIFIED! At least one test passed." : 
    "CSP appears to be ACTIVE! All tests failed."), 
    overallResult ? "color: green; font-weight: bold; font-size: 14px;" : "color: red; font-weight: bold; font-size: 14px;");
  
  // Display the actual CSP header value if available
  const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspHeader) {
    console.log("%cCSP Meta Tag Found:", "font-weight: bold");
    console.log(cspHeader.content);
  } else {
    console.log("%cNo CSP Meta Tag Found in HTML", "font-style: italic");
    console.log("Note: CSP may still be enforced via HTTP header");
  }
  
  // Create visual overlay with test results
  function createVisualOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'csp-test-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.zIndex = '2147483647'; // Maximum z-index
    overlay.style.background = 'rgba(0, 0, 0, 0.85)';
    overlay.style.padding = '15px';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'Arial, sans-serif';
    overlay.style.fontSize = '14px';
    overlay.style.borderRadius = '5px';
    overlay.style.maxWidth = '320px';
    overlay.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    overlay.style.lineHeight = '1.5';
    
    // Create all elements using DOM API instead of innerHTML to avoid Trusted Types issues
    
    // Create header
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '10px';
    header.style.fontWeight = 'bold';
    header.style.fontSize = '16px';
    header.style.paddingBottom = '5px';
    header.style.borderBottom = '1px solid #555';
    header.textContent = 'CSP Header Test Results';
    overlay.appendChild(header);
    
    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.style.margin = '10px 0';
    overlay.appendChild(resultsContainer);
    
    // Function to create a test result row
    function createTestRow(container, testName, testResult, label, isUnknown = false) {
      const row = document.createElement('div');
      row.setAttribute('data-test', testName);
      
      const dot = document.createElement('span');
      dot.textContent = '●'; // Bullet point
      
      // Set color based on test result
      let color;
      if (isUnknown) {
        color = '#FFC107'; // Yellow for unknown
      } else {
        color = testResult ? '#4CAF50' : '#F44336'; // Green for pass, red for fail
      }
      dot.style.color = color;
      
      row.appendChild(dot);
      row.appendChild(document.createTextNode(' ' + label + ': '));
      
      const resultText = document.createElement('span');
      resultText.style.color = color;
      resultText.style.fontWeight = 'bold';
      
      if (isUnknown) {
        resultText.textContent = 'CHECKING...';
      } else {
        resultText.textContent = testResult ? 'ALLOWED' : 'BLOCKED';
      }
      
      row.appendChild(resultText);
      container.appendChild(row);
    }
    
    // Add test results
    createTestRow(resultsContainer, 'inline', inlineScriptResult, 'Inline Scripts');
    createTestRow(resultsContainer, 'eval', evalResult, 'Eval Function');
    createTestRow(resultsContainer, 'datauri', dataURIResult, 'Data URI', dataURIResult === 'UNKNOWN');
    
    // Create conclusion
    const conclusion = document.createElement('div');
    conclusion.setAttribute('data-test', 'conclusion');
    conclusion.style.marginTop = '10px';
    conclusion.style.paddingTop = '8px';
    conclusion.style.borderTop = '1px solid #555';
    conclusion.style.fontWeight = 'bold';
    conclusion.style.textAlign = 'center';
    conclusion.style.color = overallResult ? '#4CAF50' : '#F44336';
    
    const conclusionText = document.createTextNode('CSP appears to be ' + 
      (overallResult ? 'REMOVED/MODIFIED ' : 'ACTIVE '));
    conclusion.appendChild(conclusionText);
    
    // Add emoji as text node to avoid HTML parsing
    const emoji = document.createTextNode(overallResult ? '✅' : '❌');
    conclusion.appendChild(emoji);
    
    overlay.appendChild(conclusion);
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.fontSize = '10px';
    footer.style.marginTop = '10px';
    footer.style.color = '#AAA';
    footer.style.textAlign = 'center';
    footer.textContent = 'CSP Test Loaded Successfully';
    overlay.appendChild(footer);
    
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
    return overlay;
  }
  
  // Show visual overlay automatically when script loads
  const overlay = createVisualOverlay();
  
  // Set flag to indicate test script loaded successfully (used by content.js)
  window.CSP_TEST_PASSED = true;
  
  // For easy removal of overlay from console if needed
  window.removeCSPTestOverlay = function() {
    const overlay = document.querySelector('div[style*="CSP Header Check Results"]');
    if (overlay) overlay.remove();
    console.log("CSP test overlay removed");
  };
  
  // Return the result object for further use in console
  return {
    inlineScript: inlineScriptResult,
    eval: evalResult,
    dataURI: dataURIResult,
    isCSPRemoved: overallResult,
    showOverlay: createVisualOverlay,
    removeOverlay: window.removeCSPTestOverlay
  };
})();
