# Brillnt Slide Templates

Professional slide templates for client presentations with automated token replacement, development workflows, and PDF generation.

## 🎯 Overview

This repository provides a modern, automated system for creating client presentations using reusable slide templates. Built with HTML/CSS and featuring token-based customization, the system generates professional PDFs while maintaining Brillnt's Apple-inspired design aesthetic.

**Key Features:**
- **Token-based customization** - No manual editing required
- **Development server** - Live preview with hot reload
- **Automated PDF generation** - Professional-quality exports
- **Config-driven workflow** - JSON-based client configurations
- **Clean client packages** - Self-contained presentation files
- **Asset path management** - Dynamic asset referencing

## 📁 Repository Structure

```
brillnt-slide-templates/
├── README.md                    # This documentation
├── CONTRIBUTING.md              # Development guidelines and verification procedures
├── package.json                 # Dependencies and npm scripts
├── .gitignore                   # Git ignore patterns
├── assets/                      # Logo files and shared assets
│   ├── brillnt-logo.png        # White logo for dark backgrounds
│   └── brillnt-logo--black.png # Black logo for light backgrounds
├── configs/                     # Client configuration files
│   ├── dev/                     # Development configurations
│   │   └── discovery-agreement.json
│   └── prod/                    # Production client configurations
│       ├── maria.json
│       └── john-boros.json
├── templates/                   # Template directories
│   └── discovery-agreement/     # Discovery & Planning Agreement template
│       ├── 00-cover.html       # Cover slide with logo and client name
│       ├── 01-title_overview.html # Title and investment overview
│       ├── 02-how_we_work_together.html # Process and collaboration
│       ├── 03-your_commitment.html # Client responsibilities
│       ├── 04-what_you_receive.html # Deliverables and outcomes
│       └── 05-agreement_next_steps.html # Terms and next steps
├── scripts/                     # Build and development scripts
│   ├── build.js                # Complete workflow (customize + PDF)
│   ├── customize.js            # Template customization with token replacement
│   ├── generate-pdf.js         # PDF generation from HTML slides
│   ├── serve.js                # Development server for template preview
│   ├── lib/                    # Shared utilities
│   │   ├── config.js           # Configuration processing
│   │   ├── pdf.js              # PDF generation utilities
│   │   ├── template.js         # Template resolution and processing
│   │   └── utils.js            # Common utilities
│   └── token-replacement/      # Token replacement system
│       ├── index.js            # Main template processor
│       ├── config-validator.js # Configuration validation
│       ├── template-processor.js # Template processing logic
│       ├── token-extractor.js  # Token extraction from templates
│       └── token-replacer.js   # Token replacement engine
├── tests/                       # Test infrastructure
│   ├── fixtures/               # Test data and expected outputs
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
├── exports/                     # Generated client packages (git ignored)
│   └── [client-slug]/          # Individual client presentation packages
│       ├── slides/             # Customized HTML slides
│       └── pdfs/               # Generated PDF files
└── temp/                        # Development server temporary files (git ignored)
```

## 🎨 Design System

### **Brand Colors**
- **Primary:** Black (#000000)
- **Secondary:** White (#ffffff) 
- **Accent:** Light Gray (#F9FAFB, #6B7280)

### **Typography**
- **Font:** Inter (Google Fonts)
- **Weights:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Hierarchy:** Title (600), Section (600), Subtitle (500), Body (400)

### **Logo Usage**
- **White logo** (`brillnt-logo.png`) for dark backgrounds
- **Black logo** (`brillnt-logo--black.png`) for light backgrounds
- **Dynamic paths** using `{{asset_path}}` token system

## 🚀 Quick Start

### **1. Clone and Setup**
```bash
git clone https://github.com/brillnt/brillnt-slide-templates.git
cd brillnt-slide-templates
npm install
```

### **2. Development Workflow**
Preview templates during development:
```bash
# Start development server
npm run serve -- discovery-agreement

# Open browser to: http://localhost:3000
# Live preview with development configuration
```

### **3. Production Workflow**
Generate client presentations:
```bash
# Complete workflow (customize + PDF generation)
npm run build -- discovery-agreement configs/prod/maria.json

# Output: exports/mara-gonzlez-caf-esperanza/
#   ├── slides/     # Customized HTML files
#   └── pdfs/       # Individual + combined PDFs
```

### **4. Individual Commands**
```bash
# Template customization only
npm run customize -- discovery-agreement configs/prod/maria.json

# PDF generation only (after customization)
npm run pdf -- configs/prod/maria.json
```

## ⚙️ Configuration System

### **Config File Structure**
Client configurations use JSON format with nested objects:

```json
{
  "client_name": "María González, Café Esperanza",
  "date": "June 7, 2025",
  "payment": {
    "amount": "$1,500",
    "description": "Planning Phase Investment",
    "link": "https://bonsai.com/pay/keylight-discovery",
    "provider": "Bonsai"
  }
}
```

### **Token System**
Templates use mustache-style tokens that are automatically replaced:

| Token | Description | Example |
|-------|-------------|---------|
| `{{client_name}}` | Client name and company | "María González, Café Esperanza" |
| `{{date}}` | Project date | "June 7, 2025" |
| `{{payment.amount}}` | Investment amount | "$1,500" |
| `{{payment.description}}` | Payment description | "Planning Phase Investment" |
| `{{payment.link}}` | Payment URL | "https://bonsai.com/pay/..." |
| `{{payment.provider}}` | Payment provider | "Bonsai" |
| `{{asset_path}}` | Dynamic asset path | "../../assets" (system-managed) |

### **Config Locations**
- **Development:** `configs/dev/` - For template development and testing
- **Production:** `configs/prod/` - For actual client presentations

## 🛠 Development Workflow

### **Template Development**
```bash
# Start development server
npm run serve -- discovery-agreement

# Features:
# - Live preview at http://localhost:3000
# - Development configuration automatically loaded
# - Asset paths resolve to project root
# - No file generation (served in-memory)
```

### **Creating New Configs**
```bash
# Copy existing config
cp configs/prod/maria.json configs/prod/new-client.json

# Edit with client-specific information
# Test with development server
npm run serve -- discovery-agreement
```

### **Template Modification**
1. Edit template files in `templates/discovery-agreement/`
2. Use `{{token}}` syntax for dynamic content
3. Use `{{asset_path}}/filename.png` for images
4. Test with development server
5. Verify with production build

## 🏗 Production Workflow

### **Client Package Generation**
```bash
# Generate complete client package
npm run build -- discovery-agreement configs/prod/client.json

# Output structure:
exports/client-slug/
├── slides/                    # Customized HTML files
│   ├── 00-cover.html         # All tokens replaced
│   ├── 01-title_overview.html
│   └── ...
└── pdfs/                     # Generated PDFs
    ├── 00-cover.pdf          # Individual slide PDFs
    ├── 01-title_overview.pdf
    ├── ...
    └── slides-combined.pdf   # All slides in one PDF
```

### **Client Slug Generation**
Client names are automatically converted to URL-safe slugs:
- "María González, Café Esperanza" → `mara-gonzlez-caf-esperanza`
- "John Boros, Keylight Development" → `john-boros-keylight-development`

### **Asset Path Resolution**
- **Development:** `{{asset_path}}` → `../../assets` (temp to project root)
- **Production:** `{{asset_path}}` → `../../assets` (exports/client/slides to project root)
- **No asset copying** - templates reference original assets directly

## 📋 Available Templates

### **Discovery Agreement** (`discovery-agreement`)
**Purpose:** Client agreement for project discovery and planning phase  
**Slides:** 6 slides (Cover, Overview, Process, Commitment, Deliverables, Agreement)  
**Use case:** Initial client engagement and planning phase setup  
**Required tokens:** `client_name`, `date`, `payment.*`

**Template files:**
- `00-cover.html` - Cover slide with logo and client name
- `01-title_overview.html` - Title and investment overview  
- `02-how_we_work_together.html` - Process and collaboration details
- `03-your_commitment.html` - Client responsibilities and expectations
- `04-what_you_receive.html` - Deliverables and outcomes
- `05-agreement_next_steps.html` - Terms, signatures, and next steps

## 🔧 Creating New Templates

### **1. Template Directory Structure**
```bash
# Create new template directory
mkdir templates/your-new-template

# Copy base structure from existing template
cp templates/discovery-agreement/* templates/your-new-template/
```

### **2. Template File Naming**
Use numbered prefixes for proper ordering:
- `00-cover.html` - Cover slide
- `01-title.html` - Title/overview
- `02-content.html` - Main content slides
- `99-final.html` - Final/signature slide

### **3. Token Integration**
```html
<!-- Use tokens for dynamic content -->
<h1>{{client_name}}</h1>
<p>Date: {{date}}</p>

<!-- Use asset_path token for images -->
<img src="{{asset_path}}/brillnt-logo.png" alt="brillnt">

<!-- Support nested object tokens -->
<span>{{payment.amount}}</span>
<a href="{{payment.link}}">Pay Now</a>
```

### **4. Development Config**
Create development configuration:
```bash
# Create dev config for new template
cp configs/dev/discovery-agreement.json configs/dev/your-new-template.json

# Edit with appropriate test data
# Test with: npm run serve -- your-new-template
```

## 📖 API Reference

### **npm Scripts**

#### **`npm run serve -- <template-name>`**
Start development server for template preview
- **Arguments:** Template directory name
- **Config:** Automatically loads `configs/dev/<template-name>.json`
- **Output:** HTTP server at `http://localhost:3000`
- **Features:** Live preview, development asset paths

#### **`npm run build -- <template> <config>`**
Complete workflow: customize templates and generate PDFs
- **Arguments:** Template name, config file path
- **Output:** Complete client package in `exports/`
- **Includes:** HTML slides, individual PDFs, combined PDF

#### **`npm run customize -- <template> <config>`**
Template customization with token replacement
- **Arguments:** Template name, config file path  
- **Output:** Customized HTML files in `exports/<client-slug>/slides/`
- **Features:** Token replacement, asset path resolution

#### **`npm run pdf -- <config>`**
PDF generation from existing HTML slides
- **Arguments:** Config file path
- **Input:** HTML files in `exports/<client-slug>/slides/`
- **Output:** PDF files in `exports/<client-slug>/pdfs/`

### **Template and Config Resolution**

#### **Template Shortcuts**
- `discovery` → `discovery-agreement`
- `agreement` → `discovery-agreement`
- `planning` → `discovery-agreement`

#### **Config Resolution**
- `maria` → `configs/prod/maria.json`
- `john-boros` → `configs/prod/john-boros.json`
- `configs/prod/client.json` → Direct path

### **Command Examples**
```bash
# Using shortcuts
npm run build -- discovery maria
npm run build -- agreement john-boros

# Using full paths
npm run build -- discovery-agreement configs/prod/maria.json
npm run customize -- discovery-agreement configs/dev/discovery-agreement.json
```

## 🧪 Testing and Verification

### **Manual Verification**
```bash
# Test complete workflow
npm run build -- discovery-agreement configs/prod/maria.json

# Verify outputs
ls -la exports/mara-gonzlez-caf-esperanza/
ls -la exports/mara-gonzlez-caf-esperanza/slides/    # 6 HTML files
ls -la exports/mara-gonzlez-caf-esperanza/pdfs/     # 7 PDF files

# Visual verification
open exports/mara-gonzlez-caf-esperanza/slides/00-cover.html
```

### **Development Guidelines**
See [CONTRIBUTING.md](CONTRIBUTING.md) for comprehensive development guidelines including:
- Explicit verification procedures
- Visual testing requirements
- Error handling verification
- Cross-config testing procedures

### **Test Infrastructure**
```bash
# Run basic infrastructure tests
npm test

# Individual test categories (when implemented)
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🔍 Troubleshooting

### **Token Replacement Issues**
```bash
# Check for unreplaced tokens
grep -r "{{" exports/client-slug/slides/

# Common issues:
# - Missing token in config file
# - Typo in token name
# - Nested object path incorrect (payment.amount)
```

### **Asset Path Problems**
```bash
# Verify asset files exist
ls -la assets/

# Check asset_path token resolution
# Development: {{asset_path}} → ../../assets
# Production: {{asset_path}} → ../../assets

# Visual verification: logos should display in browser
```

### **Development Server Issues**
```bash
# Port already in use
pkill -f "node.*serve"
npm run serve -- discovery-agreement

# Config file not found
ls -la configs/dev/discovery-agreement.json

# Template directory not found
ls -la templates/discovery-agreement/
```

### **PDF Generation Problems**
```bash
# Check HTML files exist first
ls -la exports/client-slug/slides/

# Verify PDF output directory
ls -la exports/client-slug/pdfs/

# Check for PDF generation errors in terminal output
```

### **Config Validation Errors**
```bash
# Validate JSON syntax
cat configs/prod/client.json | python -m json.tool

# Check required fields
# - client_name (string)
# - date (string)  
# - payment.amount (string)
# - payment.description (string)
# - payment.link (string)
# - payment.provider (string)
```

## 🔄 Migration Guide

### **From Manual Template System**
If migrating from the old manual editing system:

1. **Convert placeholders to tokens:**
   ```html
   <!-- Old -->
   [Client Name] → {{client_name}}
   [Date] → {{date}}
   [Investment Amount] → {{payment.amount}}
   
   <!-- New -->
   <h1>{{client_name}}</h1>
   <p>{{date}}</p>
   <span>{{payment.amount}}</span>
   ```

2. **Update asset paths:**
   ```html
   <!-- Old -->
   <img src="../../assets/brillnt-logo.png">
   
   <!-- New -->
   <img src="{{asset_path}}/brillnt-logo.png">
   ```

3. **Create config files:**
   ```bash
   # Create client config from existing project
   cp configs/prod/maria.json configs/prod/new-client.json
   # Edit with client-specific data
   ```

4. **Test with new system:**
   ```bash
   npm run build -- discovery-agreement configs/prod/new-client.json
   ```

## 🛡 Development Standards

### **Code Standards**
- **ES Modules (ESM)** - All scripts use `import/export`
- **Token-based templates** - No hardcoded client data
- **Config-driven** - All customization via JSON configs
- **Systematic verification** - Explicit testing of all outputs

### **File Naming Conventions**
- **Templates:** `00-name.html` (numbered for ordering)
- **Configs:** `client-name.json` (kebab-case)
- **Scripts:** `action-name.js` (kebab-case)

### **Asset Management**
- **Single source of truth** - Assets in `/assets/` directory
- **Dynamic paths** - Use `{{asset_path}}` token
- **No duplication** - Templates reference original assets

## 📞 Support

For questions about this template system:
- **Email:** hello@brillnt.com
- **Phone:** (313) 286-5990
- **Documentation:** See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

## 📄 License

These templates are proprietary to Brillnt, LLC. Internal use only.

---

*Last updated: June 7, 2025*
*System version: 2.0 (Token-based automation)*

