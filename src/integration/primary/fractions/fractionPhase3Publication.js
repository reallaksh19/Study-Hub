import {
  fractionDelayedRetrievalTask,
  fractionQrLaunch,
  fractionReturnTask,
} from './fractionEquivalenceJourney.js';
import {
  fractionEquivalenceQuestions,
  fractionReturnQuestionId,
} from './fractionEquivalenceContent.js';

export const FRACTION_KANI_APP_BASE_URL = 'https://reallaksh19.github.io/Kani-Game-App/';
export const FRACTION_RETURN_LEARNER_PATH = '/primary/return.html';
export const FRACTION_QR_ASSET_PATH = '/primary/fractions/P4FE7K2Q-qr.svg';

export const fractionKaniLaunchUrl = `${FRACTION_KANI_APP_BASE_URL}#/primary/m/${fractionQrLaunch.opaqueId}`;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function buildFractionReturnPageHtml() {
  const returnQuestion = fractionEquivalenceQuestions.find((question) => question.id === fractionReturnQuestionId);
  if (!returnQuestion) throw new Error('Fraction return question is missing from canonical content');

  const expectedMission = escapeHtml(fractionQrLaunch.opaqueId);
  const prompt = escapeHtml(returnQuestion.prompt);
  const activityId = escapeHtml(fractionReturnTask.activityId);
  const questionId = escapeHtml(fractionReturnTask.questionId);
  const earliestDays = Number(fractionDelayedRetrievalTask.earliestDays);
  const latestDays = Number(fractionDelayedRetrievalTask.latestDays);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Back to learning · Equivalent fractions</title>
  <style>
    :root { font-family: ui-rounded, "Nunito", system-ui, sans-serif; color: #17324d; background: #eef7ff; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at top, #ffffff 0, #eef7ff 45%, #e9e6ff 100%); }
    main { width: min(760px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 48px; }
    .card { background: rgba(255,255,255,.96); border: 2px solid #cde7ff; border-radius: 28px; padding: clamp(20px, 4vw, 34px); box-shadow: 0 18px 55px rgba(39,74,120,.13); }
    .eyebrow { color: #6d56d9; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; font-size: .78rem; }
    h1 { margin: 8px 0 8px; font-size: clamp(2rem, 7vw, 3.3rem); line-height: 1; }
    .lead { color: #53677d; font-size: 1.05rem; line-height: 1.55; }
    .task { margin: 24px 0; padding: 22px; border-radius: 22px; background: #fff7cc; border: 2px solid #f4c85d; }
    .task h2 { margin: 0 0 10px; font-size: 1rem; color: #9b6511; text-transform: uppercase; letter-spacing: .08em; }
    .prompt { font-size: clamp(1.25rem, 4vw, 1.65rem); line-height: 1.45; font-weight: 850; }
    textarea { width: 100%; min-height: 150px; resize: vertical; border: 2px solid #9fc8ef; border-radius: 18px; padding: 16px; font: inherit; font-size: 1.05rem; background: #fff; }
    textarea:focus { outline: 4px solid rgba(79,140,255,.2); border-color: #4f8cff; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
    button, a.button { border: 0; border-radius: 999px; padding: 13px 20px; font: inherit; font-weight: 900; cursor: pointer; text-decoration: none; }
    button { background: #36b5a8; color: #072d2a; }
    a.button { background: #765eea; color: white; }
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
      <h1 id="page-title">Back from the game 🚀</h1>
      <p class="lead">Now prove the fraction idea without the game. This is a fresh question, so take your time and explain your thinking.</p>
      <div id="mission-error" class="error">This return link does not match the fraction mission. Go back to Study-Hub and open the activity again.</div>
      <div id="return-content">
        <div class="task">
          <h2>Your independent fraction task</h2>
          <div class="prompt">${prompt}</div>
        </div>
        <label for="response"><strong>Explain in your own words.</strong> You can also make a quick drawing on paper.</label>
        <textarea id="response" autocomplete="off" placeholder="My explanation..."></textarea>
        <div class="actions">
          <button id="finish" type="button">I finished my explanation ✓</button>
          <a class="button" href="../../">Back to Study-Hub</a>
        </div>
        <div id="done" class="done" role="status">
          <strong>Return task complete.</strong><br />Keep your explanation. The next check should happen later, not immediately.
        </div>
        <div class="later">
          <strong>Later retrieval:</strong> a different fraction question is scheduled for ${earliestDays}–${latestDays} days later. Its status is <code>NOT_YET_TESTED</code> until that later check actually happens.
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
      document.getElementById('finish').addEventListener('click', () => {
        const response = document.getElementById('response').value.trim();
        if (!response) {
          document.getElementById('response').focus();
          return;
        }
        document.getElementById('done').style.display = 'block';
        document.getElementById('finish').disabled = true;
        document.getElementById('response').readOnly = true;
      });
    })();
  </script>
</body>
</html>`;
}
