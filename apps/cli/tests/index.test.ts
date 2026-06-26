import { describe, expect, it } from 'vitest';

import { createProgram } from '../src/program.js';

describe('index entry', () => {
  it('run executes list command', () => {
    const program = createProgram();
    expect(() => {
      program.parse(['node', 'br-validators', 'list'], { from: 'node' });
    }).not.toThrow();
  });
});
