module memetic::token {
    // === Imports ===
    use sui::coin::{Self, Coin, TreasuryCap};
    use std::string::{Self, String};
    use sui::url::{Self, Url};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Supply};
    use sui::event;
    use std::ascii::{Self, String as AsciiString};
    use std::option::{Self, Option};
    use sui::object::{Self, UID};
    use sui::object_bag::{Self as obag, ObjectBag};

    // === Errors ===
    const EInvalidTokenName: u64 = 0;
    const EInvalidTokenSymbol:u64 = 1;
    const EInvalidDecimals: u64 = 2;
    const EInvalidSupply: u64 = 3;
    const EInvalidUrl: u64 = 4;
    const EInvalidDescription: u64 = 5;
    const ESupplyExceeded: u64 = 6;
    const ETokenLocked: u64 = 7;
    const EUnauthorized: u64 = 8;

    // === Constants ===
    const MAX_SYMBOL_LENGTH: u64 = 6;
    const MIN_SYMBOL_LENGTH: u64 = 2;
    const MAX_NAME_LENGTH: u64 = 32;
    const MIN_NAME_LENGTH: u64 = 3;
    const MAX_DECIMALS: u8 = 9;

    // === Structs ===
    public struct TokenCreationFee has key, store {
        id: UID,
        fee: u64,
        fee_recipient: address
    }

    public struct FeeConfigHolder has key {
        id: UID,
        configs: ObjectBag,
    }

    public struct TokenMetadata has key, store {
        id: UID,
        name: String,
        symbol: String,
        description: String,
        icon_url: Url,
        website_url: Option<Url>,
        twitter_url: Option<Url>,
        telegram_url: Option<Url>,
        creator: address,
        created_at: u64,
        total_supply: u64,
        decimals: u8
    }

    public struct MEMETIC has drop {}

    public struct TokensTransferred has copy, drop {
        amount: u64,
        from: address,
        to: address
    }

    public struct TokenLocked has copy, drop {
        locked: bool,
        by: address
    }

    // === Events ===
    public struct TokenCreated has copy, drop {
        creator: address,
        name: String,
        symbol: String,
        total_supply: u64,
        decimals: u8,
        token_id: address,
	metadata_id: address
    }

    fun init(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        let fee_id = object::new(ctx);
	let holder_id = object::new(ctx);

	let mut holder = FeeConfigHolder {
            id: holder_id,
            configs: obag::new(ctx),
        };

        let fee_config = TokenCreationFee {
            id: fee_id,
            // 0.1 SUI = 100_000_000 MIST
            fee: 100000000,
            fee_recipient: admin
        };

	obag::add<ID, TokenCreationFee>(&mut holder.configs, object::id(&fee_config), fee_config);

        transfer::transfer(holder, admin);
    }

    public entry fun add_fee_config(holder: &mut FeeConfigHolder, fee_config: TokenCreationFee) {
        obag::add<ID, TokenCreationFee>(&mut holder.configs, object::id(&fee_config), fee_config);
    }

    public fun create_token(
        name: String,
        symbol: String,
        description: String,
        icon_url: String,
        mut website_url: Option<String>,
        mut twitter_url: Option<String>,
        mut telegram_url: Option<String>,
        total_supply: u64,
	mut payment: Coin<sui::sui::SUI>,
        decimals: u8,
        ctx: &mut TxContext
    ): (TreasuryCap<MEMETIC>, Coin<MEMETIC>) {
        let witness = MEMETIC {};

        validate_token_parameters(name, symbol, total_supply, decimals, icon_url);

	let fee = 400_000_000;
	let sender = tx_context::sender(ctx);

        let payment_value = coin::value(&payment);
        assert!(payment_value >= fee, EInvalidSupply);

	let fee_coin = payment.split(fee, ctx);

        transfer::public_transfer(fee_coin, @admin);
        
        let icon_url_bytes = *string::as_bytes(&icon_url);
        let icon_url_ascii = ascii::string(icon_url_bytes);
        let icon_url_obj = url::new_unsafe(icon_url_ascii);
        
        let website_url_obj = if (option::is_some(&website_url)) {
            let website_str = option::extract(&mut website_url);
            let website_bytes = *string::as_bytes(&website_str);
            let website_ascii = ascii::string(website_bytes);
            option::some(url::new_unsafe(website_ascii))
        } else {
            option::none()
        };
        
        let twitter_url_obj = if (option::is_some(&twitter_url)) {
            let twitter_str = option::extract(&mut twitter_url);
            let twitter_bytes = *string::as_bytes(&twitter_str);
            let twitter_ascii = ascii::string(twitter_bytes);
            option::some(url::new_unsafe(twitter_ascii))
        } else {
            option::none()
        };
        
        let telegram_url_obj = if (option::is_some(&telegram_url)) {
            let telegram_str = option::extract(&mut telegram_url);
            let telegram_bytes = *string::as_bytes(&telegram_str);
            let telegram_ascii = ascii::string(telegram_bytes);
            option::some(url::new_unsafe(telegram_ascii))
        } else {
            option::none()
        };
        
        let metadata = TokenMetadata {
            id: object::new(ctx),
            name,
            symbol,
            description,
            icon_url: icon_url_obj,
            website_url: website_url_obj,
            twitter_url: twitter_url_obj,
            telegram_url: telegram_url_obj,
            creator: tx_context::sender(ctx),
            created_at: tx_context::epoch(ctx),
            total_supply,
            decimals
        };
        
	let metadata_id = metadata.get_metadata_id();

        transfer::share_object(metadata);
        
        let name_bytes = *string::as_bytes(&name);
        let symbol_bytes = *string::as_bytes(&symbol);
        let description_bytes = *string::as_bytes(&description);
        
        let (mut treasury_cap, coin_metadata) = coin::create_currency(
            witness,
            decimals,
            symbol_bytes,
            name_bytes,
            description_bytes,
            option::some(icon_url_obj),
            ctx
        );
        
        transfer::public_share_object(coin_metadata);
        
        let minted_coins = if (total_supply > 0) {
            coin::mint(&mut treasury_cap, total_supply, ctx)
        } else {
            coin::zero<MEMETIC>(ctx)
        };
        
        event::emit(TokenCreated {
            creator: tx_context::sender(ctx),
            name,
            symbol,
            total_supply,
            decimals,
            token_id: tx_context::sender(ctx),
	    metadata_id: sui::object::id_to_address(&metadata_id)
        });
        
        (treasury_cap, minted_coins)
    }

    fun validate_token_parameters(
        name: String,
        symbol: String,
        total_supply: u64,
        decimals: u8,
        icon_url: String
    ) {
        let name_len = string::length(&name);
        assert!(name_len >= MIN_NAME_LENGTH && name_len <= MAX_NAME_LENGTH, EInvalidTokenName);

        let symbol_len = string::length(&symbol);
        assert!(symbol_len >= MIN_SYMBOL_LENGTH && symbol_len <= MAX_SYMBOL_LENGTH, EInvalidTokenSymbol);

        assert!(decimals <= MAX_DECIMALS, EInvalidDecimals);

        assert!(string::length(&icon_url) > 0, EInvalidUrl);
    }

    // ==== View functions ====
    public fun get_metadata_id (self: &TokenMetadata): ID {
	*self.id.uid_as_inner()
    }

    public fun get_creator(metadata: &TokenMetadata): address {
        metadata.creator
    }

    public fun get_token_id(treasury_cap: &TreasuryCap<MEMETIC>): address {
        sui::object::id_to_address(&sui::object::id(treasury_cap))
    }

    public fun get_name(metadata: &TokenMetadata): String {
        metadata.name
    }

    public fun get_symbol(metadata: &TokenMetadata): String {
        metadata.symbol
    }

    public fun get_description(metadata: &TokenMetadata): String {
        metadata.description
    }

    public fun get_created_at(metadata: &TokenMetadata): u64 {
        metadata.created_at
    }

    public fun get_total_supply(metadata: &TokenMetadata): u64 {
        metadata.total_supply
    }

    public fun get_decimals(metadata: &TokenMetadata): u8 {
        metadata.decimals
    }

    public fun get_icon_url(metadata: &TokenMetadata): Url {
        metadata.icon_url
    }

    public fun get_website_url(metadata: &TokenMetadata): Option<Url> {
        metadata.website_url
    }

    public fun get_twitter_url(metadata: &TokenMetadata): Option<Url> {
        metadata.twitter_url
    }
 
    public fun get_telegram_url(metadata: &TokenMetadata): Option<Url> {
        metadata.telegram_url
    }

    public fun get_fee_config(holder: &FeeConfigHolder, fee_id: ID): &TokenCreationFee {
        obag::borrow<ID, TokenCreationFee>(&holder.configs, fee_id)
    }


/**
    public fun is_locked(metadata: &TokenMetadata): bool {
        if (option::is_some(&metadata.locked)) {
            option::borrow(&metadata.locked)
        } else {
            false
        } 
    }


    public fun get_token_metadata(metadata_id: ID): &TokenMetadata {
    	let obag = ObjectBag {
	    id: metadata_id,
	    size: 1
	}
    	sui::object_bag::borrow_mut<ID, TokenMetadata>(&obag, metadata_id)
    }
*/

/* public struct TokensMinted has copy, drop {
        amount: u64,
        by: address
    }

    public struct TokensBurned has copy, drop {
        amount: u64,
        by: address
    }

    public fun burn_tokens(
        coins: Coin<MEMETIC>,
        treasury_cap: &mut TreasuryCap<MEMETIC>,
    ) {
        let metadata = get_token_metadata();
        assert!(!metadata.locked, ETokenLocked);

        let amount = coin::value(&coins);
        coin::burn(treasury_cap, coins);

        event::emit(TokensBurned {
            amount,
            by: tx_context::sender(ctx)
        });
    }

*/

#[test_only]
fun string_from_bytes(bytes: vector<u8>): String {
    string::utf8(bytes)
}

#[test_only]
fun optional_url_from_bytes(bytes: vector<u8>): Option<Url> {
    let str = string_from_bytes(bytes);
    let ascii_str = ascii::string(*string::as_bytes(&str));
    option::some(url::new_unsafe(ascii_str))
}

#[test_only]
const ADMIN: address = @0xA001;
const USER1: address = @0xB001;
const USER2: address = @0xC001;

const TOKEN_NAME: vector<u8> = b"Test Memetic Token";
const TOKEN_SYMBOL: vector<u8> = b"TMT";
const TOKEN_DESCRIPTION: vector<u8> = b"A test token for the Memetic platform";
const TOKEN_ICON_URL: vector<u8> = b"https://example.com/icon.png";
const TOKEN_WEBSITE_URL: vector<u8> = b"https://example.com";
const TOKEN_TWITTER_URL: vector<u8> = b"https://twitter.com/testmemetic";
const TOKEN_TELEGRAM_URL: vector<u8> = b"https://t.me/testmemetic";
const TOKEN_SUPPLY: u64 = 1000000000000;
const TOKEN_DECIMALS: u8 = 3;

const EXPECTED_FEE: u64 = 100000000;

#[test_only]
use sui::test_scenario::{Self as ts, Scenario};
#[test_only]
use sui::test_utils::assert_eq;
#[test_only]
use sui::test_utils;

#[test_only]
fun setup_token_module(scenario: &mut Scenario) {
    ts::next_tx(scenario, ADMIN);
    {
        init(ts::ctx(scenario));
    };
}

#[test_only]
fun get_fee_config(scenario: &mut Scenario): TokenCreationFee {
    ts::next_tx(scenario, ADMIN);
    ts::take_shared<TokenCreationFee>(scenario)
}

#[test_only]
fun create_test_payment(ctx: &mut TxContext): Coin<sui::sui::SUI> {
        let (treasury_cap, coin_metadata) = coin::create_currency(
            sui::sui::SUI {},
            TEST_DECIMALS,
            b"SUI",
            b"Sui",
            b"Test SUI Coin",
            option::none(),
            ctx
        );

        let test_coins = coin::mint(&mut treasury_cap, TEST_TOTAL_SUPPLY, ctx);

        transfer::public_share_object(coin_metadata);

        test_coins
}

#[test_only]
fun create_test_token(
    scenario: &mut Scenario, 
    creator: address,
    amount: u64
): (TreasuryCap<MEMETIC>, Coin<MEMETIC>) {
    ts::next_tx(scenario, creator);
    {
        let fee_config = ts::take_shared<TokenCreationFee>(scenario);
        let payment = create_test_payment(scenario);
        
        let name = string_from_bytes(TOKEN_NAME);
        let symbol = string_from_bytes(TOKEN_SYMBOL);
        let description = string_from_bytes(TOKEN_DESCRIPTION);
        let icon_url = string_from_bytes(TOKEN_ICON_URL);
        let website_url = option::some(string_from_bytes(TOKEN_WEBSITE_URL));
        let twitter_url = option::some(string_from_bytes(TOKEN_TWITTER_URL));
        let telegram_url = option::some(string_from_bytes(TOKEN_TELEGRAM_URL));
        
        let (treasury_cap, coin) = create_token(
            name,
            symbol,
            description,
            icon_url,
            website_url,
            twitter_url,
            telegram_url,
            payment,
            &fee_config,
            TOKEN_SUPPLY,
            TOKEN_DECIMALS,
            ts::ctx(scenario)
        );
        
        ts::return_shared(fee_config);
        (treasury_cap, coin)
    }
}

#[test_only]
fun verify_token_metadata(metadata: &TokenMetadata) {
    let name = string_from_bytes(TOKEN_NAME);
    let symbol = string_from_bytes(TOKEN_SYMBOL);
    let description = string_from_bytes(TOKEN_DESCRIPTION);
    
    assert_eq(metadata.name, name);
    assert_eq(metadata.symbol, symbol);
    assert_eq(metadata.description, description);
    assert_eq(metadata.decimals, TOKEN_DECIMALS);
    assert_eq(metadata.total_supply, TOKEN_SUPPLY);
}

#[test]
fun test_module_init() {
    let scenario = ts::begin(ADMIN);
    setup_token_module(&mut scenario);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let fee_config = ts::take_shared<TokenCreationFee>(&scenario);
        assert_eq(fee_config.fee, EXPECTED_FEE);
        assert_eq(fee_config.fee_recipient, ADMIN);
        ts::return_shared(fee_config);
    };
    
    ts::end(scenario);
}


// #[test]
// fun test_token_creation() {
// }

// #[test]
// fun test_invalid_token_parameters() {
// }

// #[test]
// fun test_insufficient_payment() {
// }

// #[test]
// fun test_token_metadata_correctness() {
// }

// #[test]
// fun test_token_transfer() {
// }

}
