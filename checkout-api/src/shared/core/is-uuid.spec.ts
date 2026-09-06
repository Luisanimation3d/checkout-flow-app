import { isUuid } from './is-uuid';

describe('isUuid', () => {
  it('accepts a valid v4 UUID', () => {
    expect(isUuid('3ef83c86-caad-4d36-bafa-ecdc0c6b6127')).toBe(true);
  });

  it('accepts uppercase UUIDs', () => {
    expect(isUuid('3EF83C86-CAAD-4D36-BAFA-ECDC0C6B6127')).toBe(true);
  });

  it('rejects a malformed string', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isUuid('')).toBe(false);
  });

  it('rejects a UUID missing a segment', () => {
    expect(isUuid('3ef83c86-caad-4d36-bafa')).toBe(false);
  });

  it('rejects a UUID with invalid hex characters', () => {
    expect(isUuid('3ef83c86-caad-4d36-bafa-ecdc0c6b6zzz')).toBe(false);
  });
});
