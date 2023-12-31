# Github action to update deployment status by unreleased commits

This action retrieves the new commits since a specific tag, parses the commits for a specific format and updates the deployment status for all matching commits. This action is designed to use with [fluxcd](https://fluxcd.io) and [github commit status notification provider](https://fluxcd.io/flux/monitoring/alerts/#git-commit-status).

## Inputs

### `token`

**Required** The github token to be used to make the deployment status update api requests (needs access to the other repos). Default `"${{ github.token }}"`.

### `repo-regex`

**Required** The regex to match the repo for the deployment status update. Default `"deploy (\w+)"`.

### `repo-regex`

**Required** The regex to match the repo for the deployment status update. Default `"deploy (\w+)"`.

### `tag`

**Required** The tag to use for getting the unreleased commits. Default `"deployed"`.


## Outputs

### `count`

The number of deployment status updates that were made.

## Example usage

```yaml
name: Updates deployment statuses on github in other repositories
on:
  - status

jobs:
  check:
    runs-on: ubuntu-latest
    if: github.event.state == 'success'
    steps:
      - uses: actions/checkout@v4
        with:
            ref: ${{ github.event.status.sha }}
            fetch-depth: 0
      - uses: notz/update-deployment-status-by-unreleased-commits@main
        id: deployment-status
        with:
            token: ${{ secrets.DEPLOYMENT_UPDATE_TOKEN }}
            repo-regex: 'Deploy ([a-z-]+)'
            deployment-id-regex: '\[([0-9]+)\]'
            tag: 'deployed'
      - name: Tag Repo
        if: ${{ steps.deployment-status.outputs.count > 0 && success() }}
        uses: richardsimko/update-tag@v1
        with:
          tag_name: deployed
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```


## Build action

```
./node_modules/.bin/ncc build index.js --license licenses.txt
```