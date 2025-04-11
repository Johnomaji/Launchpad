    #[allow(lint(self_transfer))]
module launchpad::memecoin_factory {
    use sui::tx_context::sender;
    use sui::event;
    // use sui::object;
    // use sui::tx_context::TxContext;
    // use sui::transfer;
    use launchpad::memecoin;

    // Error codes
    const E_INVALID_PARAMETERS: u64 = 1;

    // Event types
    public struct MemecoinCreated has copy, drop, store {
        creator: address,
        memecoin_id: address,
        name: vector<u8>,
        symbol: vector<u8>,
    }

    /// Create a new memecoin
    public fun create_memecoin(
        ctx: &mut TxContext,
        name: vector<u8>,
        symbol: vector<u8>,
        initial_supply: u64,
        max_supply: u64
    ): address {
        // Validate inputs
        assert!(name.length() > 0 && symbol.length() > 0, E_INVALID_PARAMETERS);
        assert!(initial_supply <= max_supply, E_INVALID_PARAMETERS);

        // Create the memecoin
        let memecoin = memecoin::create(
            ctx,
            name,
            symbol,
            initial_supply,
            max_supply
        );

        // Get the memecoin's address
        let memecoin_id = memecoin::get_address(&memecoin);

        // Emit creation event
        event::emit(MemecoinCreated {
            creator: sender(ctx),
            memecoin_id,
            name,
            symbol,
        });

        // Transfer the memecoin to the caller
        transfer::public_transfer(memecoin, sender(ctx));

        // Return the memecoin's address
        memecoin_id
    }
}