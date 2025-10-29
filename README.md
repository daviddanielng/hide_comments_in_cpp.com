# Hide Comments in learncpp.com

A Chrome extension to hide specific comments on learncpp.com, helping you focus on the comments that are useful and educative.

> **Note**: Currently hides individual comments based on filters. Hiding the entire comment section is coming soon!

## Features

- **Manual Comment Control**: Hide or show comments with one click
- **Smart Filtering**: Configure which comments to hide based on:
  - **Author Name**: Hide all comments from specific users (exact match)
  - **Comment Content**: Hide comments containing specific text
- **Auto-Hide**: Automatically hide configured comments when they load (disabled by default, enable in Configuration tab)
- **Easy Configuration**: User-friendly popup interface to manage your filters

## Installation

### Option 1: From Release (Recommended)

#### Using .crx file (Chrome/Edge)

1. Download the latest `.crx` file from the [Releases](https://github.com/daviddanielng/hide_comments_in_cpp.com/releases) page

2. **You will see an error**: "Package is invalid: CRX_REQUIRED_PROOF_MISSING"

   - This is normal for extensions not from the Chrome Web Store
   - You can safely dismiss this warning - the source code is **open source** and available for review
   - **Workaround**: Download the `.crx` file using a command-line tool instead of your browser:
     ```bash
     wget https://github.com/daviddanielng/hide_comments_in_cpp.com/releases/download/v*/hide_comments_in_cpp.com-v*.crx
     ```
     or
     ```bash
     curl -LO https://github.com/daviddanielng/hide_comments_in_cpp.com/releases/download/v*/hide_comments_in_cpp.com-v*.crx
     ```
   - **Note**: If you still get the error after downloading via command line, close and reopen Chrome before trying again
   - **Alternative**: If you don't want to use the command line, download the `.tar.xz` file or install from source instead (see options below)

3. Open Chrome and navigate to `chrome://extensions/`

4. Enable "Developer mode" in the top right corner

5. Drag and drop the `.crx` file onto the extensions page

6. Click "Add extension" when prompted

7. The extension icon should appear in your browser toolbar

#### Using .tar.xz file

1. Download the latest `.tar.xz` file from the [Releases](https://github.com/daviddanielng/hide_comments_in_cpp.com/releases) page

2. Extract the archive:

   ```bash
   tar -xf hide_comments_in_cpp.com-v*.tar.xz
   ```

3. Open Chrome and navigate to `chrome://extensions/`

4. Enable "Developer mode" in the top right corner

5. Click "Load unpacked" and select the extracted extension directory

6. The extension icon should appear in your browser toolbar

### Option 2: From Source

1. Clone this repository:

   ```bash
   git clone https://github.com/daviddanielng/hide_comments_in_cpp.com.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the extension directory

5. The extension icon should appear in your browser toolbar

## Usage

### Quick Hide/Show

1. Navigate to any page on learncpp.com
2. Click the extension icon
3. Click "Hide Comments" or "Show Comments"

### Configure Filters

1. Click the extension icon
2. Switch to the "Configuration" tab
3. Enable "Remove comments on comment load" for automatic hiding
4. Click "Add" to create a new filter:
   - **Name**: Hides comments from specific authors (exact match)
   - **Comment**: Hides comments containing the specified text
5. Enter the value and click "Save"
6. Edit or delete existing filters as needed

### Auto-Hide Feature

When enabled, the extension will automatically hide comments matching your configured filters as they load on the page, including when you scroll and load more comments.

## File Structure

```
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI structure
├── popup.js              # Popup logic and event handlers
├── content.js            # Content script for hiding comments
├── unhide.js             # Content script for showing comments
├── background.js         # Background service worker
├── icons/                # Extension icons
│   └── icon.png
├── run.sh                # Build/deployment script
└── README.md             # This file
```

## How It Works

1. **Content Scripts**: Run on learncpp.com pages to detect and hide/show comments
2. **Configuration Storage**: Uses Chrome's local storage to save your filter preferences
3. **MutationObserver**: Watches for new comments being loaded and auto-hides them based on your settings
4. **Message Passing**: Communicates between popup and content scripts for real-time feedback

## Permissions

- `activeTab`: Access the current learncpp.com tab
- `scripting`: Inject content scripts to hide/show comments
- `storage`: Save your configuration preferences

## Development

### Prerequisites

- Google Chrome or Chromium-based browser
- Basic knowledge of Chrome Extension APIs

### Making Changes

1. Modify the source files as needed
2. Reload the extension in `chrome://extensions/`
3. Test on learncpp.com

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See [LICENSE](LICENSE) file for details.

## Acknowledgments

Created to improve the reading experience on [learncpp.com](https://www.learncpp.com) by providing a cleaner, less cluttered interface.

Thanks to copilot for writing this README.md file!
