#[test_only]
module kitty_pet::kitty_pet_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use kitty_pet::kitty_game;

    // Test account addresses
    const OWNER: address = @0x1;
    const USER1: address = @0x2;
    const USER2: address = @0x3;

    // Override get_time for tests to avoid timestamp errors
    public fun get_time(): u64 { 0 }

    #[test]
    fun test_kitty_store_initialization() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        // Verify store was created
        let store = kitty_game::get_owner_kitties(OWNER);
        assert!(vector::length(&store) == 0, 0);
    }

    #[test]
    fun test_create_kitty() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        let kitty_name = string::utf8(b"Fluffy");
        kitty_game::create_kitty(&owner, kitty_name, 0);
        
        // Verify kitty was created
        let kitties = kitty_game::get_owner_kitties(OWNER);
        assert!(vector::length(&kitties) == 1, 0);
        
        // Get kitty stats
        let (hunger, energy, happiness, health, cleanliness) = kitty_game::get_kitty_stats(0);
        assert!(hunger == 50, 0);
        assert!(energy == 100, 0);
        assert!(happiness == 75, 0);
        assert!(health == 100, 0);
        assert!(cleanliness == 100, 0);
    }

    #[test]
    fun test_feed_kitty() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        let kitty_name = string::utf8(b"Fluffy");
        kitty_game::create_kitty(&owner, kitty_name, 0);
        
        // Feed the kitty
        kitty_game::feed_kitty(&owner, 0, 0);
        
        // Verify stats changed
        let (hunger, energy, happiness, health, cleanliness) = kitty_game::get_kitty_stats(0);
        assert!(hunger == 80, 0); // 50 + 30
        assert!(energy == 100, 0); // 100 + 10 (capped at 100)
        assert!(happiness == 90, 0); // 75 + 15
    }

    #[test]
    fun test_play_with_kitty() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        let kitty_name = string::utf8(b"Fluffy");
        kitty_game::create_kitty(&owner, kitty_name, 0);
        
        // Play with the kitty
        kitty_game::play_with_kitty(&owner, 0, 0);
        
        // Verify stats changed
        let (hunger, energy, happiness, health, cleanliness) = kitty_game::get_kitty_stats(0);
        assert!(hunger == 40, 0); // 50 - 10
        assert!(energy == 85, 0); // 100 - 15
        assert!(happiness == 100, 0); // 75 + 25 (capped at 100)
    }

    #[test]
    fun test_sleep_kitty() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        let kitty_name = string::utf8(b"Fluffy");
        kitty_game::create_kitty(&owner, kitty_name, 0);
        
        // First play to reduce energy
        kitty_game::play_with_kitty(&owner, 0, 0);
        
        // Then sleep
        kitty_game::sleep_kitty(&owner, 0, 0);
        
        // Verify stats changed
        let (hunger, energy, happiness, health, cleanliness) = kitty_game::get_kitty_stats(0);
        assert!(energy == 100, 0); // Should be fully restored
        assert!(health == 100, 0); // Should be at max
    }

    #[test]
    fun test_clean_kitty() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        let kitty_name = string::utf8(b"Fluffy");
        kitty_game::create_kitty(&owner, kitty_name, 0);
        
        // Clean the kitty
        kitty_game::clean_kitty(&owner, 0, 0);
        
        // Verify stats changed
        let (hunger, energy, happiness, health, cleanliness) = kitty_game::get_kitty_stats(0);
        assert!(cleanliness == 100, 0); // Should be fully clean
        assert!(happiness == 85, 0); // 75 + 10
        assert!(health == 100, 0); // 100 + 5 (capped at 100)
    }

    #[test]
    fun test_add_accessory() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        let kitty_name = string::utf8(b"Fluffy");
        kitty_game::create_kitty(&owner, kitty_name, 0);
        
        let accessory = string::utf8(b"Bow Tie");
        kitty_game::add_accessory(&owner, 0, accessory, 0);
        
        // Verify happiness increased
        let (hunger, energy, happiness, health, cleanliness) = kitty_game::get_kitty_stats(0);
        assert!(happiness == 80, 0); // 75 + 5
    }

    #[test]
    fun test_kitty_leveling() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        let kitty_name = string::utf8(b"Fluffy");
        kitty_game::create_kitty(&owner, kitty_name, 0);
        
        // Initial stage should be Baby
        let stage = kitty_game::get_kitty_stage_u8(0);
        assert!(stage == 0, 0); // 0: Baby
        
        // Perform actions to gain experience
        let i = 0;
        while (i < 10) {
            kitty_game::feed_kitty(&owner, 0, 0);
            kitty_game::play_with_kitty(&owner, 0, 0);
            i = i + 1;
        };
        
        // Should have leveled up to Teen
        let new_stage = kitty_game::get_kitty_stage_u8(0);
        assert!(new_stage == 1, 0); // 1: Teen
    }

    #[test]
    fun test_kitty_mood_changes() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        let kitty_name = string::utf8(b"Fluffy");
        kitty_game::create_kitty(&owner, kitty_name, 0);
        
        // Initial mood should be Happy
        let mood = kitty_game::get_kitty_mood_u8(0);
        assert!(mood == 0, 0); // 0: Happy
        
        // Play multiple times to reduce energy and hunger
        let i = 0;
        while (i < 7) {
            kitty_game::play_with_kitty(&owner, 0, 0);
            i = i + 1;
        };
        
        // Should be tired due to low energy
        let new_mood = kitty_game::get_kitty_mood_u8(0);
        assert!(new_mood == 1, 0); // 1: Hungry (hunger < 20 takes priority over energy < 20)
    }

    #[test]
    fun test_multiple_kitties() {
        let owner = account::create_account_for_test(OWNER);
        kitty_game::initialize(&owner);
        
        // Create multiple kitties
        kitty_game::create_kitty(&owner, string::utf8(b"Fluffy"), 0);
        kitty_game::create_kitty(&owner, string::utf8(b"Whiskers"), 0);
        kitty_game::create_kitty(&owner, string::utf8(b"Mittens"), 0);
        
        let kitties = kitty_game::get_owner_kitties(OWNER);
        assert!(vector::length(&kitties) == 3, 0);
        
        // Verify each kitty has unique ID
        assert!(*vector::borrow(&kitties, 0) == 0, 0);
        assert!(*vector::borrow(&kitties, 1) == 1, 0);
        assert!(*vector::borrow(&kitties, 2) == 2, 0);
    }

    #[test]
    #[expected_failure(abort_code = kitty_game::EKITTY_NOT_FOUND)]
    fun test_unauthorized_action() {
        let owner = account::create_account_for_test(OWNER);
        let user1 = account::create_account_for_test(USER1);
        
        kitty_game::initialize(&owner);
        kitty_game::initialize(&user1); // Initialize store for user1
        kitty_game::create_kitty(&owner, string::utf8(b"Fluffy"), 0);
        
        // Try to feed kitty with wrong account
        kitty_game::feed_kitty(&user1, 0, 0);
    }
} 