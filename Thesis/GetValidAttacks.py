def _update_action_space(self):
        self.actions = self.get_valid_attacks() + [("pass",)]
        self.action_space = spaces.Discrete(len(self.actions))
def get_valid_attacks(self):
        valid_attacks = []
        for from_territory in self.get_ai_owned_territories():
            for to_territory in self.get_attackable_neighbors(from_territory):
                _max_armies = self.get_max_attack_armies(from_territory)
                for armies in range(1, _max_armies + 1):
                    valid_attacks.append((from_territory, to_territory, armies))
        return valid_attacks