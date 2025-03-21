#[test_only]
module memetic::token_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::test_utils::{assert_eq};
    use sui::object::{Self, ID};
    use sui::transfer;
    use sui::tx_context;
    use sui::url::{Self, Url};
    use sui::balance::{Self, Supply};
    use std::ascii;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use std::vector;
    use sui::sui::SUI;
    
    use memetic::token::{Self, MEMETIC, TokenCreationFee, TokenMetadata, TokenCreated};
    
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;
    
    const TOKEN_NAME: vector<u8> = b"Test Token";
    const TOKEN_SYMBOL: vector<u8> = b"TEST";
    const TOKEN_DESCRIPTION: vector<u8> = b"A token for testing purposes";
    const TOKEN_ICON_URL: vector<u8> = b"https://example.com/icon.png";
    const TOKEN_WEBSITE_URL: vector<u8> = b"https://example.com";
    const TOKEN_TWITTER_URL: vector<u8> = b"https://twitter.com/test";
    const TOKEN_TELEGRAM_URL: vector<u8> = b"https://t.me/test";
    const TOKEN_SUPPLY: u64 = 1000000000;
    const TOKEN_DECIMALS: u8 = 9;
    
    const TEST_FEE: u64 = 100000000;
    
    fun setup(): Scenario {
        let scenario = ts::begin(ADMIN);
        scenario
    }
    
    fun string_from_bytes(bytes: vector<u8>): String {
        string::utf8(bytes)
    }
    
    fun create_url_option(bytes: vector<u8>): Option<String> {
        if (vector::length(&bytes) == 0) {
            option::none()
        } else {
            option::some(string_from_bytes(bytes))
        }
    }
    
    fun create_sui_payment(scenario: &mut Scenario, amount: u64): Coin<SUI> {
        ts::next_tx(scenario, ADMIN);
        {
            let ctx = ts::ctx(scenario);
            sui::test_utils::create_sui_for_testing(amount, ctx)
        }
    }
    
    fun create_standard_token(scenario: &mut Scenario): (TreasuryCap<MEMETIC>, Coin<MEMETIC>) {
        ts::next_tx(scenario, USER1);
        {
            let fee_config = ts::take_shared<TokenCreationFee>(scenario);
            let payment = create_sui_payment(scenario, TEST_FEE);
            
            let name = string_from_bytes(TOKEN_NAME);
            let symbol = string_from_bytes(TOKEN_SYMBOL);
            let description = string_from_bytes(TOKEN_DESCRIPTION);
            let icon_url = string_from_bytes(TOKEN_ICON_URL);
            let website_url = create_url_option(TOKEN_WEBSITE_URL);
            let twitter_url = create_url_option(TOKEN_TWITTER_URL);
            let telegram_url = create_url_option(TOKEN_TELEGRAM_URL);
            
            let ctx = ts::ctx(scenario);
            
            let result = token::create_token(
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
                ctx
            );
            
            ts::return_shared(fee_config);
            result
        }
    }
    
    fun verify_token_metadata(scenario: &mut Scenario, expected_creator: address, expected_supply: u64) {
        ts::next_tx(scenario, USER1);
        {
            let metadata = ts::take_shared<TokenMetadata>(scenario);
            
            assert_eq(string::bytes(&metadata.name), TOKEN_NAME);
            assert_eq(string::bytes(&metadata.symbol), TOKEN_SYMBOL);
            assert_eq(string::bytes(&metadata.description), TOKEN_DESCRIPTION);
            assert_eq(metadata.creator, expected_creator);
            assert_eq(metadata.total_supply, expected_supply);
            assert_eq(metadata.decimals, TOKEN_DECIMALS);
            
            ts::return_shared(metadata);
        }
    }
    
    fun assert_token_created_event(scenario: &Scenario, creator: address) {
        let events = ts::events(scenario);
        
        let i = 0;
        let found = false;
        while (i < vector::length(&events)) {
            let event = vector::borrow(&events, i);
            if (ts::event_type(event) == TokenCreated) {
                let created_event = ts::event_data<TokenCreated>(event);
                assert_eq(created_event.creator, creator);
                assert_eq(string::bytes(&created_event.name), TOKEN_NAME);
                assert_eq(string::bytes(&created_event.symbol), TOKEN_SYMBOL);
                assert_eq(created_event.total_supply, TOKEN_SUPPLY);
                assert_eq(created_event.decimals, TOKEN_DECIMALS);
                found = true;
                break;
            };
            i = i + 1;
        };
        
        assert!(found, 1);
    }
    
    fun clean_up(scenario: Scenario) {
        ts::end(scenario);
    }
}
