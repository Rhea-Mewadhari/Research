declare global {
  namespace Express {
    interface Request {
      id: string;
      validated: Record<string, unknown>;
      jwtPayload?: { userId: string; email: string; username: string };
    }
  }
}

export {};
