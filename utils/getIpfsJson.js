import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';

const gatewayTools = new IPFSGatewayTools();
const gateways = [
  'https://ipfs.fleek.co',
  'https://cloudflare-ipfs.com',
  //"https://czodiac.mypinata.cloud",
  'https://gateway.ipfs.io',
  'https://nftstorage.link',
  'https://dweb.link',
];

export const getIpfsUrl = (sourceUrl, cycle = 0) => {
  //console.log('gateway',gateways[cycle%gateways.length])
  return gatewayTools.convertToDesiredGateway(
    sourceUrl,
    gateways[cycle % gateways.length]
  );
};

const inMemoryCache = new Map();

export const getIpfsJson = async (sourceUrl) => {
  console.log(sourceUrl);
  const s = window.localStorage;
  const cached = s.getItem(sourceUrl);
  if (cached != null) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    } catch (_) {
      // ignore invalid cache
    }
  }

  if (inMemoryCache.has(sourceUrl)) {
    return inMemoryCache.get(sourceUrl);
  }

  // Try each gateway in order; on network/CORS failures or non-OK status, fall back.
  for (let i = 0; i < gateways.length; i++) {
    const url = getIpfsUrl(sourceUrl, i);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { mode: 'cors', cache: 'no-store', signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.log('getIpfsJson non-OK status:', res.status, url);
        continue;
      }

      const item = await res.json();
      if (item && typeof item === 'object' && Object.keys(item).length > 0) {
        s.setItem(sourceUrl, JSON.stringify(item));
        inMemoryCache.set(sourceUrl, item);
      }
      return item;
    } catch (err) {
      console.log('getIpfsJson attempt failed:', url, err);
      // try next gateway
    }
  }

  // All gateways failed; return empty object and avoid poisoning cache with failures
  return {};
};
