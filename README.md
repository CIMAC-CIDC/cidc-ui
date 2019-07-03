| Branch | Coverage | Travis |
| --- | --- | --- |
| Master | [![codecov](https://codecov.io/gh/CIMAC-CIDC/cidc-front-end/branch/master/graph/badge.svg)](https://codecov.io/gh/CIMAC-CIDC/cidc-front-end/branch/master/) | ![travis](https://img.shields.io/travis/CIMAC-CIDC/cidc-front-end/master.svg)
| Staging | [![codecov](https://codecov.io/gh/CIMAC-CIDC/cidc-front-end/branch/staging/graph/badge.svg)](https://codecov.io/gh/CIMAC-CIDC/cidc-front-end/branch/staging/) | ![travis](https://img.shields.io/travis/CIMAC-CIDC/cidc-front-end/staging.svg)
## CIDC UI Readme


### Installation:

Clone the project, and run `npm install`

### Build:

To create a new deployment bundle, run `npm run build`


### Test:

To run unit tests, run: `npm run test`. This should generate code coverage files and an `lcov.info` file that is compatible with most code-coverage highlighting plugins.

### Deploy
The contents of the "build" folder can be used with virtually any hosting solution. The one used for this project is an NGINX instance running on kubernetes. To build the image for this service:

Run the the script `copybuild.sh` in the root of the project directory. This should create and upload a Docker image for the service, as well as use helm to upgrade or install the existing deployment. For people not using the CIDC development settings the steps will be the following:

From the `/build` directory, run

~~~~
docker build -f ../nginx/Dockerfile .
~~~~

Which will create an image of an NGINX server with the build files hosted on it. You may then run the image on whatever setup you are currently using. See the helm chart used for kubernetes [here](https://github.com/CIMAC-CIDC/tree/master/kubernetes/helm/nginx)
### Developer mode:
To test React components without trying to contact the back-end, start the application in "dev mode", with `npm run start-dev`
