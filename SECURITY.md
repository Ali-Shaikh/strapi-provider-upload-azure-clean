# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `2.x` | Yes |
| `1.x` | No |

## Reporting a Vulnerability

Please report suspected vulnerabilities privately through GitHub Security Advisories for this repository.

Include:

- A concise description of the issue.
- Affected versions.
- Reproduction steps or proof of concept, if safe to share.
- Any relevant Azure Blob Storage or Strapi configuration details with secrets removed.

Do not open a public issue for sensitive reports. Public issues are fine for non-sensitive configuration questions and general bugs.

## Security Defaults

This provider defaults auto-created containers to private access. If `publicContainer` and `createContainerIfNotExist` are both enabled, `publicAccessType` must be set to `blob` or `container` so the provider does not return public URLs for private blobs.
