// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface BeefyInterface {
    function approve(address spender, uint256 amount) external returns (bool);
    function deposit(uint _amount) external payable;
}

contract Staker {
    address private beefyVaultAddress = 0x108c7a293162Adff86DA216AB5F91e56723125dc;

    function stake() external payable {
        BeefyInterface beefy = BeefyInterface(beefyVaultAddress); 
        beefy.approve(beefyVaultAddress, 3);
        beefy.deposit(msg.value);
    }

    function withdraw() external {
    }

    function deposit() external payable {
         // can be called to deposit funds to the contract 
    }
}