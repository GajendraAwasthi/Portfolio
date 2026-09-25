import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { isValidSectionData, safeEmailAddress, safeExternalUrl, safeMediaUrl } from '../lib/validate-content.ts';

const data = JSON.parse(readFileSync(new URL('../data/portfolio-store.json', import.meta.url)));

test('all shipped portfolio sections satisfy the write contract', () => {
  for (const [section, value] of Object.entries(data)) {
    assert.equal(isValidSectionData(section, value), true, section);
  }
});

test('unsafe links and malformed video embeds are rejected', () => {
  assert.equal(isValidSectionData('profile', {
    ...data.profile,
    socialLinks: { ...data.profile.socialLinks, github: 'javascript:alert(1)' },
  }), false);
  assert.equal(isValidSectionData('projects', [{
    ...data.projects[0], liveUrl: 'data:text/html,<script>alert(1)</script>',
  }]), false);
  assert.equal(isValidSectionData('videos', [{
    ...data.videos[0], embedId: 'abc?autoplay=1',
  }]), false);
});

test('invalid shapes and IDs cannot reach content storage', () => {
  assert.equal(isValidSectionData('settings', null), false);
  assert.equal(isValidSectionData('education', [{ ...data.education[0], id: 'a,b' }]), false);
  assert.equal(isValidSectionData('education', [data.education[0], data.education[0]]), false);
  assert.equal(isValidSectionData('skills', [{ ...data.skills[0], percentage: Infinity }]), false);
});

test('legacy public content URLs are reduced to safe protocols', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), '');
  assert.equal(safeExternalUrl('https://github.com/example'), 'https://github.com/example');
  assert.equal(safeMediaUrl('//evil.example/image.png'), '');
  assert.equal(safeMediaUrl('/src/certificate.png'), '/src/certificate.png');
  assert.equal(safeEmailAddress('person@example.com?body=bad'), '');
});
