# CSP Inspector & Modifier

A Chrome extension that tests and modifies Content Security Policy (CSP) headers for web application testing and development purposes.

## Overview

This extension helps developers and security testers inspect and modify Content Security Policy headers on web pages. It provides real-time visual feedback about the CSP status of a page and can remove or modify CSP headers to facilitate testing.

## Features

- **CSP Header Removal**: Automatically removes Content Security Policy headers from responses for specified domains
- **Visual CSP Status Indicator**: Displays an overlay with detailed CSP test results
- **Multiple CSP Tests**: Tests inline scripts, eval execution, and data URI loading capabilities
- **Console Reporting**: Provides detailed CSP test results in the browser console

## How It Works

The extension uses Chrome's Declarative Net Request API to modify HTTP response headers, specifically removing:
- `content-security-policy`
- `content-security-policy-report-only`
- `cache-control`

It then injects a content script that tests various aspects of CSP enforcement and displays the results.

## Target Application

Currently configured to work with:
- https://teams.live.com/*

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension will be installed and active for the configured domains

## Usage

1. Navigate to a page where you want to test/modify CSP headers (e.g., teams.live.com)
2. The extension will automatically:
   - Remove CSP headers from the response
   - Run tests to verify if CSP enforcement has been disabled
   - Display a visual overlay with test results
   - Log detailed information to the browser console

## Components

- **manifest.json**: Extension configuration
- **rules_1.json**: Declarative Net Request rules for header modification
- **content.js**: Content script that loads and initializes CSP testing
- **csp-test-manual.js**: Script containing CSP testing logic and visual reporting

## Customization

To target different domains:
1. Modify the `host_permissions` and `matches` arrays in `manifest.json`
2. Update the URL conditions in `rules_1.json`
3. Reload the extension

## Security Notice

This extension is intended for **development and testing purposes only**. Disabling Content Security Policy in production environments can expose users to security vulnerabilities like XSS attacks.

## License

[MIT License](LICENSE)
