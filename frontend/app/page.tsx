'use client'

import { useEffect, useState } from 'react';
import { collect, getCollectibles } from './api/collectible';
import { Box, Button, Flex, IconButton, Image, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useToast } from '@chakra-ui/react';
import { Collectible } from './types/collectibles.type';
import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons'
import { FaInfo } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { convertImage } from './utils/convertImage';

export default function Home() {
  const account = useAccount()
  const [collectibles, setCollectibles] = useState<Collectible[] | null>(null);
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollectible, setSelectedCollectible] = useState<Collectible | null>(null);

  const openModal = (collectible: Collectible) => {
    setSelectedCollectible(collectible);
    setIsModalOpen(true);
  };

  const nextSlide = () => {
    if (collectibles)
      setCurrentSlide((prev) => (prev === collectibles.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (collectibles)
      setCurrentSlide((prev) => (prev === 0 ? collectibles.length - 1 : prev - 1));
  };

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

  useEffect(() => {
    const fetchCollectibles = async () => {
      const data = await getCollectibles();
      setCollectibles(data);
    };
    fetchCollectibles();
  }, []);

  return (
    <Flex alignItems="center" justifyContent="center" paddingY="72px" paddingX="32px" gap="8px">
      {collectibles ? (
        <Flex direction="column" gap="32px" alignItems="center">
          <Flex alignItems='center' justifyContent='space-between' direction="column" key={collectibles[currentSlide]._id} gap="8px">
            <Flex direction="row" alignItems="center" justifyContent="space-between" w="full">
              <Text>{collectibles[currentSlide].metadata.name}</Text>
              {collectibles[currentSlide].minted !== collectibles[currentSlide].supply && (
                <Button onClick={async () => handleCollect(collectibles[currentSlide]._id)}>Collect</Button>
              )}
            </Flex>
            <Box position="relative" h='75vh' maxW='80vw'>
              <IconButton
                aria-label="Info"
                icon={<FaInfo />}
                position="absolute"
                color={"white"}
                backgroundColor={'none'}
                top={2}
                right={2}
                zIndex={2}
                onClick={() => openModal(collectibles[currentSlide])}
              />
              <Image
                src={convertImage(collectibles[currentSlide].metadata.image_url || collectibles[currentSlide].metadata.image)}
                alt={collectibles[currentSlide].metadata.name}
                h="100%"
                w="100%"
                objectFit="cover"
              />
            </Box>
            <Flex direction="row" position="fixed" bottom="32px" alignItems="center" justifyContent="space-between" mt="16px" h="16px" w='300px'>
              <Button variant={"ghost"} onClick={prevSlide}><ChevronLeftIcon /></Button>
              <Text>{collectibles[currentSlide].minted}/{collectibles[currentSlide].supply} Collected</Text>
              <Button variant={"ghost"} onClick={nextSlide}><ChevronRightIcon /></Button>
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
                    <Text fontStyle="italic">{selectedCollectible.metadata.description}</Text>
                    {selectedCollectible.metadata.attributes?.map((attribute, index) => (
                      <Flex key={index} direction="row" justifyContent="space-between">
                        <Text fontWeight="bold">{attribute.trait_type}:</Text>
                        <Text>{attribute.value}</Text>
                      </Flex>
                    ))}
                    <Flex direction="row" justifyContent="space-between" my='16px'>
                      <Link target='blank' href={`https://goerli.etherscan.io/address/${process.env.NEXT_PUBLIC_COLLECTIBLE_CONTRACT_ADDRESS || null}`}>Contract</Link>
                      <Link target='blank' href={selectedCollectible.metadata.image_url || selectedCollectible.metadata.animation_url}>Media</Link>
                      <Link target='blank' href={`${process.env.NEXT_PUBLIC_OPENSEA_LINK || null}`} >Opensea</Link>
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
  );
}