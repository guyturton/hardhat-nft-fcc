const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config.js");

// This script just mints the nft's we have built

// for the random ipfs nft contract you need to create the following before minting:
// - VRF Consumer on the testnet chain ex: https://vrf.chain.link/goerli/6277

//

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // Basic NFT
    const basicNft = await ethers.getContract("BasicNft", deployer);
    const basicNftTx = await basicNft.mintNft();
    await basicNftTx.wait(1);
    console.log(`Basic Nft token 0 has been minted at: ${await basicNft.tokenURI(0)}`);

    // Random IPFS NFT

    //NOTE: 'InvalidConsumer() error occurs when you have the newer chainlink contract installed when minting on local hardhat chain.
    // need to run: yarn remove @chainlink/contracts
    // then run: yarn add --dev @chainlink/contracts@0.4.1

    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
    const mintFee = await randomIpfsNft.getMintFee();

    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() });
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);
    // Need to listen for response
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 600000); // 10 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            resolve();
        });
        if (chainId == 31337) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString();
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address);
        }
    });

    console.log(`Random IPFS Nft token 0 has been minted at: ${await randomIpfsNft.tokenURI(0)}`);

    // Mint dynamic SVG NFT
    const highValue = ethers.utils.parseEther("40000");
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString());
    await dynamicSvgNftMintTx.wait(1);

    console.log(`Dynamic Svg Nft token 0 has been minted at: ${await dynamicSvgNft.tokenURI(0)}`);
};

module.exports.tags = ["all", "mint"];
