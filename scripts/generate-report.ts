/**
 * @fileoverview Report Generator - Generate beautiful HTML/Markdown reports
 * @description Creates detailed benchmark reports with charts and metrics
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { AnalyticsEngine } from '../src/core/analytics/engine.js';
import { challengeStats, challengesByCategory } from '../src/data/challenges/index.js';

// ============================================================================
// Report Generator
// ============================================================================

interface ReportData {
    title: string;
    generatedAt: string;
    summary: {
        totalChallenges: number;
        byCategory: Record<string, number>;
        byDifficulty: Record<string, number>;
    };
    features: string[];
    standards: string[];
}

function generateHTMLReport(data: ReportData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #e4e4e4;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        header {
            text-align: center;
            margin-bottom: 60px;
        }
        
        h1 {
            font-size: 3rem;
            background: linear-gradient(135deg, #00d9ff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #888;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 217, 255, 0.2);
        }
        
        .stat-number {
            font-size: 3rem;
            font-weight: bold;
            background: linear-gradient(135deg, #00d9ff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .stat-label {
            font-size: 1rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        section {
            margin-bottom: 40px;
        }
        
        h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            color: #00d9ff;
            border-bottom: 2px solid rgba(0, 217, 255, 0.3);
            padding-bottom: 10px;
        }
        
        .category-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .category-item {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #00ff88;
            transition: all 0.3s ease;
        }
        
        .category-item:hover {
            background: rgba(0, 255, 136, 0.1);
        }
        
        .category-name {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .category-count {
            color: #00ff88;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .feature-item {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            padding: 25px;
            border: 1px solid rgba(0, 217, 255, 0.2);
        }
        
        .feature-item::before {
            content: '✓';
            color: #00ff88;
            margin-right: 10px;
            font-weight: bold;
        }
        
        .standards-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .standard-badge {
            background: linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 255, 136, 0.2));
            border: 1px solid rgba(0, 217, 255, 0.3);
            border-radius: 20px;
            padding: 10px 20px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .standard-badge:hover {
            background: linear-gradient(135deg, rgba(0, 217, 255, 0.4), rgba(0, 255, 136, 0.4));
            transform: scale(1.05);
        }
        
        footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #666;
        }
        
        .chart-container {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
        }
        
        .bar-chart {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .bar-item {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .bar-label {
            width: 150px;
            font-size: 0.9rem;
        }
        
        .bar-container {
            flex: 1;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            overflow: hidden;
        }
        
        .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d9ff, #00ff88);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 15px;
            color: #1a1a2e;
            font-weight: bold;
            font-size: 0.85rem;
            transition: width 1s ease-out;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧠 MCP IntelliBench</h1>
            <p class="subtitle">AI Coding Intelligence Benchmark Platform</p>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${data.summary.totalChallenges}</div>
                <div class="stat-label">Total Challenges</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(data.summary.byCategory).length}</div>
                <div class="stat-label">Categories</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">8</div>
                <div class="stat-label">Languages Supported</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.standards.length}</div>
                <div class="stat-label">International Standards</div>
            </div>
        </div>
        
        <section>
            <h2>📊 Challenge Distribution</h2>
            <div class="chart-container">
                <div class="bar-chart">
                    ${Object.entries(data.summary.byCategory).map(([cat, count]) => {
        const maxCount = Math.max(...Object.values(data.summary.byCategory));
        const percentage = (count / maxCount) * 100;
        return `
                    <div class="bar-item">
                        <div class="bar-label">${formatCategory(cat)}</div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${percentage}%">${count}</div>
                        </div>
                    </div>`;
    }).join('')}
                </div>
            </div>
        </section>
        
        <section>
            <h2>🎯 Difficulty Levels</h2>
            <div class="stats-grid">
                ${Object.entries(data.summary.byDifficulty).map(([diff, count]) => `
                <div class="stat-card">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">${diff}</div>
                </div>`).join('')}
            </div>
        </section>
        
        <section>
            <h2>🌐 International Standards</h2>
            <div class="standards-list">
                ${data.standards.map(std => `<span class="standard-badge">${std}</span>`).join('')}
            </div>
        </section>
        
        <section>
            <h2>✨ Features</h2>
            <div class="feature-list">
                ${data.features.map(feature => `<div class="feature-item">${feature}</div>`).join('')}
            </div>
        </section>
        
        <footer>
            <p>Generated on ${data.generatedAt}</p>
            <p>MCP IntelliBench v1.0.0 | AI Coding Intelligence Benchmark</p>
        </footer>
    </div>
</body>
</html>`;
}

function formatCategory(category: string): string {
    return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
    console.log('📊 Generating IntelliBench Report...\n');

    const reportData: ReportData = {
        title: 'MCP IntelliBench Report',
        generatedAt: new Date().toISOString(),
        summary: {
            totalChallenges: challengeStats.total,
            byCategory: challengeStats.byCategory,
            byDifficulty: challengeStats.byDifficulty,
        },
        features: [
            'Multi-language support (TypeScript, JavaScript, Python, Java, Go, Rust, C#, C++)',
            'Sandboxed code execution with Docker',
            'Comprehensive scoring with multiple dimensions',
            'Real-time analytics and performance metrics',
            'Export reports in JSON, Markdown, and HTML',
            '50+ categorized coding challenges',
            'International standards compliance',
            'Detailed feedback and recommendations',
        ],
        standards: [
            'IEEE 2841',
            'ISO/IEC 25010',
            'HumanEval',
            'MMLU',
            'SWE-bench',
            'MBPP',
            'APPS',
            'CodeXGLUE',
        ],
    };

    const html = generateHTMLReport(reportData);

    const outputDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `intellibench-report-${Date.now()}.html`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, html, 'utf-8');

    console.log(`✅ Report generated: ${filepath}`);
    console.log('\n📊 Summary:');
    console.log(`   Total Challenges: ${reportData.summary.totalChallenges}`);
    console.log(`   Categories: ${Object.keys(reportData.summary.byCategory).length}`);
    console.log(`   Standards: ${reportData.standards.length}`);
    console.log(`   Features: ${reportData.features.length}`);
}

main().catch(error => {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
});
