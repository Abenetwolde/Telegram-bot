import { Request, Response,NextFunction } from 'express';
export const isSuperAdmin = (req:any, res:Response, next:NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    if (req?.user?.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
  