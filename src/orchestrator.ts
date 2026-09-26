import { query } from '@anthropic-ai/claude-agent-sdk';
import {
  ReviewReport,
  ReviewReportSchema,
  ReviewReportJSONSchema
} from './types/report-types';
import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester
} from './agents';
import { orchestratorPrompt } from './prompts';
import { mcpServersConfig } from './config/mcp.config';
import { logger, logReviewStart, logReviewComplete, logReviewError } from './utils/logger';

/**
 * Orchestrator configuration options
 */
export interface OrchestratorOptions {
  model?: string;
  maxTurns?: number;
}

/**
 * Main Code Review Orchestrator
 * Coordinates subagents to analyze pull requests and generate comprehensive reports
 */
export class CodeReviewOrchestrator {
  private readonly model: string;
  private readonly maxTurns: number;

  constructor(options: OrchestratorOptions = {}) {
    this.model =
      options.model ||
      process.env.ANTHROPIC_MODEL ||
      'claude-sonnet-4-5';

    this.maxTurns = options.maxTurns || 40;
  }

  /**
   * Review a pull request using parallel subagent analysis
   */
  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    const startTime = Date.now();

    logReviewStart(owner, repo, prNumber);

    try {
      const prompt = `
${orchestratorPrompt}

Review this pull request:

Repository owner: ${owner}
Repository name: ${repo}
Pull request number: ${prNumber}

Coordinate the specialized agents and produce the complete ReviewReport.

The specialized agents are registered with the Claude Agent SDK.

Use the Task tool to invoke each specialized agent independently.

For each pull request file:
1. Invoke the Code Quality Analyzer to analyze security, performance, maintainability, code quality, and potential bugs.
2. Invoke the Test Coverage Analyzer to analyze existing tests and identify missing coverage.
3. Invoke the Refactoring Suggester to identify meaningful refactoring opportunities.

Pass the relevant pull request file contents and repository context to each agent.

Wait for all three agent analyses before producing the final ReviewReport.

Do not skip an agent.
Do not combine the three analyses into a single agent task.
Preserve each agent's structured result and place it in the corresponding section of the final ReviewReport.

The final response must contain ONLY the structured ReviewReport data.
`;
      console.log('🤖 Starting Claude Agent SDK...');
      const response = query({
        prompt,
        options: {
          model: this.model,
          maxTurns: this.maxTurns,

          allowedTools: [
            'Task',
            'mcp__github__get_pull_request',
            'mcp__github__get_pull_request_files',
            'mcp__github__get_file_contents',
            'mcp__eslint__lint'
          ],

          mcpServers: mcpServersConfig,

          agents: {
            [codeQualityAnalyzer.name]: codeQualityAnalyzer,
            [testCoverageAnalyzer.name]: testCoverageAnalyzer,
            [refactoringSuggester.name]: refactoringSuggester
          },

          outputFormat: {
            type: 'json_schema',
            schema: ReviewReportJSONSchema
          }
        }
      });
      console.log('🤖 Claude Agent SDK query started...');
      let structuredOutput: unknown = undefined;

      for await (const message of response) {
          console.log('📩 Received message from Claude');
          console.log(JSON.stringify(message, null, 2));
        if (
          message &&
          typeof message === 'object' &&
          'structured_output' in message
        ) {
          structuredOutput = (
            message as { structured_output?: unknown }
          ).structured_output;
        }
      }

      if (structuredOutput === undefined) {
        throw new Error('No structured output was returned by the orchestrator');
      }

      const validation = ReviewReportSchema.safeParse(structuredOutput);

      if (!validation.success) {
        logger.error('ReviewReport validation failed', {
          owner,
          repo,
          prNumber,
          errors: validation.error.issues
        });

        throw new Error(
          `ReviewReport validation failed: ${validation.error.message}`
        );
      }

      const report = validation.data;

      const duration = Date.now() - startTime;

      logReviewComplete(
        owner,
        repo,
        prNumber,
        report.summary.overallScore,
        duration
      );

      return {
        ...report,
        metadata: {
          ...report.metadata,
          analyzedAt: report.metadata.analyzedAt || new Date().toISOString(),
          duration
        }
      };
    } catch (error) {
      const reviewError =
        error instanceof Error ? error : new Error(String(error));

      logReviewError(owner, repo, prNumber, reviewError);

      throw reviewError;
    }
  }
}