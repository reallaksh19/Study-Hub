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

      try {
        const response = await fetch('/api/topics');
        if (response.ok) {
           const topicList = await response.json();
           for (const { subject, topic } of topicList) {
               try {
                   const loadedTopic = await loadTopicWithPages(subject, topic);
                   if (loadedTopic) {
                       loadedTopic.source = 'json';
                       // ensure id matches folder
                       if (!loadedTopic.folder) loadedTopic.folder = topic;
                       loadedTopic.subjectFolder = subject;
                       loadedTopics.push(loadedTopic);
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
                 topic.source = 'json';
                 topic.subjectFolder = subjectFolder;
                 if (!topic.folder) topic.folder = topicFolder;
                 loadedTopics.push(topic);
               }
             } catch (e) {
               // Ignore 404s
             }
           }
         }
      }

      setData({
        subjects: demoSubjects,
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
