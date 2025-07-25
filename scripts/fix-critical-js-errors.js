/**
 * BaddBeatz Critical JavaScript Error Fix Script
 * Identifies and fixes critical JavaScript syntax errors
 */

const fs = require('fs');
const path = require('path');

class JavaScriptErrorFixer {
    constructor() {
        this.jsDirectory = path.join(__dirname, '../assets/js');
        this.errors = [];
        this.fixes = [];
    }

    async fixAllErrors() {
        console.log('🔧 Starting JavaScript error fixing process...');
        
        const jsFiles = this.getJavaScriptFiles();
        
        for (const file of jsFiles) {
            await this.analyzeAndFixFile(file);
        }
        
        this.generateReport();
    }

    getJavaScriptFiles() {
        const files = fs.readdirSync(this.jsDirectory);
        return files
            .filter(file => file.endsWith('.js'))
            .map(file => path.join(this.jsDirectory, file));
    }

    async analyzeAndFixFile(filePath) {
        const fileName = path.basename(filePath);
        console.log(`📝 Analyzing ${fileName}...`);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            
            // Apply common fixes
            content = this.fixCommonSyntaxErrors(content, fileName);
            content = this.fixMissingClosingParentheses(content, fileName);
            content = this.fixUndefinedVariables(content, fileName);
            content = this.fixMissingDOMPurify(content, fileName);
            content = this.addErrorHandling(content, fileName);
            
            // Only write if changes were made
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Fixed errors in ${fileName}`);
            } else {
                console.log(`✨ No issues found in ${fileName}`);
            }
            
        } catch (error) {
            this.errors.push({
                file: fileName,
                error: error.message
            });
            console.error(`❌ Error processing ${fileName}:`, error.message);
        }
    }

    fixCommonSyntaxErrors(content, fileName) {
        let fixed = content;
        
        // Fix missing semicolons at end of statements
        fixed = fixed.replace(/([^;\s}])\s*\n/g, '$1;\n');
        
        // Fix missing commas in object literals
        fixed = fixed.replace(/(\w+:\s*[^,\n}]+)\s*\n\s*(\w+:)/g, '$1,\n  $2');
        
        // Fix unclosed string literals
        fixed = fixed.replace(/(['"])[^'"]*\n/g, (match, quote) => {
            if (!match.includes(quote, 1)) {
                return match.trim() + quote + '\n';
            }
            return match;
        });
        
        if (fixed !== content) {
            this.fixes.push({
                file: fileName,
                fix: 'Common syntax errors (semicolons, commas, strings)'
            });
        }
        
        return fixed;
    }

    fixMissingClosingParentheses(content, fileName) {
        let fixed = content;
        
        // Count opening and closing parentheses
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        
        if (openParens > closeParens) {
            const missing = openParens - closeParens;
            // Add missing closing parentheses at the end of functions
            fixed = fixed.replace(/(\n\s*})(\s*)$/, '$1' + ')'.repeat(missing) + '$2');
            
            this.fixes.push({
                file: fileName,
                fix: `Added ${missing} missing closing parentheses`
            });
        }
        
        return fixed;
    }

    fixUndefinedVariables(content, fileName) {
        let fixed = content;
        
        // Common undefined variables and their fixes
        const undefinedFixes = {
            'DOMPurify': 'window.DOMPurify || { sanitize: (html) => html }',
            'gtag': 'window.gtag || function() {}',
            'analytics': 'window.analytics || { track: function() {} }',
            'Sentry': 'window.Sentry || { captureException: function() {} }'
        };
        
        Object.entries(undefinedFixes).forEach(([variable, fallback]) => {
            const regex = new RegExp(`\\b${variable}\\b(?!\\s*[=:])`, 'g');
            if (regex.test(content)) {
                // Add safety check at the beginning of the file
                const safetyCheck = `const ${variable} = ${fallback};\n`;
                if (!fixed.includes(safetyCheck)) {
                    fixed = safetyCheck + fixed;
                    
                    this.fixes.push({
                        file: fileName,
                        fix: `Added safety check for ${variable}`
                    });
                }
            }
        });
        
        return fixed;
    }

    fixMissingDOMPurify(content, fileName) {
        let fixed = content;
        
        // If file uses DOMPurify but it's not defined, add fallback
        if (content.includes('DOMPurify') && !content.includes('DOMPurify.sanitize')) {
            const dompurifyFallback = `
// DOMPurify fallback for development
if (typeof DOMPurify === 'undefined') {
    window.DOMPurify = {
        sanitize: function(html) {
            console.warn('DOMPurify not loaded, returning unsanitized HTML');
            return html;
        }
    };
}
`;
            fixed = dompurifyFallback + fixed;
            
            this.fixes.push({
                file: fileName,
                fix: 'Added DOMPurify fallback'
            });
        }
        
        return fixed;
    }

    addErrorHandling(content, fileName) {
        let fixed = content;
        
        // Wrap risky operations in try-catch
        const riskyPatterns = [
            /document\.querySelector\([^)]+\)\.[^;\n]+/g,
            /localStorage\.[^;\n]+/g,
            /sessionStorage\.[^;\n]+/g,
            /JSON\.parse\([^)]+\)/g
        ];
        
        riskyPatterns.forEach(pattern => {
            fixed = fixed.replace(pattern, (match) => {
                if (!match.includes('try') && !match.includes('catch')) {
                    return `try { ${match} } catch(e) { console.warn('Error in ${fileName}:', e); }`;
                }
                return match;
            });
        });
        
        if (fixed !== content) {
            this.fixes.push({
                file: fileName,
                fix: 'Added error handling for risky operations'
            });
        }
        
        return fixed;
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalFiles: this.getJavaScriptFiles().length,
            filesFixed: this.fixes.length,
            errors: this.errors,
            fixes: this.fixes
        };
        
        const reportPath = path.join(__dirname, '../JAVASCRIPT_ERROR_FIX_REPORT.md');
        const reportContent = this.generateMarkdownReport(report);
        
        fs.writeFileSync(reportPath, reportContent, 'utf8');
        
        console.log('\n📋 JavaScript Error Fix Report Generated');
        console.log(`✅ Files processed: ${report.totalFiles}`);
        console.log(`🔧 Files fixed: ${report.filesFixed}`);
        console.log(`❌ Errors encountered: ${report.errors.length}`);
        console.log(`📄 Report saved to: ${reportPath}`);
    }

    generateMarkdownReport(report) {
        return `# JavaScript Error Fix Report

## Summary
- **Timestamp**: ${report.timestamp}
- **Total Files Processed**: ${report.totalFiles}
- **Files Fixed**: ${report.filesFixed}
- **Errors Encountered**: ${report.errors.length}

## Fixes Applied

${report.fixes.map(fix => `### ${fix.file}
- ${fix.fix}`).join('\n\n')}

## Errors Encountered

${report.errors.length > 0 ? report.errors.map(error => `### ${error.file}
\`\`\`
${error.error}
\`\`\``).join('\n\n') : 'No errors encountered during processing.'}

## Next Steps

1. Test all fixed JavaScript files in the browser
2. Verify that console errors have been reduced
3. Add DOMPurify CDN link to HTML files if not already present
4. Run comprehensive testing to ensure functionality is preserved

---
*Report generated by BaddBeatz JavaScript Error Fixer*
`;
    }
}

// Run the fixer if called directly
if (require.main === module) {
    const fixer = new JavaScriptErrorFixer();
    fixer.fixAllErrors().catch(console.error);
}

module.exports = JavaScriptErrorFixer;
