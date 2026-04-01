declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    name: string;
    role: "admin";
  }

  interface UserSession {
    loggedInAt: number;
  }

  interface SecureSessionData {
    // server-only session fields go here later if needed
  }
}

export {};
