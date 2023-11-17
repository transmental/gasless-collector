'use client'

import { Flex, Text, Image, useMediaQuery, useColorMode, theme } from "@chakra-ui/react";
import React from "react";
import ConnectButton from "./ConnectButton";
import Link from "next/link";
import ColorSwitcher from "./ColorMode";

const Header: React.FC = () => {
    // const [isLargerThan500] = useMediaQuery("(min-width: 500px)");
    const { colorMode } = useColorMode()

    return (
        <Flex
            as="header"
            width="full"
            padding={8}
            align="center"
            justifyContent="space-between"
            position='fixed'
            h='72px'
            zIndex={2}
            backgroundColor={colorMode === 'light' ? '#F0F4EF' : '#1D1D20'}
        >
            <Link href="/">
                <Flex justifyContent="flex-start" align="center" flex={2}>
                    <Image src={colorMode === 'dark' ? 'icons/logo.svg' : 'icons/logo-black.svg'} alt="logo" boxSize={'50px'} mr={4} />
                    {/* {isLargerThan500 && <Text fontSize="2xl">Foundnone Collectibles</Text>} */}
                </Flex>
            </Link>
            <Flex flex={1} gap="16px" justifyContent="flex-end">
                <ColorSwitcher />
                <ConnectButton />
            </Flex>
        </Flex>
    );
};

export default Header;
