export async function callGemini(prompt, apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) throw new Error('Gemini API call failed');
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    throw err;
  }
}
