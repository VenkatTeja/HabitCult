// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./GoalNFT.sol";

contract CultManager is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _goalIds;

    address public nft;
    address public staker;

    enum TargetType{ MIN, MAX }
    enum TargetStatus{ OFF, RUNNING, SUCCESSFUL, FAIL }

    struct Vote {
        bool voted;
        uint64 events;
    }

    struct Target {
        uint256 startBlock;
        uint64 nPeriods;
        uint64 period; // number of blocks to consider as period
        uint64 eventsPerPeriod; // max number of events to perform per period to reach goal
        TargetType targetType;
        uint256 betAmount;
        TargetStatus targetStatus;
    }

    struct PeriodVoteMapping {
        mapping(uint256 => Vote) periodVoteMapping;
    }

    struct User {
        string nick;
        address addr;
    }

    struct Result {
        bool isPass;
        uint256 eventsRegisteredAvg1000x;
    }
    
    struct Goal {
        string name;
        string description;
        string category;
        User participant;
        User[] validators;
        uint256 validatorNFT;
        mapping(address => UserInfo) goalUserInfo;
        Target target;        
        mapping(address => PeriodVoteMapping) eventsRegisteredPerPeriodMapping;
        mapping(address => uint64) eventsRegisteredSum;

        Result result;
    }

    struct Category {
        string name;
        // string participantUrl;
        // string validatorUrl;
        bool exists;
    }

    struct UserGoals {
        uint256[] participant;
        uint256[] validators;
    }

    struct UserInfo {
        bool isParticipant;
        bool isValidator;
    }

    mapping(string => Category) public categories;
    string[] public categoryIndexes;
    uint public nCategories = 0;

    mapping(uint256 => Goal) nftGoalMap;
    mapping(address => UserGoals) userGoalMapping;
    // mapping(address => 

    event NewParticipant(uint256 nftID, address participant);
    event NewValidators(uint256 nftID, address[] validators);

    uint64 public MAX_LOSS = 250; // 25%
    address public stakingToken;
    uint64 public maxValidators = 5;
    uint64 public minPeriodBlocks = 1; // thats about 1 day with 1 block per 2 seconds
    constructor(address _stakingToken) {
        stakingToken = _stakingToken;
    }

    function getTargetTypes() public pure returns (string memory, string memory) {
        return ("MIN", "MAX");
    }

    function getTargetStatuses() public pure returns (string memory, string memory, string memory, string memory) {
        return ("OFF", "RUNNING", "SUCCESSFUL", "FAIL");
    }

    function getCategoryIndexes() public view returns (string[] memory) {
        return categoryIndexes;
    }

    function setMaxLoss(uint64 _maxLoss) public onlyOwner returns (uint64) {
        MAX_LOSS = _maxLoss;
        return MAX_LOSS;
    }
    
    function setMinPeriodBlocks(uint64 _minPeriodBlocks) public onlyOwner returns (uint64) {
        minPeriodBlocks = _minPeriodBlocks;
        return minPeriodBlocks;
    }

    function setMaxValidators(uint64 _maxValidators) public onlyOwner returns (uint64) {
        maxValidators = _maxValidators;
        return maxValidators;
    }

    function setStakingToken(address _stakingToken) public onlyOwner returns (address) {
        stakingToken = _stakingToken;
        return stakingToken;
    }

    function addCategory(string memory categoryID, string memory name) public onlyOwner returns (bool) {
        require(!categories[categoryID].exists, "Category already exists.");
        categories[categoryID] = Category({name: name, exists: true});
        categoryIndexes.push(categoryID);
        nCategories += 1;
        return true;
    }

    function removeCategory(uint categoryIndex) public onlyOwner returns (string[] memory) {
        require(categoryIndex < categoryIndexes.length, "categoryIndex must be < total number of categories");
        string memory category = categoryIndexes[categoryIndex];
        require(categories[category].exists, "Category does not exist.");
        delete categories[category];

        for (uint i = categoryIndex; i<categoryIndexes.length-1; i++){
            categoryIndexes[i] = categoryIndexes[i+1];
        }
        categoryIndexes.pop();
        nCategories -= 1;
        return categoryIndexes;
    }

    function setNFTAddress(address _nft) public onlyOwner returns (bool) {
        nft = _nft;
        return true;
    }

    function setStakerAddress(address _staker) public onlyOwner returns (bool) {
        staker = _staker;
        return true;
    }

    function getGoals(address _address) external view returns (uint256[] memory) {
        return userGoalMapping[_address].participant;
    }

    function getGoalsToValidate(address _address) external view returns (uint256[] memory) {
        return userGoalMapping[_address].validators;
    }

    function getGoalResult(uint256 id) external view returns (Result memory) {
        Goal storage goal = nftGoalMap[id];
        return goal.result;
    }

    function getGoalTargetByID(uint256 id) external view returns (uint256 startBlock,
                                                            uint64 nPeriods,
                                                            uint64 period, // number of blocks to consider as period
                                                            uint64 eventsPerPeriod, // max number of events to perform per period to reach goal
                                                            TargetType targetType,
                                                            uint256 betAmount,
                                                            TargetStatus targetStatus) {
        Goal storage goal = nftGoalMap[id];
        Target storage target = goal.target;
        return (target.startBlock, target.nPeriods, target.period, target.eventsPerPeriod, target.targetType, target.betAmount, target.targetStatus);
    }

    function getNickByGoalID(uint256 id, address addr) external view returns (string memory) {
        Goal storage goal = nftGoalMap[id];
        address[] memory addrs = new address[](goal.validators.length);
        for (uint i=0; i<goal.validators.length; i++) {
            User memory user = goal.validators[i];
            if(addr == user.addr) {
                return user.nick;
            }
        }
        require(false, "User not found in this goal for the given address");
    }

    function getGoalByID(uint256 id) external view returns (string memory name,
                                                            string memory description,
                                                            string memory category,
                                                            address participant,
                                                            address[] memory validators,
                                                            uint256 validatorNFT) {
        Goal storage goal = nftGoalMap[id];
        address[] memory addrs = new address[](goal.validators.length);
        for (uint i=0; i<goal.validators.length; i++) {
            User memory user = goal.validators[i];
            addrs[i] = user.addr;
        }
        return (goal.name, goal.description, goal.category, goal.participant.addr, addrs, goal.validatorNFT);
    }

    function approve(uint256 betAmount) public returns (bool) {
        require(betAmount > 0, "Non-zero bet amount is needed to start a goal");
        IERC20 token = IERC20(stakingToken);
        token.approve(address(this), betAmount);
        return true;
    }

    function addGoal(string memory name,  string memory category, User memory participantUser,
         User[] memory validatorUsers, uint64 period, uint64 eventsPerPeriod, uint64 nPeriods, TargetType targetType, uint256 betAmount) public returns (uint256) {
        console.log("addGoal");
        require(categories[category].exists, "Category does not exist.");
        console.log("Category exists");

        require(betAmount > 0, "Non-zero bet amount is needed to start a goal");
        require(nPeriods > 0, "nPeriods must be atleast 1");
        require(eventsPerPeriod >= 0, "eventsPerPeriod must be >= 0");
        require(validatorUsers.length <= maxValidators, "Max validators exceeds limit");
        require(period >= minPeriodBlocks, "period should be >= min period");

        IERC20 token = IERC20(stakingToken);
        uint256 initialBal = token.balanceOf(address(this));
        token.transferFrom(msg.sender, address(this), betAmount);
        uint256 finalBal = token.balanceOf(address(this));
        require((finalBal - initialBal) == betAmount, "Could not recieve tokens");

        _goalIds.increment();
        uint256 id = _goalIds.current();
        console.log("New Goal ID: %s", id);
        
        Goal storage goal = nftGoalMap[id];
        goal.name = name;
        goal.description = "";
        goal.category = category;
        goal.participant = participantUser;
        
        userGoalMapping[participantUser.addr].participant.push(id);
        goal.goalUserInfo[participantUser.addr].isParticipant = true;

        Target storage target = goal.target;
        target.startBlock = block.number;
        target.nPeriods = nPeriods;
        target.period = period;
        target.eventsPerPeriod = eventsPerPeriod;
        target.targetType = targetType;
        target.betAmount = betAmount;
        target.targetStatus = TargetStatus.RUNNING;
        
        _setGoalUsers(id, validatorUsers);
        
        return id;
    }

    function decodeUser(User[] memory users) public returns (bool) {
        // User memory user1 = abi.decode(user, (User));
        return true;
    }

    function _setGoalUsers(uint256 goalID, User[] memory validatorUsers) private returns (bool) {
        Goal storage goal = nftGoalMap[goalID];

        console.log("_setGoalUsers start");

        address[] memory validatorAddrs = new address[](validatorUsers.length);
        for (uint i=0; i<validatorUsers.length; i++) {
            User memory validatorUser = validatorUsers[i];
            validatorAddrs[i] = validatorUser.addr;
            goal.validators.push(User({addr: validatorUser.addr, nick: validatorUser.nick}));
        }
        console.log("Validators length: %s", goal.validators.length);

        for (uint i=0; i<goal.validators.length; i++) {
            User memory validatorUser = goal.validators[i];
            userGoalMapping[validatorUser.addr].validators.push(goalID);
            goal.goalUserInfo[validatorUser.addr].isValidator = true;
        }
        console.log("_setGoalUsers done");
        return true;
    }

    function getPeriodEndingsByBlock(uint256 goalID) external view returns (uint256[] memory) {
        Goal storage goal = nftGoalMap[goalID];
        Target storage target = goal.target;
        uint length = target.nPeriods;
        uint256[] memory blocks = new uint256[](length);
        for (uint i=0; i<target.nPeriods; i++) {
            uint256 blk = target.startBlock + (i+1) * target.period;
            blocks[i] = blk;
        }
        return blocks;
    }

    function currentBlockToLog(uint256 goalID) external view returns (uint256) {
        Goal storage goal = nftGoalMap[goalID];
        Target storage target = goal.target;
        uint256 currentBlk = block.number;
        uint256 totalPeriodLength = currentBlk - target.startBlock;
        uint256 mod = (totalPeriodLength % target.period);
        uint256 prevPeriodEndBlock = currentBlk - mod;
        require(prevPeriodEndBlock > target.startBlock, "You cannot log on this goal yet");
        return prevPeriodEndBlock;
    }

    function logActivity(uint256 goalID, uint64 events) external returns (bool) {
        Goal storage goal = nftGoalMap[goalID];
        bool isParticipant = goal.goalUserInfo[msg.sender].isParticipant;
        bool isValidator = goal.goalUserInfo[msg.sender].isValidator;
        require(isParticipant || isValidator, "You must be a Participant or validator to log activity for this goal");
        require(events >= 0, "Events should be >= 0");
        mapping(uint256 => Vote) storage votes = goal.eventsRegisteredPerPeriodMapping[msg.sender].periodVoteMapping;
        
        Target storage target = goal.target;
        uint256 currentBlk = block.number;
        uint256 totalPeriodLength = currentBlk - target.startBlock;
        uint256 mod = (totalPeriodLength % target.period);
        uint256 prevPeriodEndBlock = currentBlk - mod;
        uint256 nextPeriodEndBlock = prevPeriodEndBlock + target.period;
        console.log("Log activity: %s, prev period: %s, next period: %s", goalID, prevPeriodEndBlock, nextPeriodEndBlock);
        require(target.targetStatus == TargetStatus.RUNNING, "You can only log on goal which is in running status");

        uint256 periodEndBlock = prevPeriodEndBlock;
        require(!votes[periodEndBlock].voted, "Already voted for this period");
        require(currentBlk > prevPeriodEndBlock && currentBlk <= nextPeriodEndBlock, "You can only log activity for previous period between next period only");

        votes[periodEndBlock].events = events;
        votes[periodEndBlock].voted = true;

        goal.eventsRegisteredSum[msg.sender] += events;

        uint256 endBlock = target.startBlock + (target.period * target.nPeriods);
        if(endBlock == currentBlk) {
            // Evaluate the status of goal
            if(isPass(goal)) {
                goal.target.targetStatus = TargetStatus.SUCCESSFUL;
            } else {
                goal.target.targetStatus = TargetStatus.FAIL;
            }

        }
        return true;
    }

    function isPass(Goal storage goal) private returns (bool) {
        uint64 passed = 0;
        uint64 failed = 0;

        uint64 requirement = goal.target.nPeriods * goal.target.eventsPerPeriod;
        uint64 votedEventsAverage = 0;
        uint64 nVoters = 0;
        int8 sign = 1;
        if(goal.target.targetType == TargetType.MAX) {
            sign = -1;
        }
        if(goal.validators.length > 0) {
            for (uint i = 0; i<goal.validators.length-1; i++){
                User memory validatorUser = goal.validators[i];
                if(sign * SafeCast.toInt256(goal.eventsRegisteredSum[validatorUser.addr]) >= sign * SafeCast.toInt256(requirement)) {
                    passed += 1;
                } else {
                    failed += 1;
                }
                votedEventsAverage += goal.eventsRegisteredSum[validatorUser.addr];
                nVoters += 1;
            }
        } else {
            if(sign * SafeCast.toInt256(goal.eventsRegisteredSum[goal.participant.addr]) >= sign * SafeCast.toInt256(requirement)) {
                passed += 1;
            } else {
                failed += 1;
            }
            votedEventsAverage += goal.eventsRegisteredSum[goal.participant.addr];
            nVoters += 1;
        }

        bool isPassBool = passed * 1000 >= ((passed + failed) * 500);
        goal.result.isPass = isPassBool;
        goal.result.eventsRegisteredAvg1000x = SafeMath.div((votedEventsAverage * 1000), nVoters * 1000);
        return isPassBool;
    }
}