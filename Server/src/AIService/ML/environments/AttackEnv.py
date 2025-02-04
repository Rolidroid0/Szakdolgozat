import gym
from gym import spaces
import numpy as np
from javascript import require
import asyncio

AI_HOUSE = "Ghiscari"
MAX_ARMIES = 100
MAX_TERRITORIES = 35

gameService = require("../../../dist/services/gamesService.js")
battleService = require("../../../dist/services/battlesService.js")

class AttackEnvironment(gym.Env):

    def __init__(self):
        super(AttackEnvironment, self).__init__()

        """
        self.action_space = spaces.Tuple((
            spaces.Discrete(MAX_TERRITORIES), # Attacker index
            spaces.Discrete(MAX_TERRITORIES), # Defender index
            spaces.Discrete(MAX_ARMIES + 1) # Number of armies
        ))
        
        self.action_space = spaces.Discrete(1)
        self.actions = []
        self.observation_space = spaces.Dict({
            "ownership": spaces.Box(0, 1, shape=(MAX_TERRITORIES,), dtype=np.float32),
            "army_counts": spaces.Box(0, 1, shape=(MAX_TERRITORIES,), dtype=np.float32),
            "adjacency_matrix": spaces.Box(0, 1, shape=(MAX_TERRITORIES, MAX_TERRITORIES), dtype=np.float32),
            "attackable": spaces.Box(0, 1, shape=(MAX_TERRITORIES,), dtype=np.float32),
            "ports": spaces.Box(0, 1, shape=(MAX_TERRITORIES,), dtype=np.float32),
            "fortresses": spaces.Box(0, 1, shape=(MAX_TERRITORIES,), dtype=np.float32),
            "is_my_turn": spaces.Discrete(2),
            "round_state": spaces.Discrete(2)
            })
        """
        
        self.action_space = spaces.Discrete(1)
        self.actions = []
        self.observation_space = spaces.Dict({
            "ownership": spaces.Box(0, 1, shape=(MAX_TERRITORIES,), dtype=np.float32),
            "army_counts": spaces.Box(0, 1, shape=(MAX_TERRITORIES,), dtype=np.float32),
            "attackable": spaces.Box(0, 1, shape=(MAX_TERRITORIES,), dtype=np.float32),
            "is_my_turn": spaces.Discrete(2),
            "round_state": spaces.Discrete(2)
        })
        
        self.state = None
        self.current_round = None
        self.adjacency_matrix = None
        self.ports = None
        self.fortresses = None
    
    async def reset(self):
        """
        raw_state = self.JSgetState()
        self.state = self.process_state(raw_state)
        self.current_round = raw_state["round"]
        self.update_action_space()
        """
        await self.JSgetState()
        self._initialize_static_data()
        return self.state
    
    async def step(self, action):
        """
        Executes the given action and returns the next state, reward, done flag, and info.
        :param action: Tuple (from_territory, to_territory, num_armies)
        :return: next_state, reward, done, info
        """
        if self.state["round_state"] == 0:
            raise Exception("Not the AI's turn to play.")
        
        chosen_action = self.actions[action]
        
        if chosen_action == ("pass",):
            success = self.JSpass()
        else:
            attacker_index, defender_index, army_count = chosen_action
            success = self.JSattack(attacker_index, defender_index, army_count)
            if not success:
                return self.state, -1, True, {"info": "Attack failed"}
            else:
                await self.JSautomataBattle()

        await self.JSgetState()

        reward = self._calculate_reward(success)
        done = self._is_game_over()
        self._update_action_space()

        return self.state, reward, done, {}
    
    def render(self, mode='human'):
        print(f"Current State: {self.state}")

    def calculate_reward(self, action_result):
        """
        Calculates the reward based on the action result received from the server.
        :param action_result: Result of the action from the server.
        :return: Reward value.
        """
        if action_result["territory_captured"]:
            return 1.0
        elif action_result["lost_armies"]:
            return -0.1 * action_result["lost_armies"]
        else: 
            return 0.0
        
    async def JSgetState(self):
        raw_state = await gameService.getOngoingGameState()
        self.territories = raw_state["territories"]
        self.process_state(raw_state)
    
    async def JSattack(self, from_territory, to_territory, num_armies):
        try:
            await battleService.startBattle(self.current_player_id, from_territory, to_territory, num_armies)
            return True
        except Exception as e:
            print(f"JSattack error: {e}")
            return False
        
    async def JSautomataBattle(self):
        try:
            text = await gameService.automataBattle()
            print(text)
        except Exception as e:
            print(f"JSautomataBattle error: {e}")
    
    def JSpass(self):
        raise NotImplementedError()
    
    def _initialize_static_data(self):
        self.adjacency_matrix = self.create_adjacency_matrix()
        self.ports = [1 if t["port"] else 0 for t in self.territories]
        self.fortresses = [1 if t["fortress"] else 0 for t in self.territories]
    
    def process_state(self, raw_state):
        self.current_round = raw_state["round"]
        self.current_player_id = raw_state["current_player_id"]
        self.state = {
            "ownership": np.array([1 if t["owner_id"] == AI_HOUSE else 0 for t in self.territories], dtype=np.float32),
            "army_counts": np.array([t["number_of_armies"] / MAX_ARMIES for t in self.territories], dtype=np.float32),
            "attackable": self._get_attackable_territories(),
            "is_my_turn": 1 if raw_state["current_player"] == AI_HOUSE else 0,
            "round_state": 1 if raw_state["round_state"] == "invasion" else 0
        }
        self._update_action_space()
        
        """
        attackable = []
        for i, t in enumerate(self.territories):
            is_owned = t["owner_id"] == AI_HOUSE
            not_attacked_this_round = t["last_attacked_from"] != raw_state["round"]
            has_enemy_neighbor = any(
                self.territories[j]["owner_id"] != AI_HOUSE
                for j, is_neighbor in enumerate(adjacency_matrix[i])
                if is_neighbor == 1
            )
            if is_owned and not_attacked_this_round and has_enemy_neighbor:
                attackable.append(1)
            else:
                attackable.append(0)
        """

    def _get_attackable_territories(self):
        attackable = np.zeros(MAX_TERRITORIES, dtype=np.float32)
        for i, t in enumerate(self.territories):
            if t["owner_id"] == AI_HOUSE and t["last_attacked_from"] != self.current_round:
                for j, is_neighbor in enumerate(self.adjacency_matrix[i]):
                    if is_neighbor and self.territories[j]["owner_id"] != AI_HOUSE:
                        attackable[i] = 1
                        break
        return attackable
    
    def create_adjacency_matrix(self):
        size = len(self.territories)
        adjacency_matrix = np.zeros((size, size), dtype=np.float32)
        territory_names = {t["name"]: i for i, t in enumerate(self.territories)}

        for i, territory in enumerate(self.territories):
            for neighbor in territory["neighbors"]:
                if neighbor in territory_names:
                    j = territory_names[neighbor]
                    adjacency_matrix[i, j] = 1
        
        return adjacency_matrix
    
    def _update_action_space(self):
        """
        Frissíti az akcióteret a jelenlegi állapot alapján.
        """
        self.actions = self.get_valid_attacks() + [("pass",)]
        self.action_space = spaces.Discrete(len(self.actions))

    def get_valid_attacks(self):
        """
        Lekérdezi az összes érvényes támadási lehetőséget.
        """
        valid_attacks = []
        for from_territory in self.get_ai_owned_territories():
            for to_territory in self.get_attackable_neighbors(from_territory):
                _max_armies = self.get_max_attack_armies(from_territory)
                for armies in range(1, _max_armies + 1):
                    valid_attacks.append((from_territory, to_territory, armies))
        return valid_attacks
    
    def get_ai_owned_territories(self):
        return [i for i, owner in enumerate(self.state["ownership"]) if owner == 1 and self.get_max_attack_armies(i) > 0]
    
    def get_attackable_neighbors(self, territory):
        return [j for j in range(MAX_TERRITORIES) if self.adjacency_matrix[territory, j] == 1 and self.state["ownership"][j] == 0]
    
    def get_max_attack_armies(self, territory):
        total_armies = int(self.state["army_counts"][territory] * MAX_ARMIES)
        return max(0, total_armies - 1)

    def _calculate_reward(self, success):
        """
        Jutalom kiszámítása a támadás eredménye alapján.
        """
        return 1 if success else -1
    
    def _is_game_over(self, raw_state):
        """
        Ellenőrzi, hogy véget ért-e a játék.
        """
        return "won" in raw_state["state"].lower()
    
#raw_state = gameService.getOngoingGameState()
#print(raw_state)