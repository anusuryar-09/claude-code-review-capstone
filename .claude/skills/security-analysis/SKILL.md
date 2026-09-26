# Security Analysis

Use these guidelines when analyzing source code for security issues.

## Input Validation
- Check whether external and user-controlled input is validated.
- Identify unsafe assumptions about input types or values.
- Look for missing sanitization where appropriate.

## Injection Risks
- Check for SQL injection.
- Check for command injection.
- Check for cross-site scripting.
- Check for unsafe template or query construction.

## Authentication and Authorization
- Check authentication and authorization boundaries.
- Identify missing access-control checks.
- Check whether sensitive operations are properly protected.

## Secrets and Sensitive Data
- Look for hardcoded passwords, API keys, tokens, and credentials.
- Check whether sensitive information is exposed in logs or error messages.
- Avoid recommending that secrets be committed to source control.

## Data and Network Security
- Check insecure handling of sensitive data.
- Identify unsafe file operations.
- Check external requests and API usage for security concerns.

## Error Handling
- Check whether errors expose sensitive implementation details.
- Prefer safe, user-appropriate error messages.

## Dependencies and Configuration
- Identify obviously unsafe dependency or configuration practices.
- Check security-sensitive settings where relevant.

Report concrete evidence and explain the potential impact. Do not modify source code unless explicitly requested.
