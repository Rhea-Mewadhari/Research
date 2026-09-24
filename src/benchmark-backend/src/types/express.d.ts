declare global {
  namespace Express {
    interface Request {
      id: string;
      validated: Record<string, unknown>;
      user?: { userId: string; email: string; username: string };
    }
  }
}

export {};
