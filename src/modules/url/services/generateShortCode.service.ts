import { randomBytes } from "crypto";

import config from "../../../config/config.ts";
import { isShortCodeTaken } from "../repository/url.repository.ts";
import { AppError } from "../../../utils/AppError.ts";
import { ERRORS } from "../../../constants/index.ts";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_ATTEMPTS = 10;

const buildShortCode = (length: number) => {
    const bytes = randomBytes(length);
    let shortCode = "";

    for (let index = 0; index < length; index += 1) {
        shortCode += ALPHABET[bytes[index] % ALPHABET.length];
    }

    return shortCode;
};

export const generateShortCode = async (shortCode?: string): Promise<string> => {
    if (shortCode) {
        const exists = await isShortCodeTaken(shortCode);
        if (exists) {
            throw new AppError(ERRORS.ALIAS_TAKEN);
        }

        return shortCode;
    }

    const shortCodeLength = config.url.shortCodeLength;

    for (let attempt = 0; attempt < DEFAULT_ATTEMPTS; attempt += 1) {
        const candidate = buildShortCode(shortCodeLength);
        const exists = await isShortCodeTaken(candidate);

        if (!exists) {
            return candidate;
        }
    }

    throw new AppError(ERRORS.BAD_REQUEST);
};
