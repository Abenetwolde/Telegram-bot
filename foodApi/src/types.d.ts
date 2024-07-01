import { IUser } from '../model/user.model'; // Adjust the path to your User model

declare global {
  namespace Express {
    interface User extends IUser {} // Extending Express's User with your IUser interface
    interface Request {
      user?: User; // Optional chaining to ensure `user` is recognized as a property
    }
  }
}
