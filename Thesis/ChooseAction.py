def choose_action(self, state, num_valid_actions):
        if np.random.rand() < self.epsilon:
            return random.randint(0, num_valid_actions - 1)
        else:
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            with torch.no_grad():
                q_values = self.q_network(state_tensor, num_valid_actions)
            valid_q_values = q_values[:, :num_valid_actions]
            return torch.argmax(valid_q_values).item()