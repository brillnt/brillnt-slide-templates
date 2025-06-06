# PDF Conversion

This repository includes automated PDF conversion using Puppeteer for high-quality slide exports.

## Quick Start

```bash
# Install dependencies
npm install

# Convert discovery planning template to PDFs
npm run convert:discovery

# Convert all templates
npm run convert:all
```

## Available Scripts

- `npm run convert` - Run the conversion script with custom arguments
- `npm run convert:discovery` - Convert Discovery & Planning template
- `npm run convert:all` - Convert all available templates

## Manual Conversion

```bash
# Convert specific template directory
node scripts/convert-to-pdf.js templates/discovery-planning pdfs/output

# Convert single slide
node scripts/convert-to-pdf.js templates/discovery-planning/cover.html cover.pdf
```

## Output

PDFs are generated in the `pdfs/` directory with the same structure as your templates:

```
pdfs/
└── discovery-planning/
    ├── cover.pdf
    ├── title_overview.pdf
    ├── what_you_get.pdf
    └── agreement_next_steps.pdf
```

## PDF Quality

The conversion uses Puppeteer with Chrome's rendering engine for:
- Perfect CSS support (Tailwind, Flexbox, Grid)
- Proper font rendering (Inter from Google Fonts)
- High-quality graphics and layouts
- Print-optimized output

## Customization

Edit `scripts/convert-to-pdf.js` to adjust:
- Page size and orientation
- Margins and spacing
- Print quality settings
- Output naming conventions

