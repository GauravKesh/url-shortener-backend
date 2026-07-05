import crypto from "crypto";



const hashKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

const generateApiKey = () => {
  const rawKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = hashKey(rawKey);

  return { rawKey, keyHash };
};

const sanitizeApiKey = (key: any) => {
  const { key_hash, ...safe } = key;
  return safe;
};

const toPublicApiKey = (key: any) => {
  const { id, key_hash, ...safe } = key;
  return safe;
};


export {generateApiKey,hashKey,sanitizeApiKey,toPublicApiKey}