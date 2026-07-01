# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Added repo brand assets, including SVG and PNG icon exports plus GitHub social preview artwork.
- Added a branded README header and security defaults callout.
- Added a security policy, pull request template, and issue templates.

## 2.0.1 - 2026-07-01

- Added validation for `publicAccessType` so invalid values fail with a clear configuration error.
- Prevented `publicContainer=true` with auto-created private containers from returning SAS-free URLs.
- Documented the required public container auto-create configuration.

## 2.0.0 - 2026-07-01

- Updated `@azure/storage-blob` to `12.33.0` and set the Node.js requirement to `>=22`.
- Added private-by-default container auto-creation with cached `createIfNotExists` handling.
- Normalised SAS token, boolean, path, service URL, and CDN URL handling.
- Cleaned the lockfile so Strapi peer dependencies are not locked into the package dependency tree.
