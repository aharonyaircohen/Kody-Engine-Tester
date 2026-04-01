# [test-suite] Simple utility function - interpolate

Add an `interpolate` utility function that replaces named placeholders in a template string with values from an object. For example: `interpolate('Hello, {name}!', { name: 'World' })` returns `'Hello, World!'`. Include TypeScript types and unit tests.