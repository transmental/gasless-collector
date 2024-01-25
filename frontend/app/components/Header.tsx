'use client'

import { Flex, Image } from "@chakra-ui/react";
import React from "react";
import ConnectButton from "./ConnectButton";
import { useMenuContext } from "../providers/Context";

const Header: React.FC = () => {
    const { menuOpen, setMenuOpen } = useMenuContext();

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
            </Flex>
            <Flex flex={1} justifyContent="flex-end">
                <ConnectButton />
            </Flex>
        </Flex>
    );
};

export default Header;
