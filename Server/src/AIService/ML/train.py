import torch
import numpy as np
import asyncio
from models.deep_q_network import DeepQNetwork
from agents.deep_q_agent import DQNAgent
from environments.AttackEnv import AttackEnvironment
from websocket_client import WebSocketClient

EPISODES = 100
BATCH_SIZE = 64

class DQNTrainer:
    def __init__(self, env, state_dim, action_dim, websocket):
        self.env = env
        self.agent = DQNAgent(state_dim, action_dim)
        self.websocket = websocket
        self.batch_size = BATCH_SIZE
        self.max_episodes = EPISODES

    async def train(self):
        try:
            await self.websocket.connect()
            episode_rewards = []

            try:
                self.agent.load_model()
            except FileNotFoundError:
                print("No checkpoint found, starting from scratch")

            for episode in range(self.max_episodes):
                state = await self.env.reset()
                total_reward = 0
                done = False

                while not done:
                    valid_actions = self.env.actions
                    action = self.agent.choose_action(self._flatten_state(state), len(valid_actions))
                    next_state, reward, done, _ = await self.env.step(action)
                    self.agent.store_transition(self._flatten_state(state), action, reward, self._flatten_state(state), done)
                    self.agent.learn(self.batch_size, len(valid_actions))
                    state = next_state
                    total_reward += reward

                episode_rewards.append(total_reward)
                print(f"Episode {episode + 1}/{self.max_episodes}, Total Reward: {total_reward}")

                if (episode + 1) % 10 == 0:
                    self.agent.save_model()

            print("\nAll episodes rewards:")
            for idx, reward in enumerate(episode_rewards):
                print(f"Episode {idx + 1}: {reward} points")
        finally:
            await self.websocket.close()
        
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
    ws_url = "ws://localhost:3000"
    websocket = WebSocketClient(ws_url)

    env.set_websocket(websocket)

    state_dim = sum([
        env.observation_space["ownership"].shape[0],
            env.observation_space["army_counts"].shape[0],
            env.observation_space["attackable"].shape[0],
            #1,  # is_my_turn
            #1   # round_state
        ])
    action_dim = env.action_space.n

    #trainer = DQNTrainer(env, state_dim, action_dim, websocket)
    trainer = DQNTrainer(env, state_dim, env.max_actions, websocket)
    asyncio.run(trainer.train())
    print("Training completed!")


    #if (episode + 1) % 50 == 0:
        #torch.save(agent.q_network.state_dict(), f"dqn_model_episode_{episode + 1}.pth")