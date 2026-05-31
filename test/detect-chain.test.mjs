// Unit tests for the chain-detection regex.
//
// Goal: lock in that every fixture address resolves to the correct chain key.
// This is the test that catches regressions when someone reorders detectChain
// (Solana's catch-all base58 must stay LAST) or tightens a regex.
//
// Run via: docker run --rm -v "$(pwd):/app" -w /app node:lts npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { detectChain } from '../chains.js';

const fixturesUrl = new URL('./fixtures/addresses.json', import.meta.url);
const fixtures = JSON.parse(fs.readFileSync(fixturesUrl, 'utf8'));

for (const [name, fix] of Object.entries(fixtures)) {
  test(`detectChain: ${name} → ${fix.detectChainResult}`, () => {
    assert.equal(
      detectChain(fix.address),
      fix.detectChainResult,
      `Expected ${name} (${fix.address.slice(0, 12)}…) to be detected as "${fix.detectChainResult}"`,
    );
  });
}

test('detectChain: empty string returns null', () => {
  assert.equal(detectChain(''), null);
  assert.equal(detectChain('   '), null);
});

test('detectChain: obvious garbage returns null', () => {
  assert.equal(detectChain('not-an-address'), null);
  assert.equal(detectChain('0xZZZ'), null);
});
