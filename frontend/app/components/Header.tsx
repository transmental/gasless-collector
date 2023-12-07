'use client'

import { Flex, Text, Image, useMediaQuery, useColorMode, theme } from "@chakra-ui/react";
import React from "react";
import ConnectButton from "./ConnectButton";
import Link from "next/link";
import ColorSwitcher from "./ColorMode";
import { useMenuContext } from "../providers/Context";

const Header: React.FC = () => {
    const { menuOpen, setMenuOpen } = useMenuContext();
    // const [isLargerThan500] = useMediaQuery("(min-width: 500px)");
    // const { colorMode } = useColorMode()

    return (
        <Flex
            as="header"
            width="full"
            padding={8}
            align="center"
            justifyContent="space-between"
            position='fixed'
            h='120px'
            zIndex={2}
        >
            <Flex justifyContent="flex-start" align="center" flex={2}>
                <Image src={'icons/logo.svg'} alt="logo" cursor="pointer" boxSize={'80px'} mr={4} className="grow-on-hover" onClick={() => setMenuOpen(!menuOpen)} />
                {/* {isLargerThan500 && <Text fontSize="2xl">Tokyo Kageru</Text>} */}
            </Flex>
            <Flex flex={1} justifyContent="flex-end">
                <ConnectButton />
            </Flex>
        </Flex>
    );
};

export default Header;
