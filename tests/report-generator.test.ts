import { describe, expect, it } from 'vitest';
import { ReportGenerator } from '../src/utils/report-generator';
import { ReviewReport } from '../src/types/report-types';

describe('ReportGenerator', () => {
  it('generates valid JSON from a ReviewReport', () => {
    const report: ReviewReport = {
      pullRequest: {
        owner: 'octocat',
        repo: 'Hello-World',
        number: 1
      },
      fileReviews: [],
      summary: {
        totalFiles: 0,
        overallScore: 100,
        criticalIssues: 0,
        highPriorityTests: 0,
        refactoringOpportunities: 0
      },
      recommendations: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        duration: 10,
        agentVersions: {}
      }
    };

    const json = new ReportGenerator().generateJSONReport(report);
    const parsed = JSON.parse(json);

    expect(parsed.pullRequest.owner).toBe('octocat');
    expect(parsed.pullRequest.repo).toBe('Hello-World');
    expect(parsed.pullRequest.number).toBe(1);
    expect(parsed.summary.overallScore).toBe(100);
  });
});
