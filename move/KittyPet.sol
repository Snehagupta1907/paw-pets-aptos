// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title KittyPet
 * @dev A virtual pet game contract for managing digital kitties
 * @notice This contract replicates the functionality of the Aptos Move contract
 */
contract KittyPet is Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Error codes
    error KittyNotFound();
    error InsufficientBalance();
    error KittyNotOwner();
    error KittyAlreadyExists();
    error InvalidAction();
    error InsufficientPayment();
    error AccessoryNotFound();
    error NotDeployer();

    // Accessory prices in wei (1 ETH = 1e18 wei)
    uint256[] public accessoryPrices = [
        0.1 ether,  // Basic accessories (collar, tag)
        0.25 ether, // Medium accessories (hat, scarf)
        0.5 ether,  // Premium accessories (crown, wings)
        1 ether     // Legendary accessories (magic wand, halo)
    ];

    // Accessory categories for pricing
    enum AccessoryCategory {
        Basic,      // 0.1 ETH
        Medium,     // 0.25 ETH
        Premium,    // 0.5 ETH
        Legendary   // 1 ETH
    }

    enum KittyStage {
        Baby,    // 0-100 XP
        Teen,    // 101-300 XP
        Adult,   // 301-600 XP
        Elder    // 601+ XP
    }

    // Kitty mood states
    enum KittyMood {
        Happy,
        Hungry,
        Tired,
        Sick,
        Playful
    }

    // Main kitty structure
    struct Kitty {
        uint256 id;
        string name;
        address owner;
        uint256 birthTime;
        uint256 lastFed;
        uint256 lastPlayed;
        uint256 lastSlept;
        uint256 lastCleaned;
        uint8 hunger;      // 0-100
        uint8 energy;      // 0-100
        uint8 happiness;   // 0-100
        uint8 health;      // 0-100
        uint8 cleanliness; // 0-100
        uint8 level;       // Growth level
        uint256 experience; // XP for leveling
        bytes dna;         // Unique genetic traits
        KittyStage stage;
        KittyMood mood;
        string[] accessories;
        uint256 totalCareActions;
    }

    // State variables
    Kitty[] public kitties;
    uint256 public nextId;
    uint256 public totalKitties;
    mapping(address => uint256[]) public ownerKitties;
    mapping(uint256 => uint256) public kittyIndex; // kittyId => array index

    // Events
    event KittyCreated(uint256 indexed kittyId, address indexed owner, string name);
    event KittyFed(uint256 indexed kittyId, address indexed owner);
    event KittyPlayed(uint256 indexed kittyId, address indexed owner);
    event KittySlept(uint256 indexed kittyId, address indexed owner);
    event KittyCleaned(uint256 indexed kittyId, address indexed owner);
    event AccessoryAdded(uint256 indexed kittyId, address indexed owner, string accessory);
    event TreasuryWithdrawn(address indexed owner, uint256 amount);
    event LevelUp(uint256 indexed kittyId, uint8 newLevel, KittyStage newStage);

    /**
     * @dev Constructor to set the initial owner
     */
    constructor() {
        nextId = 0;
        totalKitties = 0;
    }

    /**
     * @dev Create a new kitty
     * @param _name The name of the kitty
     */
    function createKitty(string memory _name) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= 50, "Name too long");

        uint256 kittyId = nextId;
        nextId++;
        totalKitties++;

        // Generate unique DNA
        bytes memory dna = generateDna(kittyId);
        
        Kitty memory newKitty = Kitty({
            id: kittyId,
            name: _name,
            owner: msg.sender,
            birthTime: block.timestamp,
            lastFed: block.timestamp,
            lastPlayed: block.timestamp,
            lastSlept: block.timestamp,
            lastCleaned: block.timestamp,
            hunger: 50,
            energy: 100,
            happiness: 75,
            health: 100,
            cleanliness: 100,
            level: 1,
            experience: 0,
            dna: dna,
            stage: KittyStage.Baby,
            mood: KittyMood.Happy,
            accessories: new string[](0),
            totalCareActions: 0
        });

        kitties.push(newKitty);
        kittyIndex[kittyId] = kitties.length - 1;
        ownerKitties[msg.sender].push(kittyId);

        emit KittyCreated(kittyId, msg.sender, _name);
    }

    /**
     * @dev Feed the kitty
     * @param _kittyId The ID of the kitty to feed
     */
    function feedKitty(uint256 _kittyId) external {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        Kitty storage kitty = kitties[index];
        require(kitty.owner == msg.sender, "Not kitty owner");

        // Update stats
        kitty.hunger = _min(100, kitty.hunger + 30);
        kitty.energy = _min(100, kitty.energy + 10);
        kitty.happiness = _min(100, kitty.happiness + 15);
        
        // Feeding makes kitty dirty
        kitty.cleanliness = _max(0, kitty.cleanliness - 20);
        
        kitty.lastFed = block.timestamp;
        kitty.experience += 10;
        kitty.totalCareActions++;

        updateKittyMood(kitty);
        checkLevelUp(kitty);

        emit KittyFed(_kittyId, msg.sender);
    }

    /**
     * @dev Play with the kitty
     * @param _kittyId The ID of the kitty to play with
     */
    function playWithKitty(uint256 _kittyId) external {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        Kitty storage kitty = kitties[index];
        require(kitty.owner == msg.sender, "Not kitty owner");

        // Update stats
        kitty.happiness = _min(100, kitty.happiness + 25);
        kitty.energy = _max(0, kitty.energy - 15);
        kitty.hunger = _max(0, kitty.hunger - 10);
        
        // Playing makes kitty dirty
        kitty.cleanliness = _max(0, kitty.cleanliness - 10);
        
        kitty.lastPlayed = block.timestamp;
        kitty.experience += 15;
        kitty.totalCareActions++;

        updateKittyMood(kitty);
        checkLevelUp(kitty);

        emit KittyPlayed(_kittyId, msg.sender);
    }

    /**
     * @dev Put kitty to sleep
     * @param _kittyId The ID of the kitty to put to sleep
     */
    function sleepKitty(uint256 _kittyId) external {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        Kitty storage kitty = kitties[index];
        require(kitty.owner == msg.sender, "Not kitty owner");

        kitty.energy = 100;
        kitty.health = _min(100, kitty.health + 10);
        kitty.hunger = _max(0, kitty.hunger - 20);
        kitty.lastSlept = block.timestamp;
        kitty.experience += 5;
        kitty.totalCareActions++;

        updateKittyMood(kitty);
        checkLevelUp(kitty);

        emit KittySlept(_kittyId, msg.sender);
    }

    /**
     * @dev Clean the kitty
     * @param _kittyId The ID of the kitty to clean
     */
    function cleanKitty(uint256 _kittyId) external {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        Kitty storage kitty = kitties[index];
        require(kitty.owner == msg.sender, "Not kitty owner");

        kitty.cleanliness = 100;
        kitty.happiness = _min(100, kitty.happiness + 10);
        kitty.health = _min(100, kitty.health + 5);
        kitty.lastCleaned = block.timestamp;
        kitty.experience += 8;
        kitty.totalCareActions++;

        updateKittyMood(kitty);
        checkLevelUp(kitty);

        emit KittyCleaned(_kittyId, msg.sender);
    }

    /**
     * @dev Add accessory to kitty with payment
     * @param _kittyId The ID of the kitty
     * @param _accessory The accessory name
     * @param _category The accessory category
     */
    function addAccessoryWithPayment(
        uint256 _kittyId,
        string memory _accessory,
        AccessoryCategory _category
    ) external payable nonReentrant {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        Kitty storage kitty = kitties[index];
        require(kitty.owner == msg.sender, "Not kitty owner");

        uint256 requiredPayment = accessoryPrices[uint8(_category)];
        require(msg.value >= requiredPayment, "Insufficient payment");

        // Add accessory to kitty
        kitty.accessories.push(_accessory);
        kitty.happiness = _min(100, kitty.happiness + 5);
        kitty.experience += 3;
        kitty.lastPlayed = block.timestamp;

        updateKittyMood(kitty);

        emit AccessoryAdded(_kittyId, msg.sender, _accessory);
    }

    /**
     * @dev Add accessory to kitty for free (for testing/backward compatibility)
     * @param _kittyId The ID of the kitty
     * @param _accessory The accessory name
     */
    function addAccessory(uint256 _kittyId, string memory _accessory) external {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        Kitty storage kitty = kitties[index];
        require(kitty.owner == msg.sender, "Not kitty owner");

        kitty.accessories.push(_accessory);
        kitty.happiness = _min(100, kitty.happiness + 5);
        kitty.experience += 3;
        kitty.lastPlayed = block.timestamp;

        updateKittyMood(kitty);

        emit AccessoryAdded(_kittyId, msg.sender, _accessory);
    }

    /**
     * @dev Withdraw funds from treasury (only owner can call)
     * @param _amount The amount to withdraw
     */
    function withdrawTreasury(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit TreasuryWithdrawn(owner(), _amount);
    }

    /**
     * @dev Withdraw all funds from treasury (only owner can call)
     */
    function withdrawAllTreasury() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
        
        emit TreasuryWithdrawn(owner(), balance);
    }

    // View functions

    /**
     * @dev Get kitty owner
     * @param _kittyId The ID of the kitty
     * @return The owner address
     */
    function getKittyOwner(uint256 _kittyId) external view returns (address) {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        return kitties[index].owner;
    }

    /**
     * @dev Get all kitties for an owner
     * @param _owner The owner address
     * @return Array of kitty IDs
     */
    function getOwnerKitties(address _owner) external view returns (uint256[] memory) {
        return ownerKitties[_owner];
    }

    /**
     * @dev Get kitty stats
     * @param _kittyId The ID of the kitty
     * @return hunger, energy, happiness, health, cleanliness
     */
    function getKittyStats(uint256 _kittyId) external view returns (uint8, uint8, uint8, uint8, uint8) {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        Kitty storage kitty = kitties[index];
        return (kitty.hunger, kitty.energy, kitty.happiness, kitty.health, kitty.cleanliness);
    }

    /**
     * @dev Get kitty stage as uint8
     * @param _kittyId The ID of the kitty
     * @return The stage as uint8
     */
    function getKittyStageU8(uint256 _kittyId) external view returns (uint8) {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        KittyStage stage = kitties[index].stage;
        if (stage == KittyStage.Baby) return 0;
        else if (stage == KittyStage.Teen) return 1;
        else if (stage == KittyStage.Adult) return 2;
        else return 3; // Elder
    }

    /**
     * @dev Get kitty mood as uint8
     * @param _kittyId The ID of the kitty
     * @return The mood as uint8
     */
    function getKittyMoodU8(uint256 _kittyId) external view returns (uint8) {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        KittyMood mood = kitties[index].mood;
        if (mood == KittyMood.Happy) return 0;
        else if (mood == KittyMood.Hungry) return 1;
        else if (mood == KittyMood.Tired) return 2;
        else if (mood == KittyMood.Sick) return 3;
        else return 4; // Playful
    }

    /**
     * @dev Get kitty name
     * @param _kittyId The ID of the kitty
     * @return The kitty name
     */
    function getKittyName(uint256 _kittyId) external view returns (string memory) {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        return kitties[index].name;
    }

    /**
     * @dev Get total number of kitties
     * @return The total number of kitties
     */
    function getTotalKitties() external view returns (uint256) {
        return totalKitties;
    }

    /**
     * @dev Get next kitty ID
     * @return The next kitty ID
     */
    function getNextKittyId() external view returns (uint256) {
        return nextId;
    }

    /**
     * @dev Get kitty progress (experience and level)
     * @param _kittyId The ID of the kitty
     * @return experience and level
     */
    function getKittyProgress(uint256 _kittyId) external view returns (uint256, uint8) {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        
        Kitty storage kitty = kitties[index];
        return (kitty.experience, kitty.level);
    }

    /**
     * @dev Get kitty accessories
     * @param _kittyId The ID of the kitty
     * @return Array of accessory names
     */
    function getKittyAccessories(uint256 _kittyId) external view returns (string[] memory) {
        uint256 index = kittyIndex[_kittyId];
        require(index < kitties.length, "Kitty not found");
        return kitties[index].accessories;
    }

    /**
     * @dev Get treasury balance
     * @return The treasury balance
     */
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get accessory price by category
     * @param _category The accessory category
     * @return The price in wei
     */
    function getAccessoryPrice(uint8 _category) external view returns (uint256) {
        require(_category < 4, "Invalid category");
        return accessoryPrices[_category];
    }

    /**
     * @dev Get all accessory prices
     * @return Array of all accessory prices
     */
    function getAllAccessoryPrices() external view returns (uint256[] memory) {
        return accessoryPrices;
    }

    /**
     * @dev Check if user is deployer (owner)
     * @param _account The account to check
     * @return True if account is deployer
     */
    function isDeployer(address _account) external view returns (bool) {
        return _account == owner();
    }

    /**
     * @dev Get current timestamp
     * @return Current timestamp
     */
    function getTime() external view returns (uint256) {
        return block.timestamp;
    }

    // Internal helper functions

    /**
     * @dev Generate DNA for a kitty
     * @param _kittyId The kitty ID
     * @return The DNA bytes
     */
    function generateDna(uint256 _kittyId) internal pure returns (bytes memory) {
        bytes memory dna = new bytes(4);
        dna[0] = bytes1(uint8(_kittyId % 256));
        dna[1] = bytes1(uint8((_kittyId / 256) % 256));
        dna[2] = bytes1(uint8((_kittyId / 65536) % 256));
        dna[3] = bytes1(uint8((_kittyId / 16777216) % 256));
        return dna;
    }

    /**
     * @dev Update kitty mood based on stats
     * @param _kitty The kitty to update
     */
    function updateKittyMood(Kitty storage _kitty) internal {
        if (_kitty.hunger < 20) {
            _kitty.mood = KittyMood.Hungry;
        } else if (_kitty.energy < 20) {
            _kitty.mood = KittyMood.Tired;
        } else if (_kitty.health < 30) {
            _kitty.mood = KittyMood.Sick;
        } else if (_kitty.cleanliness < 30) {
            _kitty.mood = KittyMood.Sick; // Dirty kitties appear sick
        } else if (_kitty.happiness > 80 && _kitty.energy > 50) {
            _kitty.mood = KittyMood.Playful;
        } else {
            _kitty.mood = KittyMood.Happy;
        }
    }

    /**
     * @dev Check for level up
     * @param _kitty The kitty to check
     */
    function checkLevelUp(Kitty storage _kitty) internal {
        if (_kitty.experience >= 100 && _kitty.level < 2) {
            _kitty.level = 2;
            _kitty.stage = KittyStage.Teen;
            emit LevelUp(_kitty.id, _kitty.level, _kitty.stage);
        } else if (_kitty.experience >= 300 && _kitty.level < 3) {
            _kitty.level = 3;
            _kitty.stage = KittyStage.Adult;
            emit LevelUp(_kitty.id, _kitty.level, _kitty.stage);
        } else if (_kitty.experience >= 600 && _kitty.level < 4) {
            _kitty.level = 4;
            _kitty.stage = KittyStage.Elder;
            emit LevelUp(_kitty.id, _kitty.level, _kitty.stage);
        }
    }

    /**
     * @dev Get minimum of two values
     * @param _a First value
     * @param _b Second value
     * @return The minimum value
     */
    function _min(uint8 _a, uint8 _b) internal pure returns (uint8) {
        return _a < _b ? _a : _b;
    }

    /**
     * @dev Get maximum of two values
     * @param _a First value
     * @param _b Second value
     * @return The maximum value
     */
    function _max(uint8 _a, uint8 _b) internal pure returns (uint8) {
        return _a > _b ? _a : _b;
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
} 