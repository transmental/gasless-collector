import { Collectible } from "../types/collectibles.type";
import axiosInstance from "./axios-config";

export async function getCollectibles(): Promise<Collectible[] | null> {
  try {
    const res = await axiosInstance.get(`/collectibles`);
    return res.data.collectibles;
  } catch (error) {
    console.error("Error in prepare function:", error);
    return null;
  }
}

export async function collect(
  toAddress: `0x${string}` | undefined,
  collectibleId: string
): Promise<any> {
  const res = await axiosInstance.post(
    "/collect",
    { toAddress, collectibleId },
    { withCredentials: true }
  );
  return res.data;
}
