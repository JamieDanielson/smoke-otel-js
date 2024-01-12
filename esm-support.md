# OTel-JS and ESM Support

## Current State

Example Bug Report: "Foo" instrumentation doesn't work with ESM

- "Foo" instrumentation works in CommonJS whether it's TypeScript or JavaScript.
- If using ESM in TypeScript to write your app but compile to CJS, "Foo" instrumentation works if you use our loader hook.
- If using ESM in TypeScript to write your app and compile to ESM, "Foo" instrumentation probably(?) doesn't work.
- If using ESM in JavaScript to write your app, "Foo" instrumentation probably(?) doesn't work.

## Required (for each package) to fully support ESM

- Change the package type to `module` as default in `package.json`
- Add dual exports to package.json (`*, import, require`)
- Add `tsconfig.esm.json` if it doesn't already exist
- Add separate build scripts for cjs and esm, along with command line addition of `type:module` and `type:commonjs` in a `package.json`, which allows us to keep the `.js` suffix on built files instead of needing `.mjs` for ESM or `.cjs` for CJS
- Fix every relative import and export to be `./fileName.js` (may require adjustments to imports/exports that import directories)
- Adjust tests using sinon.spy or sinon.stub because you can't spy or stub ES modules
- Rename `.eslintrc.js` to `.eslintrc.cjs` (or change to ESM syntax instead of using `module.exports`)
- Update `.tsconfig`s to parse `.cjs` extensions
- Update mocha to use `ts-node/esm` loader (also requires install of `ts-node`)
- update the test command to use `tsconfig.esm.json`
- add a test command that builds the package and runs mocha against the built cjs (instead of `ts-mocha` against the ts source code)... idea from [this blog](https://evertpot.com/universal-commonjs-esm-typescript-packages/)

Some of these changes can be seen in an attempt to update opentelemetry-core in [WIP PR 4403](https://github.com/open-telemetry/opentelemetry-js/pull/4403/files):

```json
// package.json
"scripts": {
    "compile:cjs": "tsc --build && echo '{ \"type\": \"commonjs\" }' > build/src/package.json",
    "compile:esm": "tsc --build tsconfig.esm.json && echo '{ \"type\": \"module\" }' > build/esm/package.json",
    "compile:esnext": "tsc --build tsconfig.esnext.json && echo '{ \"type\": \"module\" }' > build/esnext/package.json",
    "compile": "npm run compile:cjs && npm run compile:esm && npm run compile:esnext",
    "test": "nyc ts-mocha -p tsconfig.esm.json test/**/*.test.ts --exclude 'test/platform/browser/**/*.ts'",
},
  "type": "module",
  "exports": {
    ".": {
      "require": {
        "types": "./build/src/index.d.ts",
        "default": "./build/src/index.js"
      },
      "import": {
        "types": "./build/esm/index.d.ts",
        "default": "./build/esm/index.js"
      }
    }
  },
  ...
  "devDependencies": {
    "ts-node": "^10.9.2",
  },
  ...
    "mocha": {
    "loader": [
      "ts-node/esm"
    ],
    "recursive": true,
    "extension": [
      "ts",
      "js"
    ]
  }
```

```ts
// opentelemetry-core/test/utils/wrap.test.ts

// this import
import { isWrapped, ShimWrapped } from '../../src';
// becomes
import { isWrapped } from '../../src/utils/wrap.js';
import { ShimWrapped } from '../../src/common/types.js';
```

## Recommended

- Upgrade TypeScript to at least 4.7 to allow using [`nodenext`](https://www.typescriptlang.org/tsconfig#node16nodenext) in `tsconfig.esm.json`, which integrates with node's native ESM support and gives warnings for missing `.js` suffixes.
- [Stop using`import *` and `export *...`](https://github.com/open-telemetry/opentelemetry-js/issues/4186) which also makes the updating of suffixes easier because it'll be easier to find what needs to be exported (e.g. easier to figure out that `export * from './detect-resources';` will become `export { detectResources, detectResourcesSync } from './detect-resources';` and finally for ESM will be `export { detectResources, detectResourcesSync } from './detect-resources.js';`)
- Add smoke tests maybe similar to [klippx recommendation](https://github.com/klippx/mappersmith-consumer) to check for varying types of usage
