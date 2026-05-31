# Final Consolidated Study Hub – Integration and Patch Guide

## Overview

This directory contains a **consolidated build** of the personal study hub application, starting from the original zip provided by the user.  It incorporates all of the fixes and improvements discussed throughout our iterations into a single coherent package.  These changes improve the stability of the app, make it safe to run as a purely static site or with the included backend server, and lay the groundwork for a richer authoring experience.

The goal of this consolidated build is to provide a clean starting point that a novice parent or student can use without worrying about merging multiple patches.  All code changes have been folded back into the base application and are described below so you can see exactly what has been addressed.

## Key Fixes and Improvements

### 1. Data provider wrapper

The React application is now wrapped with a `DataProvider` (see `src/index.jsx`).  This context lazily loads topics from the server’s `/api/topics` endpoint and provides the resulting subjects and topics to the rest of the app.  Without this wrapper the student and parent pages could not access the loaded content.

### 2. Dynamic topic discovery

The backend (`server.js`) has been extended with an `/api/topics` endpoint.  When queried, it scans the `public/` directory for subject/topic folders that contain a `topic.json` file.  This makes the app agnostic to the number of topics stored on disk and eliminates the need to hard‑code topic names in the frontend.  If the server is unavailable, the data context falls back to a small set of built‑in topics.

### 3. Student/parent route separation

`src/Grade8_StudyHub_Complete.jsx` provides two major route trees:

* **Parent mode** under `#/parent` – protected by a simple PIN lock and organised by subject and topic.  Parents can use this area to manage topic metadata, edit pages, add questions, clarifiers and attachments, and preview the lesson as a student.
* **Student mode** under `#/student` and `#/topic/…` – gives the learner a read‑only view of the content.  The student dashboard lists subjects and topics, while the `StudyGuide` component renders individual pages and supports progress tracking (marking pages as read and saving the set of read pages in `localStorage`).

### 4. Safe file operations

`server.js` includes helper functions (`getSafePath`) that prevent directory traversal.  Uploads are sanitised when SVG files are detected using `dompurify`.  There are endpoints for saving JSON, listing topics, creating folders and uploading assets.  All paths are resolved relative to the `public` directory to keep user content separate from application code.

### 5. Structured page model

Pages are stored as individual JSON files under `public/<Subject>/<Topic>/pages/`.  Each page describes its own:

* **Blocks** – content elements like headings, paragraphs, equations, images, callouts, etc.
* **Clarifiers** – helper notes such as key facts, common mistakes or tips.
* **Questions** – practice material attached directly to the page (multiple choice, numeric, short answer, etc.).
* **Attachments** – optional resources such as PDFs and images that appear in a separate section for students.

The data context hydrates these files and exposes them as `_fullPages` on the loaded topic object, ready for the `StudyGuide` to render.

### 6. Default sample content

This consolidated build includes sample topics under `public/Physics/Gravity` and `public/Physics/optics`.  They demonstrate how to use headings, paragraphs, equations, images, clarifiers and questions.  They are meant to serve as examples for creating your own topics.

## Building and running the app

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the backend API (required for file uploads and dynamic topic listing):

   ```bash
   node server.js
   ```

   The API will run on `http://localhost:3001`.  Feel free to change the port number in `server.js`.

3. In a separate terminal, launch the development server:

   ```bash
   npm run dev
   ```

   Vite will start a development server on `http://localhost:5173` by default.  Visit this URL in your browser.

4. To create a production build:

   ```bash
   npm run build
   ```

   The static assets will be emitted into the `dist/` folder.  You can serve these files via any static file server as long as your backend API runs at the same time (or you export the content as a static site via your own means).

## How to import a chapter pack

The app supports importing a chapter pack (like the provided Optics sample pack) through the parent dashboard.  A chapter pack is a zip file containing a `topic.json` alongside its `pages/`, `questions/` and `assets/` subfolders.  To import:

1. Unlock Parent Mode using the PIN.
2. Click **Add Topic** and choose **Import Pack**.
3. Select the `.zip` file.  The app will unzip it under `public/<Subject>/<Topic>` and add it to your topics list.
4. Once imported, you can edit the pages, clarifiers and questions, or export the topic back to a new `.zip` file.

## Summary

This integration guide explains the purpose of each major change folded into the consolidated app.  It also outlines how to build and serve the app, and how to import chapter packs created offline.  The consolidated codebase should serve as a solid foundation for adding richer authoring features, an asset library with usage tracking, and more sophisticated versioning in future iterations.