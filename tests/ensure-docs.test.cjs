const mockExecSync = jest.fn();

jest.mock('child_process', () => ({
  execSync: mockExecSync
}));

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false)
}));

describe('ensure-docs script', () => {
  test('runs npm run build:docs when docs folder is missing', () => {
    jest.isolateModules(() => {
      require('../scripts/ensure-docs.cjs');
    });
    expect(mockExecSync).toHaveBeenCalledWith('npm run build:docs', { stdio: 'inherit' });
  });
});
