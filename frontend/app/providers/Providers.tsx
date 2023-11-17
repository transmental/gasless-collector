'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { CSSReset, ChakraProvider } from "@chakra-ui/react";
import { Web3Modal } from './Web3Modal';
import customTheme from './Theme';
import customTheme2 from './Theme2';

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