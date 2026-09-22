import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("SignalMarket — Time-Decaying Curation Market", function () {
  let signalMarket;
  let owner, poster, curator1, curator2, curator3, sybilAttacker;

  const HALF_LIFE = 3600; // 1 hour for test verification

  beforeEach(async function () {
    [owner, poster, curator1, curator2, curator3, sybilAttacker] = await ethers.getSigners();

    const SignalMarket = await ethers.getContractFactory("SignalMarket");
    signalMarket = await SignalMarket.deploy(HALF_LIFE);
    await signalMarket.waitForDeployment();
  });

  describe("01 / Post Creation", function () {
    it("Should create a post and record metadata onchain", async function () {
      const content = JSON.stringify({
        title: "Monad Parallel EVM deep dive",
        body: "Understanding superscalar pipelining and state access in Monad.",
        tags: ["monad", "evm", "architecture"]
      });

      const tx = await signalMarket.connect(poster).createPost(content);
      await tx.wait();

      expect(await signalMarket.postCount()).to.equal(1n);

      const post = await signalMarket.getPost(1);
      expect(post.poster).to.equal(poster.address);
      expect(post.content).to.equal(content);
      expect(post.totalBoosted).to.equal(0n);
      expect(post.curatorCount).to.equal(0n);
    });

    it("Should reject empty post content", async function () {
      await expect(
        signalMarket.connect(poster).createPost("")
      ).to.be.revertedWith("Signal: Content cannot be empty");
    });
  });

  describe("02 / Boost & Atomic Payout Distribution", function () {
    let postId;

    beforeEach(async function () {
      const tx = await signalMarket.connect(poster).createPost("Alpha signal on Monad liquidity pools");
      await tx.wait();
      postId = 1n;
    });

    it("Boundary Condition: First boost atomically distributes 40% to poster, retains 60% in reserve", async function () {
      const boostAmount = ethers.parseEther("1.0"); // 1.0 MON
      const posterInitialBalance = await ethers.provider.getBalance(poster.address);

      // Curator 1 boosts 1.0 MON
      const tx = await signalMarket.connect(curator1).boost(postId, { value: boostAmount });
      await tx.wait();

      const posterFinalBalance = await ethers.provider.getBalance(poster.address);
      const expectedPosterCut = ethers.parseEther("0.4"); // 40%

      expect(posterFinalBalance - posterInitialBalance).to.equal(expectedPosterCut);

      const post = await signalMarket.getPost(postId);
      expect(post.totalBoosted).to.equal(boostAmount);
      // 15% reserve + 45% (no earlier curators) = 60% in reserve
      expect(post.poolReserve).to.equal(ethers.parseEther("0.6"));
      expect(post.curatorCount).to.equal(1n);
    });

    it("Cascading Curator Payouts: Curator 1 receives instant cut when Curator 2 boosts", async function () {
      const boost1Amount = ethers.parseEther("1.0");
      const boost2Amount = ethers.parseEther("2.0");

      // Curator 1 boosts 1.0 MON
      await signalMarket.connect(curator1).boost(postId, { value: boost1Amount });

      const curator1BalanceBefore = await ethers.provider.getBalance(curator1.address);
      const posterBalanceBefore = await ethers.provider.getBalance(poster.address);

      // Curator 2 boosts 2.0 MON
      await signalMarket.connect(curator2).boost(postId, { value: boost2Amount });

      const curator1BalanceAfter = await ethers.provider.getBalance(curator1.address);
      const posterBalanceAfter = await ethers.provider.getBalance(poster.address);

      // Poster receives 40% of 2.0 MON = 0.8 MON
      expect(posterBalanceAfter - posterBalanceBefore).to.equal(ethers.parseEther("0.8"));

      // Curator 1 was the sole earlier curator, so they receive 100% of the 45% curator share:
      // 45% of 2.0 MON = 0.9 MON
      expect(curator1BalanceAfter - curator1BalanceBefore).to.equal(ethers.parseEther("0.9"));

      // Post pool reserve increases by 15% of 2.0 MON = 0.3 MON
      const post = await signalMarket.getPost(postId);
      expect(post.totalBoosted).to.equal(ethers.parseEther("3.0"));
      expect(post.curatorCount).to.equal(2n);
    });
  });

  describe("03 / Anti-Gaming Enforcement", function () {
    let postId;

    beforeEach(async function () {
      const tx = await signalMarket.connect(poster).createPost("High-conviction market call");
      await tx.wait();
      postId = 1n;
    });

    it("Anti-Gaming Rule 1: Self-boosting is rejected by the contract", async function () {
      await expect(
        signalMarket.connect(poster).boost(postId, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Signal: Self-boosting prohibited");
    });

    it("Anti-Gaming Rule 2: Diminishing returns penalize repeat boosts from the same wallet", async function () {
      const boostAmount = ethers.parseEther("1.0");

      // Boost 1 from curator1
      await signalMarket.connect(curator1).boost(postId, { value: boostAmount });
      let boosterInfo = await signalMarket.postBoosters(postId, curator1.address);
      expect(boosterInfo.boostCount).to.equal(1n);
      expect(boosterInfo.effectiveWeight).to.equal(boostAmount); // 100% weight

      // Boost 2 from curator1 (same wallet on same post)
      // Multiplier = 10000 / 15000 = 6666 bps
      await signalMarket.connect(curator1).boost(postId, { value: boostAmount });
      boosterInfo = await signalMarket.postBoosters(postId, curator1.address);
      expect(boosterInfo.boostCount).to.equal(2n);

      const expectedWeightAdded2 = (boostAmount * 6666n) / 10000n;
      expect(boosterInfo.effectiveWeight).to.equal(boostAmount + expectedWeightAdded2);

      // Boost 3 from curator1
      // Multiplier = 10000 / 20000 = 5000 bps (50%)
      await signalMarket.connect(curator1).boost(postId, { value: boostAmount });
      boosterInfo = await signalMarket.postBoosters(postId, curator1.address);
      expect(boosterInfo.boostCount).to.equal(3n);

      const expectedWeightAdded3 = (boostAmount * 5000n) / 10000n;
      expect(boosterInfo.effectiveWeight).to.equal(boostAmount + expectedWeightAdded2 + expectedWeightAdded3);
    });
  });

  describe("04 / Time Decay Functionality", function () {
    it("Calculates exponential weight decay accurately over elapsed half-lives", async function () {
      const tx = await signalMarket.connect(poster).createPost("Time sensitive protocol launch");
      await tx.wait();
      const postId = 1n;

      const boostAmount = ethers.parseEther("10.0");
      await signalMarket.connect(curator1).boost(postId, { value: boostAmount });

      // Immediate weight should be close to 10 MON
      const initialWeight = await signalMarket.getDecayedWeight(postId);
      expect(initialWeight).to.be.closeTo(boostAmount, ethers.parseEther("0.05"));

      // Fast forward time by 1 half life (3600 seconds)
      await ethers.provider.send("evm_increaseTime", [HALF_LIFE]);
      await ethers.provider.send("evm_mine");

      const weightAfterOneHalfLife = await signalMarket.getDecayedWeight(postId);
      // After 1 half life, weight should be roughly 50% (5 MON)
      const expectedHalf = boostAmount / 2n;
      expect(weightAfterOneHalfLife).to.be.closeTo(expectedHalf, ethers.parseEther("0.1"));

      // Fast forward another half life (7200 total)
      await ethers.provider.send("evm_increaseTime", [HALF_LIFE]);
      await ethers.provider.send("evm_mine");

      const weightAfterTwoHalfLives = await signalMarket.getDecayedWeight(postId);
      // After 2 half lives, weight should be roughly 25% (2.5 MON)
      const expectedQuarter = boostAmount / 4n;
      expect(weightAfterTwoHalfLives).to.be.closeTo(expectedQuarter, ethers.parseEther("0.1"));
    });
  });
});
