// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface BeefyInterface {
    function approve(address spender, uint256 amount) external returns (bool);
    function deposit(uint _amount) external payable;
}

contract Staker {

    function stake() external payable {
        BeefyInterface beefy = BeefyInterface(0x108c7a293162Adff86DA216AB5F91e56723125dc);
        beefy.approve(0x108c7a293162Adff86DA216AB5F91e56723125dc, 3);
        beefy.deposit(msg.value);
    }

    function withdraw() external {
        // do nothing
    }

    function deposit() external payable {
         
    }
}