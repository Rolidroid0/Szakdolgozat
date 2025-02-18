import torch
import numpy as np
import asyncio
from models.deep_q_network import DeepQNetwork
from agents.deep_q_agent import DQNAgent
from environments.AttackEnv import AttackEnvironment

from javascript import require

db = require("../../dist/config/db.js")
websocket = require("../../dist/config/websocket.js")

EPISODES = 1
BATCH_SIZE = 64

class DQNTrainer:
    def __init__(self, env, state_dim, action_dim):
        self.env = env
        self.agent = DQNAgent(state_dim, action_dim)
        self.batch_size = BATCH_SIZE
        self.max_episodes = EPISODES

    async def train(self):
        websocket.initializeWebSocket(db.connectToDb())
        for episode in range(self.max_episodes):
            state = await self.env.reset()
            total_reward = 0
            done = False

            while not done:
                action = self.agent.choose_action(self._flatten_state(state))
                next_state, reward, done, _ = await self.env.step(action)
                self.agent.store_transition(self._flatten_state(state), action, reward, self._flatten_state(state), done)
                self.agent.learn(self.batch_size)
                state = next_state
                total_reward += reward

            print(f"Episode {episode + 1}/{self.max_episodes}, Total Reward: {total_reward}")
        
    def _flatten_state(self, state):
        """
        Flatten the observation dictionary into a single array for the neural network.
        """
        return np.concatenate([
            state["ownership"],
            state["army_counts"],
            state["attackable"],
            [state["is_my_turn"]],
            [state["round_state"]]
        ])

if __name__ == "__main__":
    env = AttackEnvironment()
    state_dim = sum([
        env.observation_space["ownership"].shape[0],
            env.observation_space["army_counts"].shape[0],
            env.observation_space["attackable"].shape[0],
            1,  # is_my_turn
            1   # round_state
        ])
    action_dim = env.action_space.n

    trainer = DQNTrainer(env, state_dim, action_dim)
    asyncio.run(trainer.train())
    print("Training completed!")


    #if (episode + 1) % 50 == 0:
        #torch.save(agent.q_network.state_dict(), f"dqn_model_episode_{episode + 1}.pth")