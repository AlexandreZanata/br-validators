import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/core/pix/detect.js', () => ({
  detectPixKeyType: vi.fn(),
}));

import { detectPixKeyType } from '../../src/core/pix/detect.js';
import { stripPixKey } from '../../src/strip/pix.js';
import vectors from '../vectors/pix.official.json';

describe('stripPixKey', () => {
  it('strips masked CPF PIX key', () => {
    vi.mocked(detectPixKeyType).mockReturnValue('cpf');
    expect(stripPixKey(`  ${vectors.cpf.masked} `)).toBe(vectors.cpf.canonical);
  });

  it('strips masked CNPJ PIX key', () => {
    vi.mocked(detectPixKeyType).mockReturnValue('cnpj');
    expect(stripPixKey(vectors.cnpj.numeric)).toBe(vectors.cnpj.numeric);
    expect(stripPixKey(vectors.cnpj.alphanumeric.toLowerCase())).toBe(vectors.cnpj.alphanumeric);
  });

  it('lowercases email PIX key', () => {
    vi.mocked(detectPixKeyType).mockReturnValue('email');
    expect(stripPixKey(`  ${vectors.email.primary.toUpperCase()} `)).toBe(vectors.email.primary);
  });

  it('normalizes phone PIX key spacing', () => {
    vi.mocked(detectPixKeyType).mockReturnValue('phone');
    expect(stripPixKey('+55 10 99876-5432')).toBe(vectors.phone.primary);
  });

  it('lowercases EVP PIX key', () => {
    expect(stripPixKey(vectors.evp.primary.toUpperCase())).toBe(vectors.evp.primary);
  });

  it('returns empty string for blank input', () => {
    expect(stripPixKey('   ')).toBe('');
  });

  it('returns trimmed input for unknown shapes', () => {
    vi.mocked(detectPixKeyType).mockReturnValue('unknown');
    expect(stripPixKey('  not-a-key  ')).toBe('not-a-key');
  });

  it('stripPixPhone prefixes +55 for 11-digit national input when typed as phone', () => {
    vi.mocked(detectPixKeyType).mockReturnValue('phone');
    expect(stripPixKey('11987654432')).toBe('+5511987654432');
  });

  it('stripPixPhone keeps digits when input already includes country code', () => {
    vi.mocked(detectPixKeyType).mockReturnValue('phone');
    expect(stripPixKey('5511987654432')).toBe('+5511987654432');
  });

  it('stripPixPhone falls back to separator removal for non-standard phone shapes', () => {
    vi.mocked(detectPixKeyType).mockReturnValue('phone');
    expect(stripPixKey('(11) abc')).toBe('11abc');
  });

  it('detects lowercase EVP via official pattern branch', () => {
    expect(stripPixKey(vectors.evp.primary)).toBe(vectors.evp.primary);
  });
});
