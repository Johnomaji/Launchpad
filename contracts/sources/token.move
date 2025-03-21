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

    // === Errors ===
    const EInvalidTokenName: u64 = 0;
    const EInvalidTokenSymbol:u64 = 1;
    const EInvalidDecimals: u64 = 2;
    const EInvalidSupply: u64 = 3;
    const EInvalidUrl: u64 = 4;
    const EInvalidDescription: u64 = 5;

    // === Constants ===
    const MAX_SYMBOL_LENGTH: u64 = 6;
    const MIN_SYMBOL_LENGTH: u64 = 2;
    const MAX_NAME_LENGTH: u64 = 32;
    const MIN_NAME_LENGTH: u64 = 3;
    const MAX_DECIMALS: u8 = 9;

    // === Structs ===
    public struct TokenCreationFee has key {
        id: UID,
        fee: u64,
        fee_recipient: address
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

    // === Events ===
    public struct TokenCreated has copy, drop {
        creator: address,
        name: String,
        symbol: String,
        total_supply: u64,
        decimals: u8,
        token_id: address
    }

    fun init(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        let id = object::new(ctx);

        let fee_config = TokenCreationFee {
            id,
            // 0.1 SUI = 100_000_000 MIST
            fee: 100000000,
            fee_recipient: admin
        };

        transfer::share_object(fee_config);
    }

    public fun create_token(
        name: String,
        symbol: String,
        description: String,
        icon_url: String,
        mut website_url: Option<String>,
        mut twitter_url: Option<String>,
        mut telegram_url: Option<String>,
        payment: Coin<sui::sui::SUI>,
        fee_config: &TokenCreationFee,
        total_supply: u64,
        decimals: u8,
        ctx: &mut TxContext
    ): (TreasuryCap<MEMETIC>, Coin<MEMETIC>) {
        let witness = MEMETIC {};

        validate_token_parameters(name, symbol, total_supply, decimals, icon_url);

        let payment_value = coin::value(&payment);
        assert!(payment_value >= fee_config.fee, EInvalidSupply);
      
        transfer::public_transfer(payment, fee_config.fee_recipient);
        
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
            token_id: tx_context::sender(ctx)
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

    // === GETTER FUNCTIONS ===
    public fun get_token_creation_fee(fee_config: &TokenCreationFee): u64 {
        fee_config.fee
    }
        
    public fun get_fee_recipient(fee_config: &TokenCreationFee): address {
        fee_config.fee_recipient
    }
}
