'use strict'

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Icon, useToast } from '@chakra-ui/react'
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useSignMessage } from 'wagmi';
import walletIcon from '/public/icons/walletIcon.svg'
import { auth, prepare, valid } from '../api/auth';

export default function ConnectButton() {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [clientLoaded, setClientLoaded] = useState(false);
  const [messageToSign, setMessageToSign] = useState();
  const toast = useToast()
  let authCounter = 0;
  const { signMessage } = useSignMessage({
    message: messageToSign,
    onSuccess: async (data) => {
      try {
        const res = await auth(address, messageToSign, data)
        toast({
          title: 'Successfully authenticated.',
          description: 'You are authorized to collect.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        })
        return res
      } catch (error) {
        toast({
          title: 'Unable to authenticated.',
          description: 'You will not be able to collect.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        })
        console.error(error)
        return error
      }
    },
    onError(error) {
      console.error('Error signing message:', error);
      toast({
        title: 'Unable to authenticated.',
        description: 'You will not be able to collect.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      })
    },
  });

  const prepareAuth = useCallback(async (address: `0x${string}` | undefined) => {
    try {
      if (authCounter > 0) return;
      authCounter++;
      const session = await valid(address)
      if (session.status === true) return
      const res = await prepare(address);
      setMessageToSign(res.update.message);
    } catch (error) {
      console.error('Error fetching message to sign:', error);
    }
  }, [messageToSign]);

  useEffect(() => {
    setClientLoaded(true);
    if (isConnected && address) {
      prepareAuth(address);
    }
  }, [address]);

  useEffect(() => {
    let timeout: any;

    if (messageToSign) {
      timeout = setTimeout(() => {
        signMessage();
      }, 1000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [messageToSign, signMessage]);

  return (
    <>
      {clientLoaded && (
        <Button variant="outline" onClick={() => open()} fill={'white'} p={"16px"} className='grow-on-hover'>
          {isConnected ?
            <Icon viewBox='0 0 24 24' fill='none' boxSize={"32px"}>
              <path d="M18 8V7.2C18 6.0799 18 5.51984 17.782 5.09202C17.5903 4.71569 17.2843 4.40973 16.908 4.21799C16.4802 4 15.9201 4 14.8 4H6.2C5.07989 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.0799 3 7.2V8M21 12H19C17.8954 12 17 12.8954 17 14C17 15.1046 17.8954 16 19 16H21M3 8V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V11.2C21 10.0799 21 9.51984 20.782 9.09202C20.5903 8.71569 20.2843 8.40973 19.908 8.21799C19.4802 8 18.9201 8 17.8 8H3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Icon> : 'Connect'
          }
        </Button>
      )}
    </>
  );
}
