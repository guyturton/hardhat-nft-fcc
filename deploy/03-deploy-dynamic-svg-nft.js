const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;

    log("-----------------------------");

    if (developmentChains.includes(network.name)) {
        // Find ETH/USD price feed
        log("Local network detected.  Deploying mocks ...");
        const EthUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = EthUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" });
    const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" });

    args = [ethUsdPriceFeedAddress, lowSVG, highSVG];
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name)) {
        log("Verifying ....");
        await verify(dynamicSvgNft.address, args);
    }

    log("------------------------------------");
};

module.exports.tags = ["all", "dynamicsvg", "main"];
