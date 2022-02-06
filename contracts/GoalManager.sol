// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./library/CultMath.sol";
import "./GoalNFT.sol";

contract GoalManager is Ownable {
    address parent;

    using Counters for Counters.Counter;
    Counters.Counter private _goalIds;

    struct UserGoals {
        uint256[] participant;
        uint256[] validators;
    }

    struct UserInfo {
        bool isParticipant;
        bool isValidator;
    }

    struct Liability {
        uint256 amount;
    }

    struct UserLiability {
        uint256 total;
        uint256 locked;
        uint256 rewards;
    }

    mapping(uint256 => CultMath.Goal) public nftGoalMap;
    mapping(address => UserGoals) userGoalMapping;
    mapping(uint256 => Liability) liabilities;
    mapping(address => UserLiability) liabilitiesByUser;
    // mapping(address => 

    event NewParticipant(uint256 nftID, address participant);
    event NewValidators(uint256 nftID, address[] validators);

    address public stakingToken;
    uint64 public maxValidators = 5;
    uint64 public minPeriodBlocks = 1; // thats about 1 day with 1 block per 2 seconds
    uint16 public penalty = 500; // in basis point terms. 500 means 5%

    constructor(address _stakingToken) {
        stakingToken = _stakingToken;
    }

    function setStakingToken(address _stakingToken) public onlyOwner returns (address) {
        stakingToken = _stakingToken;
        return stakingToken;
    }

    function setParent(address _parent) public onlyOwner returns (address) {
        parent = _parent;
        return parent;
    }

    function setMaxValidators(uint64 _maxValidators) public onlyOwner returns (uint64) {
        maxValidators = _maxValidators;
        return maxValidators;
    }

    function setPenalty(uint16 _penalty) public onlyOwner returns (uint16) {
        penalty = _penalty;
        return penalty;
    }
    
    function setMinPeriodBlocks(uint64 _minPeriodBlocks) public onlyOwner returns (uint64) {
        minPeriodBlocks = _minPeriodBlocks;
        return minPeriodBlocks;
    }

    
    function getGoals(address _address) external view returns (uint256[] memory) {
        return userGoalMapping[_address].participant;
    }

    function getGoalsToValidate(address _address) external view returns (uint256[] memory) {
        return userGoalMapping[_address].validators;
    }

    function getGoalResult(uint256 id) external view returns (CultMath.Result memory) {
        CultMath.Goal storage goal = nftGoalMap[id];
        return goal.result;
    }

    function getGoalTargetByID(uint256 id) external view returns (uint256 startBlock,
                                                            uint64 nPeriods,
                                                            uint64 period, // number of blocks to consider as period
                                                            uint64 eventsPerPeriod, // max number of events to perform per period to reach goal
                                                            CultMath.TargetType targetType,
                                                            uint256 betAmount,
                                                            CultMath.TargetStatus targetStatus) {
        CultMath.Goal storage goal = nftGoalMap[id];
        CultMath.Target storage target = goal.target;
        return (target.startBlock, target.nPeriods, target.period, target.eventsPerPeriod, target.targetType, target.betAmount, target.targetStatus);
    }

    // function getNickByGoalID(uint256 id, address addr) external view returns (string memory) {
    //     CultMath.Goal storage goal = nftGoalMap[id];
    //     if(goal.participant.addr == addr)
    //         return goal.participant.nick;

    //     for (uint i=0; i<goal.validators.length; i++) {
    //         CultMath.User memory user = goal.validators[i];
    //         if(addr == user.addr) {
    //             return user.nick;
    //         }
    //     }
    //     require(false, "User not found in this goal for the given address");
    // }

    // function getGoalParamsToFinalize(uint256 id) external view returns () {

    // }

    function getGoalByID(uint256 id) external view returns (string memory name,
                                                            string memory objectiveInWords,
                                                            string memory category,
                                                            uint256 nft,
                                                            CultMath.User memory participant,
                                                            CultMath.User[] memory validators,
                                                            uint256 validatorNFT) {
        CultMath.Goal storage goal = nftGoalMap[id];
        // address[] memory addrs = new address[](goal.validators.length);
        // for (uint i=0; i<goal.validators.length; i++) {
        //     CultMath.User memory user = goal.validators[i];
        //     addrs[i] = user.addr;
        // }
        return (goal.name, goal.objectiveInWords, goal.category, goal.nft, goal.participant, goal.validators, goal.validatorNFT);
    }

    function approve(uint256 betAmount) public returns (bool) {
        require(betAmount > 0, "Non-zero bet amount is needed to start a goal");
        IERC20 token = IERC20(stakingToken);
        token.approve(address(this), betAmount);
        return true;
    }

    function getExtraAmountNeeded(uint256 betAmount, address user) internal returns (int256) {
        console.log("Liability: total: %s, locked: %s, betAmount: %s", liabilitiesByUser[user].total, liabilitiesByUser[user].locked, betAmount);
        int256 extraAmountNeeded = SafeCast.toInt256(betAmount) - (SafeCast.toInt256(liabilitiesByUser[user].total) - SafeCast.toInt256(liabilitiesByUser[user].locked));
        return extraAmountNeeded;
    }

    function setNFTID(uint256 goalID, uint256 nftID) public returns (bool) { // only parent
        require(msg.sender == parent, "no permissions");
        CultMath.Goal storage goal = nftGoalMap[goalID];
        goal.nft = nftID;
        return true;
    }

    function addGoal(address creator, string memory name, string memory objectiveInWords, string memory category, CultMath.User memory participantUser,
        CultMath.User[] memory validatorUsers, uint64 period, uint64 eventsPerPeriod, uint64 nPeriods, CultMath.TargetType targetType, uint256 betAmount) public returns (uint256) { // only parent
        console.log("sender: %s, actual sender: %s", creator, msg.sender);
        require(msg.sender == parent, "no permissions");
        validateGoalParams(category, validatorUsers, period, eventsPerPeriod, nPeriods, betAmount);
        int256 extraAmountNeeded = getExtraAmountNeeded(betAmount, creator);
        if(extraAmountNeeded > 0)
            transferTokens(creator, SafeCast.toUint256(extraAmountNeeded));
        return addGoalInternal(creator, name, objectiveInWords, category, participantUser,
        validatorUsers, period, eventsPerPeriod, nPeriods, targetType, betAmount);
    }

    function validateGoalParams(string memory category,
        CultMath.User[] memory validatorUsers, uint64 period, uint64 eventsPerPeriod, uint64 nPeriods, uint256 betAmount) private view returns (bool) {

        require(betAmount > 0, "Non-zero bet amount is needed to start a goal");
        require(nPeriods > 0, "nPeriods must be atleast 1");
        require(eventsPerPeriod >= 0, "eventsPerPeriod must be >= 0");
        require(validatorUsers.length <= maxValidators, "Max validators exceeds limit");
        require(period >= minPeriodBlocks, "period should be >= min period");
        return true;
    }

    function transferTokens(address creator, uint256 betAmount) private returns (uint256) {
        IERC20 token = IERC20(stakingToken);
        uint256 initialBal = token.balanceOf(address(this));
        token.transferFrom(creator, address(this), betAmount);
        uint256 finalBal = token.balanceOf(address(this));
        require((finalBal - initialBal) == betAmount, "Could not recieve tokens");
        return (betAmount);
    }

    function addGoalInternal(address creator, string memory name, string memory objectiveInWords, string memory category, CultMath.User memory participantUser,
        CultMath.User[] memory validatorUsers, uint64 period, uint64 eventsPerPeriod, uint64 nPeriods, CultMath.TargetType targetType, uint256 betAmount) internal returns (uint256) {
        console.log("addGoalInternal");

        _goalIds.increment();
        uint256 id = _goalIds.current();
        console.log("New Goal ID: %s", id);
        
        CultMath.Goal storage goal = nftGoalMap[id];
        goal.name = name;
        goal.objectiveInWords = objectiveInWords;
        goal.category = category;
        goal.creator = creator;
        goal.participant = participantUser;
        
        userGoalMapping[participantUser.addr].participant.push(id);
        goal.goalUserInfo[participantUser.addr].isParticipant = true;

        _setTarget(goal, nPeriods, period, eventsPerPeriod, targetType, betAmount);

        liabilities[id] = Liability({amount: betAmount});

        updateUserLiability(creator, betAmount);

        _setGoalUsers(id, validatorUsers);
        
        return id;
    }

    function updateUserLiability(address creator, uint256 betAmount) private returns (bool) {
        UserLiability storage liability = liabilitiesByUser[creator];
        int256 extraAmountNeeded = getExtraAmountNeeded(betAmount, creator);
        console.log("extra amoount: %s", SafeCast.toUint256(extraAmountNeeded));
        if(extraAmountNeeded > 0) {
            liability.total += SafeCast.toUint256(extraAmountNeeded);
        }
        liability.locked += betAmount;

        console.log("locked amount: %s", liability.locked);
        console.log("total amount: %s", liability.total);
        return true;
    }

    function _setTarget(CultMath.Goal storage goal, uint64 nPeriods, uint64 period, uint64 eventsPerPeriod, CultMath.TargetType targetType, uint256 betAmount) internal returns (CultMath.Target storage) {
        CultMath.Target storage target = goal.target;
        target.startBlock = block.number;
        target.nPeriods = nPeriods;
        target.period = period;
        target.eventsPerPeriod = eventsPerPeriod;
        target.targetType = targetType;
        target.betAmount = betAmount;
        target.targetStatus = CultMath.TargetStatus.RUNNING;
        return target;
    }

    function _setGoalUsers(uint256 goalID, CultMath.User[] memory validatorUsers) private returns (bool) {
        CultMath.Goal storage goal = nftGoalMap[goalID];

        console.log("_setGoalUsers start");

        address[] memory validatorAddrs = new address[](validatorUsers.length);
        for (uint i=0; i<validatorUsers.length; i++) {
            console.log("set validator: %s", i);
            CultMath.User memory validatorUser = validatorUsers[i];
            validatorAddrs[i] = validatorUser.addr;
            userGoalMapping[validatorUser.addr].validators.push(goalID);
            goal.goalUserInfo[validatorUser.addr].isValidator = true;
            goal.validators.push(CultMath.User({nick: validatorUser.nick, addr: validatorUser.addr}));
        }

        console.log("Validators length: %s", goal.validators.length);

        console.log("_setGoalUsers done");
        return true;
    }

    function getUserStake(address user) public view returns (UserLiability memory) {
        return liabilitiesByUser[user];
    }

    function getPeriodEndingsByBlock(uint256 goalID) external view returns (uint256[] memory) {
        CultMath.Goal storage goal = nftGoalMap[goalID];
        CultMath.Target storage target = goal.target;
        uint length = target.nPeriods;
        uint256[] memory blocks = new uint256[](length);
        console.log("start block: %s", target.startBlock);
        for (uint i=0; i<target.nPeriods; i++) {
            uint256 blk = target.startBlock + (i+1) * target.period;
            console.log("blk:%s,  block: %s, period: %s", i, blk, target.period);
            blocks[i] = blk;
        }
        return blocks;
    }

    function currentBlockToLog(uint256 goalID) external view returns (uint256) {
        CultMath.Goal storage goal = nftGoalMap[goalID];
        CultMath.Target storage target = goal.target;
        uint256 currentBlk = block.number;
        uint256 totalPeriodLength = currentBlk - target.startBlock;
        uint256 mod = (totalPeriodLength % target.period);
        uint256 prevPeriodEndBlock = currentBlk - mod;
        require(prevPeriodEndBlock > target.startBlock, "You cannot log on this goal yet");
        return prevPeriodEndBlock;
    }

    function validateGoalAccess(address sender, uint256 goalID) internal view returns (bool) {
        CultMath.Goal storage goal = nftGoalMap[goalID];
        bool isParticipant = goal.goalUserInfo[sender].isParticipant;
        bool isValidator = goal.goalUserInfo[sender].isValidator;
        require(isParticipant || isValidator, "You must be a Participant or validator to log activity for this goal");
        return true;
    }

    function getLoggedEvents(uint256 goalID, address by, uint256 periodEndBlock) public view returns (CultMath.Vote memory) {
        CultMath.Goal storage goal = nftGoalMap[goalID];
        mapping(uint256 => CultMath.Vote) storage votes = goal.eventsRegisteredPerPeriodMapping[by].periodVoteMapping;
        return votes[periodEndBlock];
    }

    function logActivity(address sender, uint256 goalID, uint64 events) external returns (bool, bool) { // (isfinzliaed, output isPass)
        validateGoalAccess(sender, goalID);
        require(events >= 0, "Events should be >= 0");
        CultMath.Goal storage goal = nftGoalMap[goalID];
        mapping(uint256 => CultMath.Vote) storage votes = goal.eventsRegisteredPerPeriodMapping[sender].periodVoteMapping;
        
        CultMath.Target storage target = goal.target;
        uint256 currentBlk = block.number;
        uint256 totalPeriodLength = currentBlk - target.startBlock;
        uint256 mod = (totalPeriodLength % target.period);
        uint256 prevPeriodEndBlock = currentBlk - mod;
        uint256 nextPeriodEndBlock = prevPeriodEndBlock + target.period;
        console.log("Log activity: %s, prev period: %s, next period: %s", goalID, prevPeriodEndBlock, nextPeriodEndBlock);
        require(target.targetStatus == CultMath.TargetStatus.RUNNING, "You can only log on goal which is in running status");

        uint256 periodEndBlock = prevPeriodEndBlock;
        require(!votes[periodEndBlock].voted, "Already voted for this period");
        require(currentBlk > prevPeriodEndBlock && currentBlk <= nextPeriodEndBlock, "You can only log activity for previous period between next period only");

        votes[periodEndBlock].events = events;
        votes[periodEndBlock].voted = true;
        
        updateEventLog(goal, sender, events);

        uint256 endBlock = target.startBlock + (target.period * target.nPeriods);
        if(endBlock == periodEndBlock) {
            // Evaluate the status of goal
            return onEnd(goal, periodEndBlock);
        }
        return (false, false);
    }

    function updateEventLog(CultMath.Goal storage goal, address sender, uint64 events) internal returns (bool) {
        mapping(address => uint64) storage eventsRegisteredSum = goal.eventsRegisteredSum;
        eventsRegisteredSum[sender] += events;
        console.log("log activity user log: %s", eventsRegisteredSum[sender]);
        return true;
    }

    function onEnd(CultMath.Goal storage goal, uint256 periodEndBlock) internal returns (bool, bool) {
        uint64 nVoters = 0;
        mapping(uint256 => CultMath.Vote) storage votes1 = goal.eventsRegisteredPerPeriodMapping[goal.participant.addr].periodVoteMapping;
        if(votes1[periodEndBlock].voted) {
            console.log("participant voted");
            nVoters = 1;
        }
        for (uint i = 0; i<goal.validators.length; i++) { 
            console.log("checking validators: %s", i);
            CultMath.User memory validatorUser = goal.validators[i];
            mapping(uint256 => CultMath.Vote) storage votes2 = goal.eventsRegisteredPerPeriodMapping[validatorUser.addr].periodVoteMapping;
            if(votes2[periodEndBlock].voted) {
                console.log("validator voted");
                nVoters += 1;
            }
        }
        console.log("Should finalize: nVoters: %s / ", nVoters, (1 + goal.validators.length));
        if(nVoters == (1 + goal.validators.length)) {
            console.log("finalizeGoal");
            return (true, finalizeGoal(goal));
        }
        return (false, false);
    }

    
    function finalizeGoal(CultMath.Goal storage goal) private returns (bool) {
        uint64 requirement = goal.target.nPeriods * goal.target.eventsPerPeriod;
        console.log("Requirement: %s", requirement);
        CultMath.User storage participant = goal.participant;
        CultMath.User[] storage validators = goal.validators;
        mapping(address => uint64) storage eventsRegisteredSumMapping = goal.eventsRegisteredSum;
        CultMath.Result memory result;
        console.log("Validators length: %s", validators.length);
        if(validators.length > 0) {
            uint64[] memory eventsRegisteredSum = new uint64[](validators.length);
            for (uint i = 0; i<validators.length; i++) { 
                CultMath.User memory validatorUser = validators[i];
                console.log("eventsRegisteredSumMapping: %s - #%s", i, eventsRegisteredSumMapping[validatorUser.addr]);
                eventsRegisteredSum[i] = eventsRegisteredSumMapping[validatorUser.addr];
            }
            result = finalizeGoalInternal(requirement, goal.target.targetType, participant, validators, eventsRegisteredSum);
        } else {
            uint64[] memory eventsRegisteredSum = new uint64[](1);
            eventsRegisteredSum[0] = eventsRegisteredSumMapping[participant.addr];
            result = finalizeGoalInternal(requirement, goal.target.targetType, participant, validators, eventsRegisteredSum);
        }
        
        console.log("Result recieved");
        goal.result = result;

        if(result.isPass) {
            console.log("Result passed");
            goal.target.targetStatus = CultMath.TargetStatus.SUCCESSFUL;
            console.log("target marked successful");
            console.log("locked amount: %s", liabilitiesByUser[goal.creator].locked);
            liabilitiesByUser[goal.creator].locked -= goal.target.betAmount;
            console.log("target stake locked");
            // goal.nft = mintNFT(goal.participant.addr, goal.category, true);
            return true;
        } else {
            goal.target.targetStatus = CultMath.TargetStatus.FAIL;
        }
        return false;
    }

    function finalizeGoalInternal(uint64 requirement, CultMath.TargetType targetType, CultMath.User memory participant, 
        CultMath.User[] memory validators, uint64[] memory eventsRegisteredSum) private view returns (CultMath.Result memory) {
        uint64 passed = 0;
        uint64 failed = 0;
        // uint64 requirement = goal.target.nPeriods * goal.target.eventsPerPeriod;
        uint64 votedEventsAverage = 0;
        uint64 nVoters = 0;
        int8 sign = 1;
        if(targetType == CultMath.TargetType.MAX) {
            sign = -1;
        }
        // console.log("Sign: %s", sign);
        if(validators.length > 0) {
            for (uint i = 0; i<validators.length; i++){
                CultMath.User memory validatorUser = validators[i];
                console.log("(eventsRegisteredSum: %s", eventsRegisteredSum[i]);
                if(sign * SafeCast.toInt256(eventsRegisteredSum[i]) >= sign * SafeCast.toInt256(requirement)) {
                    passed += 1;
                } else {
                    failed += 1;
                }
                votedEventsAverage += eventsRegisteredSum[i];
                nVoters += 1;
            }
        } else {
            console.log("(eventsRegisteredSum: %s", eventsRegisteredSum[0]);
            if(sign * SafeCast.toInt256(eventsRegisteredSum[0]) >= sign * SafeCast.toInt256(requirement)) {
                passed += 1;
            } else {
                failed += 1;
            }
            votedEventsAverage += eventsRegisteredSum[0];
            nVoters += 1;
        }
        
        console.log("votedEventsAverage: %s, nVoters: %s", votedEventsAverage, nVoters);
        console.log("passed: %s, failed: %s", passed, failed);
        CultMath.Result memory result;
        bool isPassBool = passed * 1000 >= ((passed + failed) * 500);
        console.log("left: %s, right: %s, isPass: %s", passed * 1000, ((passed + failed) * 500), isPassBool);
        result.isPass = isPassBool;
        result.eventsRegisteredAvg1000x = SafeMath.div((votedEventsAverage * 1000), nVoters);
        return result;
    }

    function giveUpAndCloseGoal(uint256 goalID) public returns (uint256) {
        CultMath.Goal storage goal = nftGoalMap[goalID];
        
        require(msg.sender == goal.creator, "Only creator of goal can close it");
        uint256 originalAmount = liabilities[goalID].amount;
        uint256 returnAmount = SafeMath.div(liabilities[goalID].amount * (10000 - penalty), 10000);
        IERC20 token = IERC20(stakingToken);
        liabilities[goalID].amount = 0;
        goal.target.targetStatus = CultMath.TargetStatus.GAVEUP;
        liabilitiesByUser[msg.sender].total -= originalAmount;
        liabilitiesByUser[msg.sender].locked -= originalAmount;
        token.approve(goal.creator, returnAmount);
        token.transfer(goal.creator, returnAmount);
        return returnAmount;
    }

    function userWithdraw(uint256 amount) public returns (uint256) {
        uint256 available = liabilitiesByUser[msg.sender].total - liabilitiesByUser[msg.sender].locked;
        require(available >= amount, "Withdrawable balance is low");
        IERC20 token = IERC20(stakingToken);
        liabilitiesByUser[msg.sender].total -= amount;
        token.approve(msg.sender, amount);
        token.transfer(msg.sender, amount);
        return amount;
    }

    function emergencyWithdraw(address to, uint256 amount) public onlyOwner returns (uint256) {
        IERC20 token = IERC20(stakingToken);
        token.approve(to, amount);
        token.transfer(to, amount);
        return amount;
    }

    function repeatGoal(uint256 goalID) public returns (uint256) {
        CultMath.Goal storage goal = nftGoalMap[goalID];
        require(msg.sender == goal.creator, "Only creator of goal can choose to repeat it");
        uint256 newAmount = liabilities[goalID].amount;
        uint256 newGoalId = addGoalInternal(msg.sender, goal.name, goal.objectiveInWords, goal.category, goal.participant,
        goal.validators, goal.target.period, goal.target.eventsPerPeriod, goal.target.nPeriods, goal.target.targetType, newAmount);
        liabilities[goalID].amount = 0;
        liabilities[newGoalId].amount = newAmount;
        return newGoalId;
    }

}