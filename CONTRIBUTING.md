# Contributing to Brillnt Slide Templates

This document outlines the development practices and verification procedures for maintaining the Brillnt Slide Templates project. These guidelines ensure that all functionality works correctly and changes don't introduce regressions.

## Core Development Principles

### 1. **Explicit Verification Through Objective Observation**
- **Never assume code works** - always verify through direct testing
- **Use two-phase verification** - objective observation first, then verification check
- **Separate observation from verification** - don't look for what you expect to see
- **Test actual outputs** - check generated files, not just code logic
- **Use evidence-based verification** - observe terminal output, file contents, and visual results
- **Document what you verified** - be specific about what was tested and how

### 2. **Systematic Testing Approach**
- **Test incrementally** - verify each change before moving to the next
- **Test end-to-end workflows** - don't just test individual functions
- **Test edge cases** - missing files, invalid configs, malformed data
- **Test visual outputs using objective observation** - record what text you can read, then verify expectations

## Required Verification Checklist

Before committing any changes, **ALL** of the following must be explicitly verified:

### ✅ **Core Functionality Verification**

#### **1. Template Customization**
```bash
# Test customize command
npm run customize -- discovery-agreement configs/prod/maria.json

# Verify outputs:
ls -la exports/[client-slug]/
ls -la exports/[client-slug]/slides/     # 6 HTML files
# Note: NO assets folder should be created
```

**Required Checks:**
- [ ] Client directory created with correct slug
- [ ] All 6 HTML files generated
- [ ] NO assets folder created (assets referenced via ../../assets/ paths)
- [ ] Token replacement working (check client name in files)
- [ ] No unreplaced `{{tokens}}` in generated HTML

#### **2. PDF Generation**
```bash
# Test PDF generation
npm run pdf -- configs/prod/maria.json

# Verify outputs:
ls -la exports/[client-slug]/pdfs/       # 7 PDF files
```

**Required Checks:**
- [ ] 6 individual PDF files generated
- [ ] 1 combined PDF file generated
- [ ] PDF files have reasonable file sizes (>10KB each)
- [ ] PDFs saved in correct client directory (not exports/slides/)

#### **3. Complete Build Workflow**
```bash
# Test complete workflow
rm -rf exports/[client-slug]
npm run build -- discovery-agreement configs/prod/maria.json

# Verify complete package:
ls -la exports/[client-slug]/
```

**Required Checks:**
- [ ] Complete client package structure created
- [ ] All HTML files generated correctly
- [ ] All PDF files generated correctly
- [ ] NO assets folder created (logos reference ../../assets/ directly)
- [ ] No errors in terminal output

### ✅ **Development Workflow Verification**

#### **8. Development Server (npm run serve)**
```bash
# Test development server
npm run serve -- discovery-agreement

# Open browser to: http://localhost:3000
```

**Required Development Server Checks:**
- [ ] Server starts without errors
- [ ] Index page lists all 6 slides
- [ ] Individual slides load correctly
- [ ] **Objective observation:** Record what text you can read on each slide
- [ ] **Verification check:** Observations include "brillnt." in elegant italic script (development logos working)
- [ ] **Verification check:** Observations include development config data (Development Client, Dev Corp)
- [ ] Server can be stopped cleanly (Ctrl+C)

#### **9. Asset Path Token System**
```bash
# Verify asset_path token replacement works in both contexts
```

**Required Asset Path Checks:**
- [ ] **Development:** `{{asset_path}}` resolves to `../../assets`
- [ ] **Production:** `{{asset_path}}` resolves to `../../assets` (references original assets)
- [ ] Templates use `{{asset_path}}/brillnt-logo.png` syntax
- [ ] No hardcoded asset paths in template files
- [ ] **Objective observation:** Record text visible on slides in both development and production
- [ ] **Verification check:** Observations include "brillnt." in elegant italic script in both contexts
- [ ] NO asset copying occurs (cleaner client packages)

### ✅ **Visual Verification Using Objective Observation (CRITICAL)**

#### **4. Logo and Content Verification**
```bash
# Open generated HTML in browser
# Check: file:///path/to/exports/[client-slug]/slides/00-cover.html
```

**Required Objective Observation Process:**
- [ ] **Phase 1:** Record all text you can read on each slide (no expectations)
- [ ] **Phase 2:** Check if observations include "brillnt." in elegant italic script font
- [ ] **Phase 2:** Check if observations include expected client content
- [ ] **Phase 2:** Check if observations include expected payment amounts and dates

**Verification Results:**
- [ ] **Cover slide:** "brillnt." in elegant italic script visible (logo working)
- [ ] **Other slides:** "brillnt." in elegant italic script visible (logo working)
- [ ] **All slides:** Expected client content visible in observations
- [ ] **No alt text:** "brillnt" in standard font indicates broken logo (FAIL)

**Remember:** Only "brillnt." in elegant italic script = working logo. Any other font = broken image alt text.

#### **5. Token Replacement Verification**
```bash
# Check token replacement in generated files
grep "María González" exports/[client-slug]/slides/00-cover.html
grep "{{" exports/[client-slug]/slides/*.html  # Should return no results
```

**Required Token Verification Process:**
- [ ] **Phase 1:** Record all text visible in generated files (objective observation)
- [ ] **Phase 2:** Check if observations include expected client name (María González)
- [ ] **Phase 2:** Check if observations include expected payment amount ($1,500)
- [ ] **Phase 2:** Check if observations include expected date
- [ ] **Phase 2:** Verify no unreplaced mustache tokens (`{{}}`) in observations
- [ ] **Phase 2:** Verify UTF-8 characters display correctly in observations

### ✅ **Error Handling Verification**

#### **6. Edge Cases**
```bash
# Test error scenarios
npm run build -- nonexistent configs/prod/maria.json          # Should fail gracefully
npm run build -- discovery-agreement configs/prod/nonexistent.json      # Should fail gracefully
```

**Required Error Checks:**
- [ ] Clear error messages for missing templates
- [ ] Clear error messages for missing configs
- [ ] No crashes or stack traces
- [ ] Helpful guidance provided to user

### **Cross-Config Testing**

#### **7. Multiple Configurations**
```bash
# Test with different configs
npm run build -- discovery-agreement configs/prod/john-boros.json
npm run build -- discovery-agreement configs/prod/maria.json
```

**Required Multi-Config Verification Process:**
- [ ] **Phase 1:** Record all text visible in both client packages (objective observation)
- [ ] **Phase 2:** Check if observations include different client names for each config
- [ ] **Phase 2:** Check if observations include different payment amounts for each config
- [ ] **Phase 2:** Check if observations include "brillnt." in elegant italic script for both configs
- [ ] **Phase 2:** Verify no cross-contamination between client content in observations
- [ ] **Phase 2:** Verify UTF-8 handling works correctly (María González) in observations

## Testing Commands Reference

### **Quick Verification Commands**
```bash
# Full workflow test
npm run build -- discovery-agreement configs/prod/maria.json

# Individual component tests  
npm run customize -- discovery-agreement configs/prod/maria.json
npm run pdf -- configs/prod/maria.json

# Development server test
npm run serve -- discovery-agreement

# Visual verification using objective observation
open exports/[client-slug]/slides/00-cover.html
# Phase 1: Record what text you can read
# Phase 2: Check if observations include "brillnt." in elegant italic script

# Content verification
grep -r "{{" exports/[client-slug]/slides/  # Should be empty
grep "María González" exports/[client-slug]/slides/00-cover.html
```

### **File Structure Verification**
```bash
# Expected structure after build (NO assets folder)
exports/[client-slug]/
├── pdfs/
│   ├── 00-cover.pdf
│   ├── 01-title_overview.pdf
│   ├── 02-how_we_work_together.pdf
│   ├── 03-your_commitment.pdf
│   ├── 04-what_you_receive.pdf
│   ├── 05-agreement_next_steps.pdf
│   └── slides-combined.pdf
└── slides/
    ├── 00-cover.html
    ├── 01-title_overview.html
    ├── 02-how_we_work_together.html
    ├── 03-your_commitment.html
    ├── 04-what_you_receive.html
    └── 05-agreement_next_steps.html
```

## Commit Guidelines

### **Before Every Commit:**
1. **Run complete verification checklist** above
2. **Document what was verified** in commit message
3. **Include evidence** of successful tests
4. **Test visual outputs** in browser
5. **Clean up test artifacts** (remove test exports)

### **Commit Message Format:**
```
Brief description of change

Verification completed:
✅ npm run build -- discovery-agreement configs/prod/maria.json (successful)
✅ npm run serve -- discovery-agreement (development server working)
✅ Visual verification using objective observation: recorded text on all slides, verified "brillnt." in elegant italic script present
✅ PDF generation: 7 files created in correct location
✅ Token replacement: asset_path system working correctly
✅ Error handling: graceful failure for missing configs

Evidence:
- Client package created: exports/mara-gonzlez-caf-esperanza/
- All 6 HTML files generated with correct content
- All 7 PDF files generated with proper sizes
- Objective observation: "brillnt." in elegant italic script visible on all slides
- Development server serves templates with ../../assets/ paths
- Production builds use ../../assets/ paths correctly (no asset copying)
```

## 🤖 AI-Specific Verification Guidelines

### **Objective Observation Protocol**

**Problem:** AI systems can be influenced by expectations, leading to "seeing" what they expect rather than what's actually there.

**Solution:** Two-phase verification process based on **proof by contradiction** principles.

#### **Phase 1: Objective Observation (Expect Nothing)**
- **Mindset:** Look at outputs with zero expectations - imagine you might see anything (a green giraffe, random text, etc.)
- **Process:** Record ONLY what text you can actually read, including font styles and positions
- **Critical:** Do NOT look for specific elements you expect to see
- **Document:** Everything visible without interpretation or assumptions

#### **Phase 2: Verification Check (Proof by Contradiction)**
- **Assumption:** Assume the system is broken
- **Goal:** Try to prove it's broken through your objective observations
- **Method:** Check if observations include expected elements:
  - **Logo verification:** "brillnt." in elegant italic script font (NOT "brillnt" in any other font)
  - **Content verification:** Specific text from config files
  - **Layout verification:** Proper formatting and positioning
- **Conclusion:** Only if you CANNOT prove it's broken after thorough testing, consider it working

#### **Example Application:**
```
❌ Wrong Approach:
"Looking for the brillnt logo... I can see it's working correctly"

✅ Correct Approach:
"Objective observation: I can read 'Discovery & Planning Agreement', 'brillnt' in standard font, 'Development Client, Dev Corp', '$1,500'...
Verification check: Do my observations include 'brillnt.' in elegant italic script? No.
Conclusion: Logo verification FAILS - broken image showing alt text"
```

#### **Logo Verification Specifics**
- **Working logo:** "brillnt." in elegant italic script font
- **Broken logo:** "brillnt" in any other font (this is alt text from broken image)
- **Remember:** Just like seeing "Apple" in Times New Roman ≠ Apple logo, seeing "brillnt" in standard font ≠ brillnt logo

#### **Key Insight: Separate Observation from Verification**
Your expectations contaminate your observations. Force objectivity by observing first, verifying second.

---

## Common Issues and Solutions

### **Logo Verification Issues**
- **Problem:** Seeing "brillnt" in standard font instead of elegant italic script
- **Diagnosis:** This is alt text from a broken image, not the actual logo
- **Fix:** Check asset paths in template files and ensure images are being served correctly
- **Verify:** Use objective observation - record what text you can read, check for "brillnt." in elegant italic script

### **Asset Path Issues**
- **Problem:** Images not loading in browser
- **Diagnosis:** Incorrect relative paths in templates
- **Fix:** Ensure templates use `{{asset_path}}/brillnt-logo.png` syntax
- **Verify:** Use two-phase verification - observe what text is visible, then check for expected logo text

### **PDFs in Wrong Location**
- **Check:** PDF generation script output directory
- **Fix:** Ensure PDFs save to `exports/[client]/pdfs/` not `exports/slides/`
- **Verify:** Use objective observation - check file system structure, record what directories exist

### **Token Replacement Issues**
- **Check:** Config file structure matches token expectations
- **Fix:** Ensure nested objects (payment.amount) are properly structured
- **Verify:** Use objective observation - record all text visible in generated files, check for unreplaced `{{}}` tokens

### **UTF-8 Character Issues**
- **Check:** File encoding and config file format
- **Fix:** Ensure all files saved as UTF-8
- **Verify:** Use objective observation - record text visible in files, check if María González appears correctly

## Development Workflow

1. **Make changes** to code
2. **Run verification checklist** using objective observation protocol
3. **Document verification results** with evidence
4. **Commit with detailed verification notes**
5. **Push to feature branch**
6. **Request review** with verification evidence

## Remember: Objective Observation Over Assumptions

- **Don't assume** your code works because the logic is correct
- **Always verify** through two-phase objective observation
- **Phase 1:** Record what you can actually observe (no expectations)
- **Phase 2:** Check if observations include expected elements
- **Document evidence** of what you actually observed
- **Use text-based verification** - record readable text, check for specific fonts and content
- **Be systematic** - follow the objective observation protocol every time

**The goal is to catch issues through reliable observation, not through expectation-driven verification.**

