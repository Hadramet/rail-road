const { expect } = require("chai");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("Railroad contract", () => {
  const deployFixture = async () => {
    const Railroad = await ethers.getContractFactory("Railroad");
    const RailroadTicket = await ethers.getContractFactory("RailRoadTicket");

    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatRailroad = await Railroad.deploy();
    await hardhatRailroad.deployed();

    const hardhatRailroadTicket = await RailroadTicket.deploy(
      hardhatRailroad.address
    );
    await hardhatRailroadTicket.deployed();

    return {
      Railroad,
      hardhatRailroad,
      RailroadTicket,
      hardhatRailroadTicket,
      owner,
      addr1,
      addr2,
    };
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

  describe("Card permit", () => {
    it("Should return the permit owner", async () => {
      const { hardhatRailroad, owner, addr1 } = await loadFixture(
        deployFixture
      );
      await hardhatRailroad.addCard(1111, 500, 1050, 5000);
      await hardhatRailroad.addPermit(1111, addr1.address);
      const permitOwner = await hardhatRailroad.premitOwner(0);
      expect(permitOwner).to.eq(addr1.address);
    });

    it("Should return the permit infos", async () => {
      const { hardhatRailroad, owner, addr1 } = await loadFixture(
        deployFixture
      );
      await hardhatRailroad.addCard(1111, 500, 1050, 5000);
      await hardhatRailroad.addPermit(1111, addr1.address);
      const permitInfos = await hardhatRailroad.permitInfos(0);
      expect(permitInfos[0]).to.eq(1111);
      expect(permitInfos[2]).to.eq(addr1.address);
    });

    it("Should emit permit purchased", async () => {
      const { hardhatRailroad, owner, addr1 } = await loadFixture(
        deployFixture
      );
      await hardhatRailroad.addCard(1111, 500, 1050, 5000);
      await expect(hardhatRailroad.addPermit(1111, addr1.address)).to.emit(
        hardhatRailroad,
        "PermitPurchased"
      );
    });
  });

  describe("Card permit ownership", () => {
    it("Buying card permit emit transfet", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      const cardInitialStock = 25468;
      await hardhatRailroad.addCard(1111, 50000, 1050, cardInitialStock);
      await expect(
        hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 })
      ).to.emit(hardhatRailroad, "Transfer");
    });

    it("Buying card permit reduce stock", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      const cardInitialStock = 25468;
      await hardhatRailroad.addCard(1111, 50000, 1050, cardInitialStock);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      const cardInfos = await hardhatRailroad.getInfos(1111);
      expect(cardInfos[2]).to.eq(cardInitialStock - 1);
    });

    it("Buying card permit fill permits data", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      const cardInitialStock = 25468;
      await hardhatRailroad.addCard(1111, 50000, 1050, cardInitialStock);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      const permitInfos = await hardhatRailroad.permitInfos(0);
      expect(permitInfos[0]).to.eq(1111);
      expect(permitInfos[2]).to.eq(addr1.address);
    });

    it("Token owner set token for sale emit approval", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      await hardhatRailroad.addCard(1111, 50000, 1050, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      await expect(hardhatRailroad.connect(addr1).setForSale(0, 60000)).to.emit(
        hardhatRailroad,
        "Approval"
      );
    });

    it("Get permit for sale infos", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      await hardhatRailroad.addCard(1111, 50000, 1050, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      await hardhatRailroad.connect(addr1).setForSale(0, 60000);
      const permitForSaleInfos = await hardhatRailroad
        .connect(addr1)
        .getPermitForSale(0);

      expect(permitForSaleInfos[0]).to.eq(1111);
      expect(permitForSaleInfos[1]).to.eq(60000);
      expect(permitForSaleInfos[2]).to.eq(1050);
    });

    it("Get all permit for sale", async () => {
      const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
      await hardhatRailroad.addCard(1111, 50000, 1050, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      await hardhatRailroad.connect(addr1).setForSale(0, 60000);
      const tokenForSale = await hardhatRailroad
        .connect(addr1)
        .getTokenForSale();

      expect(tokenForSale[0]).to.eq(0);
    });

    it("Another user can get token for sale price", async () => {
      const { hardhatRailroad, addr1, addr2 } = await loadFixture(
        deployFixture
      );
      await hardhatRailroad.addCard(1111, 50000, 1050, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      await hardhatRailroad.connect(addr1).setForSale(0, 60000);
      const price = await hardhatRailroad.connect(addr2).getTokenSalePrice(0);
      expect(price).to.eq(60000);
    });

    it("Token owner remove token frome sale", async () => {
      const { hardhatRailroad, addr1, addr2 } = await loadFixture(
        deployFixture
      );
      await hardhatRailroad.addCard(1111, 50000, 1050, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      await hardhatRailroad.connect(addr1).setForSale(0, 60000);
      const price = await hardhatRailroad.connect(addr2).getTokenSalePrice(0);
      expect(price).to.eq(60000);
      await hardhatRailroad.connect(addr1).removeTokenForSale(0);
      await expect(
        hardhatRailroad.connect(addr2).getTokenSalePrice(0)
      ).to.be.revertedWith("Token not for sale");
    });

    it("Another user can bu token for sale", async () => {
      const { hardhatRailroad, addr1, addr2 } = await loadFixture(
        deployFixture
      );
      await hardhatRailroad.addCard(1111, 50000, 1050, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      await hardhatRailroad.connect(addr1).setForSale(0, 60000);

      const price = await hardhatRailroad.connect(addr2).getTokenSalePrice(0);
      await hardhatRailroad.connect(addr2).buyPermitToken(0, { value: price });

      await expect(
        hardhatRailroad.connect(addr2).getTokenSalePrice(0)
      ).to.be.revertedWith("Token not for sale");

      const permitInfos = await hardhatRailroad.permitInfos(0);
      expect(permitInfos[0]).to.eq(1111);
      expect(permitInfos[2]).to.eq(addr2.address);
    });
  });

  describe("Ticket selling", () => {
    it("Purchase ticket require valid ticket", async () => {
      const { hardhatRailroadTicket, addr1 } = await loadFixture(deployFixture);
      await expect(
        hardhatRailroadTicket.connect(addr1).purchaseTicket(1, { value: 50000 })
      ).to.emit(hardhatRailroadTicket, "TicketSold");
    });

    it("Purchase ticket with a card", async () => {
      const { hardhatRailroad, hardhatRailroadTicket, addr1 } =
        await loadFixture(deployFixture);
      await hardhatRailroad.addCard(1111, 50000, 50, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      await expect(
        hardhatRailroadTicket
          .connect(addr1)
          .purchaseTicketWithCard(0, 1, { value: 5000 })
      )
        .to.emit(hardhatRailroadTicket, "TicketSold")
        .withArgs(addr1.address, 0, 2500);
    });

    it("Purchase ticket automatically set the max discound", async () => {
      const { hardhatRailroad, hardhatRailroadTicket, addr1 } =
        await loadFixture(deployFixture);
      await hardhatRailroad.addCard(1111, 1000, 1, 1);
      await hardhatRailroad.addCard(1112, 150000, 10, 1);
      await hardhatRailroad.addCard(1113, 200000, 20, 1);
      await hardhatRailroad.addCard(1114, 300000, 50, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 1000 });
      await hardhatRailroad
        .connect(addr1)
        .buyPermit(1112, 1, { value: 150000 });
      await hardhatRailroad
        .connect(addr1)
        .buyPermit(1113, 1, { value: 200000 });
      await hardhatRailroad
        .connect(addr1)
        .buyPermit(1114, 1, { value: 300000 });

      await expect(
        hardhatRailroadTicket.connect(addr1).purchaseTicket(1, { value: 5000 })
      )
        .to.emit(hardhatRailroadTicket, "TicketSold")
        .withArgs(addr1.address, 0, 2500);

      await expect(
        hardhatRailroadTicket.connect(addr1).purchaseTicket(2, { value: 6000 })
      )
        .to.emit(hardhatRailroadTicket, "TicketSold")
        .withArgs(addr1.address, 1, 3000);

      await expect(
        hardhatRailroadTicket.connect(addr1).purchaseTicket(3, { value: 8000 })
      )
        .to.emit(hardhatRailroadTicket, "TicketSold")
        .withArgs(addr1.address, 2, 4000);
    });

    it("Ticket infos", async () => {
      const { hardhatRailroad, hardhatRailroadTicket, addr1 } =
        await loadFixture(deployFixture);
      await hardhatRailroad.addCard(1111, 50000, 50, 1);
      await hardhatRailroad.connect(addr1).buyPermit(1111, 1, { value: 50000 });
      await hardhatRailroadTicket
        .connect(addr1)
        .purchaseTicketWithCard(0, 1, { value: 5000 });
      const infos = await hardhatRailroadTicket
        .connect(addr1)
        .getTicketInfos(0);

      expect(infos[0]).to.eq(2500); // price
      expect(infos[2]).to.eq(1); // type
      expect(infos[3]).to.eq(addr1.address); // buyer

    });
  });
});
