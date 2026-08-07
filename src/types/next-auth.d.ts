import { DefaultSession } from "next-auth";

// next-auth v5 beta re-exports Session/User/JWT from @auth/core via
// `export type { ... } from "@auth/core/..."`, which is a type-only
// re-export — augmenting "next-auth"/"next-auth/jwt" directly does not
// declaration-merge with the original interfaces. Augment the @auth/core
// modules where these types actually originate instead.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "CUSTOMER" | "ADMIN";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "ADMIN";
  }
}
