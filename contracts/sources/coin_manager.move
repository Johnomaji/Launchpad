module memetic::coin_manager {
    use std::option::{Self, Option, none, some};
    use std::string::{Self, String};
    use sui::balance;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::dynamic_field;
    use sui::event;
    use sui::object::{Self};
    use sui::url::{Self, Url};

    const ENotAdmin: u64 = 0;
    const ECoinNotRegistered: u64 = 1;
    const EAlreadyRegistered: u64 = 2;
    const EInsufficientTreasuryCap: u64 = 3;
    const EInvalidAmount: u64 = 4;

    public struct CoinInfo<phantom T> has store, copy {
        name: String,
        symbol: String,
        description: String,
        decimals: u8,
        telegram_social: Option<Url>,
        x_social: Option<Url>,
        discord_social: Option<Url>,
        icon_url: Option<String>,
        max_supply: Option<u64>,
        creator: address,
        total_minted: u64,
    }

    public struct AdminCap has key {
        id: UID
    }

    public struct CoinRegistered<phantom T> has copy, drop {
        package_id: address,
        module_name: String,
        struct_name: String,
        name: String,
        symbol: String
    }

    public struct CoinsMinted<phantom T> has copy, drop {
        amount: u64,
        recipient: address
    }

    public struct CoinsBurned<phantom T> has copy, drop {
        amount: u64,
        burner: address
    }

    public struct CoinTreasuryCap<phantom T> has key, store {
        id: UID,
        cap: TreasuryCap<T>
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));
    }

    public fun is_coin_registered<T>(
        admin: &AdminCap,
        symbol: String
    ): bool {
        dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol)
    }

    public fun get_coin_info<T>(
        admin: &AdminCap,
        symbol: String
    ): CoinInfo<T> {
        assert!(dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol), ECoinNotRegistered);
        *dynamic_field::borrow<String, CoinInfo<T>>(&admin.id, symbol)
    }

    public entry fun burn<T>(
        treasury_cap: &mut CoinTreasuryCap<T>,
        coins: coin::Coin<T>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&coins);
        assert!(amount > 0, EInvalidAmount);

        coin::burn(&mut treasury_cap.cap, coins);

        event::emit(CoinsBurned<T> {
            amount,
            burner: tx_context::sender(ctx)
        });
    }

    public entry fun mint<T>(
        _admin: &AdminCap,
        treasury_cap: &mut CoinTreasuryCap<T>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, EInvalidAmount);

        let coins = coin::mint(&mut treasury_cap.cap, amount, ctx);
        transfer::public_transfer(coins, recipient);

        event::emit(CoinsMinted<T> {
            amount,
            recipient
        });
    }

    public entry fun register_coin_metadata<T>(
        admin: &mut AdminCap,
        name: String,
        symbol: String,
        description: String,
        decimals: u8, 
        icon_url: Option<String>,
        telegram_social: Option<String>,
        x_social: Option<String>,
        discord_social: Option<String>,
        max_supply: Option<u64>,
        package_id: address,
        creator: address,
        ctx: &mut TxContext
    ) {
        assert!(!dynamic_field::exists_with_type<String, CoinInfo<T>>(&admin.id, symbol), EAlreadyRegistered);

        let telegram_social_url = if (option::is_some(&telegram_social)) {
	        let url_str = *option::borrow(&telegram_social);
   		    some(url::new_unsafe_from_bytes(*url_str.as_bytes()))
	    } else {
	        none()
	    };

	    let x_social_url = if (option::is_some(&x_social)) {
	        let url_str = *option::borrow(&x_social);
	        some(url::new_unsafe_from_bytes(*url_str.as_bytes()))
	    } else {
	        none()
	    };

	    let discord_social_url = if (option::is_some(&discord_social)) {
		    let url_str = *option::borrow(&discord_social);
		    some(url::new_unsafe_from_bytes(*url_str.as_bytes()))
		} else {
		    none()
		};

	    
        
        dynamic_field::add<String, CoinInfo<T>>(
            &mut admin.id,
            symbol,
            CoinInfo { 
                name, 
                symbol, 
                description, 
                decimals, 
                icon_url,
                telegram_social: telegram_social_url,
                x_social: x_social_url,
                discord_social: discord_social_url,
                max_supply,
                creator,
                total_minted: 0
            }
        );

        event::emit(CoinRegistered<T> {
            package_id: package_id,
            module_name: string::utf8(b"coin_manager"),
            struct_name: symbol,
            name,
            symbol
        });
    }
}
