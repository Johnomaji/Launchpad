// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module examples::simple_token {
    use examples::denylist_rule::Denylist;
    use sui::coin::{Self, TreasuryCap};
    use sui::token::{Self, TokenPolicy, TokenPolicyCap};
    use sui::tx_context::sender;

    public struct SIMPLE_TOKEN has drop {}

    fun init(otw: SIMPLE_TOKEN, ctx: &mut TxContext) {
        let treasury_cap = create_currency(otw, ctx);
        let (mut policy, cap) = token::new_policy(&treasury_cap, ctx);

        set_rules(&mut policy, &cap, ctx);

        transfer::public_transfer(treasury_cap, sender(ctx));
        transfer::public_transfer(cap, sender(ctx));
        token::share_policy(policy);
    }

    public(package) fun set_rules<T>(
        policy: &mut TokenPolicy<T>,
        cap: &TokenPolicyCap<T>,
        ctx: &mut TxContext,
    ) {
        token::add_rule_for_action<T, Denylist>(policy, cap, token::spend_action(), ctx);
        token::add_rule_for_action<T, Denylist>(policy, cap, token::to_coin_action(), ctx);
        token::add_rule_for_action<T, Denylist>(policy, cap, token::transfer_action(), ctx);
        token::add_rule_for_action<T, Denylist>(policy, cap, token::from_coin_action(), ctx);
    }

    fun create_currency<T: drop>(otw: T, ctx: &mut TxContext): TreasuryCap<T> {
        let (treasury_cap, metadata) = coin::create_currency(
            otw,
            6,
            b"SMPL",
            b"Simple Token",
            b"Token that showcases denylist",
            option::none(),
            ctx,
        );
        transfer::public_freeze_object(metadata);
        treasury_cap
    }
}

#[test_only]
module examples::simple_token_tests {
    use examples::denylist_rule;
    use examples::simple_token::set_rules;
    use sui::token_test_utils::{Self as test, TEST};
    use sui::tx_context;

    #[test, expected_failure(abort_code = denylist_rule::EUserBlocked)]
    fun test_denylist_transfer_fail() {
        let ctx = &mut tx_context::dummy();
        let (policy, _cap) = test::get_policy(ctx);
        set_rules(&mut policy, &cap, ctx);
        
        let token = test::mint(1000, ctx);
        let mut request = token::transfer(token, @0x1, ctx);
        denylist_rule::verify(&policy, &mut request, ctx);
    }
}