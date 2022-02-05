// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface BeefyInterface {
    function deposit(uint256) external payable;
    function depositAll() external;

    function withdraw(uint256) external;
    function withdrawAll() external;
    
    function balance() external view returns (uint); 
}

contract Staker {
    // address private beefyVaultAddress = 0x108c7a293162Adff86DA216AB5F91e56723125dc;
    address private beefyVaultAddress = 0x9B36ECeaC46B70ACfB7C2D6F3FD51aEa87C31018;
    address private tokenAddr = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
    
    BeefyInterface private beefy = BeefyInterface(beefyVaultAddress); 
    IERC20 private token = IERC20(tokenAddr);

    function stake(uint256 _amount) external {
        // You have to tell the underling ERC20 contract that we approve transfer of tokens to beefy
        token.approve(beefyVaultAddress, _amount);

        // Now send the tokens to beefy contract
        beefy.deposit(_amount);
    }

    function stakeAll() external {
        // You have to tell the underling ERC20 contract that we approve transfer of all available tokens to beefy
        token.approve(beefyVaultAddress, token.balanceOf(address(this)));

        // Now send all the tokens to beefy contract
        beefy.depositAll();
    }

    function unstake(uint _amount) external {

        uint _pool = beefy.balance();

        uint shares = 0;

        if (token.totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = ((_amount * token.totalSupply()) / _pool);
        }

        beefy.withdraw(shares);

    }

    function unstakeAll() external {

        beefy.withdrawAll();

    }

    function withdrawFunds(address _to) external {
        // can be called to withdraw tokens back from the contract
        require(msg.sender == 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, "Not contract owner"); // can be replaced with cultmanager address later
        require(token.balanceOf(address(this)) > 0, "You have no tokens to withdraw");

        token.transfer(_to, token.balanceOf(address(this)));
    }

}