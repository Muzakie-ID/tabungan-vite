import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    userId?: string;
    user?: any;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map