'use client'

import { CSSReset, ChakraProvider } from "@chakra-ui/react";
import { Web3Modal } from './Web3Modal';
import customTheme from './Theme';
import { MenuProvider } from './Context'
import FullScreenMenu from "@components/Menu";

type ProviderType = {
    children: React.ReactNode;
};

const Providers = ({ children }: ProviderType) => {
    return (
        <Web3Modal>
            <MenuProvider>
                <ChakraProvider theme={customTheme}>
                    <CSSReset />
                    {children}
                </ChakraProvider>
            </MenuProvider>
        </Web3Modal>
    )
}

export default Providers;