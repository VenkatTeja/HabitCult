// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "hardhat/console.sol";
// import "./library/CultMath.sol";
// import "./CultManager.sol";

// contract CultManagerChild is Ownable {
//     CultManager manager;

//     constructor(address _manager) {
//         CultManager manager = CultManager(_manager);
//     }

//     function finalizeGoal(uint256 goalID) public returns (bool) {
//         (string memory name,
//             string memory description,
//             string memory category,
//             address participant,
//             address[] memory validators,
//             uint256 validatorNFT) = manager.getGoalByID(goalID);
//         (uint64 requirement, CultMath.TargetType targetType) = getTargetParams(goalID);
        
//     }

//     function getTargetParams(uint256 goalID) internal view returns (uint64 requirement, CultMath.TargetType targetType) {
//         (uint256 startBlock,
//             uint64 nPeriods,
//             uint64 period, // number of blocks to consider as period
//             uint64 eventsPerPeriod, // max number of events to perform per period to reach goal
//             CultMath.TargetType targetType,
//             uint256 betAmount,
//             CultMath.TargetStatus targetStatus) = manager.getGoalTargetByID(goalID);
//         return (eventsPerPeriod * nPeriods, targetType);
//     }

//     // function finalizeGoalInternal(uint64 requirement, CultMath.TargetType targetType, CultMath.User memory participant, 
//     //     CultMath.User[] memory validators, uint64[] memory eventsRegisteredSum) public onlyOwner returns (CultMath.Result memory) {
//     //     uint64 passed = 0;
//     //     uint64 failed = 0;

//     //     // uint64 requirement = goal.target.nPeriods * goal.target.eventsPerPeriod;
//     //     uint64 votedEventsAverage = 0;
//     //     uint64 nVoters = 0;
//     //     int8 sign = 1;
//     //     if(targetType == CultMath.TargetType.MAX) {
//     //         sign = -1;
//     //     }
//     //     if(validators.length > 0) {
//     //         for (uint i = 0; i<validators.length-1; i++){
//     //             CultMath.User memory validatorUser = validators[i];
//     //             if(sign * SafeCast.toInt256(eventsRegisteredSum[i]) >= sign * SafeCast.toInt256(requirement)) {
//     //                 passed += 1;
//     //             } else {
//     //                 failed += 1;
//     //             }
//     //             votedEventsAverage += eventsRegisteredSum[i];
//     //             nVoters += 1;
//     //         }
//     //     } else {
//     //         if(sign * SafeCast.toInt256(eventsRegisteredSum[0]) >= sign * SafeCast.toInt256(requirement)) {
//     //             passed += 1;
//     //         } else {
//     //             failed += 1;
//     //         }
//     //         votedEventsAverage += eventsRegisteredSum[0];
//     //         nVoters += 1;
//     //     }

//     //     CultMath.Result memory result;
//     //     bool isPassBool = passed * 1000 >= ((passed + failed) * 500);
//     //     result.isPass = isPassBool;
//     //     result.eventsRegisteredAvg1000x = SafeMath.div((votedEventsAverage * 1000), nVoters * 1000);
//     //     return result;
//     // }
// }