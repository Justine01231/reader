import argon2 from "argon2";

const MEMORY_COST = Number(process.env.ARGON2_MEMORY ?? 19456);
const TIME_COST = Number(process.env.ARGON2_TIME ?? 2);
const PARALLELISM = Number(process.env.ARGON2_PARALLELISM ?? 1);

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: MEMORY_COST,
    timeCost: TIME_COST,
    parallelism: PARALLELISM,
  });
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}