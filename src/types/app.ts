import type { AbstractIntlMessages } from "next-intl";
import type { Role } from "@prisma/client";

export type Locale = "en" | "am";

export interface AuthenticatedUser {
  id: string;
  role: Role;
  gymId: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface IntlProviderMessages extends AbstractIntlMessages {
  [key: string]: AbstractIntlMessages | string;
}
