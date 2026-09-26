import * as dotenv from 'dotenv';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { CodeReviewOrchestrator } from './orchestrator';
import { ReportGenerator } from './utils/report-generator';
import { formatError } from './utils/error-handler';
// Load environment variables
dotenv.config();

/**
 * Main entry point for the Claude Multi-Agent Code Review System
 * Usage: npm run dev <owner> <repo> <pr-number>
 */
async function main() {
  const [owner, repo, prStr] = process.argv.slice(2);

  if (!owner || !repo || !prStr) {
    console.error('Usage: npm run dev -- <owner> <repo> <pr-number>');
    process.exit(1);
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error('Error: PR number must be a positive integer.');
    process.exit(1);
  }
   const hasAnthropicAuth = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasAwsAuth =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY);

  if (hasAwsAuth) {
    if (!process.env.AWS_REGION) {
      console.error(
        'Error: AWS_REGION is required when using AWS Bedrock authentication.'
      );
      process.exit(1);
    }

    console.log('🔐 Using AWS Bedrock authentication');
  } else if (hasAnthropicAuth) {
    console.log('🔐 Using Anthropic API authentication');
  } else {
    console.error(
      'Error: No authentication configured.\n' +
      'Set ANTHROPIC_API_KEY for Anthropic API authentication, or set ' +
      'AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION for AWS Bedrock.'
    );
    process.exit(1);
  }
    const model = process.env.ANTHROPIC_MODEL;

  if (!model) {
    console.error('Error: ANTHROPIC_MODEL environment variable is not set.');
    process.exit(1);
  }

  console.log(`Using model: ${model}`);
  try {
         const orchestrator = new CodeReviewOrchestrator({
      model
    });
        const report = await orchestrator.reviewPullRequest(
      owner,
      repo,
      prNumber
    );
    console.log('✅ Pull request review completed.');
        const reportGenerator = new ReportGenerator();

    const markdownReport = reportGenerator.generateMarkdownReport(report);
    const htmlReport = reportGenerator.generateHTMLReport(report);
    const jsonReport = reportGenerator.generateJSONReport(report);

    const reportsDir = path.join(process.cwd(), 'reports');
    await mkdir(reportsDir, { recursive: true });

    await writeFile(
      path.join(reportsDir, 'report.md'),
      markdownReport,
      'utf-8'
    );

    await writeFile(
      path.join(reportsDir, 'report.html'),
      htmlReport,
      'utf-8'
    );

    await writeFile(
      path.join(reportsDir, 'report.json'),
      jsonReport,
      'utf-8'
    );

    console.log(`📄 Reports saved to ${reportsDir}`);
  } catch (error) {
    console.error('❌ Code review failed.');
    console.error(formatError(error));
    console.error(
      `Try: npm run dev -- ${owner} ${repo} ${prNumber}`
    );
    process.exit(1);
  }
}

main();
