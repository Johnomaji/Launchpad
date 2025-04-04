module lagos::lagos;
use sui::coin;
use sui::url;


const DECIMALS: u8 = 6;

// OTW
public struct LAGOS has drop {}


fun init(otw: LAGOS, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency<LAGOS>(
        otw,
        DECIMALS,
        b"LAGOS",
        b"lagos",
        b"A better version of Naira",
        option::some(url::new_unsafe_from_bytes(b"lagos_icon_url")),
        ctx
    );
    

    transfer::public_transfer(treasury_cap, ctx.sender());
    transfer::public_transfer(metadata, ctx.sender());
}





