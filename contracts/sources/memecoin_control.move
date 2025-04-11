    #[allow(unused_use, unused_variable)]
module launchpad::memecoin_control;

use std::type_name::{Self, TypeName};

use sui::balance::{Self, Balance};
use sui::coin::{Coin, TreasuryCap, CoinMetadata};
use sui::dynamic_field as df;
use sui::dynamic_object_field as dof;
// use sui::sui::SUI;
use sui::table::{Self, Table};

const MAX_SUPPLY: u64 = 30_000_000_000;

public struct State has key, store {
    id: UID,
    creators: Table<address, TypeName>,
    protocol_fee: u64,
    creator_share: u64,
}

// public struct Pool<T, SUI> has key, store {
//     id: UID,
//     balanceT: Balance<T>,
//     balanceSui: Balance<SUI>,

// }

fun init(ctx: &mut TxContext){
    let state = State {
        id: object::new(ctx),
        creators: table::new<address, TypeName>(ctx),
        protocol_fee: 1000,
        creator_share: 4000
    };

    transfer::public_share_object(state);
}

public fun edit_metadata<T>(metadata: &mut CoinMetadata<T>){}

public fun init_new_coin<T>(
    state: &mut State,
    treasury_cap: TreasuryCap<T>,
    metadata: CoinMetadata<T>,
    ctx: &TxContext
) {
    let name = type_name::get<T>();
    dof::add<TypeName, TreasuryCap<T>>(&mut state.id, name, treasury_cap);
    df::add<TypeName, Balance<T>>(&mut state.id, name, balance::zero<T>());
    state.creators.add<address, TypeName>(ctx.sender(), name);
    // table::add(&mut state.creators, ctx.sender(), name);
    transfer::public_freeze_object(metadata);
}

public fun initial_mint<T>(
    state: &mut State,
    ctx: &mut TxContext
): (Coin<T>, Coin<T>) {
    let name = type_name::get<T>();
    let tp_cap = dof::borrow_mut<TypeName, TreasuryCap<T>>(&mut state.id, name);
    let mut big_coin = tp_cap.mint(MAX_SUPPLY, ctx);
    let protocol_fee_value = MAX_SUPPLY * state.protocol_fee / 100;
    let creator_share_value = MAX_SUPPLY * state.creator_share / 100;
    let protocol_fee = big_coin.split(protocol_fee_value, ctx);
    let protocol_balance = df::borrow_mut<TypeName, Balance<T>>(&mut state.id, name);
    protocol_balance.join(protocol_fee.into_balance());
    let creator_share = big_coin.split(creator_share_value, ctx);
    
    (creator_share, big_coin)
}

// Price per Token = Market Cap / Total Supply = 1,000,000 / 1,000,000,000,000 = 0.000001 per token

// public fun create_pool_and_add_initial_liquidity<T>(
//     state: &mut State,
//     coin: Coin<T>,
//     ctx: &mut TxContext
// ) {

// }

public fun burn_coins<T>(
    state: &mut State,
    coin: Coin<T>
) {
    let name = type_name::get<T>();
    let tp_cap = dof::borrow_mut<TypeName, TreasuryCap<T>>(&mut state.id, name);
    tp_cap.burn(coin);
}