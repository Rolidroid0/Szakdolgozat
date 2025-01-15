import gym
from gym import spaces
import numpy as np

AI_HOUSE = "Ghiscari"
MAX_ARMIES = 100
MAX_TERRITORIES = 35

class AttackEnvironment(gym.Env):

    def __init__(self):
        super(AttackEnvironment, self).__init__()

        self.action_space = spaces.Tuple((
            spaces.Discrete(MAX_TERRITORIES), # Attacker index
            spaces.Discrete(MAX_TERRITORIES), # Defender index
            spaces.Discrete(MAX_ARMIES + 1) # Number of armies
        ))
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
        
        self.state = None
        self.current_round = None
    
    def reset(self):
        raw_state = self.JSgetState()
        self.state = self.process_state(raw_state)
        self.current_round = raw_state["round"]
        return self.state
    
    def step(self, action):
        """
        Executes the given action and returns the next state, reward, done flag, and info.
        :param action: Tuple (from_territory, to_territory, num_armies)
        :return: next_state, reward, done, info
        """
        if self.state["round_state"] == 0:
            raise Exception("Not the AI's turn to play.")
        
        attacker_index, defender_index, army_count = action

        success = self.JSattack(attacker_index, defender_index, army_count)
        if not success:
            return self.state, -1, True, {"info": "Attack failed"}

        raw_state = self.JSgetState()
        self.state = self.process_state(raw_state)
        self.current_round = raw_state["round"]

        reward = self._calculate_reward(success)
        done = self._is_game_over(raw_state)

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
        
    def JSgetState(self):
        raise NotImplementedError()
    
    def JSsendAction(self, from_territory, to_territory, num_armies):
        raise NotImplementedError()
    
    def process_state(self, raw_state):
        territories = raw_state["territories"]
        ownership = [1 if t["owner_id"] == AI_HOUSE else 0 for t in territories]
        army_counts = [t["number_of_armies"] / MAX_ARMIES for t in territories]
        adjacency_matrix = self.create_adjacency_matrix(territories)
        ports = [1 if t["port"] else 0 for t in territories]
        fortresses = [1 if t["fortress"] else 0 for t in territories]

        attackable = []
        for i, t in enumerate(territories):
            is_owned = t["owner_id"] == AI_HOUSE
            not_attacked_this_round = t["last_attacked_from"] != raw_state["round"]
            has_enemy_neighbor = any(
                territories[j]["owner_id"] != AI_HOUSE
                for j, is_neighbor in enumerate(adjacency_matrix[i])
                if is_neighbor == 1
            )
            if is_owned and not_attacked_this_round and has_enemy_neighbor:
                attackable.append(1)
            else:
                attackable.append(0)

        is_my_turn = 1 if raw_state["current_player"] == AI_HOUSE else 0
        round_state = 1 if raw_state["round_state"] == "invasion" else 0

        debug_msg = f"Processed State: Territories={territories}, Ownership={ownership}, Ports={ports}, Fortresses={fortresses}, Army Counts={army_counts}"
        print(debug_msg)
        return ownership, army_counts, adjacency_matrix, attackable, ports, fortresses, is_my_turn, round_state
    
    def create_adjacency_matrix(territories):
        territory_names = [t["name"] for t in territories]
        size = len(territories)
        adjacency_matrix = [[0 for _ in range(size)] for _ in range(size)]

        for i, territory in enumerate(territories):
            for neighbor in territory["neighbors"]:
                if neighbor in territory_names:
                    j = territory_names.index(neighbor)
                    adjacency_matrix[i][j] = 1
        
        return adjacency_matrix

    def _calculate_reward(self, success):
        """
        Jutalom kiszámítása a támadás eredménye alapján.
        """
        return 1 if success else -1
    
    def _is_game_over(self, raw_state):
        """
        Ellenőrzi, hogy véget ért-e a játék.
        """
        return raw_state["state"] in ["completed", "game_over"] #vagy ami az adatbázisban lehet a final state