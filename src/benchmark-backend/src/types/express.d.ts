declare global {
  namespace Express {
    interface Request {
      id: string;
      validated: Record<string, unknown>;
      jwtUser?: { userId: string; email: string; username: string };
    }
  }
}

export {};
