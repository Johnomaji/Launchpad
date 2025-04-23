module launchpad::templates;
use sui::coin;
use sui::url;


const DECIMALS: u8 = 6;

// OTW
public struct TEMPLATE has drop {}


fun init(otw: TEMPLATE, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency<TEMPLATE>(
        otw,
        DECIMALS,
        b"TEMPLATE",
        b"template",
        b"template_description",
        option::some(url::new_unsafe_from_bytes(b"template_icon_url")),
        ctx
    );
    

    transfer::public_transfer(treasury_cap, ctx.sender());
    transfer::public_transfer(metadata, ctx.sender());
}





