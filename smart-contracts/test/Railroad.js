const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Railroad contract", () => {
  const deployFixture = async () => {
    const Railroad = await ethers.getContractFactory("Railroad");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatRailroad = await Railroad.deploy();
    await hardhatRailroad.deployed();
    return { Railroad, hardhatRailroad, owner, addr1, addr2 };
  };

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      const { hardhatRailroad, owner } = await loadFixture(deployFixture);
      expect(await hardhatRailroad.owner()).to.eq(owner.address);
    });

    it("Should set the withdrawal address to owner by default", async () => {
      const { hardhatRailroad, owner } = await loadFixture(deployFixture);
      expect(await hardhatRailroad.withdrawalAddress()).to.eq(owner.address);
    });

    it("Setting withdrawal address should work", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      await hardhatRailroad.setWithdrawalAddress(addr1.address);
      expect(await hardhatRailroad.withdrawalAddress()).to.eq(addr1.address);
    });
  });

  describe("Card", () => {
    it("Adding card emit new card event", async () => {
      const { hardhatRailroad } = await loadFixture(deployFixture);

      await expect(hardhatRailroad.addCard(1111, 500, 1050, 5000))
        .to.emit(hardhatRailroad, "NewCard")
        .withArgs(1111, 500, 1050, 5000);
    });

    it("Adding card with existing id should faild", async () => {
      const { hardhatRailroad } = await loadFixture(deployFixture);
      await hardhatRailroad.addCard(1111, 500, 1050, 5000);

      await expect(
        hardhatRailroad.addCard(1111, 500, 1050, 5000)
      ).to.be.revertedWith("Card id already exist");
    });

    it("Adding card with invalid args should failed", async () => {
      const { hardhatRailroad } = await loadFixture(deployFixture);

      await expect(
        hardhatRailroad.addCard(1111, 500, 1050, 0)
      ).to.be.revertedWith("Invalid total sellable");

      await expect(
        hardhatRailroad.addCard(1111, 500, 0, 500)
      ).to.be.revertedWith("Invalid discount.");
    });

    it("Adding new card should failed on non owner", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      await expect(
        hardhatRailroad.connect(addr1).addCard(1111, 500, 0, 500)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Non owner can get list of card ids", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      await hardhatRailroad.addCard(1111, 500, 1050, 5000);
      await hardhatRailroad.addCard(1112, 500, 1050, 5000);
      const result = await hardhatRailroad.connect(addr1).getAllCardIds();
      expect(result.length).to.equal(2);
    });
    
  });
});
