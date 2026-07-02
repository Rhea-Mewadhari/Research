declare global {
  namespace Express {
    interface Request {
      id: string;
      validated: Record<string, unknown>;
    }
  }
}

export {};
