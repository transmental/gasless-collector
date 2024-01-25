export function convertImage(url: string) {
  if (url.startsWith("ipfs://")) {
    const updatedUrl = url.replace("ipfs://", "https://tofushop.mypinata.cloud/ipfs/");
    return updatedUrl;
  }
  return url;
}
