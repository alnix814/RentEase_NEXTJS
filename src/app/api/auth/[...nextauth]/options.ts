import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from 'next-auth/providers/email';
import prisma from '@/lib/prisma';
import { createTransport } from "nodemailer"
import YandexProvider from 'next-auth/providers/yandex';
import { NextAuthOptions } from "next-auth";

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID as string,
      clientSecret: process.env.YANDEX_CLIENT_SECRET as string,

      id: "yandex",
      name: "Yandex",
      authorization:
        "https://oauth.yandex.ru/authorize?scope=login:info+login:email+login:avatar",
      token: "https://oauth.yandex.ru/token",
      userinfo: "https://login.yandex.ru/info?format=json",

      style: {
        logo: "/yandex.png",
        bg: "#ffcc00",
        text: "#000",
      },

      async profile(profile) {
        return {
          id: profile.id,
          name: profile.display_name ?? profile.real_name ?? profile.first_name,
          email: profile.default_email,
          image:
            !profile.is_avatar_empty && profile.default_avatar_id
              ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
              : null,
        }
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email
          },
        });

        if (!user) {
          return null;
        }

        if (credentials?.email === user.email && credentials?.password === user.password) {
          return user;
        } else {
          return null;
        }

      }
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM,
      maxAge: 3600,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from }
      }) {
        const { host } = new URL(url)
        const transport = createTransport(server)

        await transport.sendMail({
          to: email,
          from,
          subject: `Вход в ${host}`,
          html: magicLinkTemplate(url)
        })
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  session: {
    strategy: 'jwt',
  },
  pages: {
    error: "/error",
    signIn: '/',
    verifyRequest: '/api/auth/verify-request',

  },
  debug: true,
  callbacks: {
    async signIn({ user, account}) {
      if (user) {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: user.email as string,
              name: user.email?.split('@')[0] || user.name as string,
              emailVerified: new Date(),
              avatarUrl: user.image,
              aPassword: false,
              role: 'user',
              accounts: {
                create: {
                  type: account?.type as string,
                  provider: account?.provider as string,
                  providerAccountId: account?.providerAccountId as string,
                  access_token: account?.access_token as string ,
                  refresh_token: account?.refresh_token as string ,
                  expires_at: account?.expires_at as number ,
                },
              },
            },
          });

          await prisma.account.create({
            data: {
              userId: existingUser.id, // ✅ Теперь точно будет id
              type: account?.type as string,
              provider: account?.provider as string,
              providerAccountId: account?.providerAccountId as string,
              access_token: account?.access_token as string ,
              refresh_token: account?.refresh_token as string ,
              expires_at: account?.expires_at as number ,
            },
          });
        }
      }

      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const user = await prisma.user.findUnique({
          where: {
            email: token.email as string,
          },
        });

        if (user) {
          token.role = user.role;
          token.id = user.id;
        }

      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const us = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (session.user) {
          session.user.id = us?.id;
          session.user.name = us?.name;
          session.user.image = us?.avatarUrl;
          session.user.email = us?.email;
          session.user.aPassword = us?.aPassword;
        }
      }
      return session;
    },
  },
};

function magicLinkTemplate(url: string) {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <div style="max-width: 500px; margin: 0 auto; font-family: Arial;">
          <h1>🔮 Вход в систему</h1>
          <p>Привет!</p>
          <p>Нажмите кнопку ниже для входа:</p>
          <a 
            href="${url}" 
            style="
              display: inline-block; 
              padding: 10px 20px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none;
              border-radius: 5px;
            "
          >
            Войти
          </a>
          <p>Ссылка действительна 1 час</p>
        </div>
      </body>
    </html>
  `
}
