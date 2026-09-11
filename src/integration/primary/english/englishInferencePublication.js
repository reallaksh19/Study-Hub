import {
  englishInferenceDelayedRetrievalTask,
  englishInferenceQrLaunch,
  englishInferenceReturnTask,
} from './englishInferenceJourney.js';
import {
  englishInferenceQuestions,
  englishInferenceReturnQuestionId,
} from './englishInferenceContent.js';

export const ENGLISH_KANI_APP_BASE_URL = 'https://reallaksh19.github.io/Kani-Game-App/';
export const ENGLISH_RETURN_LEARNER_PATH = '/primary/english/inference-return.html';
export const ENGLISH_QR_ASSET_PATH = '/primary/english/P4EI7Q2K-qr.svg';

export const englishInferenceKaniLaunchUrl = `${ENGLISH_KANI_APP_BASE_URL}#/primary/m/${englishInferenceQrLaunch.opaqueId}`;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function buildEnglishInferenceReturnPageHtml() {
  const returnQuestion = englishInferenceQuestions.find((question) => question.id === englishInferenceReturnQuestionId);
  if (!returnQuestion) throw new Error('English inference return question is missing from canonical content');

  const expectedMission = escapeHtml(englishInferenceQrLaunch.opaqueId);
  const prompt = escapeHtml(returnQuestion.prompt);
  const activityId = escapeHtml(englishInferenceReturnTask.activityId);
  const questionId = escapeHtml(englishInferenceReturnTask.questionId);
  const earliestDays = Number(englishInferenceDelayedRetrievalTask.earliestDays);
  const latestDays = Number(englishInferenceDelayedRetrievalTask.latestDays);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Back to reading · Inference Investigator</title>
  <style>
    :root { font-family: ui-rounded, "Nunito", system-ui, sans-serif; color: #18324a; background: #f4f9ff; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: linear-gradient(180deg, #f8fcff 0%, #eef4ff 52%, #f7f0ff 100%); }
    main { width: min(780px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 48px; }
    .card { background: rgba(255,255,255,.97); border: 2px solid #d8e7ff; border-radius: 28px; padding: clamp(20px, 4vw, 34px); box-shadow: 0 18px 55px rgba(39,74,120,.13); }
    .eyebrow { color: #6c55d8; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; font-size: .78rem; }
    h1 { margin: 8px 0 8px; font-size: clamp(2rem, 7vw, 3rem); line-height: 1.05; }
    .lead { color: #53677d; font-size: 1.05rem; line-height: 1.55; }
    .formula { margin: 18px 0; padding: 14px 18px; border-radius: 18px; background: #eef9f5; border: 2px solid #b7e4d3; font-weight: 900; text-align: center; }
    .task { margin: 24px 0; padding: 22px; border-radius: 22px; background: #fff7cc; border: 2px solid #f4c85d; }
    .task h2 { margin: 0 0 10px; font-size: 1rem; color: #9b6511; text-transform: uppercase; letter-spacing: .08em; }
    .prompt { font-size: clamp(1.16rem, 4vw, 1.48rem); line-height: 1.5; font-weight: 850; }
    .mode { display: flex; gap: 14px; flex-wrap: wrap; margin: 14px 0 22px; }
    .mode label { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border: 2px solid #cadcf2; border-radius: 999px; background: #fff; font-weight: 800; }
    .field { margin: 18px 0; }
    .field label { display: block; font-weight: 900; margin-bottom: 7px; }
    .cue { display: block; color: #66788d; font-size: .92rem; margin-top: 4px; font-weight: 600; }
    textarea { width: 100%; min-height: 92px; resize: vertical; border: 2px solid #9fc8ef; border-radius: 18px; padding: 14px; font: inherit; font-size: 1rem; background: #fff; }
    textarea:focus { outline: 4px solid rgba(79,140,255,.2); border-color: #4f8cff; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
    button, a.button { border: 0; border-radius: 999px; padding: 13px 20px; font: inherit; font-weight: 900; cursor: pointer; text-decoration: none; }
    button { background: #35b7a7; color: #062f2a; }
    a.button { background: #765eea; color: #fff; }
    .later { margin-top: 20px; border-radius: 20px; padding: 16px 18px; background: #e9f9f4; border: 2px solid #a4e1cf; }
    .later strong { color: #167765; }
    .done { display: none; margin-top: 18px; padding: 18px; border-radius: 18px; background: #e8f8ed; border: 2px solid #9bd5aa; }
    .error { display: none; color: #9c2d2d; background: #ffe9e9; border: 2px solid #f4aaaa; padding: 16px; border-radius: 18px; }
    .meta { margin-top: 22px; color: #718095; font-size: .78rem; }
  </style>
</head>
<body>
  <main>
    <section class="card" aria-labelledby="page-title">
      <div class="eyebrow">Study-Hub · Independent return</div>
      <h1 id="page-title">Inference Investigator 🔎</h1>
      <p class="lead">The game gave you quick clue practice. Now show the reading idea without the game.</p>
      <div class="formula">INFERENCE = ANSWER + TEXT CLUE + CONNECTION</div>
      <div id="mission-error" class="error">This return link does not match the English inference mission. Go back to Study-Hub and open the activity again.</div>
      <div id="return-content">
        <div class="task">
          <h2>Your independent reading task</h2>
          <div class="prompt">${prompt}</div>
        </div>

        <strong>How will you respond?</strong>
        <div class="mode" role="radiogroup" aria-label="Response mode">
          <label><input type="radio" name="mode" value="WRITTEN" checked /> Write it</label>
          <label><input type="radio" name="mode" value="ORAL" /> Say it first</label>
        </div>

        <div class="field">
          <label for="answer">1. My answer</label>
          <textarea id="answer" autocomplete="off" placeholder="I think..."></textarea>
        </div>
        <div class="field">
          <label for="clue">2. My text clue <span class="cue">Use words from the text that helped you.</span></label>
          <textarea id="clue" autocomplete="off" placeholder="The clue is..."></textarea>
        </div>
        <div class="field">
          <label for="connection">3. My connection <span class="cue">Explain how the clue supports your answer.</span></label>
          <textarea id="connection" autocomplete="off" placeholder="This clue supports my answer because..."></textarea>
        </div>

        <div class="actions">
          <button id="finish" type="button">I finished all 3 parts ✓</button>
          <a class="button" href="../../">Back to Study-Hub</a>
        </div>
        <div id="done" class="done" role="status">
          <strong>Return task complete.</strong><br />You gave an answer, a text clue and the connection. Keep this work for the teacher/runtime check.
        </div>
        <div class="later">
          <strong>Later retrieval:</strong> a fresh inference check belongs ${earliestDays}–${latestDays} days later. Its status stays <code>NOT_YET_TESTED</code> until that later check happens.
        </div>
        <div class="meta">Activity ${activityId} · Question ${questionId} · Completing this page is not a mastery claim.</div>
      </div>
    </section>
  </main>
  <script>
    (() => {
      const params = new URLSearchParams(location.search);
      const mission = (params.get('mission') || '').toUpperCase();
      const expected = '${expectedMission}';
      const content = document.getElementById('return-content');
      const error = document.getElementById('mission-error');
      if (mission !== expected) {
        content.style.display = 'none';
        error.style.display = 'block';
        return;
      }

      const fields = ['answer', 'clue', 'connection'].map((id) => document.getElementById(id));
      document.getElementById('finish').addEventListener('click', () => {
        const missing = fields.find((field) => !field.value.trim());
        if (missing) {
          missing.focus();
          return;
        }
        document.getElementById('done').style.display = 'block';
        document.getElementById('finish').disabled = true;
        fields.forEach((field) => { field.readOnly = true; });
        document.querySelectorAll('input[name="mode"]').forEach((radio) => { radio.disabled = true; });
      });
    })();
  </script>
</body>
</html>`;
}
