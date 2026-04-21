# Elbit Careers Auto-Scanner & Filter

A specialized Chrome Extension designed to automate the job search process on the Elbit Systems careers portal. It eliminates the need for manual scrolling and helps identify relevant junior-level positions.

## Features

### 1. Auto-Expanding Batch Loader
The Elbit career site loads jobs in small batches. This extension:
* **Simulated Human Scrolling**: Performs incremental "jumps" to trigger the site's internal observers.
* **Recursive Interaction**: Automatically detects and force-clicks the "Load More" (תוצאות חיפוש נוספות) button until the entire job catalog is visible.
* **Wait Handling**: Manages the initial 5-10 second loading state of the portal before starting the scan.

### 2. Smart Junior Filtering
Focuses your attention on relevant roles by visually de-emphasizing senior positions:
* **Experience Filtering**: Fades out listings requiring 2+ years of experience or senior-level keywords (e.g., Senior, Lead, Principal).
* **Degree Logic**: Flags degree requirements unless the job is explicitly marked as "Junior" or "Student" friendly.
* **Visual Hierarchy**: Non-relevant jobs are set to low opacity and grayscale to keep the UI clean without breaking the React DOM.

### 3. Application Tracking
* **Redundancy Check**: Highlights jobs you have already applied to with a green border and background, preventing double submissions.

## How to Install

1. **Download the files**: Ensure you have `manifest.json`, `content.js`, and `styles.css` in one folder.
2. **Open Chrome Extensions**: Navigate to `chrome://extensions`.
3. **Enable Developer Mode**: Toggle the switch in the top right corner.
4. **Load Unpacked**: Click "Load unpacked" and select the extension folder.

## Technical Details

The extension utilizes a **Recursive Polling & Scroll** mechanism. Unlike standard observers, it simulates real user movement to bypass UI constraints of Material-UI components. It specifically targets `MuiCard-root` elements for processing and `MuiButton-root` for navigation.

## Usage

Simply open the Elbit Systems careers page. The extension will display a blue banner indicating it is active. Sit back while it scrolls and loads all available positions for you.