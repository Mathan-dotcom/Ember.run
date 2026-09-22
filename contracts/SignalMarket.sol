// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SignalMarket
 * @notice A Time-Decaying Curation Market built for Monad Metropolis (Track 03: Social, Attention & Culture)
 * @dev Onchain curation where boosting costs MON, weights decay over time, and earlier curators
 *      receive instant atomic payouts on subsequent boosts. Enforces strict anti-gaming rules.
 */
contract SignalMarket {
    // -------------------------------------------------------------------------
    // Constants & Configuration
    // -------------------------------------------------------------------------
    uint256 public constant POSTER_SHARE_BPS = 4000;   // 40% to original poster
    uint256 public constant CURATOR_SHARE_BPS = 4500;  // 45% to earlier curators
    uint256 public constant RESERVE_SHARE_BPS = 1500;  // 15% retained in post reserve
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MIN_BOOST_AMOUNT = 0.001 ether;

    uint256 public decayHalfLife;

    // -------------------------------------------------------------------------
    // Data Structures
    // -------------------------------------------------------------------------
    struct BoosterInfo {
        address wallet;
        uint256 boostCount;
        uint256 totalContributed;
        uint256 earnedPayouts;
        uint256 effectiveWeight;
        uint256 firstBoostTime;
        uint256 lastBoostTime;
    }

    struct Post {
        uint256 id;
        address poster;
        string content;
        uint256 createdAt;
        uint256 totalBoosted;
        uint256 poolReserve;
        uint256 curatorCount;
        uint256 totalWeight;
    }

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------
    uint256 public postCount;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => address[]) internal postCuratorAddresses;
    mapping(uint256 => mapping(address => BoosterInfo)) public postBoosters;

    mapping(address => uint256) public totalCuratorEarnings;
    mapping(address => uint256) public totalBoostsByWallet;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------
    event PostCreated(
        uint256 indexed postId,
        address indexed poster,
        string content,
        uint256 createdAt
    );

    event Boosted(
        uint256 indexed postId,
        address indexed booster,
        uint256 amount,
        uint256 effectiveWeightAdded,
        uint256 boostNumber,
        uint256 timestamp
    );

    event PayoutDistributed(
        uint256 indexed postId,
        address indexed recipient,
        uint256 amount,
        string role
    );

    event AntiGamingDiminishingReturn(
        uint256 indexed postId,
        address indexed booster,
        uint256 boostNumber,
        uint256 effectiveMultiplierBps
    );

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(uint256 _decayHalfLife) {
        decayHalfLife = _decayHalfLife > 0 ? _decayHalfLife : 21600; // 6 hours
    }

    // -------------------------------------------------------------------------
    // Core Actions
    // -------------------------------------------------------------------------

    function createPost(string calldata content) external returns (uint256 postId) {
        require(bytes(content).length > 0, "Signal: Content cannot be empty");
        postId = ++postCount;

        posts[postId] = Post({
            id: postId,
            poster: msg.sender,
            content: content,
            createdAt: block.timestamp,
            totalBoosted: 0,
            poolReserve: 0,
            curatorCount: 0,
            totalWeight: 0
        });

        emit PostCreated(postId, msg.sender, content, block.timestamp);
    }

    function boost(uint256 postId) external payable {
        require(postId > 0 && postId <= postCount, "Signal: Post does not exist");
        require(msg.value >= MIN_BOOST_AMOUNT, "Signal: Boost below minimum threshold");

        Post storage post = posts[postId];
        require(msg.sender != post.poster, "Signal: Self-boosting prohibited");

        // Diminishing returns multiplier
        BoosterInfo storage booster = postBoosters[postId][msg.sender];
        uint256 boostNumber = booster.boostCount + 1;
        uint256 multiplierBps = 10000;

        if (booster.boostCount > 0) {
            multiplierBps = (10000 * 10000) / (10000 + (5000 * booster.boostCount));
            emit AntiGamingDiminishingReturn(postId, msg.sender, boostNumber, multiplierBps);
        }

        uint256 effectiveWeightAdded = (msg.value * multiplierBps) / 10000;

        // Payout calculations
        uint256 posterShare = (msg.value * POSTER_SHARE_BPS) / BPS_DENOMINATOR;
        uint256 curatorShare = (msg.value * CURATOR_SHARE_BPS) / BPS_DENOMINATOR;
        uint256 baseReserve = msg.value - posterShare - curatorShare;

        // 1. Distribute Poster Cut (40%)
        (bool posterSuccess, ) = post.poster.call{value: posterShare}("");
        require(posterSuccess, "Signal: Poster payout failed");
        emit PayoutDistributed(postId, post.poster, posterShare, "POSTER");

        // 2. Distribute Earlier Curators Cut (45%)
        uint256 leftoverCuratorShare = _distributeCurators(postId, curatorShare, post.totalWeight);

        // 3. Update storage
        post.totalBoosted += msg.value;
        post.poolReserve += (baseReserve + leftoverCuratorShare);
        post.totalWeight += effectiveWeightAdded;

        if (booster.boostCount == 0) {
            booster.wallet = msg.sender;
            booster.firstBoostTime = block.timestamp;
            postCuratorAddresses[postId].push(msg.sender);
            post.curatorCount++;
        }

        booster.boostCount = boostNumber;
        booster.totalContributed += msg.value;
        booster.effectiveWeight += effectiveWeightAdded;
        booster.lastBoostTime = block.timestamp;

        totalBoostsByWallet[msg.sender]++;

        emit Boosted(
            postId,
            msg.sender,
            msg.value,
            effectiveWeightAdded,
            boostNumber,
            block.timestamp
        );
    }

    function _distributeCurators(
        uint256 postId,
        uint256 curatorShare,
        uint256 totalWeightSnapshot
    ) internal returns (uint256 undistributed) {
        address[] storage curators = postCuratorAddresses[postId];
        uint256 count = curators.length;

        if (count == 0 || totalWeightSnapshot == 0) {
            return curatorShare; // No earlier curators -> retained in pool
        }

        uint256 distributed = 0;
        for (uint256 i = 0; i < count; i++) {
            address cAddr = curators[i];
            BoosterInfo storage prevCurator = postBoosters[postId][cAddr];
            uint256 weight = prevCurator.effectiveWeight;

            if (weight > 0) {
                uint256 cut = (curatorShare * weight) / totalWeightSnapshot;
                if (cut > 0) {
                    prevCurator.earnedPayouts += cut;
                    totalCuratorEarnings[cAddr] += cut;
                    distributed += cut;

                    (bool success, ) = cAddr.call{value: cut}("");
                    if (success) {
                        emit PayoutDistributed(postId, cAddr, cut, "CURATOR");
                    }
                }
            }
        }

        return curatorShare > distributed ? (curatorShare - distributed) : 0;
    }

    // -------------------------------------------------------------------------
    // View Functions
    // -------------------------------------------------------------------------

    function getPost(uint256 postId) external view returns (
        uint256 id,
        address poster,
        string memory content,
        uint256 createdAt,
        uint256 totalBoosted,
        uint256 poolReserve,
        uint256 curatorCount,
        uint256 totalWeight,
        uint256 decayedWeight
    ) {
        require(postId > 0 && postId <= postCount, "Signal: Invalid post ID");
        Post storage p = posts[postId];
        uint256 currentDecayedWeight = getDecayedWeight(postId);

        return (
            p.id,
            p.poster,
            p.content,
            p.createdAt,
            p.totalBoosted,
            p.poolReserve,
            p.curatorCount,
            p.totalWeight,
            currentDecayedWeight
        );
    }

    function getDecayedWeight(uint256 postId) public view returns (uint256) {
        Post storage p = posts[postId];
        if (p.totalWeight == 0) return 0;

        uint256 dt = block.timestamp > p.createdAt ? block.timestamp - p.createdAt : 0;
        if (dt == 0 || decayHalfLife == 0) return p.totalWeight;

        uint256 numHalfLives = dt / decayHalfLife;
        if (numHalfLives >= 10) {
            return p.totalWeight / 1024;
        }

        uint256 remainderDt = dt % decayHalfLife;
        uint256 halfLifeFactor = 10000 - ((5000 * remainderDt) / decayHalfLife);

        uint256 decayed = (p.totalWeight * halfLifeFactor) / 10000;
        if (numHalfLives > 0) {
            decayed = decayed >> numHalfLives;
        }

        return decayed;
    }

    function getPostCurators(uint256 postId) external view returns (address[] memory) {
        return postCuratorAddresses[postId];
    }

    function previewBoost(uint256 postId, uint256 amount, address prospectiveBooster) external view returns (
        uint256 posterCut,
        uint256 curatorCutTotal,
        uint256 reserveCut,
        uint256 effectiveWeightAdded,
        uint256 multiplierBps,
        bool isSelfBoost
    ) {
        Post storage p = posts[postId];
        isSelfBoost = (prospectiveBooster == p.poster);

        posterCut = (amount * POSTER_SHARE_BPS) / BPS_DENOMINATOR;
        curatorCutTotal = (amount * CURATOR_SHARE_BPS) / BPS_DENOMINATOR;
        reserveCut = amount - posterCut - curatorCutTotal;

        BoosterInfo storage booster = postBoosters[postId][prospectiveBooster];
        multiplierBps = 10000;
        if (booster.boostCount > 0) {
            multiplierBps = (10000 * 10000) / (10000 + (5000 * booster.boostCount));
        }

        effectiveWeightAdded = (amount * multiplierBps) / 10000;
    }
}
