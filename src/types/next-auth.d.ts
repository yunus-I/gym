import { Role } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      gymId: string;
    };
  }

  interface User extends DefaultUser {
    role: Role;
    gymId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    gymId?: string;
  }
}
