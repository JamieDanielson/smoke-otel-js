# smoke-otel-js

repo for testing changes to otel-js in support of proper dual-publishing cjs/esm.

Currently uses a local directory in each app for otel-core that should be changed as needed.

```sh
# install shared dependencies from top-level package.json
npm install

# install dependencies for each app (currently uses local build)
npm run get-all

# build cjs and esm apps
npm run build-all

# run cjs and esm apps
npm run start-all
```

successful run should show this:

```sh
> cjs-app@1.0.0 start
> node ./build/index.js

hello from cjs
W3CBaggagePropagator {}

> esm-app@1.0.0 start
> node ./build/index.js

hello from esm
W3CBaggagePropagator {}
```
