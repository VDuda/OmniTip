// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TipOracle is Ownable {
    IERC20 public immutable rewardToken; // tUSDC on opBNB testnet
    uint256 public constant REWARD = 5 * 10**6; // $5

    bytes32 public currentEventId; // keccak256("eng-arg-nov2025")
    uint256 public engGoals = 0;
    uint256 public argGoals = 0;

    struct Tip {
        address wallet;
        bool predictsEnglandNext; // true = England next goal
        bool claimed;
    }

    Tip[] public tips;
    mapping(address => uint256) public walletToTipIndex;

    event NewTip(address indexed wallet, bool predictsEnglandNext, uint256 timestamp);
    event GoalScored(string team, uint256 newScore);
    event TipClaimed(address indexed wallet, uint256 amount);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
        currentEventId = keccak256("eng-arg-nov2025");
    }

    function tip(bool predictsEnglandNext) external {
        require(msg.sender != address(0), "No zero address");
        tips.push(Tip(msg.sender, predictsEnglandNext, false));
        walletToTipIndex[msg.sender] = tips.length - 1;
        emit NewTip(msg.sender, predictsEnglandNext, block.timestamp);
    }

    // Admin only — dashboard calls this
    function adminScoreGoal(string calldata team) external onlyOwner {
        bool isEngland = keccak256(bytes(team)) == keccak256("England");
        bool isArgentina = keccak256(bytes(team)) == keccak256("Argentina");
        
        require(isEngland || isArgentina, "Invalid team");
        
        if (isEngland) {
            engGoals++;
            emit GoalScored(team, engGoals);
            // Auto-payout to England predictors
            _distributePayouts(true);
        } else {
            argGoals++;
            emit GoalScored(team, argGoals);
            // Auto-payout to Argentina predictors
            _distributePayouts(false);
        }
    }
    
    // Internal function to distribute payouts to correct predictors
    function _distributePayouts(bool englandScored) internal {
        uint256 winnersCount = 0;
        
        // Count winners
        for (uint i = 0; i < tips.length; i++) {
            if (!tips[i].claimed && tips[i].predictsEnglandNext == englandScored) {
                winnersCount++;
            }
        }
        
        if (winnersCount == 0) return;
        
        // Distribute rewards
        for (uint i = 0; i < tips.length; i++) {
            if (!tips[i].claimed && tips[i].predictsEnglandNext == englandScored) {
                tips[i].claimed = true;
                rewardToken.transfer(tips[i].wallet, REWARD);
                emit TipClaimed(tips[i].wallet, REWARD);
            }
        }
    }

    // Claim after goal — simplified: last goal determines winner
    function claim() external {
        uint256 index = walletToTipIndex[msg.sender];
        Tip storage userTip = tips[index];
        require(!userTip.claimed, "Already claimed");

        bool lastGoalEngland = engGoals > argGoals || (engGoals == argGoals && engGoals > 0); // mock logic
        bool userCorrect = userTip.predictsEnglandNext == lastGoalEngland;

        if (userCorrect) {
            rewardToken.transfer(msg.sender, REWARD);
            emit TipClaimed(msg.sender, REWARD);
        }
        userTip.claimed = true;
    }

    // View functions for dashboard/subgraph
    function getSentimentBias() external view returns (uint256 engTips, uint256 argTips, uint256 total) {
        for (uint i = 0; i < tips.length; i++) {
            if (tips[i].predictsEnglandNext) engTips++;
            else argTips++;
        }
        total = tips.length;
    }
}
