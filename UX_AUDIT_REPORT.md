# UX Audit Report: Parent Authoring Workflow

## Overview
I assumed the role of a parent and walked through the process of creating a brand-new Physics chapter on "Vectors" from scratch using the newly integrated authoring tools, tabbed editor, and rich component support. The goal was to make a difficult concept simple for a child to understand, using video embeds, LaTeX math blocks, clear callouts, and interactive practice.

## Step-by-Step Experience

### 1. Subject & Topic Creation
* **Action**: I created a new folder structure (`public/physics/vectors/`) and generated the `topic.json` file.
* **Observation (Pro)**: The dynamic folder detection instantly picked up the `vectors` topic alongside `Gravity` and `Optics`. The data modeling is very robust and forgiving—no need to restart the application or alter `DataContext.jsx`.
* **Friction Point**: The parent dashboard currently relies heavily on manual file creation via the backend or zip-import. If a non-technical parent wants to create a new subject entirely from the UI, the flow is somewhat opaque unless they click "Add Subject".

### 2. Tabbed Editor (Lesson, Help Notes, Practice, Resources)
* **Action**: Authored 3 pages (Intro, Addition, Resolving Vectors) utilizing the 4-tab interface.
* **Observation (Pro)**: The segregation is fantastic. Being able to write the lesson in the **Lesson tab**, then immediately click the **Help notes** tab to jot down common mistakes ("Speed vs. Velocity") without losing context makes authoring feel cohesive.
* **Observation (Pro)**: The **Resources** tab cleanly attaches external interactive simulations (like PhET) or YouTube video embeds directly to the page.

### 3. Rich Block Authoring (Video, KaTeX, SVGs)
* **Action**: Embedded a Khan Academy YouTube link via the `video_embed` block, and wrote resolving vector equations like $A_x = A \cos \theta$ using the `equation` block.
* **Observation (Pro)**: The new `video_embed` component successfully parses standard YouTube URLs and strips out the necessary ID for seamless inline iframe viewing.
* **Friction Point**: Writing raw LaTeX can be intimidating for parents. While `\cos \theta` is simple enough, creating large fractions or matrices might require an external WYSIWYG LaTeX editor.
* **Friction Point**: The block reordering tool using `dnd-kit` is powerful, but adding new blocks defaults them to the bottom, requiring long drag-and-drops for large pages.

### 4. Practice Authoring & Student View
* **Action**: Built multiple MCQs, Numeric, and "Concept Strengthener" queries linked directly to Clarifiers and Support Blocks.
* **Observation (Pro)**: Linking a wrong answer to a specific Support Block (e.g., the 3-4-5 Triangle worked solution) provides a highly personalized learning loop for the child. 
* **Observation (Pro)**: The student side now accurately surfaces attached resources at the bottom under "Helpful resources", meaning parents can dump reference PDFs or worksheets without breaking the lesson flow.

## Conclusion
The workflow is highly capable and functionally complete. The tabbed page editor and robust JSON schema allow for extremely dense, rich, and interactive educational content. The only remaining barriers are purely cosmetic/UX related (e.g., a rich-text toolbar for LaTeX or a more drag-and-drop friendly interface for creating folders). The application successfully fulfills its purpose as a highly customizable Study Hub.
