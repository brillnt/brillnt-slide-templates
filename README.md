# Brillnt Slide Templates

Professional slide templates for client presentations, built with HTML/CSS and optimized for PDF export.

## 🎯 Overview

This repository contains reusable slide templates that maintain Brillnt's Apple-inspired design aesthetic. Each template is built with clean HTML/CSS and can be easily customized for different clients and projects.

## 📁 Repository Structure

```
brillnt-slide-templates/
├── README.md                    # This file
├── assets/                      # Logo files and other assets
│   ├── brillnt-logo.png        # White logo for dark backgrounds
│   └── brillnt-logo--black.png # Black logo for light backgrounds
├── css/
│   └── shared-styles.css        # Common styles across all templates
└── templates/
    └── discovery-planning/      # Discovery & Planning Agreement slides
        ├── cover.html          # Cover slide with logo
        ├── title_overview.html # Title and investment overview
        ├── what_you_get.html   # Deliverables and commitments
        └── agreement_next_steps.html # Terms and signature
```

## 🎨 Design System

### **Brand Colors**
- **Primary:** Black (#000000)
- **Secondary:** White (#ffffff) 
- **Accent:** Light Gray (#F9FAFB, #6B7280)

### **Typography**
- **Font:** Inter (Google Fonts)
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Hierarchy:** Title (600), Section (600), Subtitle (500), Body (400)

### **Logo Usage**
- **White logo** (`brillnt-logo.png`) for dark backgrounds
- **Black logo** (`brillnt-logo--black.png`) for light backgrounds
- **Sizes:** Header (32px), Cover (64px), Large (96px)

## 🚀 Quick Start

### **1. Clone the Repository**
```bash
git clone https://github.com/brillnt/brillnt-slide-templates.git
cd brillnt-slide-templates
```

### **2. Customize for Your Client**
1. Navigate to the template you want to use (e.g., `templates/discovery-planning/`)
2. Edit the HTML files with your client's information:
   - Replace `[Client Name]` with actual client name
   - Replace `[Date]` with project date
   - Update any project-specific content

### **3. Preview Your Changes**
- Open any HTML file in your web browser
- All styles and assets are linked relatively
- Test in Chrome/Safari for best PDF export results

### **4. Export to PDF**
Choose your preferred method:

#### **Option A: Browser Print-to-PDF**
1. Open the HTML file in Chrome or Safari
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
3. Select "Save as PDF"
4. Choose "More settings" → "Paper size: A4" or "Letter"
5. Set margins to "Minimum" for best results

#### **Option B: Via Manus Chat**
1. Upload your HTML files to the chat
2. Request PDF export
3. Download the generated PDF

#### **Option C: Command Line (Advanced)**
```bash
# Using Puppeteer (requires Node.js)
npx puppeteer print cover.html cover.pdf

# Using wkhtmltopdf
wkhtmltopdf --page-size A4 --orientation Landscape cover.html cover.pdf
```

## 📝 Editing Guidelines

### **Client Information**
Always update these placeholders:
- `[Client Name]` → Actual client name
- `[Date]` → Project date
- `[Project Name]` → Specific project title (if applicable)

### **Content Customization**
- **Investment amounts:** Update pricing as needed
- **Timeline:** Adjust project duration
- **Terms:** Modify agreement terms for specific projects
- **Contact info:** Ensure current contact information

### **Asset Paths**
All asset paths are relative to the template folder:
```html
<!-- Correct path from template folder -->
<img src="../../assets/brillnt-logo--black.png" alt="brillnt.">
```

## 🔧 Creating New Templates

### **1. Create Template Folder**
```bash
mkdir templates/your-new-template
```

### **2. Copy Base Structure**
```bash
cp templates/discovery-planning/cover.html templates/your-new-template/
# Edit as needed
```

### **3. Update Asset Paths**
Ensure all asset references point to the correct location:
```html
<img src="../../assets/brillnt-logo--black.png" alt="brillnt.">
<link rel="stylesheet" href="../../css/shared-styles.css">
```

### **4. Follow Design System**
- Use shared CSS classes from `shared-styles.css`
- Maintain consistent typography hierarchy
- Follow the Apple-inspired aesthetic
- Keep layouts clean and minimal

## 📋 Template Checklist

Before using any template:
- [ ] Client name updated
- [ ] Date updated  
- [ ] Investment amounts correct
- [ ] Contact information current
- [ ] All placeholder text replaced
- [ ] Asset paths working
- [ ] Tested in browser
- [ ] PDF export tested

## 🎯 Available Templates

### **Discovery & Planning Agreement**
**Purpose:** Client agreement for project planning phase  
**Slides:** 4 (Cover, Overview, Deliverables, Agreement)  
**Use case:** Initial client engagement and planning phase setup

*More templates coming soon...*

## 🔄 Version Control

### **Making Changes**
```bash
# Make your edits
git add .
git commit -m "Update discovery template for [Client Name]"
git push origin main
```

### **Creating Client-Specific Branches**
```bash
# Create branch for specific client
git checkout -b client/john-boros
# Make client-specific changes
git commit -m "Customize for John Boros project"
```

## 🛠 Troubleshooting

### **Assets Not Loading**
- Check file paths are relative to the HTML file location
- Ensure asset files exist in the `assets/` folder
- Verify file names match exactly (case-sensitive)

### **PDF Export Issues**
- Use Chrome or Safari for best results
- Set print margins to "Minimum"
- Choose landscape orientation for slide format
- Test with "Print Preview" before saving

### **Styling Problems**
- Ensure `shared-styles.css` is linked correctly
- Check for typos in CSS class names
- Verify Tailwind CSS CDN is loading
- Test in incognito/private browsing mode

## 📞 Support

For questions about these templates:
- **Email:** hello@brillnt.com
- **Phone:** (313) 286-5990

## 📄 License

These templates are proprietary to Brillnt, LLC. Internal use only.

---

*Last updated: June 6, 2025*

