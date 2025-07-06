// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

/**
 *  OptionLoanHook – a post‑interaction hook for 1inch Limit Order Protocol v4.
 *
 *  Behaviour summary (single‑loan version to keep gas low):
 *   • Called once by LOP settlement when an order is filled.
 *   • Moves borrower margin → contract, transfers loan principal (already received via LOP transfer).
 *   • Stores immutable loan terms (strike in USD, expiry).
 *   • Refunds part of the taker’s gas (optional, capped).
 *   • Allows borrower to repay OR anyone to liquidate after expiry.
 */

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}

interface IPriceOracle {               // Chainlink ETH/USD aggregator (8‑decimals)
    function latestAnswer() external view returns (int256);
}

interface ILimitOrderProtocol {
    function fillOrder( bytes calldata order, bytes calldata signature, bytes calldata interaction, uint256 makingAmount, uint256 takingAmount, uint256 skipPermitAndInteractions) external payable returns (uint256, uint256);
}

contract OptionLoanHook {
    // immutable parameters (set once in openLoan)
    address public lender;
    address public borrower;

    IERC20  public principalToken;  // WETH (loan)
    uint256 public principalAmount; // 10e18

    IERC20  public marginToken;     // USDC (borrower posted)
    uint256 public marginRequired;

    uint256 public strikeUsd;       // e.g. 30_000 * 1e8
    uint256 public expiryTs;        // unix timestamp

    // config
    uint256 public gasRefundCapWei;
    IPriceOracle public immutable oracle;
    address public immutable limitOrderProtocol;

    // state
    bool public opened;
    bool public repaid;

    // events
    event LoanOpened(address indexed borrower, uint256 expiryTs);
    event LoanRepaid(address indexed borrower, uint256 repayAmountPrincipal, uint256 repayAmountExtra);
    event LoanLiquidated(address indexed liquidator, uint256 seizedMargin);

    modifier onlyLOP() {
        require(msg.sender == limitOrderProtocol, "Only LOP");
        _;
    }

    constructor(IPriceOracle _oracle, address _lop) {
        oracle = _oracle;
        limitOrderProtocol = _lop;
    }

    /*==============================================================
      Called by 1inch LOP (postInteraction) exactly ONCE per order
    ==============================================================*/
    function openLoan(bytes calldata data) external onlyLOP {
        require(!opened, "Already opened");
        opened = true;

        (
            address _lender,
            address _borrower,
            address _principalToken,
            uint256 _principalAmount,
            address _marginToken,
            uint256 _marginRequired,
            uint256 _strikeUsd,
            uint256 _expiryTs,
            uint256 _gasRefundCapWei
        ) = abi.decode(
            data,
            (address, address, address, uint256, address, uint256, uint256, uint256, uint256)
        );

        require(block.timestamp < _expiryTs, "expired before open");

        lender           = _lender;
        borrower         = _borrower;
        principalToken   = IERC20(_principalToken);
        principalAmount  = _principalAmount;
        marginToken      = IERC20(_marginToken);
        marginRequired   = _marginRequired;
        strikeUsd        = _strikeUsd;
        expiryTs         = _expiryTs;
        gasRefundCapWei  = _gasRefundCapWei;

        // Pull margin from borrower
        require(
            marginToken.transferFrom(_borrower, address(this), _marginRequired),
            "margin xfer fail"
        );

        // Refund gas (simple fixed cap)
        if (gasRefundCapWei > 0 && address(this).balance >= gasRefundCapWei) {
            // best‑effort refund – ignore failure
            (bool ok,) = _borrower.call{value: gasRefundCapWei}("");
            ok;
        }

        emit LoanOpened(_borrower, _expiryTs);
    }

    /* ───────────────────────────────────────── */
    function repay(uint256 repayPrincipal) external {
        require(opened && !repaid, "!open or repaid");
        require(msg.sender == borrower, "!borrower");
        require(block.timestamp <= expiryTs, "after expiry" );

        // calculate USD value of repayment in principal token
        uint256 spotUsd = uint256(int256(oracle.latestAnswer())); // 8‑dec
        uint256 repayUsd = (repayPrincipal * spotUsd) / 1e18;     // usd‑8
        require(repayPrincipal >= principalAmount, "< principal");
        require(repayUsd >= strikeUsd, "below strike val");

        // transfer repayment principal back to lender
        require(principalToken.transferFrom(msg.sender, lender, repayPrincipal), "repay xfer fail");

        // return margin to borrower
        marginToken.transfer(borrower, marginToken.balanceOf(address(this)));
        repaid = true;
        emit LoanRepaid(borrower, repayPrincipal, 0);
    }

    /* ─ liquidate after expiry if borrower fails ─ */
    function liquidate() external {
        require(opened && !repaid, "no default");
        require(block.timestamp > expiryTs, "too early");

        // seize all margin → lender
        uint256 bal = marginToken.balanceOf(address(this));
        marginToken.transfer(lender, bal);
        repaid = true;
        emit LoanLiquidated(msg.sender, bal);
    }

    receive() external payable {}
}