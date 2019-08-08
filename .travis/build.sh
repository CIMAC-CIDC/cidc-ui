# !/usr/bin/bash
#
# Create a production build of the CIDC Portal UI.

# TODO: generate up-to-date shipping manifest templates 
# and move these into public/static before running build

# Configure the environment based on the branch
if [ "$TRAVIS_BRANCH" = production ]; then
    cat .env.prod > .env
elif [ "$TRAVIS_BRANCH" = master ]; then
    cat .env.staging > .env
fi

# If running in Travis, we need to install some cidc_schemas dependencies
[ -z $TRAVIS_BRANCH ] || pip3 install setuptools wheel

# Build the metadata / manifest templates from cidc-schemas
pip3 install cidc-schemas==0.1.4
python3.6 -m cidc_schemas.cli generate_all_templates --out_dir public/static/xlsx || exit 1

# Compile the application
npm run build
