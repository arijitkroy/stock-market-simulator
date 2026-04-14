import { auth, db } from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token missing" });
    }

    const decoded = await auth.verifyIdToken(token);

    const uid = decoded.uid;
    const email = decoded.email;

    const userRef = db.collection("users").doc(uid);
    const portfolioRef = db.collection("portfolios").doc(uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email,
        balance: 100000,
        createdAt: Date.now(),
      });

      await portfolioRef.set({
        holdings: [],
      });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}