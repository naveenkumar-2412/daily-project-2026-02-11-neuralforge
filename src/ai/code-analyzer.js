// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Code Analyzer Engine
// Multi-language code quality analysis with complexity metrics
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LANGUAGE_PATTERNS = {
    javascript: {
        detect: [/\bconst\b/, /\blet\b/, /\bvar\b/, /=>\s*{/, /function\s*\(/, /require\(/, /module\.exports/, /console\.log/],
        functionPattern: /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g,
        classPattern: /class\s+(\w+)/g,
        commentSingle: '//', commentMultiStart: '/*', commentMultiEnd: '*/',
        branchKeywords: ['if', 'else if', 'else', 'switch', 'case', 'for', 'while', 'do', 'try', 'catch', '?', '&&', '||', '??'],
        smells: {
            longFunction: { pattern: null, maxLines: 40, message: 'Function exceeds recommended length' },
            magicNumbers: { pattern: /(?<![.\w])(\d{2,})(?![.\w"'])/g, message: 'Magic number detected — consider using a named constant' },
            deepNesting: { maxDepth: 4, message: 'Deep nesting detected — consider refactoring' },
            todoComments: { pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi, message: 'Unresolved TODO/FIXME comment' },
            consoleLogs: { pattern: /console\.(log|warn|error|debug)\(/g, message: 'Console statement — remove in production' },
            longLine: { maxLength: 120, message: 'Line exceeds 120 characters' },
            emptyBlock: { pattern: /\{\s*\}/g, message: 'Empty code block' },
            varUsage: { pattern: /\bvar\s+/g, message: 'Prefer const/let over var' },
            eqeq: { pattern: /[^=!]==[^=]/g, message: 'Use === instead of == for strict equality' },
            alertUsage: { pattern: /\balert\s*\(/g, message: 'Avoid using alert() in production' }
        }
    },
    python: {
        detect: [/\bdef\s+\w+\s*\(/, /\bimport\s+/, /\bclass\s+\w+.*:/, /\bprint\s*\(/, /\bself\b/, /\bif\s+__name__/],
        functionPattern: /def\s+(\w+)\s*\(/g,
        classPattern: /class\s+(\w+)/g,
        commentSingle: '#', commentMultiStart: '"""', commentMultiEnd: '"""',
        branchKeywords: ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'with', 'and', 'or'],
        smells: {
            longFunction: { pattern: null, maxLines: 40, message: 'Function exceeds recommended length' },
            magicNumbers: { pattern: /(?<![.\w])(\d{2,})(?![.\w"'])/g, message: 'Magic number detected' },
            todoComments: { pattern: /#\s*(TODO|FIXME|HACK|XXX|BUG)/gi, message: 'Unresolved TODO/FIXME comment' },
            printStatements: { pattern: /\bprint\s*\(/g, message: 'Print statement — use logging module instead' },
            longLine: { maxLength: 100, message: 'Line exceeds PEP 8 limit (100 chars)' },
            starImport: { pattern: /from\s+\w+\s+import\s+\*/g, message: 'Avoid wildcard imports' },
            bareExcept: { pattern: /except\s*:/g, message: 'Bare except — catch specific exceptions' },
            mutableDefault: { pattern: /def\s+\w+\s*\([^)]*=\s*(\[\]|\{\})/g, message: 'Mutable default argument' }
        }
    },
    java: {
        detect: [/\bpublic\s+class\b/, /\bSystem\.out\.print/, /\bvoid\s+main\b/, /\bimport\s+java\./],
        functionPattern: /(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\(/g,
        classPattern: /(?:public|private|protected)?\s*class\s+(\w+)/g,
        commentSingle: '//', commentMultiStart: '/*', commentMultiEnd: '*/',
        branchKeywords: ['if', 'else if', 'else', 'switch', 'case', 'for', 'while', 'do', 'try', 'catch', '?', '&&', '||'],
        smells: {
            longFunction: { pattern: null, maxLines: 50, message: 'Method exceeds recommended length' },
            magicNumbers: { pattern: /(?<![.\w])(\d{2,})(?![.\w"'])/g, message: 'Magic number detected' },
            todoComments: { pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi, message: 'Unresolved TODO/FIXME' },
            systemOut: { pattern: /System\.out\.print/g, message: 'Use logger instead of System.out' },
            longLine: { maxLength: 120, message: 'Line exceeds 120 characters' }
        }
    }
};

class CodeAnalyzer {
    constructor() { this.history = []; }

    analyze(code, language = null) {
        if (!code || typeof code !== 'string' || code.trim().length < 10)
            return { error: 'Please provide valid code to analyze.' };
        const startTime = Date.now();
        const lang = language || this._detectLanguage(code);
        const config = LANGUAGE_PATTERNS[lang] || LANGUAGE_PATTERNS.javascript;
        const lines = code.split('\n');
        const functions = this._extractFunctions(code, config);
        const classes = this._extractClasses(code, config);
        const complexity = this._calcComplexity(code, lines, config);
        const issues = this._findIssues(code, lines, config, lang);
        const metrics = this._calcMetrics(code, lines, config);
        const qualityScore = this._calcQualityScore(complexity, issues, metrics);
        const result = {
            language: lang, code: code,
            functions, classes, complexity, issues, metrics,
            qualityScore,
            summary: {
                totalIssues: issues.length,
                criticalIssues: issues.filter(i => i.severity === 'critical').length,
                warningIssues: issues.filter(i => i.severity === 'warning').length,
                infoIssues: issues.filter(i => i.severity === 'info').length
            },
            suggestions: this._generateSuggestions(complexity, issues, metrics, lang),
            processingTimeMs: Date.now() - startTime
        };
        this.history.push({ language: lang, lines: lines.length, qualityScore: qualityScore.overall, issues: issues.length, timestamp: Date.now() });
        return result;
    }

    _detectLanguage(code) {
        const scores = {};
        for (const [lang, config] of Object.entries(LANGUAGE_PATTERNS)) {
            scores[lang] = config.detect.reduce((s, p) => s + (p.test(code) ? 1 : 0), 0);
        }
        const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
        return best[1] > 0 ? best[0] : 'javascript';
    }

    _extractFunctions(code, config) {
        const fns = []; let match;
        const rgx = new RegExp(config.functionPattern.source, config.functionPattern.flags);
        while ((match = rgx.exec(code)) !== null) {
            const name = match[1] || match[2] || 'anonymous';
            const line = code.substring(0, match.index).split('\n').length;
            fns.push({ name, line, index: match.index });
        }
        return fns;
    }

    _extractClasses(code, config) {
        const cls = []; let match;
        const rgx = new RegExp(config.classPattern.source, config.classPattern.flags);
        while ((match = rgx.exec(code)) !== null) {
            const line = code.substring(0, match.index).split('\n').length;
            cls.push({ name: match[1], line });
        }
        return cls;
    }

    _calcComplexity(code, lines, config) {
        let cyclomatic = 1;
        for (const kw of config.branchKeywords) {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matches = code.match(new RegExp(`\\b${escaped}\\b`, 'g'));
            if (matches) cyclomatic += matches.length;
        }
        let maxNesting = 0, currentNesting = 0;
        for (const line of lines) {
            const opens = (line.match(/\{/g) || []).length;
            const closes = (line.match(/\}/g) || []).length;
            currentNesting += opens - closes;
            if (currentNesting > maxNesting) maxNesting = currentNesting;
        }
        const cognitive = cyclomatic + maxNesting * 2;
        let label;
        if (cyclomatic <= 5) label = 'simple';
        else if (cyclomatic <= 10) label = 'moderate';
        else if (cyclomatic <= 20) label = 'complex';
        else label = 'very complex';
        return { cyclomatic, cognitive, maxNesting, label, halsteadEstimate: Math.round(lines.length * 2.5) };
    }

    _findIssues(code, lines, config, lang) {
        const issues = [];
        for (const [name, smell] of Object.entries(config.smells)) {
            if (smell.pattern) {
                let match;
                const rgx = new RegExp(smell.pattern.source, smell.pattern.flags);
                while ((match = rgx.exec(code)) !== null) {
                    const line = code.substring(0, match.index).split('\n').length;
                    issues.push({
                        type: name, message: smell.message, line, column: match.index - code.lastIndexOf('\n', match.index),
                        severity: name.includes('todo') || name.includes('console') || name.includes('print') ? 'info' :
                            name.includes('var') || name.includes('eqeq') || name.includes('bare') ? 'warning' : 'warning',
                        code: lines[line - 1]?.trim() || ''
                    });
                }
            }
            if (smell.maxLength) {
                lines.forEach((line, i) => {
                    if (line.length > smell.maxLength) {
                        issues.push({ type: 'longLine', message: smell.message, line: i + 1, severity: 'info', code: line.substring(0, 50) + '...' });
                    }
                });
            }
        }
        return issues;
    }

    _calcMetrics(code, lines, config) {
        const totalLines = lines.length;
        const blankLines = lines.filter(l => l.trim() === '').length;
        let commentLines = 0;
        let inMultiComment = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (inMultiComment) { commentLines++; if (trimmed.includes(config.commentMultiEnd)) inMultiComment = false; continue; }
            if (trimmed.startsWith(config.commentSingle)) { commentLines++; continue; }
            if (trimmed.includes(config.commentMultiStart)) { commentLines++; inMultiComment = true; }
        }
        const codeLines = totalLines - blankLines - commentLines;
        return {
            totalLines, codeLines, blankLines, commentLines,
            commentRatio: totalLines > 0 ? Math.round((commentLines / totalLines) * 100) : 0,
            avgLineLength: Math.round(lines.reduce((s, l) => s + l.length, 0) / Math.max(1, totalLines)),
            maxLineLength: Math.max(...lines.map(l => l.length))
        };
    }

    _calcQualityScore(complexity, issues, metrics) {
        let score = 100;
        if (complexity.cyclomatic > 20) score -= 20;
        else if (complexity.cyclomatic > 10) score -= 10;
        else if (complexity.cyclomatic > 5) score -= 5;
        score -= issues.filter(i => i.severity === 'critical').length * 10;
        score -= issues.filter(i => i.severity === 'warning').length * 3;
        score -= issues.filter(i => i.severity === 'info').length * 1;
        if (metrics.commentRatio < 5) score -= 5;
        if (metrics.commentRatio > 40) score -= 3;
        if (complexity.maxNesting > 4) score -= 10;
        const overall = Math.max(0, Math.min(100, Math.round(score)));
        let grade;
        if (overall >= 90) grade = 'A';
        else if (overall >= 80) grade = 'B';
        else if (overall >= 70) grade = 'C';
        else if (overall >= 60) grade = 'D';
        else grade = 'F';
        return { overall, grade, label: grade === 'A' ? 'Excellent' : grade === 'B' ? 'Good' : grade === 'C' ? 'Fair' : grade === 'D' ? 'Poor' : 'Critical' };
    }

    _generateSuggestions(complexity, issues, metrics, lang) {
        const suggestions = [];
        if (complexity.cyclomatic > 10)
            suggestions.push({ priority: 'high', message: 'High cyclomatic complexity. Break large functions into smaller, focused functions.', category: 'complexity' });
        if (complexity.maxNesting > 4)
            suggestions.push({ priority: 'high', message: 'Deep nesting detected. Use early returns, guard clauses, or extract helper functions.', category: 'complexity' });
        if (metrics.commentRatio < 5)
            suggestions.push({ priority: 'medium', message: 'Low comment density. Add documentation for complex logic and public interfaces.', category: 'documentation' });
        if (issues.some(i => i.type === 'varUsage'))
            suggestions.push({ priority: 'medium', message: 'Replace var with const (preferred) or let for better scoping.', category: 'modernization' });
        if (issues.some(i => i.type === 'eqeq'))
            suggestions.push({ priority: 'medium', message: 'Use strict equality (===) to avoid type coercion bugs.', category: 'reliability' });
        if (issues.some(i => i.type === 'consoleLogs'))
            suggestions.push({ priority: 'low', message: 'Remove console statements or replace with a proper logging library.', category: 'production-readiness' });
        if (metrics.avgLineLength > 80)
            suggestions.push({ priority: 'low', message: 'Consider shorter lines for better readability.', category: 'readability' });
        return suggestions;
    }

    getHistory() { return this.history.slice(-50); }
}

module.exports = CodeAnalyzer;
