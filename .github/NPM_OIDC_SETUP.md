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
1. `setup-node` with `registry-url` creates an `.npmrc` file configured for npm registry
2. GitHub Actions provides an OIDC token via the environment (due to `id-token: write`)
3. npm CLI (with `--provenance` flag) uses OIDC to authenticate with the registry
4. npm verifies the OIDC token matches the trusted publisher configuration
5. The package is published with automatic provenance attestation

**Important**: The `registry-url` in `setup-node` is REQUIRED for OIDC to work. It configures npm to use the registry with OIDC authentication. The key difference from token-based auth is that NO `NODE_AUTH_TOKEN` secret is provided—npm automatically uses OIDC when it's available.

## Workflow Configuration

The correct workflow configuration for OIDC authentication:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write    # Required for OIDC
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'  # Required for OIDC
      - run: npm ci
      - run: npm publish --provenance --access public  # No NODE_AUTH_TOKEN needed
```

**Key points:**
- `id-token: write` permission enables OIDC
- `registry-url` is required to configure npm for the registry
- NO `NODE_AUTH_TOKEN` environment variable in the publish step
- npm automatically uses OIDC when available

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
5. Verify that `setup-node` HAS `registry-url` configured (required for OIDC)
6. Make sure NO `NODE_AUTH_TOKEN` or `NPM_TOKEN` environment variable is set in the publish step
7. Check npm CLI version is 11.5.1 or later
8. Ensure you're using GitHub-hosted runners (self-hosted not supported yet)

## References

- [npm Docs: Trusted Publishing](https://docs.npmjs.com/trusted-publishers)
- [GitHub Docs: OpenID Connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
