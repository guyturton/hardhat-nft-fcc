const { ethers } = require("hardhat");

const networkConfig = {
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "6277",
        callbackGasLimit: "500000",
        interval: "30",
        wethToken: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        lendingPoolAddressesProvider: "0x5E52dEc931FFb32f609681B8438A51c675cc232d",
        daiEthPriceFeed: "0xb4c4a493AB6356497713A78FFA6c60FB53517c63",
        daiToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        mintFee: "10000000000000000", // 0.01 ETH
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
        interval: "30",
        subscriptionId: "588",
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        // This is the AaveV2 Lending Pool Addresses Provider
        lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
        mintFee: "10000000000000000", // 0.01 ETH
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    },
};

const developmentChains = ["hardhat", "loclhost"];
const DECIMALS = "18";
const INITIAL_PRICE = "200000000000000000000";

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_PRICE };
