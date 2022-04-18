import type { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
const path = require('path');
const { readFileSync, writeFileSync } = require('fs');

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
  ];

  switch (req.method) {
    case 'GET':
      res.status(200).json(nfts);
      break;
    case 'POST':
      // Get ID and address from request body and ensure that the requested NFT has not yet been minted
      const { id, address } = req.body;

      if (nfts[id].minted === true) {
        res.status(400).json({ message: 'Invalid request' });
      }

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
      const nftCollectionAddress = '0xB20B7AA964365A753Fb7412d98D76D139fd7Cbbd';

      // Initialize the NFT collection with the contract address
      const nftCollection = sdk.getNFTCollection(nftCollectionAddress);

      // Give 3 minutes to mint the NFT
      const startTime = new Date();
      const endTime = new Date(Date.now() + 180 * 1000);

      // Set up the NFT metadata
      const metadata = {
        metadata: {
          name: nfts[id].name,
          description: nfts[id].description,
          image: nfts[id].url,
        },
        price: nfts[id].price,
        mintStartTime: startTime,
        mintEndTime: endTime,
        to: address,
      };

      try {
        const response = await nftCollection?.signature.generate(metadata);

        // Update the minted status of the NFT to true so that it can't be minted again
        const newNFTs = nfts;
        newNFTs[id].minted = true;
        writeFileSync('data/nfts.json', JSON.stringify(newNFTs));

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
