// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./library/CultMath.sol";
import "./GoalNFT.sol";
import "./GoalManager.sol";

contract CultManager is Ownable {

    address public nft;
    address public staker;
    address public goalManager;

    struct Category {
        string name;
        string description;
        string participantUrl;
        string validatorUrl;
        bool exists;
    }

    mapping(string => Category) public categories;
    string[] public categoryIndexes;
    uint public nCategories = 0;

    constructor(address _goalManager) {
        goalManager = _goalManager;
    }

    function getTargetTypes() public pure returns (string memory, string memory) {
        return ("MIN", "MAX");
    }

    function getTargetStatuses() public pure returns (string memory, string memory, string memory, string memory, string memory) {
        return ("OFF", "RUNNING", "SUCCESSFUL", "FAIL", "GAVEUP");
    }

    function getCategoryIndexes() public view returns (string[] memory) {
        return categoryIndexes;
    }

    function getCategory(string memory index) public view returns (Category memory) {
        return categories[index];
    }
    
    function addCategory(string memory categoryID, string memory name, string memory description, string memory participantUrl, string memory validatorUrl) public onlyOwner returns (bool) {
        require(!categories[categoryID].exists, "Category already exists.");
        categories[categoryID] = Category({name: name, description: description, participantUrl: participantUrl, validatorUrl: validatorUrl, exists: true});
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

    function mintNFT(address to, string memory category, bool isParticipant) internal returns (uint256) {
        GoalNFT nft = GoalNFT(nft);
        Category memory cat = categories[category];
        address[] memory tos = new address[](1);
        tos[0] = to;
        string memory url = cat.participantUrl;
        if(!isParticipant) {
            url = cat.validatorUrl;
        }
        return nft.mintNFT(tos, url);
        return 1;
    }

    // function getEventsRegistered(uint256 goalID, bool isParticipant) public view returns (uint64[] memory eventsRegisteredSum) {
    //     CultMath.Goal storage goal = nftGoalMap[goalID];
    //     CultMath.User storage participant = goal.participant;
    //     CultMath.User[] storage validators = goal.validators;
    //     mapping(address => uint64) storage eventsRegisteredSumMapping = goal.eventsRegisteredSum;   

    //     if(validators.length > 0) {
    //         uint64[] memory eventsRegisteredSum = new uint64[](validators.length);
    //         for (uint i = 0; i<validators.length-1; i++) { 
    //             CultMath.User memory validatorUser = validators[i];
    //             eventsRegisteredSum[i] = eventsRegisteredSumMapping[validatorUser.addr];
    //         }
    //         return eventsRegisteredSum;
    //     } else {
    //         uint64[] memory eventsRegisteredSum = new uint64[](1);
    //         eventsRegisteredSum[0] = eventsRegisteredSumMapping[participant.addr];
    //         return eventsRegisteredSum;
    //     }
    // }

    function addGoal(string memory name, string memory objectiveInWords, string memory category, CultMath.User memory participantUser,
        CultMath.User[] memory validatorUsers, uint64 period, uint64 eventsPerPeriod, uint64 nPeriods, CultMath.TargetType targetType, uint256 betAmount) public returns (uint256) {
        require(categories[category].exists, "Category does not exist.");
        console.log("Category exists");
        GoalManager goalManagerContract = GoalManager(goalManager);
        return goalManagerContract.addGoal(msg.sender, name, objectiveInWords, category, participantUser, validatorUsers, period, eventsPerPeriod, nPeriods, targetType, betAmount);
    }

    function logActivity(uint256 goalID, uint64 events) external returns (bool isFinalized, bool isPass) {
        GoalManager goalManagerContract = GoalManager(goalManager);
        (bool isFinalized, bool isPass) = goalManagerContract.logActivity(msg.sender, goalID, events);
        if(isFinalized && isPass) {
            mintAndSet(goalID);
        }
        return (isFinalized, isPass);
    }

    function mintAndSet(uint256 goalID) internal {
        GoalManager goalManagerContract = GoalManager(goalManager);
        (string memory name,
                string memory objectiveInWords,
                string memory category,
                uint256 _nft, 
                CultMath.User memory participant,
                CultMath.User[] memory validators,
                uint256 validatorNFT) = goalManagerContract.getGoalByID(goalID);
            uint256 nft = mintNFT(participant.addr, category, true);
            goalManagerContract.setNFTID(goalID, nft);
    }
}