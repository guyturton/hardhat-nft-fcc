const { assert, expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic Svg NFT unit tests", function () {
          let dynamicSvgNft, accounts, deployer, mintFee, mockV3Aggregator;
          const chainId = network.config.chainId;

          // set up everything and create objects etc before starting tests
          beforeEach(async function () {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["mocks", "dynamicsvg"]);
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer); // get the contract
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator"); // get the chainlink price feed mock
          });

          describe("constructor", function () {
              it("tests if token counter is initially set", async () => {
                  const tokenCount = await dynamicSvgNft.getTokenCounter();
                  const priceFeed = await dynamicSvgNft.getPriceFeed();
                  //   assert.equal(lowSVG, lowSVGImageuri)
                  //   assert.equal(highSVG, highSVGimageUri)
                  assert.equal(priceFeed, mockV3Aggregator.address);
                  assert.equal(tokenCount.toString(), "0");
              });
          });

          describe("mintNft", function () {
              it("emits event on enter when requesting a nft", async function () {
                  // will test that an event fired within the mintNft function
                  const highValue = ethers.utils.parseEther("1"); // 1 dollar per ether
                  await expect(dynamicSvgNft.mintNft(highValue)).to.emit(
                      dynamicSvgNft,
                      "CreatedNFT"
                  );

                  const tokenCount = await dynamicSvgNft.getTokenCounter();
                  assert.equal(tokenCount.toString(), "1");
              });
              //   it("shifts the token uri to lower when the price doesn't surpass the highvalue", async function () {
              //       const highValue = ethers.utils.parseEther("100000000"); // $100,000,000 dollar per ether. Maybe in the distant future this test will fail...
              //       const txResponse = await dynamicSvgNft.mintNft(highValue);
              //       await txResponse.wait(1);
              //       const tokenURI = await dynamicSvgNft.tokenURI(0);
              //       //assert.equal(tokenURI, lowTokenUri)
              //   });
          });
      });
