import { auth } from "./firebaseAdmin";

export async function verifyUser(req) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) throw new Error("Unauthorized");

  return await auth.verifyIdToken(token);
}