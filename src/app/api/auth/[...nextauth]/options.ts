import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from 'next-auth/providers/email';
import prisma from '@/lib/prisma';
import { createTransport } from "nodemailer"

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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
          html: magicLinkTemplate(url, email)
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
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (user) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email as string,
              name: user.email?.split('@')[0],
              emailVerified: new Date(),
              avatarUrl: null,
            },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token) {
        const us = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (session.user) {
          session.user.name = us?.name;
          session.user.image = us?.avatarUrl;
          session.user.email = us?.email;
        }
      }
      return session;
    },
  },
};

function magicLinkTemplate(url: string, email: string) {
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
