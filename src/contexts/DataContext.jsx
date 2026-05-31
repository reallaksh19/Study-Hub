import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadTopicWithPages } from '../services/jsonContentService.js';

export const DataContext = createContext({
  subjects: [],
  topics: [],
  loadingState: 'loading'
});

const demoSubjects = [
  { id: 'physics', title: 'Physics', icon: 'FlaskConical', color: '#0ea5e9', order: 1 },
  { id: 'mathematics', title: 'Mathematics', icon: 'Calculator', color: '#8b5cf6', order: 2 },
  { id: 'chemistry', title: 'Chemistry', icon: 'FlaskRound', color: '#ec4899', order: 3 },
  { id: 'biology', title: 'Biology', icon: 'Dna', color: '#10b981', order: 4 },
  { id: 'english', title: 'English', icon: 'BookOpen', color: '#f59e0b', order: 5 }
];

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({ subjects: demoSubjects, topics: [], loadingState: 'loading' });

  useEffect(() => {
    async function loadData() {
      const loadedTopics = [];
      let loadedSubjects = demoSubjects;
      const upsertTopic = (topicData, folderName) => {
        const topicWithMeta = {
          ...topicData,
          source: 'json',
          folder: topicData.folder || folderName
        };
        const existingIndex = loadedTopics.findIndex((existingTopic) => existingTopic.id === topicWithMeta.id);
        if (existingIndex === -1) {
          loadedTopics.push(topicWithMeta);
          return;
        }

        const existingTopic = loadedTopics[existingIndex];
        const existingFolderLength = (existingTopic.folder || '').length;
        const candidateFolderLength = (topicWithMeta.folder || '').length;
        const shouldReplace = candidateFolderLength > 0 && (existingFolderLength === 0 || candidateFolderLength < existingFolderLength);
        if (shouldReplace) {
          loadedTopics[existingIndex] = topicWithMeta;
        }
      };

      try {
        const subjectResponse = await fetch('/api/subjects');
        if (subjectResponse.ok) {
          const subjectData = await subjectResponse.json();
          if (Array.isArray(subjectData) && subjectData.length > 0) {
            const merged = new Map(demoSubjects.map((subject) => [subject.id.toLowerCase(), subject]));
            subjectData.forEach((subject, index) => {
              const id = String(subject.id || '').toLowerCase();
              if (!id) return;
              const base = merged.get(id) || {};
              merged.set(id, {
                ...base,
                ...subject,
                id,
                title: String(base.title || subject.title || id),
                order: Number(subject.order || base.order || index + 1)
              });
            });
            loadedSubjects = Array.from(merged.values()).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
          }
        }

        const response = await fetch('/api/topics');
        if (response.ok) {
           const topicList = await response.json();
           for (const { subject, topic } of topicList) {
               try {
                   const loadedTopic = await loadTopicWithPages(subject, topic);
                   if (loadedTopic) {
                       // Store real disk folder so path resolution works even when
                       // subjectId differs from the actual directory name (e.g. "grade4english" vs "Grade 4 English")
                       loadedTopic._subjectFolder = subject;
                       upsertTopic(loadedTopic, topic);
                    }
               } catch(e) {
                   console.error(`Error loading topic ${topic} in ${subject}`, e);
               }
           }
        }
      } catch (e) {
         console.warn('Backend not available, trying static fallback', e);
         const knownTopics = {
            Physics: ['Gravity', 'optics'],
            physics: ['vectors'],
         };

         for (const [subjectFolder, topicFolders] of Object.entries(knownTopics)) {
           for (const topicFolder of topicFolders) {
             try {
                const topic = await loadTopicWithPages(subjectFolder, topicFolder);
                if (topic) {
                  upsertTopic(topic, topicFolder);
                }
              } catch (e) {
                // Ignore 404s
              }
           }
         }
      }

      setData({
        subjects: loadedSubjects,
        topics: loadedTopics,
        loadingState: 'ready'
      });
    }

    loadData();
  }, []);

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
