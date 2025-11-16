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
        if (keccak256(bytes(team)) == keccak256("England")) engGoals++;
        else if (keccak256(bytes(team)) == keccak256("Argentina")) argGoals++;
        else revert("Invalid team");
        emit GoalScored(team, keccak256(bytes(team)) == keccak256("England") ? engGoals : argGoals);
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
