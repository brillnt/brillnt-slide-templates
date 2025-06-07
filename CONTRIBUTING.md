# Contributing to Brillnt Slide Templates

This document outlines the development practices and verification procedures for maintaining the Brillnt Slide Templates project. These guidelines ensure that all functionality works correctly and changes don't introduce regressions.

## Core Development Principles

### 1. **Explicit Verification Through Observation**
- **Never assume code works** - always verify through direct testing
- **Test actual outputs** - check generated files, not just code logic
- **Use evidence-based verification** - observe terminal output, file contents, and visual results
- **Document what you verified** - be specific about what was tested and how

### 2. **Systematic Testing Approach**
- **Test incrementally** - verify each change before moving to the next
- **Test end-to-end workflows** - don't just test individual functions
- **Test edge cases** - missing files, invalid configs, malformed data
- **Test visual outputs** - ensure images, layouts, and styling work correctly

## Required Verification Checklist

Before committing any changes, **ALL** of the following must be explicitly verified:

### ✅ **Core Functionality Verification**

#### **1. Template Customization**
```bash
# Test customize command
npm run customize -- discovery maria

# Verify outputs:
ls -la exports/[client-slug]/
ls -la exports/[client-slug]/slides/     # 6 HTML files
ls -la exports/[client-slug]/assets/     # Logo files copied
```

**Required Checks:**
- [ ] Client directory created with correct slug
- [ ] All 6 HTML files generated
- [ ] Assets copied to client package
- [ ] Token replacement working (check client name in files)
- [ ] No unreplaced `{{tokens}}` in generated HTML

#### **2. PDF Generation**
```bash
# Test PDF generation
npm run pdf -- maria

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
npm run build -- discovery maria

# Verify complete package:
ls -la exports/[client-slug]/
```

**Required Checks:**
- [ ] Complete client package structure created
- [ ] All HTML files generated correctly
- [ ] All PDF files generated correctly
- [ ] Assets copied correctly
- [ ] No errors in terminal output

### ✅ **Visual Verification (CRITICAL)**

#### **4. Image Assets Display Correctly**
```bash
# Open generated HTML in browser
# Check: file:///path/to/exports/[client-slug]/slides/00-cover.html
```

**Required Visual Checks:**
- [ ] **White brillnt logo displays** on cover slide (black background)
- [ ] **Black brillnt logo displays** on other slides (white background)
- [ ] **No broken image icons** visible
- [ ] **Logos are properly sized** and positioned
- [ ] **All slides load without visual errors**

**Common Issues to Check:**
- Image paths pointing to wrong directory (`../../assets/` vs `../assets/`)
- Missing asset files in client package
- Broken relative paths after directory structure changes

#### **5. Content Verification**
```bash
# Check token replacement in generated files
grep "María González" exports/[client-slug]/slides/00-cover.html
grep "{{" exports/[client-slug]/slides/*.html  # Should return no results
```

**Required Content Checks:**
- [ ] Client name appears correctly in all slides
- [ ] Payment amount displays correctly ($1,500)
- [ ] Date displays correctly (current date)
- [ ] No unreplaced mustache tokens (`{{}}`) remain
- [ ] UTF-8 characters display correctly (María, Café)

### ✅ **Error Handling Verification**

#### **6. Edge Cases**
```bash
# Test error scenarios
npm run build -- nonexistent maria          # Should fail gracefully
npm run build -- discovery nonexistent      # Should fail gracefully
```

**Required Error Checks:**
- [ ] Clear error messages for missing templates
- [ ] Clear error messages for missing configs
- [ ] No crashes or stack traces
- [ ] Helpful guidance provided to user

### ✅ **Cross-Config Testing**

#### **7. Multiple Configurations**
```bash
# Test with different configs
npm run build -- discovery john-boros
npm run build -- discovery maria
```

**Required Multi-Config Checks:**
- [ ] Both configs generate correctly
- [ ] Different client slugs created
- [ ] No cross-contamination between clients
- [ ] UTF-8 handling works (María González)
- [ ] Different payment amounts display correctly

## Testing Commands Reference

### **Quick Verification Commands**
```bash
# Full workflow test
npm run build -- discovery maria

# Individual component tests  
npm run customize -- discovery maria
npm run pdf -- maria

# Visual verification
open exports/[client-slug]/slides/00-cover.html

# Content verification
grep -r "{{" exports/[client-slug]/slides/  # Should be empty
grep "María González" exports/[client-slug]/slides/00-cover.html
```

### **File Structure Verification**
```bash
# Expected structure after build
exports/[client-slug]/
├── assets/
│   ├── brillnt-logo.png
│   └── brillnt-logo--black.png
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
✅ npm run build -- discovery maria (successful)
✅ Visual verification: logos display correctly
✅ PDF generation: 7 files created in correct location
✅ Token replacement: no unreplaced {{}} tokens
✅ Error handling: graceful failure for missing configs

Evidence:
- Client package created: exports/mara-gonzlez-caf-esperanza/
- All 6 HTML files generated with correct content
- All 7 PDF files generated with proper sizes
- White logo displays on cover, black logo on other slides
```

## Common Issues and Solutions

### **Image Assets Not Displaying**
- **Check:** Image paths in template files
- **Fix:** Ensure paths use `../assets/` not `../../assets/`
- **Verify:** Open HTML files in browser to confirm logos display

### **PDFs in Wrong Location**
- **Check:** PDF generation script output directory
- **Fix:** Ensure PDFs save to `exports/[client]/pdfs/` not `exports/slides/`
- **Verify:** Check file system after PDF generation

### **Token Replacement Issues**
- **Check:** Config file structure matches token expectations
- **Fix:** Ensure nested objects (payment.amount) are properly structured
- **Verify:** Search generated files for unreplaced `{{}}` tokens

### **UTF-8 Character Issues**
- **Check:** File encoding and config file format
- **Fix:** Ensure all files saved as UTF-8
- **Verify:** Test with María González config

## Development Workflow

1. **Make changes** to code
2. **Run verification checklist** completely
3. **Document verification results** with evidence
4. **Commit with detailed verification notes**
5. **Push to feature branch**
6. **Request review** with verification evidence

## Remember: Evidence Over Assumptions

- **Don't assume** your code works because the logic is correct
- **Always verify** through direct observation and testing
- **Document evidence** of what you actually tested
- **Test visually** - open files in browser, check images display
- **Be systematic** - follow the checklist completely every time

**The goal is to catch issues before they reach production, not after.**

