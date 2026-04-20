
import { User } from "@/services/authService";

export interface AuthSuccessCallback {
  (user: User): void;
}

export interface LogoutCallback {
  (e: React.MouseEvent): void;
}
