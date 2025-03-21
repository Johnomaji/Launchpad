module abuja::abuja;
use sui::coin;
use sui::url;


const DECIMALS: u8 = 6;

// OTW
public struct ABUJA has drop {}


fun init(otw: ABUJA, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency<ABUJA>(
        otw,
        DECIMALS,
        b"ABJA",
        b"abuja",
        b"A better version of Naira",
        option::some(url::new_unsafe_from_bytes(b"abuja_icon_url")),
        ctx
    );
    

    transfer::public_transfer(treasury_cap, ctx.sender());
    transfer::public_transfer(metadata, ctx.sender());
}