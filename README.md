# Gift Code Redemption App

## Overview

This Electron app automates the process of redeeming gift codes using Puppeteer to interact with a web interface. It supports different platforms and can be customized for different use cases.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **npm or pnpm**: Node package managers. [Install pnpm](https://pnpm.io/) if you prefer it over npm.
- **Google Chrome or Chromium**: Ensure you have one of these browsers installed on your system.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/samir1498/wos
   cd wos
   ```

2. **Install Dependencies**:
   ```sh
   pnpm install
   ```

## Configuration

### Platform-Specific Configuration

The application detects the path to Chrome or Chromium based on your operating system:

- **macOS**: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` or `/Applications/Chromium.app/Contents/MacOS/Chromium`
- **Windows**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Linux**: `/usr/bin/google-chrome` or `/usr/bin/chromium-browser`

If you have Chrome or Chromium installed in a different location, you can modify the `determineChromePath` function in `src/main.js`.

## Usage

1. **Start the Application**:

   ```bash
   pnpm start
   ```

2. **Interact with the App**:
   - Open the application.
   - Enter the Player IDs (comma-separated) and the Gift Code in the form.
   - Click the "Redeem Gift Code" button.
   - Check the log and progress bar for updates on the redemption process.

## Code Structure

- **`src/main.js`**: Main process script for Electron, handles Chrome path detection and Puppeteer automation.
- **`src/renderer.js`**: Renderer process script for interacting with the UI, manages form submission and updates the progress bar and logs.
- **`src/preload.js`**: Preload script exposing safe APIs to the renderer process.
- **`public/index.html`**: HTML file for the user interface.

## Contributing

Feel free to submit issues or pull requests to improve the application. For significant changes, please open an issue first to discuss what you would like to change.
