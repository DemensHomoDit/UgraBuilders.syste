import type { User, UserRole } from "./types/authTypes";
import { transformProfileToUser } from "./utils/authUtils";
import { CLIENT_STAGES } from "./constants/constructionData";
import authLoginService from "./auth/authLoginService";
import authSignupService from "./auth/authSignupService";
import authCurrentUserService from "./auth/authCurrentUserService";
import authLogoutService from "./auth/authLogoutService";
import userService from "./userService";
import fileService from "./fileService";

export type { User, UserRole };
export { CLIENT_STAGES };

class AuthService {
  public transformProfileToUser = transformProfileToUser;

  public async login(email: string, password: string): Promise<User | null> {
    return authLoginService.login(email, password);
  }

  public async signup(
    email: string,
    password: string,
    username: string,
  ): Promise<User | null> {
    return authSignupService.signup(email, password, username);
  }

  public async logout(): Promise<void> {
    return authLogoutService.logout();
  }

  public async getCurrentUser(): Promise<User | null> {
    return authCurrentUserService.getCurrentUser();
  }

  public getClientStages(): string[] {
    return [...CLIENT_STAGES];
  }

  public async getAllUsers(): Promise<User[]> {
    return userService.getAllUsers();
  }

  public async getUsersList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    return userService.getUsersList(params);
  }

  public async createUser(
    username: string,
    phone: string,
    password: string,
    role: UserRole,
  ): Promise<User | null> {
    return userService.createUser(username, phone, password, role);
  }

  public async deleteUser(userId: string): Promise<boolean> {
    return userService.deleteUser(userId);
  }

  public async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    return userService.updateUserRole(userId, role);
  }

  public async updateClientSaleStage(
    clientId: string,
    stage: string,
  ): Promise<User | null> {
    return userService.updateClientSaleStage(clientId, stage);
  }

  public async getClientFiles(
    userId: string,
    folderType: "photos" | "documents" | "contracts",
  ): Promise<
    {
      id: string;
      name: string;
      type: string;
      data: string;
      date: string;
      uploadedBy?: { id: string; username: string; role: string };
    }[]
  > {
    return fileService.getClientFiles(userId, folderType);
  }

  public async uploadFile(
    userId: string,
    file: File | { name: string; type: string; data: string },
    folderType: "photos" | "documents" | "contracts",
    uploaderId?: string,
  ): Promise<boolean> {
    return fileService.uploadFile(userId, file, folderType, uploaderId);
  }
}

export default new AuthService();
