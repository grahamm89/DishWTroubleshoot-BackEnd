const fs = require('fs');
const assert = require('assert');

const data = JSON.parse(fs.readFileSync('app_data.json', 'utf8'));
['symptoms', 'questions', 'chemicalTests'].forEach(section => {
  assert.ok(data[section], `Missing ${section} section in app_data.json`);
});

console.log('app_data.json contains required sections.');
