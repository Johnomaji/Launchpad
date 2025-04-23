module memetic::coin_manager {
    use std::option::{Self, Option, none, some};
    use std::string::{Self, String};
    use sui::balance;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::dynamic_field;
    use sui::event;
    use sui::object::{Self};
    use sui::url::{Self, Url};

    const ENotAdmin: u64 = 0;
    const ECoinNotRegistered: u64 = 1;
    const EAlreadyRegistered: u64 = 2;
    const EInsufficientTreasuryCap: u64 = 3;
    const EInvalidAmount: u64 = 4;
    const ESupplyExceeded: u64 = 5;

	const EInvalidName: u64 = 6;
	const EInvalidSymbol: u64 = 7;
	const EInvalidDecimals: u64 = 8;
	const EInvalidSupply: u64 = 9;
	const EInvalidCreator: u64 = 10;
	const EInvalidUrl: u64 = 11;
	const EInvalidRecipient: u64 = 12;

    public struct COIN_MANAGER has drop {}

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

	public struct CoinMetadataUpdated<phantom T> has copy, drop {
	    symbol: String,
	    updater: address,
	    timestamp: u64
	}

    public struct AdminCap has key {
        id: UID
    }

    public struct MintCapability<T> has key {
	    id: UID,
	    treasury: TreasuryCap<T>,
	    total_minted: u64,
	}

    public struct CoinRegistered<phantom T> has copy, drop {
        package_id: address,
        module_name: String,
        struct_name: String,
        name: String,
        symbol: String,
        creator: address,
	    timestamp: u64
    }

    public struct CoinsMinted<phantom T> has copy, drop {
        amount: u64,
        recipient: address,
        timestamp: u64,
	    minter: address
    }

    public struct CoinsBurned<phantom T> has copy, drop {
        amount: u64,
        burner: address
    }

    public struct CoinTreasuryCap<phantom T> has key, store {
        id: UID,
        cap: TreasuryCap<T>
    }

    fun init(otw: COIN_MANAGER, ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));
    }

    public fun is_coin_registered<T>(
        admin: &AdminCap,
        symbol: String
    ): bool {
        dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol)
    }

    public fun create_mint_capability<T>(ctx: &mut TxContext, treasury: TreasuryCap<T>): MintCapability<T> {
		MintCapability {
	        id: object::new(ctx),
	        treasury,
	        total_minted: 0,
	    }
    }

    public fun create_coin_info<T>(
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
	    ctx: &mut TxContext,
	    creator: address,
	): CoinInfo<T> {
	    
	    CoinInfo<T> {
	        name,
	        symbol,
	        description,
	        decimals,
	        icon_url,
	        telegram_social,
	        x_social,
	        discord_social,
	        total_supply,
	        initial_supply,
	        creator,
	        total_minted: 0,
	        creation_time: tx_context::epoch(ctx),
	        first_mint_time: 0,
	        last_mint_time: 0 
	    }
	}

    public fun get_coin_info<T>(
        admin: &AdminCap,
        symbol: String
    ): &CoinInfo<T> {
        assert!(dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol), ECoinNotRegistered);
        dynamic_field::borrow<String, CoinInfo<T>>(&admin.id, symbol)
    }

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

	fun process_url_option(url_opt: Option<String>): Option<Url> {
	    if (option::is_some(&url_opt)) {
	        let url_str = *option::borrow(&url_opt);
	        assert!(!string::is_empty(&url_str), EInvalidUrl);
	        some(url::new_unsafe_from_bytes(*url_str.as_bytes()))
	    } else {
	        none()
	    }
	}

    public entry fun burn<T>(
        treasury_cap: &mut CoinTreasuryCap<T>,
        coins: coin::Coin<T>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&coins);
        assert!(amount > 0, EInvalidAmount);

        coin::burn(&mut treasury_cap.cap, coins);

        event::emit(CoinsBurned<T> {
            amount,
            burner: tx_context::sender(ctx)
        });
    }

	public fun mint<T>(
	    mint_cap: &mut MintCapability<T>,
	    amount: u64,
	    recipient: address,
	    coin_info: &mut CoinInfo<T>,
	    ctx: &mut TxContext
	) {
	    assert!(recipient != @0x0, EInvalidRecipient);
	    
	    let coin = mint_internal(mint_cap, amount, coin_info, ctx);
	    transfer::public_transfer(coin, recipient);

	    event::emit(CoinsMinted<T> {
	        amount,
	        recipient,
	        timestamp: tx_context::epoch(ctx),
	        minter: tx_context::sender(ctx)
	    });
	}

	fun mint_internal<T>(
	    mint_cap: &mut MintCapability<T>,
	    amount: u64,
	    coin_info: &mut CoinInfo<T>,
	    ctx: &mut TxContext
	): coin::Coin<T> {
	    assert!(amount > 0, EInvalidAmount);
	    
	    assert!(mint_cap.total_minted <= (coin_info.total_supply - amount), ESupplyExceeded);

	    let treasury = &mut mint_cap.treasury;
	    let coin = coin::mint(treasury, amount, ctx);

	    mint_cap.total_minted = mint_cap.total_minted + amount;
	    coin_info.total_minted = mint_cap.total_minted;
	    
	    if (coin_info.last_mint_time == 0) {
	        coin_info.first_mint_time = tx_context::epoch(ctx);
	    };
	    coin_info.last_mint_time = tx_context::epoch(ctx);
	    
	    coin
	}

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
	    package_id: address,
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
	        package_id,
	        module_name: string::utf8(b"coin_manager"),
	        struct_name: symbol,
	        name,
	        symbol,
	        creator,
	        timestamp: tx_context::epoch(ctx)
	    });
	}

	public fun get_coin_name<T>(coin_info: &CoinInfo<T>): string::String {
	    coin_info.name
	}

	public fun get_coin_symbol<T>(coin_info: &CoinInfo<T>): string::String {
	    coin_info.symbol
	}

	public fun get_total_supply<T>(coin_info: &CoinInfo<T>): u64 {
	    coin_info.total_supply
	}

	public fun get_total_minted<T>(coin_info: &CoinInfo<T>): u64 {
	    coin_info.total_minted
	}
    
	#[test_only]
	public struct TEST_TOKEN has drop {}

	#[test_only]
	const ADMIN: address = @0xA11CE;
	#[test_only]
	const USER: address = @0xB0B;
	#[test_only]
    const CREATOR: address = @0xC8EA108;
	#[test_only]
    const PACKAGE_ID: address = @0xFAC8ABE;
    

	#[test]
	fun init_test(): sui::test_scenario::Scenario {
		let mut scenario = sui::test_scenario::begin(ADMIN);
	    let ctx = sui::test_scenario::ctx(&mut scenario);

	    let otw = COIN_MANAGER {};
	    init(otw, ctx);
	    
	    sui::test_scenario::next_tx(&mut scenario, ADMIN);

	    {
	        let admin_cap = sui::test_scenario::take_from_sender<AdminCap>(&scenario);
	        sui::test_scenario::return_to_sender(&mut scenario, admin_cap);
	    };
//	    sui::test_scenario::end(scenario);
		scenario
	}

	#[test]
	fun register_test_coin_2(): ID {
	    let mut scenario = sui::test_scenario::begin(ADMIN);

        sui::test_scenario::next_tx(&mut scenario, ADMIN); 

        {
            let ctx = sui::test_scenario::ctx(&mut scenario);
            let otw = COIN_MANAGER {};
            init(otw, ctx);
        };
        
	    sui::test_scenario::next_tx(&mut scenario, ADMIN); 
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
            9, // decimals
            icon_url,
            telegram,
            x,
            discord,
            PACKAGE_ID,
            CREATOR,
            1000000000, // initial supply
            10000000000, // total supply
            sui::test_scenario::ctx(&mut scenario)
        );
        
        let admin_id = object::id(&admin_cap);
        sui::test_scenario::return_to_sender(&scenario, admin_cap);
        sui::test_scenario::end(scenario);
        admin_id
 
    }

	#[test]
	fun test_register_coin_metadata () {
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
	        
	        register_coin_metadata<COIN_MANAGER>(
	            &mut admin_cap,
	            b"Test Coin".to_string(),
	            b"TEST".to_string(),
	            b"A test coin".to_string(),
	            9,
	            icon_url,
                telegram,
                x,
                discord,
                PACKAGE_ID,
                CREATOR,
                1000000000, // initial supply
                10000000000, // total supply
	            ctx
	        );

	        assert!(is_coin_registered<COIN_MANAGER>(&admin_cap, string::utf8(b"TEST")), 0);

            let coin_info = get_coin_info<COIN_MANAGER>(&admin_cap, string::utf8(b"TEST"));
            assert!(coin_info.name == string::utf8(b"Test Coin"), 0);
            assert!(coin_info.symbol == string::utf8(b"TEST"), 0);
            assert!(coin_info.decimals == 9, 0);
            assert!(option::is_some(&coin_info.telegram_social), 0);
            assert!(option::is_some(&coin_info.x_social), 0);
            assert!(option::is_some(&coin_info.discord_social), 0);
            assert!(&coin_info.total_supply == 10000000000, 0);
            assert!(&coin_info.initial_supply == 1000000000, 0);
            assert!(coin_info.creator == CREATOR, 0);
            assert!(coin_info.total_minted == 0, 0);

	        sui::test_scenario::return_to_sender(&mut scenario, admin_cap);
	    };
	    
	    sui::test_scenario::end(scenario);
	}

	#[test]
    fun test_init() {
        let mut scenario = init_test();
        
        sui::test_scenario::next_tx(&mut scenario, ADMIN);
        {
            assert!(sui::test_scenario::has_most_recent_for_sender<AdminCap>(&scenario), 0);
        };
        
        sui::test_scenario::end(scenario);
    }

    #[test_only]
	public fun register_test_coin(
	    admin_cap: &mut AdminCap,
	    ctx: &mut TxContext
	) {
	    register_coin_metadata<COIN_MANAGER>(
	        admin_cap,
	        b"Test Coin".to_string(),
	        b"TEST".to_string(),
	        b"A test coin".to_string(),
	        9,
	        none(),
	        some(string::utf8(b"https://t.me/testcoin")),
	        some(string::utf8(b"https://x.com/testcoin")),
	        some(string::utf8(b"https://discord.gg/testcoin")),
	        PACKAGE_ID,
	        USER,
			1000000000, // initial supply
            10000000000, // total supply
	        ctx
	    );
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
	        
	        register_test_coin(&mut admin_cap, ctx);
	        
	        register_test_coin(&mut admin_cap, ctx);
	        
	        sui::test_scenario::return_to_sender(&mut scenario, admin_cap);
	    };

	    sui::test_scenario::end(scenario);
	}

	
    #[test]
    fun test_register_coin_metadata_2() {
        let mut scenario = init_test();
        
        let admin_id = register_test_coin_2();
        
        sui::test_scenario::next_tx(&mut scenario, ADMIN); {
            let admin_cap = sui::test_scenario::take_from_address<AdminCap>(&mut scenario, ADMIN);
            let coin_symbol = string::utf8(b"TEST");
            
            let coin_info = get_coin_info<TEST_TOKEN>(&admin_cap, coin_symbol);
            
            assert!(get_coin_name(coin_info) == string::utf8(b"Test Token"), 0);
            assert!(get_coin_symbol(coin_info) == string::utf8(b"TEST"), 0);
            assert!(get_total_supply(coin_info) == 10000000000, 0);
            assert!(get_total_minted(coin_info) == 0, 0);
            
            sui::test_scenario::return_to_address(ADMIN, admin_cap);
        };
        
        sui::test_scenario::end(scenario);
    }

/**	#[test_only]
	public fun return_mint_capability<T>(mint_cap: MintCapability<T>) {
		let treasury = mint_cap.treasury;
		sui::test_scenario::return_to_sender(treasury);
		sui::test_scenario::return_to_sender(mint_cap);
	}
*/

	#[test]
    fun test_mint_tokens() {
        let mut scenario = init_test();
        register_test_coin_2();
        
        sui::test_scenario::next_tx(&mut scenario, ADMIN);
            let mut admin_cap = sui::test_scenario::take_from_address<AdminCap>(&mut scenario, ADMIN);
            let coin_symbol = string::utf8(b"TEST");

            let treasury_cap = sui::test_scenario::take_shared<TreasuryCap<TEST_TOKEN>>(&scenario);
            let mut mint_cap = create_mint_capability<TEST_TOKEN>(&admin_cap, treasury_cap, sui::test_scenario::ctx(&mut scenario));
            
            let coin_info = borrow_mut_coin_info<TEST_TOKEN>(&mut admin_cap, coin_symbol);
            
            mint<TEST_TOKEN>(
                &mut mint_cap,
                1000000,
                USER,
                coin_info,
                sui::test_scenario::ctx(&mut scenario)
            );
            
           assert!(get_total_minted(coin_info) == 1000000, 0);
            
            sui::test_scenario::return_to_address(ADMIN, admin_cap);
        
        
        // Verify USER received the tokens
        sui::test_scenario::next_tx(&mut scenario, USER); {
            let coins = sui::test_scenario::take_from_address<coin::Coin<TEST_TOKEN>>(&mut scenario, USER);
            sui::test_utils::assert_eq(coin::value(&coins), 1000000);
            sui::test_scenario::return_to_address(USER, coins);
        };
        return_mint_capability(mint_cap);

        sui::test_scenario::end(scenario);
    }

	#[test_only]
    public fun create_mint_capability<T>(
	    _admin: &AdminCap,
	    treasury: TreasuryCap<T>,
	    ctx: &mut TxContext
	): MintCapability<T> {
	    let id = object::new(ctx);
	    MintCapability {
	        id,
	        treasury: treasury,
	        total_minted: 0
	    }
	}

	#[test_only]
	public fun borrow_mut_coin_info<T>(
	    admin: &mut AdminCap,
	    symbol: string::String
	): &mut CoinInfo<T> {
	    dynamic_field::borrow_mut<String, CoinInfo<T>>(&mut admin.id, symbol)
	}


	#[test_only]
	public fun return_mint_capability<T>(mint_cap: MintCapability<T>) {
	    let MintCapability { id, treasury, total_minted: _ } = mint_cap;
	    
	    object::delete(id);
	    
	    sui::transfer::public_share_object(treasury);
	}

}

