# How to release

As soon as you push a tagged commit to master, it triggers the release to Github.com.

As it is not possible to push to master directly, it is necessary to create a tagged release branch and create a PR to
master from there. 

You can use the bash commands stored in __scripts/release_sdk.sh__. If you use __scripts/release_sdk.sh__ you need to
ensure, that you updated the __CHANGELOG.md__ properly. For more information, look into __scripts/release_sdk.sh__.

```bash
# example: scripts/release_sdk.sh "1.0.0"
scripts/release_sdk.sh VERSION
```

## TODO
- Adjust env to production when ENDPOINT and CDN are working with prod value
- Create a dedicated Travis github user for gesundheitscloud organization to depersonalize deployment
