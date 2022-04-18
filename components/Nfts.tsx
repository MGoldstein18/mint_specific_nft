import {
  Box,
  SimpleGrid,
  Button,
  Flex,
  Image,
  Heading,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAddress, useNFTCollection, useMetamask } from '@thirdweb-dev/react';

const Nfts = () => {
  // State to set when we are loading
  const [loading, setLoading] = useState(false);
  // State for nft metadata
  const [nftMetadata, setNftMetadata] = useState([null]);

  const [fetchedNfts, setFetchedNfts] = useState(false);

  const fetchNfts = async () => {
    try {
      const response = await fetch('/api/get-nfts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setNftMetadata(data);
      setFetchedNfts(true);
    } catch (error) {
      console.error(error);
    }
  };
  // useEffect hook to get NFTs from API
  useEffect(() => {
    fetchNfts();
  }, [loading]);

  // Use address and connect with metamask
  const address = useAddress();
  const connectWithMetamask = useMetamask();

  // You can find your contract address in your dashboard after you have created an NFT Collection contract
  const nftCollectionAddress = '0x121923e1C44585d3e1417B1e3e7cE17be6546e7e';

  // Connect to contract using the address
  const nftCollection = useNFTCollection(nftCollectionAddress);

  // Function which generates signature and mints NFT
  const mintNft = async (id: number) => {
    setLoading(true);

    try {
      // Call API to generate signature and payload for minting
      const response = await fetch('/api/get-nfts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, address }),
      });

      console.log('generated');

      if (response) {
        connectWithMetamask;
        const data = await response.json();
        const mintInput = {
          signature: data.signature,
          payload: data.payload,
        };

        await nftCollection?.signature.mint(mintInput);

        alert('NFT successfully minted!');
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      alert('Failed to mint NFT!');
    }
  };

  if (fetchedNfts) {
    return (
      <SimpleGrid m='2rem' justifyItems='center' columns={3} spacing={10}>
        {nftMetadata?.map((nft: any) => (
          <Box
            key={nftMetadata.indexOf(nft)}
            maxW='sm'
            borderWidth='1px'
            borderRadius='lg'
            overflow='hidden'
          >
            <Image
              width='30rem'
              height='15rem'
              src={nft?.url}
              alt='NFT image'
            />

            <Flex p='1rem' alignItems='center' flexDir='column'>
              <Box
                mt='1'
                fontWeight='bold'
                lineHeight='tight'
                fontSize='20'
                isTruncated
                m='0.5rem'
              >
                {nft?.name}
              </Box>

              <Box fontSize='16' m='0.5rem'>
                {nft?.description}
              </Box>
              <Box fontSize='16' m='0.5rem'>
                {nft?.price}
              </Box>
              {loading ? (
                <p>Minting... You will need to approve 1 transaction</p>
              ) : nft?.minted ? (
                <b>This NFT has already been minted</b>
              ) : (
                <Button
                  colorScheme='purple'
                  m='0.5rem'
                  onClick={() => mintNft(nft?.id)}
                >
                  Mint
                </Button>
              )}
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    );
  } else {
    return <Heading>Loading...</Heading>;
  }
};

export default Nfts;
