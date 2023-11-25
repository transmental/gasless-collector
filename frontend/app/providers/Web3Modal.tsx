"use client";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { arbitrum, goerli, mainnet } from 'viem/chains'
import { ReactNode } from 'react';

type Web3ModalProps = {
    children: ReactNode;
};

const projectId = process.env.NEXT_PUBLIC_WEB3MODAL_ID || ''

const metadata = {
    name: 'Web3Modal',
    description: 'Web3Modal Example',
    url: 'https://web3modal.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({ wagmiConfig, projectId, chains })

export function Web3Modal({ children }: Web3ModalProps) {
    return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}