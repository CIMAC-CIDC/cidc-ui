| Environment | Branch                                                                   | Status                                                                                                                                | Maintainability | Test Coverage |
| ----------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| production  | [production](https://github.com/CIMAC-CIDC/cidc-ui/tree/production) | [![Build Status](https://travis-ci.org/CIMAC-CIDC/cidc-ui.svg?branch=production)](https://travis-ci.org/CIMAC-CIDC/cidc-ui)                                                                                                                                                                   ||                                                                                                                                                               |
| staging     | [master](https://github.com/CIMAC-CIDC/cidc-ui)                     | [![Build Status](https://travis-ci.org/CIMAC-CIDC/cidc-ui.svg?branch=master)](https://travis-ci.org/CIMAC-CIDC/cidc-ui)     | [![Maintainability](https://api.codeclimate.com/v1/badges/5b511fb97b4e48906501/maintainability)](https://codeclimate.com/github/CIMAC-CIDC/cidc-ui/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/5b511fb97b4e48906501/test_coverage)](https://codeclimate.com/github/CIMAC-CIDC/cidc-ui/test_coverage) |

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

The CIDC leverages Google Cloud Storage's static site-hosting capabilities for serving the Portal UI. Although it's recommended that you rely on the Travis CI pipeline for deployment to staging and production, should you need to deploy by hand, run:

```bash
sh .travis/build.sh
sh .travis/deploy.sh gs://$YOUR_GCS_BUCKET
```

This will create an optimized build of the site using whatever configuration is present in your `.env` file, upload the build files to `$YOUR_GCS_BUCKET`, and make those files publicly readable.

### Developer mode:

To test React components without trying to contact the back-end, start the application in "dev mode", with `npm run start-dev`
