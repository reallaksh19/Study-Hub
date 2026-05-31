# Harshi-App Parent Dashboard Integration Guide

This directory contains the newly implemented Parent Dashboard components, services, utilities, and the updated `server.js` backend designed to support a JSON-based content management approach.

## 1. Backend Integration

The new JSON endpoints have been added to `server.js`. Ensure that the `server.js` file at the root of your application includes these endpoints:
* `POST /api/json`
* `GET /api/json`
* `POST /api/mkdir`
* `POST /api/upload` (Updated to handle SVG sanitization server-side using `dompurify`)

You will also need to ensure you have the required dependencies in your backend environment (if applicable):
```bash
npm install express multer dompurify jsdom
```

## 2. Dependencies

The React frontend components use several new dependencies. Add them to your application:
```bash
npm install @dnd-kit/core @dnd-kit/sortable react-hook-form jszip file-saver dompurify zod remark-parse remark-math unified
```

## 3. Integrating the Utilities & Services

Move the `src/utils`, `src/services`, and `src/content` folders into your application's `src` directory.

## 4. Frontend Components Integration

The new components are located under `src/components/parent` and `src/components/blocks`, etc.

### Registering the Parent Route

In your main application routing (e.g., `src/Grade8_StudyHub_Complete.jsx`), integrate the Parent Auth Gate and Dashboard routes. A placeholder is provided in `src/Grade8_StudyHub_Complete.jsx`.

```jsx
// Example integration in your router:
import { ParentPinLock } from './components/parent/ParentPinLock.jsx';
import { ParentLayout } from './components/parent/ParentLayout.jsx';
import { ParentDashboard } from './components/parent/ParentDashboard.jsx';

// Inside your component logic:
const [parentUnlocked, setParentUnlocked] = useState(
  sessionStorage.getItem('parent_unlocked') === 'true'
);

if (window.location.hash.startsWith('#/parent')) {
  if (!parentUnlocked) {
    return <ParentPinLock onUnlocked={() => setParentUnlocked(true)} />;
  }

  return (
    <ParentLayout>
      <ParentDashboard subjects={data.subjects} topics={data.topics} />
      {/* Configure deeper routes like ParentSubjectView and ParentTopicEditor here */}
    </ParentLayout>
  );
}
```

### Context and Services Integration
Update your `DataContext.jsx` to fetch JSON-based topics using `loadTopicWithPages` from `src/services/jsonContentService.js` in addition to the legacy CSV files.

### Student UI Components
Use the placeholders in `src/components/StudyGuide/RightSidebar.jsx`, `src/components/Dashboard.jsx`, and `src/components/QuizSection/index.jsx` to adapt your existing Student app components to integrate the new `clarifiers`, `SupportMaterialCard`, and AI Assist buttons.
