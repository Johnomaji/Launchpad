module launchpad::memecoin {
    use sui::tx_context::sender;
    use sui::event;
    // use sui::object::{Self, UID};
    // use sui::tx_context::TxContext;

    // Error codes
    // const E_NOT_AUTHORIZED: u64 = 1;
    const E_SUPPLY_CAP_EXCEEDED: u64 = 2;

    // Event types
    public struct TokensMinted has copy, drop, store {
        to: address,
        amount: u64,
    }

    public struct TokensBurned has copy, drop, store {
        from: address,
        amount: u64,
    }

    /// Struct representing the memecoin token
    public struct Memecoin has key, store {
        id: UID,
        name: vector<u8>,
        symbol: vector<u8>,
        total_supply: u64,
        max_supply: u64,
    }

    /// Create a new memecoin
    public fun create(
        ctx: &mut TxContext,
        name: vector<u8>,
        symbol: vector<u8>,
        initial_supply: u64,
        max_supply: u64
    ): Memecoin {
        Memecoin {
            id: object::new(ctx),
            name,
            symbol,
            total_supply: initial_supply,
            max_supply,
        }
    }

    /// Mint new tokens
    public fun mint(
        memecoin: &mut Memecoin,
        ctx: &mut TxContext,
        amount: u64
    ) {
        assert!(memecoin.total_supply + amount <= memecoin.max_supply, E_SUPPLY_CAP_EXCEEDED);

        memecoin.total_supply = memecoin.total_supply + amount;

        // Emit minting event
        event::emit(TokensMinted {
            to: sender(ctx),
            amount,
        });
    }

    /// Burn tokens
    public fun burn(
        memecoin: &mut Memecoin,
        ctx: &mut TxContext,
        amount: u64
    ) {
        assert!(amount <= memecoin.total_supply, E_SUPPLY_CAP_EXCEEDED);

        memecoin.total_supply = memecoin.total_supply - amount;

        // Emit burning event
        event::emit(TokensBurned {
            from: sender(ctx),
            amount,
        });
    }

    /// Get the address of the memecoin
    public fun get_address(memecoin: &Memecoin): address {
        object::uid_to_address(&memecoin.id)
    }
}