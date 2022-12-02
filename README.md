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

### Run

To run a local development server:

```
npm start
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

## UI FAQs


### How is the code in the UI repo structured?

This repo’s codebase was initialized using [Create React App](https://reactjs.org/docs/create-a-new-react-app.html#create-react-app), and its top-level structure is pretty typical of apps created this way:



* **public/** contains static assets used to build the CIDC portal site, the most important of which is probably [index.html](https://github.com/CIMAC-CIDC/cidc-ui/blob/master/public/index.html) (the HTML page that the React app gets loaded into - this is what gets sent to the browser initially on page load, before React starts up and begins rendering additional content to the page). The [public/static/cg](https://github.com/CIMAC-CIDC/cidc-ui/tree/master/public/static/cg) subdirectory contains code adapted (copy-and-pasted, with the exception of [these lines](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/public/static/cg/clustergrammer.html#L46)) from the [clustergrammer repo](https://github.com/MaayanLab/clustergrammer) that is used in our clustergrammer-in-react implementation.
* **src/** contains the majority of the app’s code, including all React components. The index.tsx file contains the [function call](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/index.tsx#L11) that attaches our React app to the static HTML code in the public/index.html file (to [this div](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/public/index.html#L55) in particular). The [App.tsx](https://github.com/CIMAC-CIDC/cidc-ui/blob/master/src/App.tsx) file contains the [App](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/App.tsx#L49) component, which is the root node in the app’s React tree - that is, only components that are descendants of the App component will be included in the UI. Stepping through this App component is a good way to get a sense of how all the UI code is connected (I’ll do this in more detail below).
* **test/** contains helper methods used in tests, kept separately from the rest of the code because they should only be called by tests. The tests themselves, however, appear in the same directory as the file they’re testing, usually in a file called, e.g., “MyComponent.test.tsx”.
* **.env** and **.env.&lt;prod|staging>** contain environment variables used to configure the app. Environment variables are loaded from .env by default, so the appropriate staging/prod configuration must be [copied into .env at build time](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/.github/workflows/ci.yml#L53). If you create a **.env.local** file, the app will load config from that file instead of .env, but the .env.local file won’t be tracked by git (since [it’s gitignored](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/.gitignore#L14)).
* **package.json** is the npm analog to a python setup.py file. It contains a [dependency list](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/package.json#L5) (with separate [dev dependencies](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/package.json#L84)) and some [scripts](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/package.json#L74) that you’ll find yourself running in the course of UI development.
* **tsconfig.json** configures the typescript compiler. This file is based pretty closely off of defaults that create-react-app gives you out of the box, and it’s pretty rare you would ever need to update it.

The **src/** directory is where you’ll spend most of your time, so It's broken it down further here:



* **@types/** contains typescript module stubs for packages the CIDC uses that don’t have typescript type definitions available (many packages implemented in javascript provide typescript types, but some don’t). These files contain a one-line module declaration that tells the typescript compiler to essentially do no type checking for the associated package.
* **api/** contains generic client functions for interacting with the API. The key part of this code is the [buildRequester](https://github.com/CIMAC-CIDC/cidc-ui/blob/master/src/api/api.ts) factory function. This function takes as its argument an HTTP method (GET, POST, etc.) and returns another function called _requester_ that makes requests using that HTTP method. This approach allows us to use the same requesting logic for our [swr fetcher](https://swr.vercel.app/docs/data-fetching) as we do for requests that don’t fetch data. The function handles logic related to [building request headers](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/api/api.ts#L24), [issuing requests to the API](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/api/api.ts#L39), [handling etag conflicts](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/api/api.ts#L43), and [retrying failed requests](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/api/api.ts#L22). It’s used to build the [four helper functions](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/api/api.ts#L71) that are used for issuing requests to the API throughout the UI code: _apiFetch_, _apiCreate_, _apiUpdate_, and _apiDelete_.
* **components/** contains, unsurprisingly, most of the React component definitions for the UI. Generally, each subdirectory corresponds to a page in the UI - for example, profile/, home/, transfer-data/, etc.. There are some exceptions, though: **generic/** contains “generic” components that are used throughout the UI, like the [InfoTooltip](https://github.com/CIMAC-CIDC/cidc-ui/blob/master/src/components/generic/InfoTooltip.tsx) component; visualizations/ contains data visualization components; identity/ contains a collection of components related to authentication and authorization.
* **model/** contains typescript definitions generally corresponding to response types returned by the API.
* **util/** contains miscellaneous helper functions.
* **App.tsx** contains the root component in the app’s React tree.
* **index.css** contains global styles applied to the app via [this import](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/index.tsx#L5).
* **index.tsx** renders the React app into the DOM.
* **react-app-env.d.ts** is autogenerated by create-react-app (I’m not sure why).
* **rootStyles.tsx** configures the [global Material UI theme](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/rootStyles.tsx#L21) and creates some page layout default [style classes](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/rootStyles.tsx#L51).
* **setupTests.ts** runs before any tests are executed. It’s analogous to pytest’s conftest.py.


### What’s going on in App.tsx?

First, we [lazily import code](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/App.tsx#L20) for the different pages in the UI. Using lazy imports tells React to only load javascript related to a certain component into the browser when that component is rendered. It’s not critical to understand this, since it’s just a minor performance optimization, but here are the [relevant docs](https://reactjs.org/docs/code-splitting.html) if you want to learn more.

Next, we [define the root App component](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/App.tsx#L49). This component ties together all the different parts of the UI. I’ll go through these different parts:



* [Router](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/App.tsx#L53) is a [react-router](https://reactrouter.com/web/guides/quick-start) component that provides context related to navigation (e.g., what page the user is currently on, what page they were on previously, etc.) to all child components. It’s required that we wrap our app in this component for all routing related functionality to work correctly.
* [SWRConfig](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/App.tsx#L54) provides global configuration to the [swr](https://swr.vercel.app/) library, which we rely on for smart data fetching throughout the UI code (for example, here’s how it’s used to [load user account info](https://github.com/CIMAC-CIDC/cidc-ui/blob/b77fb54a61a4196d1811f8bd24f327b9a94f67ad/src/components/identity/UserProvider.tsx#L33)).
* [QueryParamProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/App.tsx#L61) sets up the library we use for reading and updating URL query params, called [use-query-params](https://github.com/pbeshai/use-query-params) (here’s an [example usage](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/components/browse-data/BrowseDataPage.tsx#L12)).
* [CIDCThemeProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L57) provides the global Material UI theme defaults defined in rootStyles.tsx to all child components.
* [ErrorGuard](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L58) is a custom component that is used for displaying “fatal” errors, like [a user's account being disabled](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/components/identity/UserProvider.tsx#L42).
* [InfoProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L59) provides global info loaded from the API’s “/info” resource to all child components. 
* [IdentityProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L60) provides user authentication/authorization/account info to all child components.
* [Header](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L61) defines the UI page header (the tabs and everything above them).
* [This mysterious looking code](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L63) is required for lazy component imports to work.
* [Switch](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L64) is a react-router component that handles toggling between a set of different [Route](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L65) components. **This block of code lays out all of the top-level pages that appear in the UI**, so you’ll need to add code here if you’re adding a new page to the UI. See the [Switch docs](https://reactrouter.com/web/api/Switch) and [Route docs](https://reactrouter.com/web/api/Route) for more info.
    * To see one interesting example of how a route component works, let’s look at the [FileDetailsPage route](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L82). The _path_ prop contains a parameter, _fileId_, which is accessible in the render method of the FileDetailsPage component [like so](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/components/browse-data/files/FileDetailsPage.tsx#L357) (it’s used to load data from the API for the relevant file). In addition to URL path params, react-router passes [other useful props](https://reactrouter.com/web/api/Route/route-props) to route components.

Anything that appears in the UI is somehow a descendant of the App component. If you can’t find where the code corresponding to something in the UI lives (and [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) doesn’t do the trick), then starting at the App component and making your way down the component hierarchy should get you to your answer.


### How do I set up the development environment?



1. [Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. In cidc-ui directory
    1. `nvm use`
    2. `npm install`
3. Install a browser extension that blocks CORS such as [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) if using firefox **or** [launch chrome without security](https://alfilatov.com/posts/run-chrome-without-cors/) if using chrome
4. To run tests, `npm test`
5. To run a development server, `npm start`
    3. To point to prod, create top-level `.env.local`
    4. Uncomment prod config, comment out staging config


### How do I write tests for things in the UI?

We use [jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing the components that make up our UI. There are so many excellent resources online that help with learning them (between the docs, blog posts, talks).


### How do I add a page to the portal?



1. Create a new React component that will hold the contents for this page. By convention (not requirement), you should do this inside of a new subdirectory inside the src/components/ directory, in a file and component named like “&lt;SomeName>Page”. Generally, the page’s body should be styled using the [centeredPage](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/components/home/HomePage.tsx#L125) style class defined in rootStyles.tsx (accessible via the [useRootStyles](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/components/home/HomePage.tsx#L115) hook). Add a test file and some initial tests, too - even just making sure the component renders without runtime errors!
2. Add a route component corresponding to this new page to the [Switch](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.tsx#L64) component in App.tsx. If the _path_ string for this page matches a substring of any other route paths (e.g., “/path” and “/path-1”), make sure that the substring appears before the longer path in the Switch component’s children - otherwise, you won’t be able to navigate to the substring path.
3. Add some interaction that makes it possible for the user to get to the new page. This could be anything from adding a new [tab in the Header component](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/components/header/Header.tsx#L262), a [button that sends the user to the page](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/components/header/Header.tsx#L122) when it’s clicked, or a [redirect based on an API response](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/components/identity/UserProvider.tsx#L61).
4. (Maybe) add a smoke test to [App.test.tsx](https://github.com/CIMAC-CIDC/cidc-ui/blob/1968a3b423b9c3bda1a68076ce6aed30eeb36506/src/App.test.tsx#L77) to make sure the new page is reachable.


### How does the authentication flow work?

Whereas the API’s authentication flow is centered around validating clients’ identity tokens, the UI’s auth flow is centered around _obtaining_ valid identity tokens from Auth0 to use when authenticating with the API. Once a valid id token is obtained, the UI can then perform basic authorization checks after loading a user’s account information.

The authentication flow is handled by the [IdentityProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/IdentityProvider.tsx#L23) component (which wraps children of the App component [here](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/App.tsx#L66)). The IdentityProvider’s implementation contains two other context providers which handle key logic related to authentication and user identity/authorization:



* [AuthProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L52) handles the authentication flow with the Auth0 API. We use the [Auth0 web client](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L15) for interacting with the Auth0 API. Here’s how the AuthProvider [component](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L52) works. When the component is rendered:
    1. It starts the user in a [“loading” state](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L54), since we’re not sure if the user is logged in or not yet.
    2. After initial render in the “loading” state, [performs logic based on the current URL](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L101) path to determine what to do. If the path is “/logout”, then [log the user out](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L33). If the path is “/callback”, then the user was just redirected back to the portal after logging into their google account, meaning they are now authenticated, so we [send them along to their target path](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L94) (i.e., the path that they initially tried to visit before being sent to google to log in) or to the home page. Otherwise, if the user isn’t already logged in, we try to log them in using the [checkSession](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L58) function.
    3. The Auth0 web client checkSession function ([docs](https://auth0.com/docs/libraries/auth0js#using-checksession-to-acquire-new-tokens)) checks whether there’s currently a valid id token available for the user (the web client caches the user’s id token behind the scenes).
        * If no token is available and [the user is visiting the home page](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L61), don’t automatically log them in (set their state to “logged-out”). From the home page, the user can elect to log in by pressing the [sign up / log in button](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/header/Header.tsx#L245).
        * If no token is available and the user is trying to visit a page other than the home page (e.g., the file browser), [automatically log the user in](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L64).
        * If a valid id token is available, [unpack user info from the token payload](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L72) and [store that data in the AuthProvider state](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/AuthProvider.tsx#L74). In this case, the user is “logged-in” from the perspective of Auth0. However, that doesn’t mean the user has a CIDC account - checks related to the user’s CIDC account are executed by the UserProvider.
* [UserProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L29) handles logic related to checking whether an authenticated user has a CIDC account and if that account has been approved to use the CIDC. Here’s how it does that:
    4. It [loads data passed down to it from the AuthProvider context](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L30).
    5. If the AuthProvider says the user is authenticated, it [tries to load CIDC account info associated with the user's identity token](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L33).
    6. [If the user has an existing CIDC account](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L39), it:
        * [Displays an error](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L42) if the account is disabled.
        * [Redirects to the home page](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L55) if the user’s account is registered but not approved (i.e., a CIDC admin hasn’t granted them a role yet).
    7. [If the user hasn’t registered](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L59), it sends the user to the [account registration page](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/Register.tsx#L23).
    8. [If there was some other error](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L62) loading the user’s CIDC account info, display a generic error message. There’s probably room for improvement here by handling other specific error messages.
    9. [If the user is logged in](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L71) and registered/approved (we won’t hit this line of code otherwise, since the user will have been redirected to another page), load their data access permissions from the API for use throughout the app.
    10. It [determines which tabs a user should see based on their role](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/identity/UserProvider.tsx#L76).

So, in this way, the IdentityProvider component checks if a user is logged in and loads their account information before allowing the rest of the app to render.


### How does the trial/file browser tab work?

Since the trial/file browser is a critical part of the CIDC portal and since the way all its subcomponents string together is a bit complicated, we are stepping through it at a high level here.

[BrowseDataPage](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/BrowseDataPage.tsx#L11) is the container for both the trial and file browsers, and it handles [layout](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/BrowseDataPage.tsx#L36) and logic for [switching between the two](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/BrowseDataPage.tsx#L17). By default, it displays the trial browser on initial render. It renders the browsers inside of a component called [FilterProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/BrowseDataPage.tsx#L35), which provides context about which facets the user has selected.

[FilterProvider](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/shared/FilterProvider.tsx#L51) implements logic for [loading available facets from the API](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/shared/FilterProvider.tsx#L57) and for [updating which facets the user has selected](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/shared/FilterProvider.tsx#L114). The facet [update logic related to nested facets](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/shared/FilterProvider.tsx#L119) is kind of hard to understand at first glance, but the bulk of the complexity comes from [handling the case where a parent facet (e.g. WES) is selected](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/shared/FilterProvider.tsx#L123) and we need to determine whether all of its subfacets should be selected or deselected.

[Filters](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/shared/Filters.tsx#L8) renders the filter facet checkboxes. It relies on data and functions for updating filters loaded from the [FilterProvider's context](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/shared/Filters.tsx#L15) and uses [FilterCheckboxGroup](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/shared/FilterCheckboxGroup.tsx#L73) for facet layout. The BrowseDataPage renders the Filters component [alongside](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/BrowseDataPage.tsx#L36) both the file and trial browsers.

Both the FileTable and TrialTable components change what data they load from the API based on the current state of the filter facets. FileTable does so [here](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/files/FileTable.tsx#L160) and TrialTable does so [here](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/browse-data/trials/TrialTable.tsx#L358).


### How does the current clustergrammer-in-react implementation work?

Since clustergrammer doesn’t natively provide a component for use in React apps, we had to hack one ourselves by injecting the clustergrammer js code into an iframe. Here’s how the custom [Clustergrammer](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/visualizations/ClustergrammerCard.tsx#L34) component works:



1. It [loads the clustergrammer HTML](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/visualizations/ClustergrammerCard.tsx#L36) as a string from the file stored [here](https://github.com/CIMAC-CIDC/cidc-ui/blob/master/public/static/cg/clustergrammer.html).
2. It defines a [function](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/visualizations/ClustergrammerCard.tsx#L38) to be executed from within the clustergrammer iframe (this function can operate on the iframe’s [window and document objects](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/visualizations/ClustergrammerCard.tsx#L39)). This function passes the [clustergrammer network data](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/visualizations/ClustergrammerCard.tsx#L46) provided to the Clustergrammer component props to a function called [DrawClustergram](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/visualizations/ClustergrammerCard.tsx#L45), which is [defined in the clustergrammer HTML document](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/public/static/cg/clustergrammer.html#L46) and does the actual rendering of the clustergrammer visualization. This clustergrammer function will be [re-run every time the window size changes](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/visualizations/ClustergrammerCard.tsx#L54).
3. It renders the iframe with the clustergrammer HTML [injected into the iframe document](https://github.com/CIMAC-CIDC/cidc-ui/blob/1f5e9f3e1c3a09f6307a16a537a26ae6dd7c1e42/src/components/visualizations/ClustergrammerCard.tsx#L60).

**Note**: this solution may become entirely moot if the frontend switches over to clustergrammer2. Since clustergrammer2 is packaged as an ipython widget instead of a plain HTML file, the solution may look more like finding a way to render an ipython widget initialized with data inside a React component.
