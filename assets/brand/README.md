# Brand Assets

This folder contains the repo brand assets for `strapi-provider-upload-azure-clean`.

## Palette

| Token | Hex | Use |
|---|---:|---|
| Azure blue | `#0078D4` | Storage container and primary brand field |
| Strapi indigo | `#4945FF` | Directional/upload accent |
| Ink | `#0F172A` | Text and subtle shadow strokes |
| Surface | `#F8FAFC` | Background |
| Success green | `#10B981` | Clean link/path motif |

## Files

- `icon.svg`: editable vector source.
- `icon-128.png`, `icon-256.png`, `icon-512.png`: square PNG exports for repo and documentation use.
- `social-preview.png`: 1280 by 640 GitHub social preview artwork.

## Usage

- Use `icon.svg` for source edits.
- Use the PNG icons in README and social previews where SVG support is inconsistent.
- Keep the icon legible at 32px by preserving the storage container, green clean-link path, and indigo upload arrow.
- Keep brand assets outside `package.json.files` so they do not ship in the npm tarball.

## Export Notes

The PNG files should be regenerated from the same flat geometry as `icon.svg` whenever the source changes. Keep the social preview under 1 MB so it can be uploaded in GitHub repository settings.
