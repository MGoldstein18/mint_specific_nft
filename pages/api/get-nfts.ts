import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ThirdwebSDK,
  PayloadToSign721,
  NFTMetadata,
  NFTMetadataOwner,
} from '@thirdweb-dev/sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export interface NFT {
  id: number;
  name: string;
  description: string;
  url: string;
  price: number;
  minted: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let nfts = [
    {
      id: 0,
      name: 'NFT 1',
      description: 'This is our first amazing NFT',
      url: 'https://bafybeihgfxd5f5sqili34vyjyfai6kezlagrya43e6bkgw6hnxucxug5ya.ipfs.nftstorage.link/',
      price: 0.01,
      minted: false,
    },
    {
      id: 1,
      name: 'NFT 2',
      description: 'This is our second amazing NFT',
      url: 'https://bafybeihgfxd5f5sqili34vyjyfai6kezlagrya43e6bkgw6hnxucxug5ya.ipfs.nftstorage.link/',
      price: 0.02,
      minted: false,
    },
    {
      id: 2,
      name: 'NFT 3',
      description: 'This is our third amazing NFT',
      url: 'https://bafybeihgfxd5f5sqili34vyjyfai6kezlagrya43e6bkgw6hnxucxug5ya.ipfs.nftstorage.link/',
      price: 0.03,
      minted: false,
    },
    {
      id: 3,
      name: 'NFT 4',
      description: 'This is our forth amazing NFT',
      url: 'https://bafybeihgfxd5f5sqili34vyjyfai6kezlagrya43e6bkgw6hnxucxug5ya.ipfs.nftstorage.link/',
      price: 0.01,
      minted: false,
    },
    {
      id: 4,
      name: 'NFT 5',
      description: 'This is our fifth amazing NFT',
      url: 'https://bafybeihgfxd5f5sqili34vyjyfai6kezlagrya43e6bkgw6hnxucxug5ya.ipfs.nftstorage.link/',
      price: 0.02,
      minted: false,
    },
    {
      id: 5,
      name: 'NFT 6',
      description: 'This is our sixth amazing NFT',
      url: 'https://bafybeihgfxd5f5sqili34vyjyfai6kezlagrya43e6bkgw6hnxucxug5ya.ipfs.nftstorage.link/',
      price: 0.03,
      minted: false,
    },
  ];

  // Connect to thirdweb SDK
  const sdk = new ThirdwebSDK(
    new ethers.Wallet(
      // Your wallet private key
      process.env.PRIVATE_KEY as string,
      // RPC URL
      ethers.getDefaultProvider(
        'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
      )
    )
  );

  // Set variable for the NFT collection contract address which can be found after creating an NFT collection in the dashboard
  const nftCollectionAddress = '0x121923e1C44585d3e1417B1e3e7cE17be6546e7e';

  // Initialize the NFT collection with the contract address
  const nftCollection = sdk.getNFTCollection(nftCollectionAddress);

  switch (req.method) {
    case 'GET':
      const mintedNfts: NFTMetadataOwner[] = await nftCollection?.getAll();
      if (!mintedNfts) {
        res.status(200).json(nfts);
      }
      mintedNfts.forEach((nft) => {
        if (nft.metadata.attributes) {
          // @ts-ignore
          nfts[nft.metadata.attributes.id].minted = true;
        }
      });
      res.status(200).json(nfts);
      break;
    case 'POST':
      // Get ID and address from request body and ensure that the requested NFT has not yet been minted
      const { id, address } = req.body;

      if (nfts[id].minted === true) {
        res.status(400).json({ message: 'Invalid request' });
      }

      // Give 3 minutes to mint the NFT
      const startTime = new Date();
      const endTime = new Date(Date.now() + 180 * 1000);

      // Set up the NFT metadata
      const metadata: PayloadToSign721 = {
        metadata: {
          name: nfts[id].name,
          description: nfts[id].description,
          image: nfts[id].url,
          attributes: { id },
        },
        price: nfts[id].price,
        mintStartTime: startTime,
        mintEndTime: endTime,
        to: address,
      };

      try {
        const response = await nftCollection?.signature.generate(metadata);

        res.status(201).json({
          payload: response?.payload,
          signature: response?.signature,
        });
      } catch (error) {
        res.status(500).json({ error });
        console.error(error);
      }
      break;
    default:
      res.status(200).json(nfts);
  }
}
