'use client'

import { CSSReset, ChakraProvider } from "@chakra-ui/react";
import { Web3Modal } from './Web3Modal';
import customTheme from './Theme';

type ProviderType = {
    children: React.ReactNode;
};

const Providers = ({ children }: ProviderType) => {
    return (
        <Web3Modal>
            <ChakraProvider theme={customTheme}>
                <CSSReset />
                {children}

            </ChakraProvider>
        </Web3Modal>
    )
}

export default Providers;