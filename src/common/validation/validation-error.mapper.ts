import type { ValidationError } from 'class-validator';

export type ValidationIssue = {
  detail: string;
  pointer?: string;
};

export function mapValidationErrors(
  errors: ValidationError[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  collectIssues(errors, [], issues);
  return issues;
}

function collectIssues(
  errors: ValidationError[],
  path: string[],
  out: ValidationIssue[],
): void {
  for (const error of errors) {
    const currentPath = [...path, error.property];

    if (error.constraints) {
      for (const detail of Object.values(error.constraints)) {
        out.push({
          detail,
          pointer: buildPointer(currentPath, error),
        });
      }
    }

    if (error.children && error.children.length > 0) {
      collectIssues(error.children, currentPath, out);
    }
  }
}

function buildPointer(
  path: string[],
  error: ValidationError,
): string | undefined {
  if (error.value === undefined) {
    return undefined;
  }

  return '/' + path.join('/');
}
