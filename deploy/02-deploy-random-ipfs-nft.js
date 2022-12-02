const env = require("hardhat");
const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");

const VRF_FUND_SUBSCRIPTION_AMT = ethers.utils.parseEther("30");
const imagesLocation = "./images/randomNft";

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            traitType: "Cuteness",
            value: 100,
        },
    ],
};

let tokenUris = [
    "ipfs://QmYbbv4YDnXBTrwj4MB3QDLYqCYzz8UaaNYwGv2tjxPqX9",
    "ipfs://QmVAUvg5LmRKdzewZZwYcJPBm7skBJD1Fbm251pjsHsRxK",
    "ipfs://QmcWCLKXsMsByRwQQaJ2HuvAMd2bR3PY6bn9eXSn7C6WVf",
];

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let vrfCoordinatorsV2Address, subscriptionId, vrfCoordinatorV2Mock;

    // need to upload images(nfts) to IPFS
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorsV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait(1);
        subscriptionId = txReceipt.events[0].args.subId;

        // need to fund the mock
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_FUND_SUBSCRIPTION_AMT);
    } else {
        log("Deploying to network");
        vrfCoordinatorsV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }

    log("------------------------------------");

    const args = [
        vrfCoordinatorsV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ];

    const randomNIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name)) {
        log("Verifying ....");
        await verify(randomNIpfsNft.address, args);
    }

    log("------------------------------------");
};

async function handleTokenUris() {
    tokenUris = [];

    // need to store image and metadata in IPFS
    const { responses: imagesUploadResponses, files } = await storeImages(imagesLocation);
    for (imagesUploadResponsesIndex in imagesUploadResponses) {
        // create the metadata and upload it
        let imageUriMetadata = { ...metadataTemplate };
        imageUriMetadata.name = files[imagesUploadResponsesIndex].replace(".png", "");
        imageUriMetadata.description = `An adorable ${imageUriMetadata.name}`;
        imageUriMetadata.image = `ipfs://${imagesUploadResponses[imagesUploadResponsesIndex].IpfsHash}`;
        console.log(`Uploading ${imageUriMetadata.name} ...`);

        // store the metadata for each nft
        const tokenUriMetadataREsponse = await storeTokenUriMetadata(imageUriMetadata);
        tokenUris.push(`ipfs://${tokenUriMetadataREsponse.IpfsHash}`);
    }

    console.log("Token Upload Complete.  They are:");
    console.log(tokenUris);
    return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
