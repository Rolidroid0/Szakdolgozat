import torch
import torch.nn as nn
import torch.optim as optim

class DeepQNetwork(nn.Module):
    """def __init__(self, input_dim, output_dim, hidden_dim=128):
        super(DeepQNetwork, self).__init__()

        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x"""
    def __init__(self, input_dim, max_actions, hidden_dim=128):
        super(DeepQNetwork, self).__init__()

        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, max_actions)

    def forward(self, x, action_dim):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x[:, :action_dim]
    
"""if __name__ == "__main__":
    input_dim = 10
    output_dim = 4
    model = DeepQNetwork(input_dim, output_dim)

    sample_input = torch.rand((1, input_dim))
    output = model(sample_input)
    print("Q-values:", output)"""