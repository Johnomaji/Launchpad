module memetic::coin_manager {
    use std::option::{Self, Option, none, some};
    use std::string::{Self, String};
    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::url::{Self, Url};
    use sui::dynamic_field;

    // Error constants
    const ENotAdmin: u64 = 0;
    const ECoinNotRegistered: u64 = 1;
    const EAlreadyRegistered: u64 = 2;
    const EInvalidName: u64 = 6;
    const EInvalidSymbol: u64 = 7;
    const EInvalidDecimals: u64 = 8;
    const EInvalidSupply: u64 = 9;
    const EInvalidCreator: u64 = 10;
    const EInvalidUrl: u64 = 11;

    /// One-time-witness for the module
    public struct COIN_MANAGER has drop {}

    /// Stores metadata information about a coin
    public struct CoinInfo<phantom T> has store {
        name: String,
        symbol: String,
        description: String,
        decimals: u8,
        icon_url: Option<String>,
        telegram_social: Option<Url>,
        x_social: Option<Url>,
        discord_social: Option<Url>,
        total_supply: u64,
        initial_supply: u64,
        creator: address,
        total_minted: u64,
        creation_time: u64,
        first_mint_time: u64,
        last_mint_time: u64
    }

    /// Capability that grants administrative permissions
    public struct AdminCap has key {
        id: UID
    }

    /// Event emitted when coin metadata is updated
    public struct CoinMetadataUpdated<phantom T> has copy, drop {
        symbol: String,
        updater: address,
        timestamp: u64
    }

    /// Event emitted when a coin is registered
    public struct CoinRegistered<phantom T> has copy, drop {
        name: String,
        symbol: String,
        creator: address,
        timestamp: u64
    }

    /// Initialize the module
    fun init(otw: COIN_MANAGER, ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));
    }

    /// Check if a coin is registered
    public fun is_coin_registered<T>(
        admin: &AdminCap,
        symbol: String
    ): bool {
        dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol)
    }

    /// Process URL option to create a URL object
    public fun process_url_option(url_opt: Option<String>): Option<Url> {
        if (option::is_some(&url_opt)) {
            let url_str = *option::borrow(&url_opt);
            assert!(!string::is_empty(&url_str), EInvalidUrl);
            some(url::new_unsafe_from_bytes(*string::bytes(&url_str)))
        } else {
            none()
        }
    }

    /// Get coin information
    public fun get_coin_info<T>(
        admin: &AdminCap,
        symbol: String
    ): &CoinInfo<T> {
        assert!(dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol), ECoinNotRegistered);
        dynamic_field::borrow<String, CoinInfo<T>>(&admin.id, symbol)
    }

    /// Register coin metadata
    public entry fun register_coin_metadata<T>(
        admin: &mut AdminCap,
        name: String,
        symbol: String,
        description: String,
        decimals: u8,
        icon_url: Option<String>,
        telegram_social: Option<String>,
        x_social: Option<String>,
        discord_social: Option<String>,
        creator: address,
        initial_supply: u64,
        total_supply: u64,
        ctx: &mut TxContext
    ) {
        assert!(!string::is_empty(&name), EInvalidName);
        assert!(!string::is_empty(&symbol), EInvalidSymbol);
        assert!(decimals <= 18, EInvalidDecimals);
        assert!(initial_supply <= total_supply, EInvalidSupply);
        assert!(creator != @memetic, EInvalidCreator);

        assert!(!dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol), EAlreadyRegistered);

        let telegram_social_url = process_url_option(telegram_social);
        let x_social_url = process_url_option(x_social);
        let discord_social_url = process_url_option(discord_social);

        dynamic_field::add<String, CoinInfo<T>>(
            &mut admin.id,
            symbol,
            CoinInfo {
                name,
                symbol,
                description,
                decimals,
                icon_url,
                telegram_social: telegram_social_url,
                x_social: x_social_url,
                discord_social: discord_social_url,
                total_supply,
                initial_supply,
                creator,
                total_minted: 0,
                creation_time: tx_context::epoch(ctx),
                first_mint_time: 0,
                last_mint_time: 0
            }
        );

        event::emit(CoinRegistered<T> {
            name,
            symbol,
            creator,
            timestamp: tx_context::epoch(ctx)
        });
    }

    /// Update coin metadata
    public entry fun update_coin_metadata<T>(
        admin: &mut AdminCap,
        symbol: String,
        description: Option<String>,
        icon_url: Option<String>,
        telegram_social: Option<String>,
        x_social: Option<String>,
        discord_social: Option<String>,
        ctx: &mut TxContext
    ) {
        assert!(dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol), ECoinNotRegistered);

        let coin_info = dynamic_field::borrow_mut<String, CoinInfo<T>>(&mut admin.id, symbol);

        if (option::is_some(&description)) {
            coin_info.description = *option::borrow(&description);
        };

        if (option::is_some(&icon_url)) {
            coin_info.icon_url = icon_url;
        };

        if (option::is_some(&telegram_social)) {
            coin_info.telegram_social = process_url_option(telegram_social);
        };

        if (option::is_some(&x_social)) {
            coin_info.x_social = process_url_option(x_social);
        };

        if (option::is_some(&discord_social)) {
            coin_info.discord_social = process_url_option(discord_social);
        };

        event::emit(CoinMetadataUpdated<T> {
            symbol,
            updater: tx_context::sender(ctx),
            timestamp: tx_context::epoch(ctx)
        });
    }

    /// Get coin name
    public fun get_coin_name<T>(coin_info: &CoinInfo<T>): String {
        coin_info.name
    }

    /// Get coin symbol
    public fun get_coin_symbol<T>(coin_info: &CoinInfo<T>): String {
        coin_info.symbol
    }

    /// Get total supply
    public fun get_total_supply<T>(coin_info: &CoinInfo<T>): u64 {
        coin_info.total_supply
    }

    /// Get total minted
    public fun get_total_minted<T>(coin_info: &CoinInfo<T>): u64 {
        coin_info.total_minted
    }

    /// Get coin description
    public fun get_coin_description<T>(coin_info: &CoinInfo<T>): String {
        coin_info.description
    }

    /// Get coin decimals
    public fun get_coin_decimals<T>(coin_info: &CoinInfo<T>): u8 {
        coin_info.decimals
    }

    /// Get coin creator
    public fun get_coin_creator<T>(coin_info: &CoinInfo<T>): address {
        coin_info.creator
    }

    /// Get coin icon URL
    public fun get_coin_icon_url<T>(coin_info: &CoinInfo<T>): &Option<String> {
        &coin_info.icon_url
    }

    /// Get coin social media URLs
    public fun get_coin_social_urls<T>(coin_info: &CoinInfo<T>): (&Option<Url>, &Option<Url>, &Option<Url>) {
        (&coin_info.telegram_social, &coin_info.x_social, &coin_info.discord_social)
    }

    /// Get coin creation time
    public fun get_coin_creation_time<T>(coin_info: &CoinInfo<T>): u64 {
        coin_info.creation_time
    }

    /// Get coin first mint time
    public fun get_coin_first_mint_time<T>(coin_info: &CoinInfo<T>): u64 {
        coin_info.first_mint_time
    }

    /// Get coin last mint time
    public fun get_coin_last_mint_time<T>(coin_info: &CoinInfo<T>): u64 {
        coin_info.last_mint_time
    }

    /// Update minting stats (to be called by individual token contracts)
    public fun update_mint_stats<T>(
        admin: &mut AdminCap,
        symbol: String,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol), ECoinNotRegistered);

        let coin_info = dynamic_field::borrow_mut<String, CoinInfo<T>>(&mut admin.id, symbol);
        coin_info.total_minted = coin_info.total_minted + amount;

        if (coin_info.first_mint_time == 0) {
            coin_info.first_mint_time = tx_context::epoch(ctx);
        };
        coin_info.last_mint_time = tx_context::epoch(ctx);
    }

    #[test_only]
    public struct TEST_TOKEN has drop {}

    #[test_only]
    const ADMIN: address = @0xA11CE;
    #[test_only]
    const USER: address = @0xB0B;
    #[test_only]
    const CREATOR: address = @0xC8EA108;

    #[test]
    fun init_test(): sui::test_scenario::Scenario {
        let mut scenario = sui::test_scenario::begin(ADMIN);
        let ctx = sui::test_scenario::ctx(&mut scenario);

        let otw = COIN_MANAGER {};
        init(otw, ctx);

        sui::test_scenario::next_tx(&mut scenario, ADMIN);

        {
            let admin_cap = sui::test_scenario::take_from_sender<AdminCap>(&scenario);
            sui::test_scenario::return_to_sender(&scenario, admin_cap);
        };
        
        scenario
    }

    #[test]
    fun test_register_coin_metadata() {
        let mut scenario = sui::test_scenario::begin(ADMIN);

        sui::test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let ctx = sui::test_scenario::ctx(&mut scenario);
            let otw = COIN_MANAGER {};
            init(otw, ctx);
        };

        sui::test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut admin_cap = sui::test_scenario::take_from_sender<AdminCap>(&scenario);
            let ctx = sui::test_scenario::ctx(&mut scenario);

            let name = string::utf8(b"Test Token");
            let symbol = string::utf8(b"TEST");
            let description = string::utf8(b"A token for testing");
            let icon_url = none();
            let telegram = some(string::utf8(b"https://t.me/testtoken"));
            let x = some(string::utf8(b"https://x.com/testtoken"));
            let discord = some(string::utf8(b"https://discord.com/testtoken"));

            register_coin_metadata<TEST_TOKEN>(
                &mut admin_cap,
                name,
                symbol,
                description,
                9,
                icon_url,
                telegram,
                x,
                discord,
                CREATOR,
                1000000000, // initial supply
                10000000000, // total supply
                ctx
            );

            assert!(is_coin_registered<TEST_TOKEN>(&admin_cap, symbol), 0);

            let coin_info = get_coin_info<TEST_TOKEN>(&admin_cap, symbol);
            assert!(get_coin_name(coin_info) == name, 0);
            assert!(get_coin_symbol(coin_info) == symbol, 0);
            assert!(get_coin_decimals(coin_info) == 9, 0);
            assert!(option::is_some(&coin_info.telegram_social), 0);
            assert!(option::is_some(&coin_info.x_social), 0);
            assert!(option::is_some(&coin_info.discord_social), 0);
            assert!(get_total_supply(coin_info) == 10000000000, 0);
            assert!(coin_info.initial_supply == 1000000000, 0);
            assert!(get_coin_creator(coin_info) == CREATOR, 0);
            assert!(get_total_minted(coin_info) == 0, 0);

            sui::test_scenario::return_to_sender(&scenario, admin_cap);
        };

        sui::test_scenario::end(scenario);
    }

    #[test]
    fun test_update_coin_metadata() {
        let mut scenario = sui::test_scenario::begin(ADMIN);

        sui::test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let ctx = sui::test_scenario::ctx(&mut scenario);
            let otw = COIN_MANAGER {};
            init(otw, ctx);
        };

        sui::test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut admin_cap = sui::test_scenario::take_from_sender<AdminCap>(&scenario);
            let ctx = sui::test_scenario::ctx(&mut scenario);

            register_coin_metadata<TEST_TOKEN>(
                &mut admin_cap,
                string::utf8(b"Test Token"),
                string::utf8(b"TEST"),
                string::utf8(b"A token for testing"),
                9,
                none(),
                some(string::utf8(b"https://t.me/testtoken")),
                some(string::utf8(b"https://x.com/testtoken")),
                some(string::utf8(b"https://discord.com/testtoken")),
                CREATOR,
                1000000000,
                10000000000,
                ctx
            );

            update_coin_metadata<TEST_TOKEN>(
                &mut admin_cap,
                string::utf8(b"TEST"),
                some(string::utf8(b"Updated description")),
                some(string::utf8(b"https://example.com/icon.png")),
                some(string::utf8(b"https://t.me/updated")),
                some(string::utf8(b"https://x.com/updated")),
                some(string::utf8(b"https://discord.com/updated")),
                ctx
            );

            let coin_info = get_coin_info<TEST_TOKEN>(&admin_cap, string::utf8(b"TEST"));
            assert!(get_coin_description(coin_info) == string::utf8(b"Updated description"), 0);
            assert!(option::is_some(&coin_info.icon_url), 0);
            assert!(option::is_some(&coin_info.telegram_social), 0);
            assert!(option::is_some(&coin_info.x_social), 0);
            assert!(option::is_some(&coin_info.discord_social), 0);

            sui::test_scenario::return_to_sender(&scenario, admin_cap);
        };

        sui::test_scenario::end(scenario);
    }

    #[test]
    fun test_update_mint_stats() {
        let mut scenario = sui::test_scenario::begin(ADMIN);

        sui::test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let ctx = sui::test_scenario::ctx(&mut scenario);
            let otw = COIN_MANAGER {};
            init(otw, ctx);
        };

        //sui::test_scenario::next_tx(&mut scenario, ADMIN);
		sui::test_scenario::next_epoch(&mut scenario, ADMIN);
        {
            let mut admin_cap = sui::test_scenario::take_from_sender<AdminCap>(&scenario);
            let mut ctx = sui::test_scenario::ctx(&mut scenario);
			// let mut ctx = tx_context::dummy();

            register_coin_metadata<TEST_TOKEN>(
                &mut admin_cap,
                string::utf8(b"Test Token"),
                string::utf8(b"TEST"),
                string::utf8(b"A token for testing"),
                9,
                none(),
                some(string::utf8(b"https://t.me/testtoken")),
                some(string::utf8(b"https://x.com/testtoken")),
                some(string::utf8(b"https://discord.com/testtoken")),
                CREATOR,
                1000000000,
                10000000000,
                ctx
            );

		    let epoch = tx_context::epoch(ctx);
		    assert!(epoch > 0, 999); 

            update_mint_stats<TEST_TOKEN>(
			    &mut admin_cap,
			    string::utf8(b"TEST"),
			    500000,
			    ctx
			);

			{
			    let coin_info = get_coin_info<TEST_TOKEN>(&admin_cap, string::utf8(b"TEST"));
			    assert!(get_total_minted(coin_info) == 500000, 0);
			    assert!(get_coin_first_mint_time(coin_info) > 0, 0);
			    assert!(get_coin_last_mint_time(coin_info) > 0, 0);
			};

			update_mint_stats<TEST_TOKEN>(
			    &mut admin_cap,
			    string::utf8(b"TEST"),
			    300000,
			    ctx
			);

			{
			    let coin_info = get_coin_info<TEST_TOKEN>(&admin_cap, string::utf8(b"TEST"));
			    assert!(get_total_minted(coin_info) == 800000, 0);
			};

			sui::test_scenario::return_to_sender(&scenario, admin_cap);
        };

        sui::test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EAlreadyRegistered)]
    fun test_duplicate_registration() {
        let mut scenario = sui::test_scenario::begin(ADMIN);

        sui::test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let ctx = sui::test_scenario::ctx(&mut scenario);
            let otw = COIN_MANAGER {};
            init(otw, ctx);
        };

        sui::test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut admin_cap = sui::test_scenario::take_from_sender<AdminCap>(&scenario);
            let ctx = sui::test_scenario::ctx(&mut scenario);

            register_coin_metadata<TEST_TOKEN>(
                &mut admin_cap,
                string::utf8(b"Test Token"),
                string::utf8(b"TEST"),
                string::utf8(b"A token for testing"),
                9,
                none(),
                some(string::utf8(b"https://t.me/testtoken")),
                some(string::utf8(b"https://x.com/testtoken")),
                some(string::utf8(b"https://discord.com/testtoken")),
                CREATOR,
                1000000000,
                10000000000,
                ctx
            );

            // Try to register again with the same symbol - should fail
            register_coin_metadata<TEST_TOKEN>(
                &mut admin_cap,
                string::utf8(b"Test Token 2"),
                string::utf8(b"TEST"),
                string::utf8(b"Another test token"),
                9,
                none(),
                none(),
                none(),
                none(),
                CREATOR,
                1000000000,
                10000000000,
                ctx
            );

            sui::test_scenario::return_to_sender(&scenario, admin_cap);
        };

        sui::test_scenario::end(scenario);
    }
}
