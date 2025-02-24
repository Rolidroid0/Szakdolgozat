import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from models.deep_q_network import DeepQNetwork

class ReplayBuffer:
    def __init__(self, max_size):
        self.buffer = []
        self.max_size = max_size

    def store(self, transition):
        if len(self.buffer) >= self.max_size:
            self.buffer.pop(0)
        self.buffer.append(transition)

    def sample(self, batch_size):
        return random.sample(self.buffer, batch_size)

    def size(self):
        return len(self.buffer)

class DQNAgent:
    def __init__(self, state_dim, action_dim, lr=0.001, gamma=0.99, epsilon=1.0, epsilon_min=0.01, epsilon_decay=0.995, target_update_tau=0.005):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.lr = lr
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.target_update_tau = target_update_tau

        self.q_network = DeepQNetwork(state_dim, action_dim)
        self.target_network = DeepQNetwork(state_dim, action_dim)
        self.target_network.load_state_dict(self.q_network.state_dict())  # Kezdetben azonos

        self.optimizer = optim.Adam(self.q_network.parameters(), lr=lr)
        self.replay_buffer = ReplayBuffer(max_size=10000)

    def choose_action(self, state, num_valid_actions):
        if np.random.rand() < self.epsilon:
            return random.randint(0, num_valid_actions - 1)
        else:
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            with torch.no_grad():
                q_values = self.q_network(state_tensor, num_valid_actions) #q_values = self.q_network(state_tensor)
            valid_q_values = q_values[:, :num_valid_actions]
            return torch.argmax(valid_q_values).item()

    def store_transition(self, state, action, reward, next_state, done):
        self.replay_buffer.store((state, action, reward, next_state, done))

    def learn(self, batch_size, next_num_valid_actions):
        if self.replay_buffer.size() < batch_size:
            return

        transitions = self.replay_buffer.sample(batch_size)
        states, actions, rewards, next_states, dones = zip(*transitions)

        states = torch.FloatTensor(np.array(states)) #states = torch.FloatTensor(states)
        actions = torch.LongTensor(actions).unsqueeze(1)
        actions = torch.clamp(actions, min=0, max=next_num_valid_actions - 1)
        rewards = torch.FloatTensor(rewards).unsqueeze(1)
        next_states = torch.FloatTensor(np.array(next_states)) #next_states = torch.FloatTensor(next_states)
        dones = torch.FloatTensor(dones).unsqueeze(1)

        q_values = self.q_network(states, next_num_valid_actions).gather(1, actions)
        
        with torch.no_grad():
            next_q_values = self.target_network(next_states, next_num_valid_actions).max(1)[0].unsqueeze(1) #next_q_values = self.target_network(next_states).max(1)[0].unsqueeze(1)
            target_q_values = rewards + self.gamma * next_q_values * (1 - dones)

        loss = nn.MSELoss()(q_values, target_q_values)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

        self.update_target_network()

    def update_target_network(self):
        for target_param, param in zip(self.target_network.parameters(), self.q_network.parameters()):
            target_param.data.copy_(self.target_update_tau * param.data + (1 - self.target_update_tau) * target_param.data)

    def save_model(self, filepath="dqn_model_checkpoint.pth"):
        torch.save(self.q_network.state_dict(), filepath)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath="dqn_model_checkpoint.pth"):
        self.q_network.load_state_dict(torch.load(filepath))
        self.target_network.load_state_dict(self.q_network.state_dict())
        print(f"Model loaded from {filepath}")
