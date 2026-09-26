# TypeScript Patterns

Use these guidelines when analyzing TypeScript code.

## Type Safety
- Prefer explicit and meaningful types.
- Avoid `any` unless there is a clear justification.
- Use interfaces, type aliases, and generics appropriately.
- Avoid unnecessary type assertions.

## Modern TypeScript
- Prefer modern TypeScript syntax and features.
- Use optional chaining and nullish coalescing where appropriate.
- Prefer `const` when variables are not reassigned.
- Use discriminated unions when they improve type safety.

## Functions and Classes
- Keep functions focused and reasonably small.
- Use clear parameter and return types.
- Avoid unnecessary complexity and deeply nested logic.

## Error Handling
- Handle errors explicitly.
- Do not silently swallow exceptions.
- Use appropriate error types and meaningful error messages.

## Maintainability
- Prefer readable and reusable code.
- Avoid duplicated type definitions and repeated logic.
- Keep responsibilities separated between modules.

Use these guidelines to support analysis and recommendations. Do not modify source code unless explicitly requested.
