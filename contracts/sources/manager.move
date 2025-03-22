module memetic::manager {
    // === Imports ===
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use sui::coin::{TreasuryCap};
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use memetic::token::{Self, MEMETIC, TokenMetadata};

    // === Errors ===
    const ENotAuthorized: u64 = 0;
    const ETokenNotRegistered: u64 = 1;
    const ETokenAlreadyRegistered: u64 = 2;
    const EInvalidFee: u64 = 3;

    // === Structs ===
    public struct MemeticRegistry has key {
        id: UID,
        // Track all created tokens
        tokens: Table<address, TokenInfo>,
        // Admins who can manage the registry
        admins: VecSet<address>,
        // Creator-specific token sets
        creator_tokens: Table<address, VecSet<address>>,
        // Fee configuration for token listing and other services
        listing_fee: u64,
        fee_recipient: address,
        // Total token count
        token_count: u64,
    }

    public struct TokenInfo has store {
        metadata_id: address,
        creator: address,
        treasury_cap_id: address,
        name: String,
        symbol: String,
        created_at: u64,
        total_supply: u64,
        verified: bool
    }

    // === Events ===
    public struct TokenRegistered has copy, drop {
        token_id: address,
        metadata_id: address,
        creator: address,
        name: String,
        symbol: String
    }

    public struct TokenVerified has copy, drop {
        token_id: address,
        verified_by: address
    }

    public struct AdminAdded has copy, drop {
        admin: address
    }

    public struct AdminRemoved has copy, drop {
        admin: address
    }

    public struct FeeUpdated has copy, drop {
        old_fee: u64,
        new_fee: u64,
        updated_by: address
    }

    // === Public functions ===
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        let mut admins = vec_set::empty();
        vec_set::insert(&mut admins, sender);
        
        let registry = MemeticRegistry {
            id: object::new(ctx),
            tokens: table::new(ctx),
            admins,
            creator_tokens: table::new(ctx),
            listing_fee: 50000000, // 0.05 SUI = 50_000_000 MIST
            fee_recipient: sender,
            token_count: 0
        };
        
        transfer::share_object(registry);
    }

    // Register a token in the registry
    public fun register_token(
        registry: &mut MemeticRegistry,
        treasury_cap: &TreasuryCap<MEMETIC>,
        metadata: &TokenMetadata,
        ctx: &mut TxContext
    ) {
        let creator = token::get_creator(metadata);
        let sender = tx_context::sender(ctx);
        
        assert!(sender == creator, ENotAuthorized);
        
        let token_id = token::get_token_id(treasury_cap);
        let metadata_id = token::get_metadata_id(metadata);
        
        assert!(!table::contains(&registry.tokens, token_id), ETokenAlreadyRegistered);
        
        let token_info = TokenInfo {
            metadata_id: object::id_to_address(&metadata_id),
            creator,
            treasury_cap_id: token_id,
            name: token::get_name(metadata),
            symbol: token::get_symbol(metadata),
            created_at: token::get_created_at(metadata),
            total_supply: token::get_total_supply(metadata),
            verified: false
        };
        
        table::add(&mut registry.tokens, token_id, token_info);
        
        if (!table::contains(&registry.creator_tokens, creator)) {
            table::add(&mut registry.creator_tokens, creator, vec_set::empty());
        };
        
        let creator_set = table::borrow_mut(&mut registry.creator_tokens, creator);
        vec_set::insert(creator_set, token_id);
        
        registry.token_count = registry.token_count + 1;
        
        event::emit(TokenRegistered {
            token_id,
            metadata_id: object::id_to_address(&metadata_id),
            creator,
            name: token::get_name(metadata),
            symbol: token::get_symbol(metadata)
        });
    }

    public fun verify_token(
        registry: &mut MemeticRegistry,
        token_id: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(vec_set::contains(&registry.admins, &sender), ENotAuthorized);
        
        assert!(table::contains(&registry.tokens, token_id), ETokenNotRegistered);
        
        let token_info = table::borrow_mut(&mut registry.tokens, token_id);
        token_info.verified = true;
        
        event::emit(TokenVerified {
            token_id,
            verified_by: sender
        });
    }

    public fun add_admin(
        registry: &mut MemeticRegistry,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(vec_set::contains(&registry.admins, &sender), ENotAuthorized);
        
        if (!vec_set::contains(&registry.admins, &new_admin)) {
            vec_set::insert(&mut registry.admins, new_admin);
            
            event::emit(AdminAdded {
                admin: new_admin
            });
        }
    }

    public fun remove_admin(
        registry: &mut MemeticRegistry,
        admin: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(vec_set::contains(&registry.admins, &sender), ENotAuthorized);
        assert!(vec_set::size(&registry.admins) > 1, ENotAuthorized);
        
        if (vec_set::contains(&registry.admins, &admin)) {
            vec_set::remove(&mut registry.admins, &admin);
            
            event::emit(AdminRemoved {
                admin
            });
        }
    }

    public fun update_listing_fee(
        registry: &mut MemeticRegistry,
        new_fee: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(vec_set::contains(&registry.admins, &sender), ENotAuthorized);
        
        let old_fee = registry.listing_fee;
        
        registry.listing_fee = new_fee;
        
        event::emit(FeeUpdated {
            old_fee,
            new_fee,
            updated_by: sender
        });
    }

    // === View functions ===
    public fun is_admin(registry: &MemeticRegistry, account: address): bool {
        vec_set::contains(&registry.admins, &account)
    }

    public fun is_token_verified(registry: &MemeticRegistry, token_id: address): bool {
        if (table::contains(&registry.tokens, token_id)) {
            let token_info = table::borrow(&registry.tokens, token_id);
            token_info.verified
        } else {
            false
        }
    }

    public fun get_token_count(registry: &MemeticRegistry): u64 {
        registry.token_count
    }

    public fun get_creator_token_count(registry: &MemeticRegistry, creator: address): u64 {
        if (table::contains(&registry.creator_tokens, creator)) {
            let creator_set = table::borrow(&registry.creator_tokens, creator);
            vec_set::size(creator_set)
        } else {
            0
        }
    }

    public fun get_listing_fee(registry: &MemeticRegistry): u64 {
        registry.listing_fee
    }

    // === Test functions ===
    #[test_only]
    use sui::test_scenario::{Self as ts, Scenario};
    #[test_only]
    use sui::test_utils::assert_eq;

    #[test_only]
    const ADMIN: address = @0xA001;
    #[test_only]
    const USER1: address = @0xB001;
    #[test_only]
    const USER2: address = @0xC001;

    #[test_only]
    fun setup_manager_module(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            init(ts::ctx(scenario));
        };
    }

    // #[test]
    // fun test_module_init() {
    //     let mut scenario = ts::begin(ADMIN);
    //     setup_manager_module(&mut scenario);

    //     ts::next_tx(&mut scenario, ADMIN);
    //     {
    //         let registry = ts::take_shared<MemeticRegistry>(&scenario);
    //         assert_eq(registry.token_count, 0);
    //         assert_eq(registry.listing_fee, 50000000);
    //         assert_eq(registry.fee_recipient, ADMIN);
            
    //         assert!(vec_set::contains(&registry.admins, &ADMIN), 0);
            
    //         ts::return_shared(registry);
    //     };

    //     ts::end(scenario);
    // }

}
