
import { Client } from "@upstash/qstash";
import config from "../config.ts";

const qstashClient = new Client({
    baseUrl: config.qstash.url,
    token: config.qstash.token,
});

/**
 * Publish a message to a QStash endpoint.
 */
export async function publish(
    url: string,
    body?: unknown,
    headers?: Record<string, string>
) {
    return qstashClient.publishJSON({
        url,
        body,
        headers,
    });
}

/**
 * Export the client for advanced use cases.
 */
export { qstashClient };