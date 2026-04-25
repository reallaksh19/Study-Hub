import React from 'react';
import { slugify } from '../../utils/slugify.js';
import { createDirectory, saveJSON, deleteDirectory } from '../../services/parentApiService.js';

export function ParentSubjectView({ subject, topics }) {
  if (!subject) return <div>Subject not found</div>;

  const handleDeleteSubject = async () => {
    // Step 1 — intent confirmation
    if (!window.confirm(`⚠️ Delete subject "${subject.title}"?\n\nThis will permanently delete ALL topics and pages in this subject. This cannot be undone.`)) return;

    // Step 2 — type the subject name
    const typed = window.prompt(`To confirm, type the subject name exactly:\n\n"${subject.title}"`);
    if (typed !== subject.title) {
      if (typed !== null) alert('Name did not match. Deletion cancelled.');
      return;
    }

    // Step 3 — final irreversible confirmation
    if (!window.confirm(`FINAL WARNING: Permanently delete "${subject.title}" and all its content?\n\nType OK to proceed — there is NO undo.`)) return;

    try {
      await deleteDirectory(subject.id);
      window.location.hash = '#/parent';
      window.location.reload();
    } catch (err) {
      alert('Failed to delete subject: ' + err.message);
    }
  };

  const handleAddTopic = async () => {
    const title = window.prompt("Enter new topic title:");
    if (!title) return;

    const folder = slugify(title);
    const newTopic = {
      id: `${subject.id}-${folder}`,
      subjectId: subject.id,
      title,
      difficulty: 'medium',
      estimatedMinutes: 30,
      pages: []
    };

    try {
      const subjectFolder = subject.id;
      await createDirectory(`${subjectFolder}/${folder}/pages`);
      await createDirectory(`${subjectFolder}/${folder}/assets`);
      await saveJSON(`${subjectFolder}/${folder}/topic.json`, newTopic);
      window.location.hash = `#/parent/subject/${subject.id}/topic/${folder}`;
    } catch (err) {
      alert("Failed to create topic: Backend might be unavailable.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{subject.title} Topics</h1>
        <div className="flex gap-2">
          <button onClick={handleAddTopic} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            + Add Topic
          </button>
          <button onClick={handleDeleteSubject} className="border border-red-300 text-red-600 px-4 py-2 rounded hover:bg-red-50 text-sm">
            🗑 Delete subject
          </button>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm">
        {topics.map(topic => (
          <div key={topic.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50">
            <div>
              <div className="font-bold text-lg">{topic.title}</div>
              <div className="text-sm text-gray-500">
                {topic.pages?.length || 0} pages · {topic.difficulty || 'Medium'}
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`#/parent/subject/${subject.id}/topic/${topic.folder || topic.id.replace(`${subject.id}-`, '')}`} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                Edit
              </a>
              <a href={`#/parent/subject/${subject.id}/topic/${topic.folder || topic.id.replace(`${subject.id}-`, '')}/worksheet`} className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-sm font-medium">
                📋 Worksheet
              </a>
            </div>
          </div>
        ))}
        {topics.length === 0 && <div className="p-8 text-center text-gray-500">No topics yet.</div>}
      </div>
    </div>
  );
}
