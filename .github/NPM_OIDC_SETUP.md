# NPM OIDC Trusted Publishing Setup

This repository uses OpenID Connect (OIDC) for secure npm package publishing via GitHub Actions. This eliminates the need for long-lived npm tokens and provides automatic provenance attestation.

## Prerequisites

Before the GitHub Actions workflow can publish packages, you need to configure a trusted publisher in npm.

## Configuration Steps

### 1. Navigate to Package Settings

Go to your package page on npmjs.com:
- URL: `https://www.npmjs.com/package/@ribassu/worker-mailer`
- Click on "Settings" tab

### 2. Add Trusted Publisher

In the package settings:
1. Scroll to "Trusted Publishers" section
2. Click "Add trusted publisher"
3. Select "GitHub Actions" as the provider
4. Fill in the following details:
   - **Repository Owner**: `RibasSu`
   - **Repository Name**: `worker-mailer`
   - **Workflow filename**: `publish.yml`
   - **Environment** (optional): leave empty

### 3. Save Configuration

Click "Add" to save the trusted publisher configuration.

## How It Works

When the GitHub Actions workflow runs:
1. GitHub generates a short-lived OIDC token
2. The workflow uses this token to authenticate with npm
3. npm verifies the token matches the trusted publisher configuration
4. The package is published with automatic provenance attestation

## Benefits

- **Security**: No long-lived tokens to manage or leak
- **Provenance**: Automatic cryptographic proof linking package to source
- **Simplicity**: No secrets to configure in GitHub repository
- **Trust**: Users can verify package authenticity on npm

## Troubleshooting

If publishing fails with authentication errors:
1. Verify the trusted publisher is configured in npm package settings
2. Ensure the workflow filename matches exactly (`publish.yml`)
3. Check that repository owner/name are correct
4. Confirm the workflow has `id-token: write` permission (already configured)

## References

- [npm Docs: Trusted Publishing](https://docs.npmjs.com/trusted-publishers)
- [GitHub Docs: OpenID Connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
