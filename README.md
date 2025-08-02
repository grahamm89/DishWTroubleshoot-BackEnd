Dishwasher Troubleshooting Helper
A simple, offline-first web application designed to help technicians and users diagnose common dishwasher problems quickly. The app provides a checklist of essential tests, a symptom-to-solution lookup, and a list of chemical tests.

All application content (symptoms, questions, and tests) is loaded from an external app_data.json file, making it easy to update and customize without changing the application code.

## Repository Overview

This project is an offline-first web application that helps technicians diagnose dishwasher issues. It offers symptom lookup, essential checklists, and chemical test references, with data stored separately for easy updates.

### Core Files

| File | Purpose |
|------|---------|
| `index.html` | Main application containing UI, styling, and logic for loading data, tracking checklist answers, and supporting offline use via a service worker. |
| `app_data.json` | External data source defining symptoms, diagnostic questions, and chemical tests used by the app. |
| `ContentsEditor.html` | Standalone tool that loads and edits `app_data.json` through a form-based interface. |
| `ContentEditorInstructions.txt` | Step-by-step instructions for using the content editor and updating deployment data. |

### Application Logic (`index.html`)

* Local storage wrapper keeps user preferences (e.g., selected symptom, checklist choices) across sessions.
* Data fetching loads `app_data.json`, falling back with UI error messages if unavailable.
* Symptom lookup builds a dropdown from loaded data and displays likely causes and suggested actions for the selected symptom.
* Essential checklist renders questions with Yes/No toggles and remembers responses in local storage.
* Chemical tests section lists reference tests with optional follow-up checks.
* Summary & persistence: event listeners compile advice, copy results to clipboard, and save machine details locally.
* Initialization loads data, builds sections, restores previous state, and starts service-worker registration to enable offline caching of app assets and data.

### Data Structure (`app_data.json`)

* `symptoms`: mapping of symptom names to `causes` and recommended `actions`.
* `questions`: array of checklist items with unique keys and optional notes.
* `chemicalTests`: list of chemical tests, each with a title, description, and optional check instructions.

### Content Editor (`ContentsEditor.html`)

* Provides file upload, form-based editing, and JSON download to update `app_data.json` without manual JSON editing.
* Functions exist to populate forms from existing data, add/remove symptoms/questions/tests, and regenerate the JSON file for download.

Live Demo
You can access the live application here:
https://grahamm89.github.io/DishWTroubleshoot-BackEnd/index.html


Key Features
Symptom Lookup: Select an observed issue from a dropdown to see likely causes and suggested actions.

Essential Checklist: Run through a dynamic checklist of common checks. The app provides instant feedback based on your answers.

Chemical Test Reference: A quick reference guide for common chemical tests used in diagnostics.

Copy Summary: Easily copy a summary of the machine details, checklist answers, and selected symptom to your clipboard.

Offline First: The application works entirely offline after the first visit, making it reliable in the field where internet access may be unavailable.

Easily Updatable: All content is managed in a single app_data.json file. No coding knowledge is required to update the application's data.

Content Editor Tool
To make content updates accessible to everyone, this project includes a standalone Content Editor Tool. This tool provides a user-friendly interface to modify the application's data without needing to understand or edit JSON code directly.

Features of the Editor:

Load Existing Data: Upload your app_data.json file to populate the editor.

Form-Based Editing: Add, edit, and delete symptoms, questions, and chemical tests using simple forms.

Generate New File: Download a perfectly formatted app_data.json file, ready for deployment.

You can find the editor tool in the editor.html file in this repository or here: https://grahamm89.github.io/DishWTroubleshoot-BackEnd/ContentsEditor.html

How to Update Application Content
Updating the live application is a simple, three-step process:

Step 1: Edit the Content

Download the editor.html file from this repository.

Open the file in any web browser.

Click "Choose File" and select your current app_data.json file.

Make any desired changes using the forms.

Click the "Download app_data.json" button to save your updated file.

Step 2: Upload the New File to GitHub

Go to your repository on GitHub.

Click on the app_data.json file.

On the file view page, click the pencil icon (Edit this file).

Delete the old content and paste the new content from the file you just downloaded.

Scroll down and click "Commit changes".

Your changes will be live at your GitHub Pages URL in about a minute.
