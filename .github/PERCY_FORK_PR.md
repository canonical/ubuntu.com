# Percy Testing for Fork PRs

## Overview

This repository uses two workflows for Percy visual testing:

1. **percy.yml** - Runs automatically on PRs from the same repository
2. **percy-fork-pr.yml** - Runs on PRs from forks with security controls

## How Fork PR Testing Works

### Security Model

The `percy-fork-pr.yml` workflow uses `pull_request_target` which runs in the context of the base repository, giving it access to secrets. To prevent malicious code execution, it includes a security check job that validates PRs before running tests.

### Automatic Approval

PRs from trusted contributors are automatically approved if the author has one of these associations:
- `COLLABORATOR`
- `MEMBER`
- `OWNER`

### Manual Approval

For PRs from first-time or external contributors:

1. A maintainer reviews the PR code for safety
2. If safe, the maintainer adds the `safe-to-test` label to the PR
3. The Percy tests will then run automatically


## For Maintainers

To approve Percy tests for a fork PR:

1. Review the PR changes carefully
2. Ensure the changes don't contain malicious code
3. Add the `safe-for-percy` label to the PR
4. The Percy workflow will run automatically


## For Contributors

If you're submitting a PR from a fork:

- Your Percy tests may require approval from a maintainer
- This is a security measure to protect the project
- Once approved, tests will run automatically on future commits to the same PR
