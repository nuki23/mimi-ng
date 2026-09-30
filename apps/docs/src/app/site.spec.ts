import cliPackage from '../../../../packages/cli/package.json';
import { SITE } from './site';

describe('SITE', () => {
  it('la versión es la del package.json de @mimi-ng/cli (única fuente)', () => {
    expect(SITE.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(SITE.version).toBe(cliPackage.version);
  });
});
