import gym
from gym import spaces
import numpy as np
import asyncio

AI_HOUSE = "Ghiscari"
MAX_ARMIES = 100
MAX_TERRITORIES = 35

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

        self.websocket = None

    async def reset(self):
        """
        raw_state = self.JSgetState()
        self.state = self.process_state(raw_state)
        self.current_round = raw_state["round"]
        self.update_action_space()
        """
        #await self.JSstartNewGame()
        await self.send_action("start-new-game")
        await self.JSgetFirstState()
        #await self.JSgetState()
        #self._initialize_static_data()
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
            reward = await self.JSpass()
        else:
            attacker_index, defender_index, army_count = chosen_action
            attacker_territory = self.territories[attacker_index]
            defender_territory = self.territories[defender_index]

            reward = await self.JSattack(attacker_territory['_id'], defender_territory['_id'], army_count)
            #reward = await self.JSattack(attacker_index, defender_index, army_count)

        done = abs(reward) > 30

        if done:
            await self.JSgetLastState()
        else:
            await self.JSgetState()

        #await self.JSgetState()

        #done = self._is_game_over()
        self._update_action_space()

        return self.state, reward, done, {}
    
    def render(self, mode='human'):
        print(f"Current State: {self.state}")
        
    async def JSgetState(self):
        raw_state = await self.send_action("get-game-state", extract_key="raw_state")
        self.territories = raw_state["territories"]
        self.process_state(raw_state)
    
    async def JSattack(self, from_territory, to_territory, num_armies):
        try:
            data = { "playerId": self.current_player_id,
                    "fromTerritoryId": from_territory,
                    "toTerritoryId": to_territory,
                    "armies": num_armies }
            await self.send_action('start-battle', data)
            #await battleService.startBattle(self.current_player_id, from_territory, to_territory, num_armies)
            #reward = await gameService.automataBattle()
            reward = await self.send_action('automata-battle', extract_key="reward")
            return reward["attackerPoints"]
        except Exception as e:
            print(f"JSattack error: {e}")
            return False
    
    async def JSpass(self):
        try:
            #reward = await gameService.automataTurn()
            reward = await self.send_action('automata-turn', extract_key=reward)
            return reward
        except Exception as e:
            print(f"JSpass error: {e}")

    async def JSgetFirstState(self):
        raw_state = await self.send_action("get-game-state", extract_key="raw_state")

        if isinstance(raw_state, dict):
            raw_state = {key: value for key, value in raw_state.items()}
        elif isinstance(raw_state, list):
            raw_state = list(raw_state)
        #self.territories = raw_state["territories"]
        self.territories = list(raw_state["territories"])
        self._initialize_static_data()
        self.process_state(raw_state)

    async def JSgetLastState(self):
        data = { "gameId": self.game_id }
        raw_state = await self.send_action('get-game-state-by-id', data, "raw_state")
        #raw_state = await gameService.getGameStateById(self.game_id)
        self.territories = raw_state["territories"]
        self.process_state(raw_state)

    #async def JSstartNewGame(self):
    #    gameService.startNewGame()
    
    def _initialize_static_data(self):
        self.adjacency_matrix = self.create_adjacency_matrix()
        self.ports = [1 if t["port"] else 0 for t in self.territories]
        self.fortresses = [1 if t["fortress"] else 0 for t in self.territories]
    
    def process_state(self, raw_state):
        self.game_id = raw_state["_id"]
        self.current_round = raw_state["round"]
        self.current_player_id = raw_state["current_player_id"]
        self.game_state = raw_state["state"]
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
        return [j for j in range(MAX_TERRITORIES-1) if self.adjacency_matrix[territory, j] == 1 and self.state["ownership"][j] == 0]
    
    def get_max_attack_armies(self, territory):
        total_armies = int(self.state["army_counts"][territory] * MAX_ARMIES)
        return max(0, total_armies - 1)
    
    def set_websocket(self, websocket):
        self.websocket = websocket

    async def send_action(self, action, data=None, extract_key=None):
        if not self.websocket:
            raise Exception("WebSocket connection not established.")
            
        response = await self.websocket.send_message(action, data)

        if not response:
            print("az baj")
            return

        if not response.get("success", False):
            error_message = response.get("message", "Unknown error occurred.")
            raise Exception(f"Action failed: {error_message}")

        return response.get(extract_key) if extract_key else response
    
    def _is_game_over(self):
        """
        Ellenőrzi, hogy véget ért-e a játék.
        """
        return "won" in self.game_state.lower()
    
#raw_state = gameService.getOngoingGameState()
#print(raw_state)