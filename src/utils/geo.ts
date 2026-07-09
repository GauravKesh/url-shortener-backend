import geoip from "geoip-lite";

/**
 * Synchronously gets location from local memory database
 */
export const getLocationFromIpInternal = (ip: string | undefined): string | null => {
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return "Localhost";
  }

  // Remove IPv6 prefix if present (e.g., ::ffff:192.168.1.1)
  const cleanIp = ip.includes("::ffff:") ? ip.split("::ffff:")[1] : ip;

  const geo = geoip.lookup(cleanIp);
  
  if (geo) {
    // Returns format like "San Francisco, US"
    return `${geo.city}, ${geo.country}`;
  }

  return null;
};

/**
 * Asynchronously gets location using free ip-api.com
 */
export const getLocationFromIpExternal = async (ip: string | undefined): Promise<string | null> => {
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return "Localhost";
  }

  // Remove IPv6 prefix if present
  const cleanIp = ip.includes("::ffff:") ? ip.split("::ffff:")[1] : ip;

  try {
    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,city,countryCode`);
    const data = await response.json();

    if (data.status === "success") {
      // Returns format like "San Francisco, US"
      return `${data.city}, ${data.countryCode}`;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch location from IP:", error);
    return null;
  }
};