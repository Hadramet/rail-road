const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Railroad contract", () => {

    const deployFixture = async () => {
        const Railroad = await ethers.getContractFactory("Railroad");
        const [owner, addr1, addr2] = await ethers.getSigners();
        
        const hardhatRailroad = await Railroad.deploy();
        await hardhatRailroad.deployed();
        return { Railroad, hardhatRailroad, owner, addr1, addr2 };
    }


    describe("Deployment", () => {

        it("Should set the right owner", async () => {
            const { hardhatRailroad, owner } = await loadFixture(deployFixture);
            expect(await hardhatRailroad.owner()).to.eq(owner.address);
        })

        it("Should set the withdrawal address to owner by default", async () => {
            const { hardhatRailroad, owner } = await loadFixture(deployFixture);
            expect(await hardhatRailroad.withdrawalAddress()).to.eq(owner.address);
        })

        it("Setting withdrawal address should work", async () => {
            const { hardhatRailroad, addr1 } = await loadFixture(deployFixture);
            await hardhatRailroad.setWithdrawalAddress(addr1.address);
            expect(await hardhatRailroad.withdrawalAddress()).to.eq(addr1.address);
        })
    })
})
