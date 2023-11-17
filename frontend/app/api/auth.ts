import axiosInstance from "./axios-config";

export async function prepare(address: `0x${string}` | undefined): Promise<any> {
  try {
    const response = await axiosInstance.get(
      `/auth/prepare?address=${address}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in prepare function:", error);
    return error;
  }
}

export async function valid(address: `0x${string}` | undefined): Promise<any> {
  try {
    const response = await axiosInstance.get(`/auth/valid?address=${address}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error in prepare function:", error);
    return error;
  }
}

export async function auth(
  walletAddress: `0x${string}` | undefined,
  message: string | undefined,
  signature: `0x${string}`
): Promise<any> {
  try {
    const response = await axiosInstance.post(
      "/auth",
      {
        walletAddress,
        message,
        signature,
      },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}
