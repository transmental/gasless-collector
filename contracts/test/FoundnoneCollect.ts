import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { keccak256 } from "ethers";
import { ethers } from "hardhat";

describe("FoundnoneCollect", function () {
  async function deployNFTFixture() {
    const [owner, relayer, admin, otherAccount] = await ethers.getSigners();

    const FoundnoneCollect = await ethers.getContractFactory(
      "FoundnoneCollect"
    );
    const foundnoneCollect = await FoundnoneCollect.deploy();

    // Grant the relayer and admin roles
    await foundnoneCollect.grantRole(
      await foundnoneCollect.RELAYER_ROLE(),
      relayer.address
    );
    await foundnoneCollect.grantRole(
      await foundnoneCollect.ADMIN_ROLE(),
      admin.address
    );

    return { foundnoneCollect, owner, relayer, admin, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner and roles", async function () {
      const { foundnoneCollect, owner } = await loadFixture(deployNFTFixture);

      const defaultAdminRole = await foundnoneCollect.DEFAULT_ADMIN_ROLE();
      const adminRole = await foundnoneCollect.ADMIN_ROLE();
      const relayerRole = await foundnoneCollect.RELAYER_ROLE();

      expect(await foundnoneCollect.owner()).to.equal(owner.address);
      expect(await foundnoneCollect.hasRole(defaultAdminRole, owner.address)).to
        .be.true;
      expect(await foundnoneCollect.hasRole(adminRole, owner.address)).to.be
        .true;
      expect(await foundnoneCollect.hasRole(relayerRole, owner.address)).to.be
        .true;
    });
  });

  describe("Role Management", function () {
    it("Owner can set a new relayer", async function () {
      const { foundnoneCollect, owner, relayer } = await loadFixture(
        deployNFTFixture
      );

      await foundnoneCollect.connect(owner).setRelayer(relayer.address);
      const relayerRole = await foundnoneCollect.RELAYER_ROLE();
      expect(await foundnoneCollect.hasRole(relayerRole, relayer.address)).to.be
        .true;
    });

    it("Owner can set a new admin", async function () {
      const { foundnoneCollect, owner, admin } = await loadFixture(
        deployNFTFixture
      );

      await foundnoneCollect.connect(owner).setAdmin(admin.address);
      const adminRole = await foundnoneCollect.ADMIN_ROLE();
      expect(await foundnoneCollect.hasRole(adminRole, admin.address)).to.be
        .true;
    });

    it("Owner can set a new owner", async function () {
      const { foundnoneCollect, owner, otherAccount } = await loadFixture(
        deployNFTFixture
      );

      // Transfer ownership to otherAccount
      await foundnoneCollect
        .connect(owner)
        .transferOwnership(otherAccount.address);

      // Check if the new owner is indeed otherAccount
      expect(await foundnoneCollect.owner()).to.equal(otherAccount.address);
    });

    it("Should not allow other users to set roles or transfer ownership", async function () {
      const { foundnoneCollect, relayer, admin, otherAccount } =
        await loadFixture(deployNFTFixture);
      await expect(foundnoneCollect.connect(relayer).setAdmin(otherAccount)).to
        .be.reverted;
      await expect(foundnoneCollect.connect(relayer).setRelayer(otherAccount))
        .to.be.reverted;
      await expect(foundnoneCollect.connect(admin).setAdmin(otherAccount)).to.be
        .reverted;
      await expect(foundnoneCollect.connect(admin).setRelayer(otherAccount)).to
        .be.reverted;
      await expect(
        foundnoneCollect.connect(otherAccount).setAdmin(otherAccount)
      ).to.be.reverted;
      await expect(
        foundnoneCollect.connect(otherAccount).setRelayer(otherAccount)
      ).to.be.reverted;
    });
    it("Correctly assigns roles", async function () {
      const { foundnoneCollect, relayer, admin } = await loadFixture(
        deployNFTFixture
      );

      const relayerRole = await foundnoneCollect.RELAYER_ROLE();
      const adminRole = await foundnoneCollect.ADMIN_ROLE();

      expect(await foundnoneCollect.hasRole(relayerRole, relayer.address)).to.be
        .true;
      expect(await foundnoneCollect.hasRole(adminRole, admin.address)).to.be
        .true;
    });
  });

  describe("Minting Functionality", function () {
    it("Admin can set max supply", async function () {
      const { foundnoneCollect, admin } = await loadFixture(deployNFTFixture);
      const newMaxSupply = 100;

      await foundnoneCollect.connect(admin).setMaxSupply(newMaxSupply);
      expect(await foundnoneCollect.maxSupply()).to.equal(newMaxSupply);
    });

    it("Non-admin cannot set max supply", async function () {
      const { foundnoneCollect, otherAccount } = await loadFixture(
        deployNFTFixture
      );
      const newMaxSupply = 100;

      await expect(
        foundnoneCollect.connect(otherAccount).setMaxSupply(newMaxSupply)
      ).to.be.reverted;
    });
    it("Relayer can mint an NFT", async function () {
      const { foundnoneCollect, admin, relayer, otherAccount } =
        await loadFixture(deployNFTFixture);
      await foundnoneCollect.connect(admin).setMaxSupply(100);
      const tokenURI = "ipfs.io/testuri";
      await expect(
        foundnoneCollect.connect(relayer).mint(otherAccount.address, tokenURI)
      )
        .to.emit(foundnoneCollect, "Transfer")
        .withArgs(ethers.ZeroAddress, otherAccount.address, 1);
      const actualURI = await foundnoneCollect
        .connect(otherAccount)
        .tokenURI(1);
      console.log(actualURI, tokenURI);
      expect(actualURI).to.be.equal(tokenURI)
    });
    it("Non-relayer cannot mint an NFT", async function () {
      const { foundnoneCollect, otherAccount } = await loadFixture(
        deployNFTFixture
      );
      await expect(
        foundnoneCollect
          .connect(otherAccount)
          .mint(otherAccount.address, "testuri")
      ).to.be.reverted;
    });
  });

  describe("Receiving ETH", function () {
    it("Should receive ETH", async function () {
      const { foundnoneCollect, owner } = await loadFixture(deployNFTFixture);
      const transaction = {
        to: foundnoneCollect,
        value: ethers.parseEther("1.0"),
      };
      await expect(owner.sendTransaction(transaction)).to.changeEtherBalance(
        foundnoneCollect,
        ethers.parseEther("1.0")
      );
    });
  });

  describe("Withdrawal", function () {
    it("Should allow admin to withdraw ETH", async function () {
      const { foundnoneCollect, admin, owner } = await loadFixture(
        deployNFTFixture
      );

      await owner.sendTransaction({
        to: foundnoneCollect,
        value: ethers.parseEther("1.0"),
      });

      await expect(() =>
        foundnoneCollect.connect(admin).withdraw()
      ).to.changeEtherBalances(
        [admin, foundnoneCollect],
        [ethers.parseEther("1.0"), ethers.parseEther("-1.0")]
      );
    });

    it("Should prevent non-admin from withdrawing ETH", async function () {
      const { foundnoneCollect, otherAccount } = await loadFixture(
        deployNFTFixture
      );
      await otherAccount.sendTransaction({
        to: foundnoneCollect,
        value: ethers.parseEther("1"),
      });
      await expect(foundnoneCollect.connect(otherAccount).withdraw()).to.be
        .reverted;
    });
  });
});
