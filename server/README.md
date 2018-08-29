## Brief of the project
A simple text alignment API which accepts a JSON running order and timed transcript and returns the running order with timings.

## Setup
Developed using Node 8 LTS (8.11.3). You can use Node Version Manager (nvm) to switch between versions: `nvm use 8`

To install:
```
npm install
```

To run:
```
npm start
```

## System architecture
Express API with fuzzyset.js to help with the text alignment.

## Development env
To run the server in watch mode (i.e. reload after file changes):
```
npm run dev
```

To run tests in watch mode:
```
npm run dev-test
```

## Build - TBA
How to run build, this can be as simple as `npm run build` or involving more steps for more complex projects.

Top tip: if your build is more then 3 steps, consider writing a build script.

## Tests
Tests live in the `/test` directory, and there are `/integration` and `/unit` (tbd) subdirectories within.

Tests run with mocha by running:
```
npm test
```

## Benchmark tests
Using source data from various speech programmes, there are benchmark tests to run the data through the algorithm and output the results.

To run the tests locally and output the comparison data from Elasticsearch to the console (useful for development):
```
npm run compare
```
To run the tests and post the JSON to Elasticsearch:
```
npm run post-results
```

## Deployment - TBA
How to deploy the code/app into test/staging/production, where applicable.
