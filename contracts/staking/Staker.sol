// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface BeefyInterface {
    function approve(address spender, uint256 amount) external returns (bool);
    function deposit(uint _amount) external payable;
}

contract Staker {
    // address private beefyVaultAddress = 0x108c7a293162Adff86DA216AB5F91e56723125dc;
    address private beefyVaultAddress = 0x9B36ECeaC46B70ACfB7C2D6F3FD51aEa87C31018;
    address private tokenAddr = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;

    function stake(uint256 amount) external {
        IERC20 token = IERC20(tokenAddr);
        BeefyInterface beefy = BeefyInterface(beefyVaultAddress); 

        // You have to tell the underling ERC20 contract that we approve transfer of tokens to beefy
        token.approve(beefyVaultAddress, amount);

        // Now send the tokens to beefy contract
        beefy.deposit(amount);
    }

    function withdraw() external {
    }

    function deposit() external payable {
         // can be called to deposit funds to the contract 
    }
}