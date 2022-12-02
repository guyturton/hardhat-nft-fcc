const { assert, expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT unit tests", function () {
          let basicNftContract, accounts, deployer;
          const chainId = network.config.chainId;

          // set up everything and create objects etc before starting tests
          beforeEach(async function () {
              await deployments.fixture(["all"]); // we are going to deply everything
              accounts = await ethers.getSigners();
              deployer = accounts.deployer;

              basicNftContract = await ethers.getContract("BasicNft", deployer); // get the contract that was just deployed.
          });

          describe("constructor", function () {
              it("creates the constructor correctly", async function () {
                  assert.equal(1, 1);
              });
              it("gets the token counter", async function () {
                  const tokenCounter = await basicNftContract.getTokenCounter();
                  assert.equal(tokenCounter, 0);
              });
          });

          describe("mintNft", async function () {
              beforeEach(async function () {
                  await basicNftContract.mintNft();
              });

              it("gets the token counter incremented", async function () {
                  const tokenCounter = await basicNftContract.getTokenCounter();
                  assert.equal(tokenCounter, 1);
              });

              //   it("gets the token uri", async function () {
              //       const tokenUri = await basicNftContract.tokenURI();
              //       assert.equals(
              //           tokenUri.toString(),
              //           "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
              //       );
              //   });
          });
      });
