import { v4 as uuidv4 } from "uuid";

export const users: {
  id: string;
  email: string;
  password: string;
  usd_balance: number;
}[] = [];
export const trades: any[] = [];

export const assets = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    buyPrice: 1002000000,
    sellPrice: 1000000000,
    decimals: 4,
    imageUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  },
  {
    name: "Solana",
    symbol: "SOL",
    buyPrice: 2000000,
    sellPrice: 1900000,
    decimals: 4,
    imageUrl: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },
];

export function seedUser(email: string, password: string) {
  const userId = uuidv4();
  users.push({ id: userId, email, password, usd_balance: 1000000 });
  return userId;
}
