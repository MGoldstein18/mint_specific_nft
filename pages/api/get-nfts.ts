import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ThirdwebSDK,
  PayloadToSign721,
  NFTMetadataOwner
} from '@thirdweb-dev/sdk';
import { ethers } from 'ethers';
// We use dotenv to securely manage our private key.
// If you deploy this project to Vercel, use their environment variable management instead
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let nfts = [
    {
      id: 0, // Unique ID for each NFT corresponding to its position in the array
      name: 'NFT 1', // A name for the NFT
      description: 'This is our first amazing NFT', // Description for the NFT
      url: 'https://bafybeihgfxd5f5sqili34vyjyfai6kezlagrya43e6bkgw6hnxucxug5ya.ipfs.nftstorage.link/', // URL for the NFT image
      price: 0.01, // The price of the NFT
      minted: false // A variable to indicate if the NFT has been minted
    },
    {
      id: 1,
      name: 'NFT 2',
      description: 'This is our second amazing NFT',
      url: 'https://bafybeida2kkclur4345iihiqb6pepfnwse7ko7pvrft4duxwxxwo2jqqjq.ipfs.nftstorage.link/',
      price: 0.02,
      minted: false
    },
    {
      id: 2,
      name: 'NFT 3',
      description: 'This is our third amazing NFT',
      url: 'https://bafybeidegtxcfpr43d6vbrippnm2csxqst7stxaxl3rp5vd27ss6yd3s5e.ipfs.nftstorage.link/',
      price: 0.03,
      minted: false
    },
    {
      id: 3,
      name: 'NFT 4',
      description: 'This is our forth amazing NFT',
      url: 'https://bafybeieicywyvnaher24isrxoagjxbro6qr6kbzcz2feldbquoqeag7ivm.ipfs.nftstorage.link/',
      price: 0.01,
      minted: false
    },
    {
      id: 4,
      name: 'NFT 5',
      description: 'This is our fifth amazing NFT',
      url: 'https://bafybeieufjiaqny6q6kis2ehv2w6epwqzkeoscfc3ltck67dunrbvseczq.ipfs.nftstorage.link/',
      price: 0.02,
      minted: false
    },
    {
      id: 5,
      name: 'NFT 6',
      description: 'This is our sixth amazing NFT',
      url: 'https://bafybeiftcf7xruf4gmlbme6bos5tznlrvz46xfxdnofp3auibvzbizysoy.ipfs.nftstorage.link/',
      price: 0.03,
      minted: false
    }
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
      try {
        // Get all the NFTs that have been minted from the contract
        const mintedNfts: NFTMetadataOwner[] = await nftCollection?.getAll();
        // If no NFTs have been minted, return the array of NFT metadata
        if (!mintedNfts) {
          res.status(200).json(nfts);
        }
        // If there are NFTs that have been minted, go through each of them
        mintedNfts.forEach((nft) => {
          if (nft.metadata.attributes) {
            // Find the id attribute of the NFT
            // @ts-expect-error
            const positionInMetadataArray = nft.metadata.attributes.id;
            // Change the minted status of the NFT metadata at the position of ID in the NFT metadata array
            nfts[positionInMetadataArray].minted = true;
          }
        });
      } catch (error) {
        console.error(error);
      }
      res.status(200).json(nfts);
      break;
    case 'POST':
      // Get ID of the NFT to mint and address of the user from request body
      const { id, address } = req.body;

      // Ensure that the requested NFT has not yet been minted
      if (nfts[id].minted === true) {
        res.status(400).json({ message: 'Invalid request' });
      }

      // Allow the minting to happen anytime from now
      const startTime = new Date(0);

      // Find the NFT to mint in the array of NFT metadata using the ID
      const nftToMint = nfts[id]

      // Set up the NFT metadata for signature generation
      const metadata: PayloadToSign721 = {
        metadata: {
          name: nftToMint.name,
          description: nftToMint.description,
          image: nftToMint.url,
          // Set the id attribute which we use to find which NFTs have been minted
          attributes: { id }
        },
        price: nftToMint.price,
        mintStartTime: startTime,
        to: address
      };

      try {
        const response = await nftCollection?.signature.generate(metadata);

        // Respond with the payload and signature which will be used in the frontend to mint the NFT
        res.status(201).json({
          payload: response?.payload,
          signature: response?.signature
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
