# !/usr/bin/bash
#
# Create a production build of the CIDC Portal UI.

# TODO: generate up-to-date shipping manifest templates 
# and move these into public/static before running build

# Configure the environment based on the branch
if [ "$TRAVIS_BRANCH" = production ]; then
    cat .env.prod > .env
else
    cat .env.staging > .env
fi

# Compile the application
npm run build
