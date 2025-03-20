
module memetic::token {
    // === Imports ===
    use sui::coin::{Self, Coin, TreasuryCap};
    use std::string::{Self, String};
    use sui::url::{Self, Url};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::balance::Supply;
    use sui::event;
    use std::ascii::{String as AsciiString};

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
        id: sui::object::UID,
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

    // === Events ===
    public struct TokenCreated has copy, drop {
        creator: address,
        name: String,
        symbol: String,
        total_supply: u64,
        decimals: u8,
        token_id: address
    }

    fun init (
        ctx: &mut TxContext
    ) {
        let admin = tx_context::sender(ctx);
        let id = sui::object::new(ctx);

        let fee_config = TokenCreationFee {
            id,
            // 0.1 SUI = 100_000_000 MIST
            fee: 100000000,
            fee_recipient: admin
        };

        transfer::share_object(fee_config);
    }

    public fun create_token (
        name: String,
        symbol: String,
        description: String,
        icon_url: String,
        website_url: Option<Url>,
        twitter_url: Option<Url>,
        telegram_url: Option<Url>,
        payment: Coin<sui::sui::SUI>,
        fee_config: &TokenCreationFee,
        total_supply: u64,
        decimals: u8,
        ctx: &mut TxContext
    ): TreasuryCap<TokenMetadata> {

        validate_token_parameters (name, symbol, total_supply, decimals, icon_url);

        let payment_value = coin::value(&payment);
        assert!(payment_value >= fee_config.fee, EInvalidSupply)
      
        // Send payment to fee recipient
        transfer::public_transfer(payment, fee_config.fee_recipient);
        
        let icon_url = url::new_unsafe(icon_url);
        let website_url_obj = if (option::is_some(&website_url)) {
            option::some(url::new_unsafe(option::extract(&mut website_url)))
        } else {
            option::none()
        };
        
        let twitter_url_obj = if (option::is_some(&twitter_url)) {
            option::some(url::new_unsafe(option::extract(&mut twitter_url)))
        } else {
            option::none()
        };
        
        let telegram_url_obj = if (option::is_some(&telegram_url)) {
            option::some(url::new_unsafe(option::extract(&mut telegram_url)))
        } else {
            option::none()
        };
        
        let metadata = TokenMetadata {
            id: sui::object::new(ctx),
            name,
            symbol,
            description,
            icon_url,
            website_url: website_url_obj,
            twitter_url: twitter_url_obj,
            telegram_url: telegram_url_obj,
            creator: tx_context::sender(ctx),
            creation_time: tx_context::epoch(ctx),
            total_supply,
            decimals
        };
        
        let (treasury_cap, coin_metadata) = coin::create_currency(
            metadata,
            decimals,
            name,
            symbol,
            description,
            option::some(icon_url),
            ctx
        );
        
        // Mint the initial supply
        if (total_supply > 0) {
            let minted_coins = coin::mint(&mut treasury_cap, total_supply, ctx);
            transfer::public_transfer(minted_coins, tx_context::sender(ctx));
        };
        
        transfer::public_share_object(coin_metadata);
        
        event::emit(TokenCreated {
            creator: tx_context::sender(ctx),
            name,
            symbol,
            total_supply,
            decimals,
            token_id: sui::object::uid_to_address(&coin_metadata.id)
        });
        
        treasury_cap
    }

    fun validate_token_parameters (
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
    public fun get_token_metadata (treasury_cap: TreasuryCap<TokenMetadata>): Supply<TokenMetadata> {
        coin::treasury_into_supply(treasury_cap)
    }

    public fun get_token_creation_fee(fee_config: &TokenCreationFee): u64 {
        fee_config.fee
    }
        
    public fun get_fee_recipient(fee_config: &TokenCreationFee): address {
        fee_config.fee_recipient
    }
}


