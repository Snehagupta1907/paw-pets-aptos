module kitty_pet::kitty_game {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;

    // Error codes
    const EKITTY_NOT_FOUND: u64 = 1;
    const EINSUFFICIENT_BALANCE: u64 = 2;
    const EKITTY_NOT_OWNER: u64 = 3;
    const EKITTY_ALREADY_EXISTS: u64 = 4;
    const EINVALID_ACTION: u64 = 5;
    const EKITTY_STORE_NOT_INITIALIZED: u64 = 6;
    const EINSUFFICIENT_PAYMENT: u64 = 7;
    const EACCESSORY_NOT_FOUND: u64 = 8;
    const ENOT_DEPLOYER: u64 = 9;

    // Module address for the kitty store
    const KITTY_STORE_ADDRESS: address = @kitty_pet;

    // Accessory prices in octas (1 APT = 100,000,000 octas)
    const ACCESSORY_PRICES: vector<u64> = vector[
        10000000,  // 0.1 APT - Basic accessories (collar, tag)
        25000000,  // 0.25 APT - Medium accessories (hat, scarf)
        50000000,  // 0.5 APT - Premium accessories (crown, wings)
        100000000, // 1 APT - Legendary accessories (magic wand, halo)
    ];

    // Accessory categories for pricing
    enum AccessoryCategory has drop, store {
        Basic,      // 0.1 APT
        Medium,     // 0.25 APT
        Premium,    // 0.5 APT
        Legendary,  // 1 APT
    }

    enum KittyStage has drop, store {
        Baby,    // 0-100 XP
        Teen,    // 101-300 XP
        Adult,   // 301-600 XP
        Elder,   // 601+ XP
    }

    // Kitty mood states
    enum KittyMood has drop, store {
        Happy,
        Hungry,
        Tired,
        Sick,
        Playful,
    }

    // Main kitty resource structure
    struct Kitty has key, store {
        id: u64,
        name: String,
        owner: address,
        birth_time: u64,
        last_fed: u64,
        last_played: u64,
        last_slept: u64,
        last_cleaned: u64,
        hunger: u8,      // 0-100
        energy: u8,      // 0-100
        happiness: u8,   // 0-100
        health: u8,      // 0-100
        cleanliness: u8, // 0-100
        level: u8,       // Growth level
        experience: u64, // XP for leveling
        dna: vector<u8>, // Unique genetic traits
        stage: KittyStage,
        mood: KittyMood,
        accessories: vector<String>,
        total_care_actions: u64,
    }

    // Kitty store to manage all kitties
    struct KittyStore has key {
        kitties: vector<Kitty>,
        next_id: u64,
        total_kitties: u64,
    }

    // Treasury to hold collected APT tokens
    struct Treasury has key {
        coins: Coin<AptosCoin>,
    }

    // Initialize the kitty store and treasury
    public entry fun initialize(account: &signer) {
        // Only allow initialization by the module publisher
        assert!(signer::address_of(account) == @kitty_pet, EKITTY_STORE_NOT_INITIALIZED);
        
        let store = KittyStore {
            kitties: vector::empty(),
            next_id: 0,
            total_kitties: 0,
        };
        move_to(account, store);

        // Initialize treasury with 0 coins
        let treasury = Treasury {
            coins: coin::zero<AptosCoin>(),
        };
        move_to(account, treasury);
    }

    // Create a new kitty using Move 2.0 features
    public entry fun create_kitty(
        account: &signer,
        name: String,
        time: u64,
    ) acquires KittyStore {
        // Input validation for production
        assert!(string::length(&name) > 0, EINVALID_ACTION);
        assert!(string::length(&name) <= 50, EINVALID_ACTION); // Reasonable name length limit

        let store = borrow_global_mut<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty_id = store.next_id;
        store.next_id = store.next_id + 1;
        store.total_kitties = store.total_kitties + 1;

        // Generate unique DNA using Move 2.0 vector operations
        let dna = generate_dna(kitty_id);
        
        let kitty = Kitty {
            id: kitty_id,
            name,
            owner: signer::address_of(account),
            birth_time: time,
            last_fed: time,
            last_played: time,
            last_slept: time,
            last_cleaned: time,
            hunger: 50,
            energy: 100,
            happiness: 75,
            health: 100,
            cleanliness: 100,
            level: 1,
            experience: 0,
            dna,
            stage: KittyStage::Baby,
            mood: KittyMood::Happy,
            accessories: vector::empty(),
            total_care_actions: 0,
        };

        // Store kitty in the vector
        vector::push_back(&mut store.kitties, kitty);
    }

    // Feed the kitty using receiver style functions (Move 2.0 feature)
    public entry fun feed_kitty(account: &signer, kitty_id: u64, time: u64) acquires KittyStore {
        let store = borrow_global_mut<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id(&mut store.kitties, kitty_id);
        assert!(kitty.owner == signer::address_of(account), EKITTY_NOT_OWNER);

        // Update stats
        kitty.hunger = if (kitty.hunger + 30 > 100) { 100 } else { kitty.hunger + 30 };
        kitty.energy = if (kitty.energy + 10 > 100) { 100 } else { kitty.energy + 10 };
        kitty.happiness = if (kitty.happiness + 15 > 100) { 100 } else { kitty.happiness + 15 };
        
        // Feeding makes kitty dirty (decrease cleanliness by 20)
        kitty.cleanliness = if (kitty.cleanliness < 20) { 0 } else { kitty.cleanliness - 20 };
        
        kitty.last_fed = time;
        kitty.experience = kitty.experience + 10;
        kitty.total_care_actions = kitty.total_care_actions + 1;

        // Update mood based on stats
        update_kitty_mood(kitty);
        
        // Check for level up
        check_level_up(kitty);
    }

    // Play with the kitty
    public entry fun play_with_kitty(account: &signer, kitty_id: u64, time: u64) acquires KittyStore {
        let store = borrow_global_mut<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id(&mut store.kitties, kitty_id);
        assert!(kitty.owner == signer::address_of(account), EKITTY_NOT_OWNER);

        // Update stats
        kitty.happiness = if (kitty.happiness + 25 > 100) { 100 } else { kitty.happiness + 25 };
        kitty.energy = if (kitty.energy < 15) { 0 } else { kitty.energy - 15 };
        kitty.hunger = if (kitty.hunger < 10) { 0 } else { kitty.hunger - 10 };
        
        // Playing makes kitty dirty (decrease cleanliness by 10)
        kitty.cleanliness = if (kitty.cleanliness < 10) { 0 } else { kitty.cleanliness - 10 };
        
        kitty.last_played = time;
        kitty.experience = kitty.experience + 15;
        kitty.total_care_actions = kitty.total_care_actions + 1;

        update_kitty_mood(kitty);
        check_level_up(kitty);
    }

    // Put kitty to sleep
    public entry fun sleep_kitty(account: &signer, kitty_id: u64, time: u64) acquires KittyStore {
        let store = borrow_global_mut<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id(&mut store.kitties, kitty_id);
        assert!(kitty.owner == signer::address_of(account), EKITTY_NOT_OWNER);

        kitty.energy = 100;
        kitty.health = if (kitty.health + 10 > 100) { 100 } else { kitty.health + 10 };
        kitty.hunger = if (kitty.hunger < 20) { 0 } else { kitty.hunger - 20 };
        kitty.last_slept = time;
        kitty.experience = kitty.experience + 5;
        kitty.total_care_actions = kitty.total_care_actions + 1;

        update_kitty_mood(kitty);
        check_level_up(kitty);
    }

    // Clean the kitty
    public entry fun clean_kitty(account: &signer, kitty_id: u64, time: u64) acquires KittyStore {
        let store = borrow_global_mut<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id(&mut store.kitties, kitty_id);
        assert!(kitty.owner == signer::address_of(account), EKITTY_NOT_OWNER);

        kitty.cleanliness = 100;
        kitty.happiness = if (kitty.happiness + 10 > 100) { 100 } else { kitty.happiness + 10 };
        kitty.health = if (kitty.health + 5 > 100) { 100 } else { kitty.health + 5 };
        kitty.last_cleaned = time;
        kitty.experience = kitty.experience + 8;
        kitty.total_care_actions = kitty.total_care_actions + 1;

        update_kitty_mood(kitty);
        check_level_up(kitty);
    }

    // Add accessory to kitty with payment
    public entry fun add_accessory_with_payment(
        account: &signer, 
        kitty_id: u64, 
        accessory: String, 
        category: u8,  // 0=Basic, 1=Medium, 2=Premium, 3=Legendary
        time: u64
    ) acquires KittyStore, Treasury {
        let store = borrow_global_mut<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id(&mut store.kitties, kitty_id);
        assert!(kitty.owner == signer::address_of(account), EKITTY_NOT_OWNER);

        // Validate category
        assert!(category < 4, EINVALID_ACTION);
        
        // Get required payment amount
        let required_payment = *vector::borrow(&ACCESSORY_PRICES, (category as u64));
        
        // Withdraw payment from user's account
        let payment = coin::withdraw<AptosCoin>(account, required_payment);

        // Add payment to treasury
        let treasury = borrow_global_mut<Treasury>(KITTY_STORE_ADDRESS);
        coin::merge(&mut treasury.coins, payment);

        // Add accessory to kitty
        vector::push_back(&mut kitty.accessories, accessory);
        kitty.happiness = if (kitty.happiness + 5 > 100) { 100 } else { kitty.happiness + 5 };
        kitty.experience = kitty.experience + 3;
        kitty.last_played = time;

        update_kitty_mood(kitty);
    }

    // Legacy function for free accessories (for testing/backward compatibility)
    public entry fun add_accessory(account: &signer, kitty_id: u64, accessory: String, time: u64) acquires KittyStore {
        let store = borrow_global_mut<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id(&mut store.kitties, kitty_id);
        assert!(kitty.owner == signer::address_of(account), EKITTY_NOT_OWNER);

        vector::push_back(&mut kitty.accessories, accessory);
        kitty.happiness = if (kitty.happiness + 5 > 100) { 100 } else { kitty.happiness + 5 };
        kitty.experience = kitty.experience + 3;
        kitty.last_played = time;

        update_kitty_mood(kitty);
    }

    // Withdraw funds from treasury (only deployer can call)
    public entry fun withdraw_treasury(account: &signer, amount: u64) acquires Treasury {
        assert!(signer::address_of(account) == @kitty_pet, ENOT_DEPLOYER);
        
        let treasury = borrow_global_mut<Treasury>(KITTY_STORE_ADDRESS);
        let available_amount = coin::value(&treasury.coins);
        assert!(amount <= available_amount, EINSUFFICIENT_BALANCE);
        
        let coins_to_withdraw = coin::extract(&mut treasury.coins, amount);
        coin::deposit(signer::address_of(account), coins_to_withdraw);
    }

    // Withdraw all funds from treasury (only deployer can call)
    public entry fun withdraw_all_treasury(account: &signer) acquires Treasury {
        assert!(signer::address_of(account) == @kitty_pet, ENOT_DEPLOYER);
        
        let treasury = borrow_global_mut<Treasury>(KITTY_STORE_ADDRESS);
        let all_coins = coin::extract_all(&mut treasury.coins);
        coin::deposit(signer::address_of(account), all_coins);
    }

    // Get kitty by ID
    #[view]
    public fun get_kitty_owner(kitty_id: u64): address acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id_immutable(&store.kitties, kitty_id);
        kitty.owner
    }

    // Get all kitties for an owner
    #[view]
    public fun get_owner_kitties(owner: address): vector<u64> acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        let kitties: vector<u64> = vector::empty();
        let i = 0;
        let len = vector::length(&store.kitties);
        while (i < len) {
            let kitty = vector::borrow(&store.kitties, i);
            if (kitty.owner == owner) {
                vector::push_back(&mut kitties, kitty.id);
            };
            i = i + 1;
        };
        kitties
    }

    // Helper functions
    fun find_kitty_by_id(kitties: &mut vector<Kitty>, kitty_id: u64): &mut Kitty {
        let i = 0;
        let len = vector::length(kitties);
        while (i < len) {
            let kitty = vector::borrow_mut(kitties, i);
            if (kitty.id == kitty_id) {
                return kitty
            };
            i = i + 1;
        };
        abort EKITTY_NOT_FOUND
    }

    fun find_kitty_by_id_immutable(kitties: &vector<Kitty>, kitty_id: u64): &Kitty {
        let i = 0;
        let len = vector::length(kitties);
        while (i < len) {
            let kitty = vector::borrow(kitties, i);
            if (kitty.id == kitty_id) {
                return kitty
            };
            i = i + 1;
        };
        abort EKITTY_NOT_FOUND
    }

    // Time abstraction for testing
    #[view]
    public fun get_time(): u64 {
        timestamp::now_seconds()
    }

    fun generate_dna(kitty_id: u64): vector<u8> {
        let dna = vector::empty<u8>();
        vector::push_back(&mut dna, (kitty_id % 256) as u8);
        vector::push_back(&mut dna, ((kitty_id / 256) % 256) as u8);
        vector::push_back(&mut dna, ((kitty_id / 65536) % 256) as u8);
        vector::push_back(&mut dna, ((kitty_id / 16777216) % 256) as u8);
        dna
    }

    fun update_kitty_mood(kitty: &mut Kitty) {
        if (kitty.hunger < 20) {
            kitty.mood = KittyMood::Hungry;
        } else if (kitty.energy < 20) {
            kitty.mood = KittyMood::Tired;
        } else if (kitty.health < 30) {
            kitty.mood = KittyMood::Sick;
        } else if (kitty.cleanliness < 30) {
            kitty.mood = KittyMood::Sick; // Dirty kitties appear sick
        } else if (kitty.happiness > 80 && kitty.energy > 50) {
            kitty.mood = KittyMood::Playful;
        } else {
            kitty.mood = KittyMood::Happy;
        }
    }

    fun check_level_up(kitty: &mut Kitty) {
        // Level up logic based on experience
        if (kitty.experience >= 100 && kitty.level < 2) {
            kitty.level = 2;
            kitty.stage = KittyStage::Teen;
        } else if (kitty.experience >= 300 && kitty.level < 3) {
            kitty.level = 3;
            kitty.stage = KittyStage::Adult;
        } else if (kitty.experience >= 600 && kitty.level < 4) {
            kitty.level = 4;
            kitty.stage = KittyStage::Elder;
        };
    }

    // View functions for frontend
    #[view]
    public fun get_kitty_stats(kitty_id: u64): (u8, u8, u8, u8, u8) acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id_immutable(&store.kitties, kitty_id);
        (kitty.hunger, kitty.energy, kitty.happiness, kitty.health, kitty.cleanliness)
    }

    #[view]
    public fun get_kitty_stage_u8(kitty_id: u64): u8 acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id_immutable(&store.kitties, kitty_id);
        if (&kitty.stage is KittyStage::Baby) { 0 }
        else if (&kitty.stage is KittyStage::Teen) { 1 }
        else if (&kitty.stage is KittyStage::Adult) { 2 }
        else { 3 }
    }

    #[view]
    public fun get_kitty_mood_u8(kitty_id: u64): u8 acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id_immutable(&store.kitties, kitty_id);
        if (&kitty.mood is KittyMood::Happy) { 0 }
        else if (&kitty.mood is KittyMood::Hungry) { 1 }
        else if (&kitty.mood is KittyMood::Tired) { 2 }
        else if (&kitty.mood is KittyMood::Sick) { 3 }
        else { 4 }
    }

    // Get kitty name
    #[view]
    public fun get_kitty_name(kitty_id: u64): String acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id_immutable(&store.kitties, kitty_id);
        kitty.name
    }

    // Get total number of kitties (for production monitoring)
    #[view]
    public fun get_total_kitties(): u64 acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        store.total_kitties
    }

    // Get next kitty ID (for production monitoring)
    #[view]
    public fun get_next_kitty_id(): u64 acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        store.next_id
    }

    // Get kitty experience and level
    #[view]
    public fun get_kitty_progress(kitty_id: u64): (u64, u8) acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id_immutable(&store.kitties, kitty_id);
        (kitty.experience, kitty.level)
    }

    // Get kitty accessories
    #[view]
    public fun get_kitty_accessories(kitty_id: u64): vector<String> acquires KittyStore {
        let store = borrow_global<KittyStore>(KITTY_STORE_ADDRESS);
        let kitty = find_kitty_by_id_immutable(&store.kitties, kitty_id);
        kitty.accessories
    }

    // Get treasury balance
    #[view]
    public fun get_treasury_balance(): u64 acquires Treasury {
        let treasury = borrow_global<Treasury>(KITTY_STORE_ADDRESS);
        coin::value(&treasury.coins)
    }

    // Get accessory price by category
    #[view]
    public fun get_accessory_price(category: u8): u64 {
        assert!(category < 4, EINVALID_ACTION);
        *vector::borrow(&ACCESSORY_PRICES, (category as u64))
    }

    // Get all accessory prices
    #[view]
    public fun get_all_accessory_prices(): vector<u64> {
        ACCESSORY_PRICES
    }

    // Check if user is deployer
    #[view]
    public fun is_deployer(account: address): bool {
        account == @kitty_pet
    }

    // Create Treasury resource if missing (recovery function)
    public entry fun create_treasury(account: &signer) {
        assert!(signer::address_of(account) == @kitty_pet, ENOT_DEPLOYER);
        if (!exists<Treasury>(KITTY_STORE_ADDRESS)) {
            let treasury = Treasury {
                coins: coin::zero<AptosCoin>(),
            };
            move_to(account, treasury);
        }
    }
} 