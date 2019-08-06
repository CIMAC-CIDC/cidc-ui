# !/usr/bin/bash
#
# Deploy the UI to the current gcloud project.

BUCKET=$1

# Copy the contents of the build directory to the GCS UI bucket
gsutil -m cp -r build/* $BUCKET

# Make all objects in the GCS UI bucket public
gsutil iam ch allUsers:objectViewer $BUCKET