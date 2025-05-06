module template::template;
use sui::coin;
use sui::url;
use memetic::coin_manager::{Self, MintCapability, process_url_option, mint, create_mint_capability, create_coin_info};

const DECIMALS: u8 = 6;
const INITIAL_SUPPLY: u64 = 1;
const TOTAL_SUPPLY: u64 = 100;

// OTW
public struct TEMPLATE has drop {}


fun init(otw: TEMPLATE, ctx: &mut TxContext) {
	let sender = ctx.sender();
    let (treasury, metadata) = coin::create_currency<TEMPLATE>(
        otw,
        DECIMALS,
        b"TEMPLATE",
        b"template",
        b"template_description",
        option::some(url::new_unsafe_from_bytes(b"template_icon_url")),
        ctx
    );

    let mut mint_cap = create_mint_capability<TEMPLATE>(ctx, treasury);

    let mut coin_info = create_coin_info<TEMPLATE>(
		std::string::utf8(b"TEMPLATE"),
	    std::string::utf8(b"TEST"),
	    std::string::utf8(b"A test coin for demonstration purposes"),
	    DECIMALS,
	    option::some(std::string::utf8(b"template_icon_url")),
	    process_url_option(option::some(std::string::utf8(b"telegram_url"))),
	    process_url_option(option::some(std::string::utf8(b"x_url"))),
	    process_url_option(option::some(std::string::utf8(b"discord_url"))),
	    TOTAL_SUPPLY,
	    INITIAL_SUPPLY,
	    ctx,
	    sender,
    );

    mint(&mut mint_cap, INITIAL_SUPPLY, ctx.sender(), &mut coin_info, ctx);

    transfer::public_freeze_object(metadata);
    transfer::public_transfer(mint_cap, ctx.sender());

    //transfer::public_transfer(metadata, ctx.sender());
}





