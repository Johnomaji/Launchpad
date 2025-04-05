module my_coin::my_coin;
use sui::coin;
use sui::url;


const DECIMALS: u8 = 6;

// OTW
public struct MY_COIN has drop {}


fun init(otw: MY_COIN, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency<MY_COIN>(
        otw,
        DECIMALS,
        b"MY_COIN",
        b"my_coin",
        b"This is my custom coin",
        option::some(url::new_unsafe_from_bytes(b"my_coin_icon_url")),
        ctx
    );
    

    transfer::public_transfer(treasury_cap, ctx.sender());
    transfer::public_transfer(metadata, ctx.sender());
}





