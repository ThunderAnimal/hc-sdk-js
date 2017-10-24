#!/usr/bin/env bash

export ENV="$1"
export PUBLISH_FOLDER="dest"
export FILENAME="healthcloud_sdk.js"
export CONTENT_TYPE="application/javascript"

bash <( curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H 'Accept: application/vnd.github.v3.raw' -L https://api.github.com/repos/gesundheitscloud/hc-octopus/contents/remote-scripts/publish_to_cdn.sh?ref=fi/publish_sdk_js)

export FILENAME="healthcloud_sdk.js.map"
export CONTENT_TYPE="application/json"
bash <( curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H 'Accept: application/vnd.github.v3.raw' -L https://api.github.com/repos/gesundheitscloud/hc-octopus/contents/remote-scripts/publish_to_cdn.sh?ref=fi/publish_sdk_js)