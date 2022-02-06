// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

library CultMath {
    enum TargetType{ MIN, MAX }
    enum TargetStatus{ OFF, RUNNING, SUCCESSFUL, FAIL, GAVEUP }

    struct User {
        string nick;
        address addr;
    }

    struct Result {
        bool isPass;
        uint256 eventsRegisteredAvg1000x;
    }

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

    struct UserInfo {
        bool isParticipant;
        bool isValidator;
    }

    struct PeriodVoteMapping {
        mapping(uint256 => Vote) periodVoteMapping;
    }

    struct Goal {
        string name;
        string objectiveInWords;
        string category;
        uint256 nft;
        address creator;
        User participant;
        User[] validators;
        uint256 validatorNFT;
        mapping(address => UserInfo) goalUserInfo;
        Target target;        
        mapping(address => PeriodVoteMapping) eventsRegisteredPerPeriodMapping;
        mapping(address => uint64) eventsRegisteredSum;

        Result result;
    }

    
}