import { extractCanonicalPayloadFromHtml } from './canonicalContentLayer.js';

const html = `
<!doctype html>
<html>
<head><title>Test</title></head>
<body>
<script type="application/json" id="studyhub-canonical-page">
{
  "title": "Imported Test Page",
  "pageKind": "lesson",
  "blocks": [{"type":"paragraph","data":{"text":"Hello"}}],
  "clarifiers": [],
  "questions": [],
  "attachments": [],
  "resources": []
}
</script>
</body>
</html>
`;

const result = extractCanonicalPayloadFromHtml(html);
console.assert(result.found === true, 'canonical payload found');
console.assert(result.valid === true, 'canonical payload valid');
console.assert(result.page.title === 'Imported Test Page', 'page title parsed');
console.log('canonicalContentLayer tests passed');
