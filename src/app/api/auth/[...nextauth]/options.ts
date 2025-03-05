import type { NextAuthOptions } from "next-auth";
import YandexProvider from "next-auth/providers/yandex";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SsgRoute } from "next/dist/build";

export const options: NextAuthOptions = {
  providers: [
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID as string,
      clientSecret: process.env.YANDEX_CLIENT_SECRET as string,
      authorization:
        "https://oauth.yandex.ru/authorize?scope=login:info+login:email+login:avatar+login:birthday",
      async profile(profile) {
        let user = await prisma.user.findUnique({
          where: { email: profile.default_email },
        });

        if (!user) {
          const hashedPassword = await bcrypt.hash("yandex", 10);
          user = await prisma.user.create({
            data: {
              name: profile.display_name,
              email: profile.default_email as string,
              avatar:
                `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200` ||
                null,
              password: hashedPassword,
              type_autorize: "yandex",
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (
          !user ||
          !(await bcrypt.compare(credentials.password, user.password))
        ) {
          throw new Error("Неверный email или пароль");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET as string,
  debug: true,
  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
};
