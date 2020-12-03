| Environment | Branch                                                              | Status                                                                                                                          | Maintainability                                                                                                                                                     | Test Coverage                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| production  | [production](https://github.com/CIMAC-CIDC/cidc-ui/tree/production) | ![Continuous Integration](https://github.com/CIMAC-CIDC/cidc-ui/workflows/Continuous%20Integration/badge.svg?branch=production) |                                                                                                                                                                     |                                                                                                                                                               |
| staging     | [master](https://github.com/CIMAC-CIDC/cidc-ui)                     | ![Continuous Integration](https://github.com/CIMAC-CIDC/cidc-ui/workflows/Continuous%20Integration/badge.svg?branch=master)     | [![Maintainability](https://api.codeclimate.com/v1/badges/5b511fb97b4e48906501/maintainability)](https://codeclimate.com/github/CIMAC-CIDC/cidc-ui/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/5b511fb97b4e48906501/test_coverage)](https://codeclimate.com/github/CIMAC-CIDC/cidc-ui/test_coverage) |

## CIDC UI

### Installation:

This repo uses [nvm](https://github.com/nvm-sh/nvm#install--update-script) for node version management. Configure your node version:

```
nvm use
```

Next, install the dependencies:

```
npm install
```

### Build:

To create a new deployment bundle, run `npm run build`

### Test:

To run unit tests, run: `npm run test`. This should generate code coverage files and an `lcov.info` file that is compatible with most code-coverage highlighting plugins.

### Deploy

The CIDC leverages Google Cloud Storage's static site-hosting capabilities for serving the Portal UI. It's recommended that you rely on the GitHub Actions workflow for deployment to staging and production.
However, here's how to deploy manually, should you need to. Set `IS_PROD=true` if you are deploying to production, then run:

```bash
## 1. BUILD
# Create an optimized production build with environment-specific configuration
if $IS_PROD; then cat .env.prod > .env; else cat .env.staging > .env; fi
npm run build

## 2. DEPLOY
# Figure out the UI bucket to deploy to
if $IS_PROD; then export BUCKET='gs://cidc-ui-prod'; else export BUCKET='gs://cidc-ui-staging'; fi
# Copy the build to the GCS UI bucket
gsutil -m -h 'Cache-Control:no-cache,max-age=0' cp -r build/* $BUCKET
# Make all objects in the GCS UI bucket public
gsutil iam ch allUsers:objectViewer $BUCKET
```
