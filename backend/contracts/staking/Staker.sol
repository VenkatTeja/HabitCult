// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function removeLiquidity(
            address tokenA,
            address tokenB,
            uint liquidity,
            uint amountAMin,
            uint amountBMin,
            address to,
            uint deadline
        ) external returns (uint amountA, uint amountB);

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

interface BeefyInterface {
    function approve(address spender, uint256 amount) external returns (bool);
    function deposit(uint _amount) external payable;
}

contract Staker is Ownable {
    address parent;

    // address private beefyVaultAddress = 0x108c7a293162Adff86DA216AB5F91e56723125dc;
    // address private beefyVaultAddress = 0x9B36ECeaC46B70ACfB7C2D6F3FD51aEa87C31018;
    address private router = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506; // uniswap v2
    address private tokenAddr = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F; // USDT
    address private token2 = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063; // DAI

    function setParent(address _parent) public onlyOwner {
        parent = _parent;
    }

    function stake(uint256 amount) external returns (uint) {
        // require(msg.sender == parent, "no permissions");

        IERC20 token = IERC20(tokenAddr);
        // BeefyInterface beefy = BeefyInterface(beefyVaultAddress); 
        IUniswapV2Router02 routerContract = IUniswapV2Router02(router);

        // You have to tell the underling ERC20 contract that we approve transfer of tokens to beefy
        token.approve(router, amount);

        uint256 halfAmount = SafeMath.div(amount, 2);
        address[] memory pair = new address[](2);
        pair[0] = tokenAddr;
        pair[1] = token2;
        console.log("halfAmount: %s", halfAmount);
        
        uint[] memory amounts = routerContract.swapExactTokensForTokens(halfAmount, 0, pair, address(this), block.timestamp + 20);
        console.log("amounts: %s, %s", amounts[0], amounts[1]);

        IERC20 token2Contract = IERC20(token2);
        token2Contract.approve(router, amounts[1]);

        (uint amountA, uint amountB, uint liquidity) = routerContract.addLiquidity(tokenAddr, token2, halfAmount, amounts[1], 0, 0, address(this), block.timestamp + 20);
        console.log("amountA: %s, amountB: %s, liquidity: %s", amountA, amountB, liquidity);

        return liquidity;

        // Now send the tokens to beefy contract
        // beefy.deposit(amount);
    }

    // function withdraw(uint256 liquidity, address to) external {
    //     // require(msg.sender == parent, "no permissions");
    //     IERC20 token = IERC20(tokenAddr);
    //     // BeefyInterface beefy = BeefyInterface(beefyVaultAddress); 
    //     IUniswapV2Router02 routerContract = IUniswapV2Router02(router);

    //     // You have to tell the underling ERC20 contract that we approve transfer of tokens to beefy
    //     token.approve(router, amount);

    //     uint256 halfAmount = SafeMath.div(amount, 2);
    //     address[] memory pair = new address[](2);
    //     pair[0] = tokenAddr;
    //     pair[1] = token2;
    //     console.log("halfAmount: %s", halfAmount);
        
    //     uint[] memory amounts = routerContract.swapExactTokensForTokens(halfAmount, 0, pair, address(this), block.timestamp + 20);
    //     console.log("amounts: %s, %s", amounts[0], amounts[1]);

    //     IERC20 token2Contract = IERC20(token2);
    //     token2Contract.approve(router, amounts[1]);

    //     (uint amountA, uint amountB, uint liquidity) = routerContract.addLiquidity(tokenAddr, token2, halfAmount, amounts[1], 0, 0, address(this), block.timestamp + 20);
    //     console.log("amountA: %s, amountB: %s, liquidity: %s", amountA, amountB, liquidity);

    //     return liquidity;
    // }

    function deposit() external payable {
         // can be called to deposit funds to the contract 
    }
}