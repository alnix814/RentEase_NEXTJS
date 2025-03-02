import type { NextAuthOptions } from 'next-auth';
import YandexProvider from "next-auth/providers/yandex";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const options: NextAuthOptions = {
  providers: [
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID as string,
      clientSecret: process.env.YANDEX_CLIENT_SECRET as string,
      authorization: "https://oauth.yandex.ru/authorize?scope=login:info+login:email+login:avatar+login:birthday",

      async profile(profile) {
        const user = await prisma.user.findUnique({
          where: { email: profile.default_email },
        });
        if (!user) {
          const hashedPassword = await bcrypt.hash('yandex', 10);
          const newUser = await prisma.user.create({
            data: {
              name: profile.display_name,
              email: profile.default_email as string,
              avatar: `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200` || null,
              password: hashedPassword,
              type_autorize: 'yandex',
            },
          });
          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            image: newUser.avatar,
          };
        } else {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar,
          };
        }
      },
    }),

    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: Number(process.env.EMAIL_SERVER_PORT),
    //     auth: {
    //         user: process.env.EMAIL_SERVER_USER,
    //         pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // }),
    
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        password: { label: "Пароль", type: "password" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.password || !credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Пользователь с таким email не найден");
        }

        if (!(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("Неверный пароль");
        }

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return { id: user.id, name: user.name, email: user.email };
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, user, token }) {
      const dbUser = await prisma.user.findUnique({
          where: { email: session.user?.email as string },
      });

      if (dbUser && session.user) {
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.image = dbUser.avatar;
      }

      return session;
    },
  },
};
