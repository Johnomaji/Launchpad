module template::template {
    use sui::coin::{Self, TreasuryCap};
    use sui::balance::{Balance};
    use sui::clock::{Clock};
    use sui::url::new_unsafe_from_bytes;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const EInvalidAmount: u64 = 0;
    const ESupplyExceeded: u64 = 1;
    const ETokenLocked: u64 = 2;

    public struct TEMPLATE has drop {}

    public struct MintCapability has key {
        id: UID,
        treasury: TreasuryCap<TEMPLATE>,
        total_minted: u64,
    }

    public struct Locker has key, store {
        id: UID,
        unlock_date: u64,
        balance: Balance<TEMPLATE>,
    }

    const DECIMALS: u8 = 6;
    const INITIAL_SUPPLY: u64 = 1;
    const TOTAL_SUPPLY: u64 = 100;

	const TOKEN_NAME: vector<u8> = b"TEMPLATE";
    const TOKEN_SYMBOL: vector<u8> = b"TMP";
    const TOKEN_DESCRIPTION: vector<u8> = b"template_description";
    const TOKEN_ICON_URL: vector<u8> = b"template_icon_url";

	fun init(otw: TEMPLATE, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            otw,
            DECIMALS,
            TOKEN_SYMBOL,
            TOKEN_NAME,
            TOKEN_DESCRIPTION,
            option::some(new_unsafe_from_bytes(TOKEN_ICON_URL)),
            ctx
        );

        let mut mint_cap = MintCapability {
            id: object::new(ctx),
            treasury,
            total_minted: 0,
        };

        mint(&mut mint_cap, INITIAL_SUPPLY, ctx.sender(), ctx);

        transfer::public_freeze_object(metadata);
        transfer::transfer(mint_cap, ctx.sender());
    }

    public fun mint(
        mint_cap: &mut MintCapability,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = mint_internal(mint_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    public fun mint_locked(
        mint_cap: &mut MintCapability,
        amount: u64,
        recipient: address,
        duration: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let coin = mint_internal(mint_cap, amount, ctx);
        let start_date = clock.timestamp_ms();
        let unlock_date = start_date + duration;

        let locker = Locker {
            id: object::new(ctx),
            unlock_date,
            balance: coin::into_balance(coin)
        };

        transfer::public_transfer(locker, recipient);
    }

    entry fun withdraw_locked(locker: Locker, clock: &Clock, ctx: &mut TxContext): u64 {
        let Locker { id, mut balance, unlock_date } = locker;

        assert!(clock.timestamp_ms() >= unlock_date, ETokenLocked);

        let locked_balance_value = balance.value();

        transfer::public_transfer(
            coin::take(&mut balance, locked_balance_value, ctx),
            ctx.sender()
        );

        balance.destroy_zero();
        object::delete(id);

        locked_balance_value
    }

    fun mint_internal(
        mint_cap: &mut MintCapability,
        amount: u64,
        ctx: &mut TxContext
    ): coin::Coin<TEMPLATE> {
        assert!(amount > 0, EInvalidAmount);
        assert!(mint_cap.total_minted + amount <= TOTAL_SUPPLY, ESupplyExceeded);

        let treasury = &mut mint_cap.treasury;
        let coin = coin::mint(treasury, amount, ctx);

        mint_cap.total_minted = mint_cap.total_minted + amount;
        coin
    }

    // Additional utility functions
    public fun get_total_supply(): u64 {
        TOTAL_SUPPLY
    }

    public fun get_decimals(): u8 {
        DECIMALS
    }

    #[test_only]
    use sui::test_scenario;
    #[test_only]
    use sui::clock;

    #[test]
    fun test_init() {
        let publisher = @0x11;

        let mut scenario = test_scenario::begin(publisher);
        {
            let otw = TEMPLATE{};
            init(otw, scenario.ctx());
        };

        scenario.next_tx(publisher);
        {
            let mint_cap = scenario.take_from_sender<MintCapability>();
            let template_coin = scenario.take_from_sender<coin::Coin<TEMPLATE>>();

            assert!(mint_cap.total_minted == INITIAL_SUPPLY, EInvalidAmount);
            assert!(template_coin.balance().value() == INITIAL_SUPPLY, EInvalidAmount);

            scenario.return_to_sender(template_coin);
            scenario.return_to_sender(mint_cap);
        };

        scenario.next_tx(publisher);
        {
            let mut mint_cap = scenario.take_from_sender<MintCapability>();

            mint(
                &mut mint_cap,
                50,
                scenario.ctx().sender(),
                scenario.ctx()
            );

            assert!(mint_cap.total_minted == INITIAL_SUPPLY + 50, EInvalidAmount);

            scenario.return_to_sender(mint_cap);
        };

        scenario.end();
    }

    #[test]
    fun test_lock_tokens() {
        let publisher = @0x11;
        let bob = @0xB0B;

        let mut scenario = test_scenario::begin(publisher);
        {
            let otw = TEMPLATE{};
            init(otw, scenario.ctx());
        };

        scenario.next_tx(publisher);
        {
            let mut mint_cap = scenario.take_from_sender<MintCapability>();
            let duration = 5000;
            let test_clock = clock::create_for_testing(scenario.ctx());

            mint_locked(
                &mut mint_cap,
                20,
                bob,
                duration,
                &test_clock,
                scenario.ctx()
            );

            assert!(mint_cap.total_minted == INITIAL_SUPPLY + 20, EInvalidAmount);
            scenario.return_to_sender(mint_cap);
            test_clock.destroy_for_testing();
        };

        scenario.next_tx(bob);
        {
            let locker = scenario.take_from_sender<Locker>();
            let duration = 5000;
            let mut test_clock = clock::create_for_testing(scenario.ctx());
            test_clock.set_for_testing(duration);

            let amount = withdraw_locked(
                locker,
                &test_clock,
                scenario.ctx()
            );

            assert!(amount == 20, EInvalidAmount);
            test_clock.destroy_for_testing();
        };

        scenario.next_tx(bob);
        {
            let coin = scenario.take_from_sender<coin::Coin<TEMPLATE>>();
            assert!(coin.balance().value() == 20, EInvalidAmount);
            scenario.return_to_sender(coin);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = ESupplyExceeded)]
    fun test_lock_overflow() {
        let publisher = @0x11;
        let bob = @0xB0B;

        let mut scenario = test_scenario::begin(publisher);
        {
            let otw = TEMPLATE{};
            init(otw, scenario.ctx());
        };

        scenario.next_tx(publisher);
        {
            let mut mint_cap = scenario.take_from_sender<MintCapability>();
            let duration = 5000;
            let test_clock = clock::create_for_testing(scenario.ctx());

            mint_locked(
                &mut mint_cap,
                TOTAL_SUPPLY + 1,
                bob,
                duration,
                &test_clock,
                scenario.ctx()
            );

            scenario.return_to_sender(mint_cap);
            test_clock.destroy_for_testing();
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = ESupplyExceeded)]
    fun test_mint_overflow() {
        let publisher = @0x11;

        let mut scenario = test_scenario::begin(publisher);
        {
            let otw = TEMPLATE{};
            init(otw, scenario.ctx());
        };

        scenario.next_tx(publisher);
        {
            let mut mint_cap = scenario.take_from_sender<MintCapability>();

            mint(
                &mut mint_cap,
                TOTAL_SUPPLY + 1,
                scenario.ctx().sender(),
                scenario.ctx()
            );

            scenario.return_to_sender(mint_cap);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = ETokenLocked)]
    fun test_withdraw_locked_before_unlock() {
        let publisher = @0x11;
        let bob = @0xB0B;

        let mut scenario = test_scenario::begin(publisher);
        {
            let otw = TEMPLATE{};
            init(otw, scenario.ctx());
        };

        scenario.next_tx(publisher);
        {
            let mut mint_cap = scenario.take_from_sender<MintCapability>();
            let duration = 5000;
            let test_clock = clock::create_for_testing(scenario.ctx());

            mint_locked(
                &mut mint_cap,
                20,
                bob,
                duration,
                &test_clock,
                scenario.ctx()
            );

            scenario.return_to_sender(mint_cap);
            test_clock.destroy_for_testing();
        };

        scenario.next_tx(bob);
        {
            let locker = scenario.take_from_sender<Locker>();
            let duration = 4999;
            let mut test_clock = clock::create_for_testing(scenario.ctx());
            test_clock.set_for_testing(duration);

            withdraw_locked(
                locker,
                &test_clock,
                scenario.ctx()
            );

            test_clock.destroy_for_testing();
        };

        scenario.end();
    }

    #[test]
    fun test_utility_functions() {
        assert!(get_total_supply() == TOTAL_SUPPLY, EInvalidAmount);
        assert!(get_decimals() == DECIMALS, EInvalidAmount);
    }
}
