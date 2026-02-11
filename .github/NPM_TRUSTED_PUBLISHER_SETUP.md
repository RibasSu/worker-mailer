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

### Configure Trusted Publisher on npmjs.com

1. **Log in to npmjs.com** and navigate to your package: https://www.npmjs.com/package/@ribassu/worker-mailer

2. **Go to Settings** → **Publishing Access** section

3. **Add a Trusted Publisher**:
   - Click "Add trusted publisher"
   - Select **GitHub Actions** as the provider
   - Fill in the following details:
     - **GitHub User/Organization**: `RibasSu`
     - **Repository**: `worker-mailer`
     - **Workflow filename**: `publish.yml`
     - **Environment** (optional): Leave empty (or specify if you use GitHub environments)

4. **Save the configuration**

### That's It!

Once configured, the workflow will automatically publish to npm without requiring any tokens. The authentication happens via OIDC using short-lived credentials generated for each workflow run.

## How It Works

1. GitHub Actions generates a unique OIDC token for each workflow run
2. npm validates this token matches the trusted publisher configuration
3. If valid, npm allows the publish operation
4. Each publish includes automatic provenance attestation

## Verification

After the next release is created, check the workflow run to confirm successful publishing. You should see:

```
npm notice Publishing to https://registry.npmjs.org/ with provenance
npm notice Publishing package with trusted publishing...
```

## Troubleshooting

### "Authentication required" error

- Ensure the trusted publisher is configured correctly on npmjs.com
- Verify the workflow filename matches exactly (`publish.yml`)
- Check that repository name matches (`RibasSu/worker-mailer`)

### "Provenance generation failed"

- Ensure `id-token: write` permission is set in workflow (already configured)
- Verify npm CLI version supports provenance (v9.5.0+)

### "Not authorized to publish"

- Confirm you have maintainer/owner permissions on the package
- Double-check trusted publisher settings on npmjs.com

## Additional Resources

- [npm Trusted Publishers Documentation](https://docs.npmjs.com/trusted-publishers)
- [GitHub Blog: npm Trusted Publishing with OIDC](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [npm Security Changes Announcement](https://github.blog/changelog/2025-09-29-strengthening-npm-security-important-changes-to-authentication-and-token-management/)
