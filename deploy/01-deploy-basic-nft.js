const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    log("-----------------------------");
    const args = [];

    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.waitConfirmations || 1,
    });

    if (!developmentChains.includes(network.name)) {
        log("Verifying ....");
        await verify(basicNft.address, args);
    }
    log("------------------------------------");
};

module.exports.tags = ["all", "basicnft", "main"];
