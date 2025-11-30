#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Events}, token, Address, Env, String};
     use crate::TicketMarketplaceClient;
     use crate::TicketMarketplace;

    // Helper function to setup the test environment
    fn setup_test<'a>(
        env: &Env,
    ) -> (TicketMarketplaceClient<'a>, token::Client<'a>, token::StellarAssetClient<'a>, Address, Address, Address, Address) {
        env.mock_all_auths();

        // 1. Register the Marketplace Contract
        let contract_id = env.register_contract(None, TicketMarketplace);
        let client = TicketMarketplaceClient::new(env, &contract_id);

        // 2. Register a Mock Payment Token (like USDC or XLM)
        let token_admin = Address::generate(env);
        let token_id = env.register_stellar_asset_contract(token_admin.clone());
        let token = token::Client::new(env, &token_id);
        let token_admin_client = token::StellarAssetClient::new(env, &token_id);

        // 3. Generate Users
        let creator = Address::generate(env);
        let seller = Address::generate(env);
        let buyer = Address::generate(env);

        (client, token, token_admin_client, token_admin, creator, seller, buyer)
    }

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let (client, _, _, _, creator, _, _) = setup_test(&env);
        
        // We need a dummy token address for initialization
        let token_id = env.register_stellar_asset_contract(Address::generate(&env));

        client.initialize(
            &creator,
            &100,
            &10_000_000, // 1 Unit
            &250,
            &String::from_str(&env, "Test Event Metadata"),
            &token_id,   // <--- Added Payment Token Address
            &String::from_str(&env, "Concert Tickets"),
            &String::from_str(&env, "CNCT"),
        );

        let event_info = client.get_event_info();
        assert_eq!(event_info.total_supply, 100);
        assert_eq!(event_info.primary_price, 10_000_000);
        assert_eq!(event_info.creator_fee_bps, 250);
        assert_eq!(client.name(), String::from_str(&env, "Concert Tickets"));
        assert_eq!(client.symbol(), String::from_str(&env, "CNCT"));
    }

    #[test]
    fn test_mint_ticket() {
        let env = Env::default();
        let (client, token, token_admin, token_admin_addr, creator, _, buyer) = setup_test(&env);

        // Mint tokens to buyer so they can pay
        token_admin.mint(&buyer, &100_000_000);

        client.initialize(
            &creator,
            &100,
            &10_000_000,
            &250,
            &String::from_str(&env, "Test Event"),
            &token.address, // Pass the token address
            &String::from_str(&env, "Event Tickets"),
            &String::from_str(&env, "EVNT"),
        );

        let ticket_id = client.mint_ticket(&buyer);
        assert_eq!(ticket_id, 1);

        let ticket = client.get_ticket(&ticket_id);
        assert_eq!(ticket.owner, buyer);
        assert_eq!(ticket.is_used, false);

        assert_eq!(client.get_tickets_minted(), 1);
        assert_eq!(client.get_tickets_available(), 99);
        
        // Verify payment was transferred
        assert_eq!(token.balance(&creator), 10_000_000);
    }

    #[test]
    fn test_secondary_listing() {
        let env = Env::default();
        let (client, token, token_admin, token_admin_addr, creator, seller, buyer) = setup_test(&env);

        // Fund seller (to mint) and buyer (to buy secondary)
        token_admin.mint( &seller, &100_000_000);
        token_admin.mint( &buyer, &100_000_000);

        client.initialize(
            &creator,
            &100,
            &10_000_000,
            &250,
            &String::from_str(&env, "Test Event"),
            &token.address,
            &String::from_str(&env, "Festival Pass"),
            &String::from_str(&env, "FEST"),
        );

        // Seller mints ticket
        let ticket_id = client.mint_ticket(&seller);

        // List on secondary market for 15.0 units
        client.list_ticket(&seller, &ticket_id, &15_000_000);

        let listing = client.get_secondary_listing(&ticket_id);
        assert!(listing.is_some());
        assert_eq!(listing.unwrap().price, 15_000_000);

        // Buyer purchases from secondary
        client.buy_secondary_ticket(&buyer, &ticket_id);

        let ticket = client.get_ticket(&ticket_id);
        assert_eq!(ticket.owner, buyer);

        // Listing should be removed
        let listing_after = client.get_secondary_listing(&ticket_id);
        assert!(listing_after.is_none());
    }

    #[test]
    fn test_delist_ticket() {
        let env = Env::default();
        let (client, token, token_admin, token_admin_addr, creator, seller, _) = setup_test(&env);

        token_admin.mint( &seller, &100_000_000);

        client.initialize(
            &creator,
            &100,
            &10_000_000,
            &250,
            &String::from_str(&env, "Test Event"),
            &token.address,
            &String::from_str(&env, "Sports Event"),
            &String::from_str(&env, "SPRT"),
        );

        let ticket_id = client.mint_ticket(&seller);
        client.list_ticket(&seller, &ticket_id, &15_000_000);

        // Delist
        client.delist_ticket(&seller, &ticket_id);

        let listing = client.get_secondary_listing(&ticket_id);
        assert!(listing.is_none());
    }

    #[test]
    fn test_mark_ticket_used() {
        let env = Env::default();
        let (client, token, token_admin, token_admin_addr, creator, _, buyer) = setup_test(&env);

        token_admin.mint( &buyer, &100_000_000);

        client.initialize(
            &creator,
            &100,
            &10_000_000,
            &250,
            &String::from_str(&env, "Test Event"),
            &token.address,
            &String::from_str(&env, "Theater Show"),
            &String::from_str(&env, "SHOW"),
        );

        let ticket_id = client.mint_ticket(&buyer);

        // Mark as used
        client.mark_ticket_used(&creator, &ticket_id);

        let ticket = client.get_ticket(&ticket_id);
        assert_eq!(ticket.is_used, true);
    }

    #[test]
    fn test_transfer_ticket() {
        let env = Env::default();
        let (client, token, token_admin, token_admin_addr, creator, from, to) = setup_test(&env);

        token_admin.mint( &from, &100_000_000);

        client.initialize(
            &creator,
            &100,
            &10_000_000,
            &250,
            &String::from_str(&env, "Test Event"),
            &token.address,
            &String::from_str(&env, "VIP Pass"),
            &String::from_str(&env, "VIP"),
        );

        let ticket_id = client.mint_ticket(&from);

        // Transfer ticket
        client.transfer_ticket(&from, &to, &ticket_id);

        let ticket = client.get_ticket(&ticket_id);
        assert_eq!(ticket.owner, to);

        let to_tickets = client.get_user_tickets(&to);
        assert_eq!(to_tickets.len(), 1);
    }

    #[test]
    fn test_update_listing_price() {
        let env = Env::default();
        let (client, token, token_admin, token_admin_addr, creator, seller, _) = setup_test(&env);

        token_admin.mint( &seller, &100_000_000);

        client.initialize(
            &creator,
            &100,
            &10_000_000,
            &250,
            &String::from_str(&env, "Test Event"),
            &token.address,
            &String::from_str(&env, "Conference Pass"),
            &String::from_str(&env, "CONF"),
        );

        let ticket_id = client.mint_ticket(&seller);
        client.list_ticket(&seller, &ticket_id, &15_000_000);

        // Update price to 20.0
        client.update_listing_price(&seller, &ticket_id, &20_000_000);

        let listing = client.get_secondary_listing(&ticket_id);
        assert_eq!(listing.unwrap().price, 20_000_000);
    }

    #[test]
    #[should_panic(expected = "All tickets sold out")]
    fn test_mint_ticket_sold_out() {
        let env = Env::default();
        let (client, token, token_admin, token_admin_addr, creator, _, buyer) = setup_test(&env);

        token_admin.mint( &buyer, &100_000_000);

        // Initialize with only 1 ticket
        client.initialize(
            &creator,
            &1,
            &10_000_000,
            &250,
            &String::from_str(&env, "Test Event"),
            &token.address,
            &String::from_str(&env, "Limited Edition"),
            &String::from_str(&env, "LTD"),
        );

        client.mint_ticket(&buyer);
        client.mint_ticket(&buyer); // Should panic
    }

    #[test]
    fn test_creator_fee_calculation() {
        let env = Env::default();
        let (client, token, token_admin, token_admin_addr, creator, seller, buyer) = setup_test(&env);

        // Fund everyone
        token_admin.mint(&seller, &100_000_000); // 100 to mint
        token_admin.mint(&buyer, &500_000_000);  // 500 to buy secondary

        // 500 bps = 5% creator fee
        client.initialize(
            &creator,
            &100,
            &10_000_000,
            &500, // 5%
            &String::from_str(&env, "Test Event"),
            &token.address,
            &String::from_str(&env, "Music Fest"),
            &String::from_str(&env, "MFST"),
        );

        let ticket_id = client.mint_ticket(&seller);
        
        // List for 200.00
        let secondary_price = 200_000_000i128;
        client.list_ticket(&seller, &ticket_id, &secondary_price);

        // Capture balances before trade
        let creator_initial_bal = token.balance(&creator); // Should be 10.0 from the initial mint
        let seller_initial_bal = token.balance(&seller);

        // Buyer purchases
        client.buy_secondary_ticket(&buyer, &ticket_id);

        let ticket = client.get_ticket(&ticket_id);
        assert_eq!(ticket.owner, buyer);

        // Verify Balances
        // Fee = 5% of 200 = 10
        // Seller gets = 190
        
        // Creator check: 10 (initial mint) + 10 (fee) = 20
        let creator_final_bal = token.balance(&creator);
        assert_eq!(creator_final_bal, creator_initial_bal + 10_000_000);

        // Seller check: Initial - 10 (mint cost) + 190 (secondary sale)
        // Since we captured balance AFTER mint cost, it's just Initial + 190
        let seller_final_bal = token.balance(&seller);
        assert_eq!(seller_final_bal, seller_initial_bal + 190_000_000);
    }
}
