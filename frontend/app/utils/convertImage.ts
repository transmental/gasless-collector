export function convertImage(url: string) {
  if (url.startsWith("ipfs://")) {
    const updatedUrl = url.replace("ipfs://", "https://ipfs.io/ipfs/");
    return updatedUrl;
  }
  return url;
}
