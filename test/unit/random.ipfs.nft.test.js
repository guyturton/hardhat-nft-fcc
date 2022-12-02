const { assert, expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

//NOTE: 'InvalidConsumer() error occurs when you have the newer chainlink contract installed.
// need to run: yarn remove @chainlink/contracts
// then run: yarn add --dev @chainlink/contracts@0.4.1

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT unit tests", function () {
          let randomIpfsNftContract,
              accounts,
              deployer,
              mintFee,
              vrfCoordinatorV2Mock,
              subscriptionId;
          const chainId = network.config.chainId;

          // set up everything and create objects etc before starting tests
          beforeEach(async function () {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["mocks", "randomipfs"]);
              randomIpfsNftContract = await ethers.getContract("RandomIpfsNft", deployer); // get the contract that was just deployed.
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock"); // get the chainlink mock

              mintFee = await randomIpfsNftContract.getMintFee();
          });

          describe("constructor", function () {
              it("creates the constructor correctly", async function () {
                  const isInitialized = await randomIpfsNftContract.getInitialized();
                  assert.equal(isInitialized, true);
              });
              it("gets the token counter", async function () {
                  const tokenCounter = await randomIpfsNftContract.getTokenCounter();
                  assert.equal(tokenCounter, 0);
              });
              it("gets the dog token uri for index 0", async function () {
                  const tokenUri = await randomIpfsNftContract.getDogTokenUri(0);
                  assert.equal(tokenUri, "ipfs://QmYbbv4YDnXBTrwj4MB3QDLYqCYzz8UaaNYwGv2tjxPqX9");
              });
              it("gets the mint fee", async function () {
                  mintFee = await randomIpfsNftContract.getMintFee();
                  assert.equal(mintFee.toString(), networkConfig[chainId].mintFee.toString());
              });
              it("gets the chance array", async function () {
                  const chanceArr = await randomIpfsNftContract.getChanceArray();
                  assert.equal(chanceArr.length, 3);
              });
          });

          describe("requestNft", function () {
              it("reverts when there is not enough mint fee", async function () {
                  await expect(randomIpfsNftContract.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  );
              });
              it("reverts if payment amount is less than the mint fee", async function () {
                  await expect(
                      randomIpfsNftContract.requestNft({
                          value: mintFee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
              });

              it("emits event on enter when requesting a nft", async function () {
                  // will test that an event fired within the enterRaffle function
                  await expect(
                      randomIpfsNftContract.requestNft({ value: mintFee.toString() })
                  ).to.emit(randomIpfsNftContract, "NftRequested");
              });
          });

          describe("withdrawl", function () {
              it("successfully withdrawls funds", async function () {
                  const startingBalance = await accounts[0].getBalance();
                  const nft = await randomIpfsNftContract.connect(accounts[1]);

                  await nft.requestNft({ value: mintFee });
                  await network.provider.request({ method: "evm_mine", params: [] });

                  await randomIpfsNftContract.withdrawl();
                  const endingBalance = await accounts[0].getBalance();
                  //   console.log(startingBalance.toString());
                  //   console.log(endingBalance.toString());
                  assert(startingBalance < endingBalance);
              });
              it("reverts when another account besides the deployer tries to withdrawl", async function () {
                  const nft = randomIpfsNftContract.connect(accounts[1]);
                  await expect(nft.withdrawl()).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  );
              });
          });
          describe("fulfillRandomWords", () => {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNftContract.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNftContract.tokenURI("0");
                              const tokenCounter = await randomIpfsNftContract.getTokenCounter();
                              console.log(`Token Counter: ${tokenCounter}`);
                              assert.equal(tokenUri.toString().includes("ipfs://"), true);
                              assert.equal(tokenCounter.toString(), "1");
                              resolve();
                          } catch (e) {
                              console.log(e);
                              reject(e);
                          }
                      });
                      try {
                          const requestNftResponse = await randomIpfsNftContract.requestNft({
                              value: mintFee.toString(),
                          });
                          const requestNftReceipt = await requestNftResponse.wait(1);
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNftContract.address
                          );
                      } catch (e) {
                          console.log(e);
                          reject(e);
                      }
                  });
              });
          });

          describe("getBreedFromModdedRng", () => {
              it("should return pug if moddedRng < 10", async function () {
                  const expectedValue = await randomIpfsNftContract.getBreedFromModdedRng(7);
                  assert.equal(0, expectedValue);
              });
              it("should return shiba-inu if moddedRng is between 10 - 29", async function () {
                  const expectedValue = await randomIpfsNftContract.getBreedFromModdedRng(21);
                  assert.equal(1, expectedValue);
              });
              it("should return st. bernard if moddedRng is between 30 - 99", async function () {
                  const expectedValue = await randomIpfsNftContract.getBreedFromModdedRng(77);
                  assert.equal(2, expectedValue);
              });
              it("should revert if moddedRng > 99", async function () {
                  await expect(randomIpfsNftContract.getBreedFromModdedRng(100)).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds"
                  );
              });
          });
      });
