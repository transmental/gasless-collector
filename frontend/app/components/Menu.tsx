import React, { useState } from 'react';
import { Flex, VStack, Link, Button, CloseButton } from "@chakra-ui/react";
import { useMenuContext } from '../providers/Context';

const FullScreenMenu = () => {
    const { menuOpen, setMenuOpen } = useMenuContext();

    return (
        <>
            {menuOpen && (
                <Flex
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="rgba(0, 0, 0, 0.8)" // Semi-transparent background
                    zIndex={10} // Ensure it's above other content
                    align="center"
                    justify="center"
                    onClick={() => setMenuOpen(!menuOpen)}
                    backdropFilter='blur(16px) invert(90)'
                >
                    <CloseButton size={"xl"} position={"absolute"} top={"32px"} right={"32px"} onClick={() => setMenuOpen(!menuOpen)} />
                    <VStack spacing={4}>
                        <Link className='grow-on-hover' target='blank' href="https://x.com/transmental" color="white" fontSize="xl">Twitter</Link>
                        <Link className='grow-on-hover' target='blank' href="https://discord.gg/Pfy5VMcxqP" color="white" fontSize="xl">Discord</Link>
                        <Link className='grow-on-hover' target='blank' href="https://tofushop.mypinata.cloud/ipfs/QmP9tUeHJf5kGSPMuSsasgnsbSGHiG9WC4YFpb14bHcDv4/examples/player/" color="white" fontSize="xl">Sake Files</Link>
                        <Link className='grow-on-hover' target='blank' href="https://ukiyo.foundnone.xyz/" color="white" fontSize="xl">Ukiyo Dashboard</Link>
                        <Link className='grow-on-hover' target='blank' href="https://www.cryptovoxels.com/play?coords=NE@1181.5E,840S,0.5U" color="white" fontSize="xl">Voxels Research Center</Link>
                    </VStack>
                </Flex>
            )}
        </>
    );
};

export default FullScreenMenu;
