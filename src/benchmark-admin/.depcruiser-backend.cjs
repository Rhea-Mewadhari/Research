/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-controller-to-data-bypass',
      severity: 'error',
      comment: 'Controllers must not import from the data layer directly — route through services.',
      from: { path: '(^|/)controllers/' },
      to:   { path: '(^|/)data/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
