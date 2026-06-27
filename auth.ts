import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// 允許登入後台的 email 清單（以逗號分隔，設定於 .env.local 的 ALLOWED_EMAILS）。
// 若未設定，預設只允許網站擁有者。
const allowedEmails = (process.env.ALLOWED_EMAILS ?? "prayer168@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 部署在 Railway 等反向代理後方時需信任轉發的 Host 標頭
  trustHost: true,
  providers: [Google],
  callbacks: {
    // 只允許清單內的 Google 帳號登入
    signIn({ user }) {
      const email = user.email?.toLowerCase();
      return !!email && allowedEmails.includes(email);
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  pages: {
    signIn: "/login",
  },
});
