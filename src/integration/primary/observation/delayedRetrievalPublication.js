import {
  fractionDelayedQuestionId,
  fractionEquivalenceQuestions,
} from '../fractions/fractionEquivalenceContent.js';
import {
  englishInferenceDelayedQuestionId,
  englishInferenceQuestions,
} from '../english/englishInferenceContent.js';

export const FRACTION_DELAYED_RETRIEVAL_LEARNER_PATH = '/primary/fractions/delayed-retrieval.html';
export const ENGLISH_DELAYED_RETRIEVAL_LEARNER_PATH = '/primary/english/inference-delayed-retrieval.html';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sharedStyles() {
  return `
    :root { font-family: ui-rounded, "Nunito", system-ui, sans-serif; color: #17324d; background: #f3f8ff; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: linear-gradient(180deg,#fbfdff 0%,#edf5ff 55%,#f7f0ff 100%); }
    main { width: min(780px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 48px; }
    .card { background: rgba(255,255,255,.97); border: 2px solid #d7e7ff; border-radius: 28px; padding: clamp(20px,4vw,34px); box-shadow: 0 18px 55px rgba(39,74,120,.13); }
    .eyebrow { color: #6b55d8; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; font-size: .78rem; }
    h1 { margin: 8px 0; font-size: clamp(2rem,7vw,3rem); line-height: 1.05; }
    .guardian { margin: 18px 0; padding: 16px 18px; border-radius: 18px; background: #fff2d7; border: 2px solid #e9ba62; }
    .guardian strong { color: #8a5b0a; }
    .task { margin: 22px 0; padding: 22px; border-radius: 22px; background: #fff7cc; border: 2px solid #f4c85d; }
    .prompt { font-size: clamp(1.18rem,4vw,1.5rem); line-height: 1.5; font-weight: 850; }
    .option { display: flex; gap: 10px; align-items: flex-start; margin: 10px 0; padding: 12px 14px; border: 2px solid #d3e2f4; border-radius: 16px; background: white; font-weight: 750; }
    textarea { width: 100%; min-height: 92px; resize: vertical; border: 2px solid #9fc8ef; border-radius: 18px; padding: 14px; font: inherit; font-size: 1rem; background: #fff; }
    .field { margin: 18px 0; }
    .field label { display:block; font-weight:900; margin-bottom:7px; }
    .actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:18px; }
    button, a.button { border:0; border-radius:999px; padding:13px 20px; font:inherit; font-weight:900; cursor:pointer; text-decoration:none; }
    button { background:#35b7a7; color:#062f2a; }
    a.button { background:#765eea; color:white; }
    .result { display:none; margin-top:18px; padding:16px 18px; border-radius:18px; background:#e8f8ed; border:2px solid #9bd5aa; }
    .note { color:#63778d; font-size:.94rem; line-height:1.5; }
    .formula { margin:16px 0; padding:13px 16px; text-align:center; border-radius:16px; background:#eef9f5; border:2px solid #b7e4d3; font-weight:900; }
  `;
}

export function buildFractionDelayedRetrievalPageHtml() {
  const question = fractionEquivalenceQuestions.find((item) => item.id === fractionDelayedQuestionId);
  if (!question) throw new Error('Fraction delayed-retrieval question is missing from canonical content');
  if (question.type !== 'mcq' || !Array.isArray(question.options) || !Number.isInteger(question.answerIndex)) {
    throw new Error('Fraction delayed-retrieval question must remain a canonical MCQ');
  }

  const options = question.options.map((option, index) => `
    <label class="option"><input type="radio" name="answer" value="${index}" /> <span>${escapeHtml(option)}</span></label>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Delayed retrieval · Equivalent fractions</title>
  <style>${sharedStyles()}</style>
</head>
<body>
  <main><section class="card">
    <div class="eyebrow">Gate #50 · Delayed retrieval</div>
    <h1>Fresh fraction check</h1>
    <div class="guardian"><strong>Guardian:</strong> use this only 3–7 days after the initial supervised session. Do not rehearse the original question immediately before this check.</div>
    <p class="note">This is a fresh retrieval item. Give no conceptual hint before the child answers. Record the observed result in the local Gate #50 observation record.</p>
    <div class="task"><div class="prompt">${escapeHtml(question.prompt)}</div>${options}</div>
    <div class="actions"><button id="finish" type="button">Submit this fresh answer</button><a class="button" href="../observation/">Back to observer page</a></div>
    <div id="result" class="result" role="status"></div>
  </section></main>
  <script>
    (() => {
      const correctIndex = ${question.answerIndex};
      document.getElementById('finish').addEventListener('click', () => {
        const selected = document.querySelector('input[name="answer"]:checked');
        if (!selected) return;
        const isCorrect = Number(selected.value) === correctIndex;
        const result = document.getElementById('result');
        result.style.display = 'block';
        result.textContent = isCorrect
          ? 'Observer result: CORRECT on the fresh delayed-retrieval item. Record what was observed; do not turn one item into a mastery claim.'
          : 'Observer result: INCORRECT on the fresh delayed-retrieval item. Record the response as observed and keep diagnosis separate.';
        document.querySelectorAll('input[name="answer"]').forEach((input) => { input.disabled = true; });
        document.getElementById('finish').disabled = true;
      });
    })();
  </script>
</body>
</html>`;
}

export function buildEnglishDelayedRetrievalPageHtml() {
  const question = englishInferenceQuestions.find((item) => item.id === englishInferenceDelayedQuestionId);
  if (!question) throw new Error('English delayed-retrieval question is missing from canonical content');
  if (question.type !== 'long_answer') throw new Error('English delayed-retrieval question must remain open response');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Delayed retrieval · Inference Investigator</title>
  <style>${sharedStyles()}</style>
</head>
<body>
  <main><section class="card">
    <div class="eyebrow">Gate #50 · Delayed retrieval</div>
    <h1>Fresh inference check</h1>
    <div class="guardian"><strong>Guardian:</strong> use this only 3–7 days after the initial supervised session. Do not show the earlier return example first.</div>
    <div class="formula">INFERENCE = ANSWER + TEXT CLUE + CONNECTION</div>
    <p class="note">The child may respond orally or in writing. A complete response is not automatically “correct”: the supervising adult must judge whether the cited clue actually supports the inference.</p>
    <div class="task"><div class="prompt">${escapeHtml(question.prompt)}</div></div>
    <div class="field"><label for="answer">1. Answer</label><textarea id="answer" autocomplete="off"></textarea></div>
    <div class="field"><label for="clue">2. Text clue</label><textarea id="clue" autocomplete="off"></textarea></div>
    <div class="field"><label for="connection">3. Connection</label><textarea id="connection" autocomplete="off"></textarea></div>
    <div class="actions"><button id="finish" type="button">Finish fresh response</button><a class="button" href="../observation/">Back to observer page</a></div>
    <div id="result" class="result" role="status"><strong>Observer judgement required.</strong> Record whether the answer, clue and connection form a text-supported inference. Do not use string matching or the presence of all three fields alone as correctness.</div>
  </section></main>
  <script>
    (() => {
      const fields = ['answer','clue','connection'].map((id) => document.getElementById(id));
      document.getElementById('finish').addEventListener('click', () => {
        const missing = fields.find((field) => !field.value.trim());
        if (missing) { missing.focus(); return; }
        fields.forEach((field) => { field.readOnly = true; });
        document.getElementById('finish').disabled = true;
        document.getElementById('result').style.display = 'block';
      });
    })();
  </script>
</body>
</html>`;
}
