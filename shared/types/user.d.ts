declare module "#user-typing" {

  interface AdminUserRecord {
    id: number;
    email: string;
    name: string;
    role: "admin" | "user";
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };

}

export {};
