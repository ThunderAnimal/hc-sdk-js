#!/usr/bin/env bash

export ENV="$1"
export PUBLISH_FOLDER="dest"
export FILE="${PUBLISH_FOLDER}/healthcloud_sdk.js"
export FILENAME="healthcloud_sdk${FILENAME_SUFFIX}.js"

export CONTENT_TYPE="application/javascript"

bash <( curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H 'Accept: application/vnd.github.v3.raw' -L https://api.github.com/repos/gesundheitscloud/hc-octopus/contents/remote-scripts/publish_to_cdn.sh)

export FILE="${PUBLISH_FOLDER}/healthcloud_sdk.js.map"
export FILENAME="healthcloud_sdk${FILENAME_SUFFIX}.js.map"
export CONTENT_TYPE="application/json"
bash <( curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H 'Accept: application/vnd.github.v3.raw' -L https://api.github.com/repos/gesundheitscloud/hc-octopus/contents/remote-scripts/publish_to_cdn.sh)