import { db } from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/auth";
import { getStockPrice } from "@/lib/market";

export default async function handler(req, res) {
  try {
    const user = await verifyUser(req);
    const { symbol, quantity } = req.body;

    const price = await getStockPrice(symbol);

    const userRef = db.collection("users").doc(user.uid);
    const portfolioRef = db.collection("portfolios").doc(user.uid);

    await db.runTransaction(async (tx) => {
      const portfolioDoc = await tx.get(portfolioRef);
      const userDoc = await tx.get(userRef);

      const holdings = portfolioDoc.data()?.holdings || [];
      const balance = userDoc.data()?.balance || 0;

      const index = holdings.findIndex(h => h.symbol === symbol);
      if (index === -1) throw new Error("Stock not owned");

      const stock = holdings[index];
      if (stock.quantity < quantity) {
        throw new Error("Not enough shares");
      }

      stock.quantity -= quantity;
      if (stock.quantity === 0) {
        holdings.splice(index, 1);
      }

      tx.update(portfolioRef, { holdings });
      tx.update(userRef, { balance: balance + price * quantity });
    });

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}