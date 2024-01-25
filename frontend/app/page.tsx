'use client'

import { useCallback, useEffect, useState } from 'react';
import { collect, getCollectibles } from './api/collectible';
import { Box, Button, Flex, IconButton, Image, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useColorMode, useMediaQuery, useToast } from '@chakra-ui/react';
import { Collectible } from './types/collectibles.type';
import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons'
import { FaInfo } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { convertImage } from './utils/convertImage';
import Layout from '@components/Layout';
import { motion } from "framer-motion"

export default function Home() {
  const account = useAccount()
  const [collectibles, setCollectibles] = useState<Collectible[] | null>(null);
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollectible, setSelectedCollectible] = useState<Collectible | null>(null);
  const [isLargerThan1100] = useMediaQuery("(min-width: 1100px)");
  const { setColorMode } = useColorMode()

  useEffect(() => {
    setColorMode('dark')
  }, [])

  const openModal = (collectible: Collectible) => {
    setSelectedCollectible(collectible);
    setIsModalOpen(true);
  };

  const nextSlide = useCallback(() => {
    if (collectibles) {
      setCurrentSlide((prev) => (prev === collectibles.length - 1 ? 0 : prev + 1));
    }
  }, [collectibles]);

  const prevSlide = useCallback(() => {
    if (collectibles) {
      setCurrentSlide((prev) => (prev === 0 ? collectibles.length - 1 : prev - 1));
    }
  }, [collectibles]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'ArrowRight') {
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    if (collectibles)
      setSelectedCollectible(collectibles[currentSlide])
  }, [collectibles, currentSlide])

  const handleCollect = async (collectibleId: string) => {
    setLoading(true)
    console.log(loading)
    const loadingToast = toast({
      title: 'Collecting...',
      description: 'This may take a moment...',
      status: 'loading',
      duration: null,
      isClosable: true,
      position: 'top-right'
    })
    const res = await collect(account.address, collectibleId)
    toast.close(loadingToast)
    if (res.status !== true) {
      setLoading(false)
      console.log(res)
      toast({
        title: res.txRes?.error || res.message || 'Error',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      })
    }
    if (res.status === true) {
      console.log(res)
      fetchCollectibles()
      setLoading(false)
      toast({
        title: 'Success',
        description: `Successfully collected token ID: ${res?.txRes?.tokenID}` || null,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      })
    }
  }

  const fetchCollectibles = async () => {
    const data = await getCollectibles();
    setCollectibles(data);
  };

  useEffect(() => {
    fetchCollectibles();
  }, []);

  const State = {
    COLLECT: 'COLLECT',
    COLLECTED: 'COLLECTED',
    NONE: 'NONE',
  };

  const determineState = () => {
    if (account.address && collectibles) {
      if (collectibles[currentSlide].minted !== collectibles[currentSlide].supply && !collectibles[currentSlide].collectedBy.includes(account.address.toString())) {
        return State.COLLECT;
      }
      if (collectibles[currentSlide].collectedBy.includes(account.address.toString())) {
        return State.COLLECTED;
      }
    }
    return State.NONE;
  };

  const currentState = determineState();

  return (
    <Layout>
      <Flex alignItems="center" justifyContent="center" gap="8px" h={"100vh"}>
        {collectibles ? (
          <Flex direction="column" gap="32px" alignItems="center" justifyItems={'center'}>
            <Flex alignItems='center' justifyContent='space-between' direction="column" key={collectibles[currentSlide]._id} gap="8px">
              {collectibles.length > 1 && <Button className="grow-on-hover" variant={"ghost"} borderRadius={"8px"} position={"absolute"} top={"50%"} left={isLargerThan1100 ? "32px" : "8px"} onClick={prevSlide}><ChevronLeftIcon stroke={"none"} boxSize={"32px"} /></Button>}
              {collectibles.length > 1 && <Button className="grow-on-hover" variant={"ghost"} borderRadius={"8px"} position={"absolute"} top={"50%"} right={isLargerThan1100 ? "32px" : "8px"} onClick={nextSlide}><ChevronRightIcon stroke={"none"} boxSize={"32px"} /></Button>}
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 200 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={convertImage(collectibles[currentSlide].metadata.image_url || collectibles[currentSlide].metadata.image)}
                  alt={collectibles[currentSlide].metadata.name}
                  h={isLargerThan1100 ? "80vh" : "70vh"}
                  maxW="80vw"
                  objectFit="cover"
                />
              </motion.div>
              <Flex
                as="footer"
                width="full"
                padding={8}
                align="center"
                position='fixed'
                h='80px'
                bottom='0px'
                zIndex={2}
              >
                <Flex justifyContent={"space-between"} align={"center"} w={"100vw"}>
                  <IconButton
                    aria-label="Info"
                    icon={<FaInfo />}
                    color={"white"}
                    backgroundColor={'none'}
                    zIndex={1}
                    onClick={() => openModal(collectibles[currentSlide])}
                    justifySelf={"flex-start"}
                    variant={"outline"}
                    className='grow-on-hover'
                  />
                  {(() => {
                    switch (currentState) {
                      case State.COLLECT:
                        return <Button className="grow-on-hover" onClick={async () => handleCollect(collectibles[currentSlide]._id)}>Collect</Button>;
                      case State.COLLECTED:
                        return <Flex boxSize={"auto"} borderRadius={"16px"} p={"8px"}><Text fontWeight={'bold'}>Collected</Text></Flex>;
                      default:
                        return <Box w="80px" h="56px" visibility="hidden"></Box>;
                    }
                  })()}
                </Flex>
              </Flex>
            </Flex>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
              <ModalOverlay backdropFilter='blur(10px)' />
              <ModalContent>
                <ModalHeader fontSize="3xl" fontWeight='bolder'>{selectedCollectible?.metadata.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {selectedCollectible && (
                    <Flex direction="column" gap="16px">
                      {selectedCollectible.metadata.description && (<Text fontStyle="italic">{selectedCollectible.metadata.description}</Text>)}
                      <Flex direction="row" justifyContent="space-between">
                        <Text fontWeight="bold">Availability:</Text>
                        <Text>{collectibles[currentSlide].supply - collectibles[currentSlide].minted} / {collectibles[currentSlide].supply}</Text>
                      </Flex>
                      {selectedCollectible.metadata.attributes?.map((attribute, index) => (
                        <Flex key={index} direction="row" justifyContent="space-between">
                          <Text fontWeight="bold">{attribute.trait_type}:</Text>
                          <Text>{attribute.value}</Text>
                        </Flex>
                      ))}
                      <Flex direction="row" justifyContent="space-between" my='16px'>
                        <Link className="grow-on-hover" target='blank' href={`https://arbiscan.io/address/${process.env.NEXT_PUBLIC_COLLECTIBLE_CONTRACT_ADDRESS || null}`}>Contract</Link>
                        <Link className="grow-on-hover" target='blank' href={convertImage(selectedCollectible.metadata.image)}>Media</Link>
                        <Link className="grow-on-hover" target='blank' href={`${process.env.NEXT_PUBLIC_OPENSEA_LINK || null}`} >Opensea</Link>
                      </Flex>
                    </Flex>
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>
          </Flex>
        ) : (
          <p>Loading...</p>
        )}
      </Flex>
    </Layout>
  );
}