# NPM Trusted Publisher Setup

This repository uses npm's OIDC Trusted Publishing for secure, token-free package publishing from GitHub Actions.

## Why This Change?

- **Classic npm tokens have been revoked** (December 2025)
- **Granular tokens expire after 90 days** and require 2FA
- **OIDC Trusted Publishing** eliminates token management entirely
- More secure: no long-lived secrets, no risk of token leakage
- Automatic provenance attestation for published packages

## Setup Instructions

### Prerequisites

1. The package must be published at least once using traditional authentication (this is already done for `@ribassu/worker-mailer`)
2. You must have maintainer/owner permissions on the npm package
3. npm CLI version 11.5.1 or later is required (already satisfied in GitHub Actions)

### Configure Trusted Publisher on npmjs.com

1. **Log in to npmjs.com** and navigate to your package: https://www.npmjs.com/package/@ribassu/worker-mailer

2. **Go to Settings** → **Publishing Access** section

3. **Add a Trusted Publisher**:
   - Click "Add trusted publisher"
   - Select **GitHub Actions** as the provider
   - Fill in the following details **exactly as shown**:
     - **GitHub User/Organization**: `RibasSu`
     - **Repository**: `worker-mailer`
     - **Workflow filename**: `publish.yml` (must match exactly, including extension)
     - **Environment** (optional): Leave empty (or specify if you use GitHub environments)

4. **Save the configuration**

### Workflow Configuration

The workflow is configured with:

```yaml
permissions:
  contents: read
  id-token: write  # Required for OIDC authentication

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    registry-url: 'https://registry.npmjs.org'  # Required for OIDC

- name: Publish to npm
  run: npm publish --provenance --access public
  # NO NODE_AUTH_TOKEN needed - authentication via OIDC
```

**Critical Requirements:**
- ✅ `id-token: write` permission (enables OIDC token generation)
- ✅ `registry-url: 'https://registry.npmjs.org'` in setup-node (initializes OIDC auth)
- ❌ **Do NOT set** `NODE_AUTH_TOKEN` (interferes with OIDC detection)

### That's It!

Once configured, the workflow will automatically publish to npm without requiring any tokens. The authentication happens via OIDC using short-lived credentials generated for each workflow run.

## How It Works

1. GitHub Actions generates a unique OIDC token for each workflow run
2. The `registry-url` setting in setup-node configures npm to use OIDC authentication
3. npm validates this token matches the trusted publisher configuration
4. If valid, npm allows the publish operation
5. Each publish includes automatic provenance attestation

## Verification

After the next release is created, check the workflow run to confirm successful publishing. You should see:

```
npm notice Publishing to https://registry.npmjs.org/ with provenance
npm notice Publishing package with trusted publishing...
```

## Troubleshooting

### "Authentication required" error (ENEEDAUTH)

- Ensure the trusted publisher is configured correctly on npmjs.com
- Verify the workflow filename matches exactly (`publish.yml`)
- Check that repository name matches (`RibasSu/worker-mailer`)
- Confirm `registry-url` is set in setup-node action

### "Provenance generation failed"

- Ensure `id-token: write` permission is set in workflow (already configured)
- Verify npm CLI version supports provenance (v9.5.0+)

### "Not authorized to publish"

- Confirm you have maintainer/owner permissions on the package
- Double-check trusted publisher settings on npmjs.com

### Still using NODE_AUTH_TOKEN?

- Remove any `NODE_AUTH_TOKEN` from the workflow - it interferes with OIDC
- Delete the `NPM_TOKEN` secret from repository settings (no longer needed)

## Additional Resources

- [npm Trusted Publishers Documentation](https://docs.npmjs.com/trusted-publishers)
- [GitHub Blog: npm Trusted Publishing with OIDC](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [npm Security Changes Announcement](https://github.blog/changelog/2025-09-29-strengthening-npm-security-important-changes-to-authentication-and-token-management/)
- [Phil Nash: Trusted Publishing Tips](https://philna.sh/blog/2026/01/28/trusted-publishing-npm/)
- [Comprehensive OIDC Troubleshooting Guide](https://blog.moelove.info/from-deprecated-npm-classic-tokens-to-oidc-trusted-publishing-a-cicd-troubleshooting-journey)
