import type { RequestHandler, Request, Response, NextFunction } from 'express';

type SafeParseResult =
  | { success: true; data: unknown }
  | { success: false; error: { issues: Array<{ path: (string | number | symbol)[]; message: string }> } };

interface Schema {
  safeParse(data: unknown): SafeParseResult;
}

export function validate(schema: Schema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const rawParams = req.params as Record<string, unknown>;
    const rawQuery = req.query as Record<string, unknown>;
    const rawBody = req.body as Record<string, unknown>;
    const data =
      req.method === 'GET' || req.method === 'HEAD'
        ? { ...rawParams, ...rawQuery }
        : { ...rawParams, ...rawBody };

    const result = schema.safeParse(data);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : 'root',
        message: issue.message,
      }));
      res.status(400).json({ error: 'Validation failed', details });
      return;
    }

    req.validated = result.data as Record<string, unknown>;
    next();
  };
}
