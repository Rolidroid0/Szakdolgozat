EPISODES = 100
BATCH_SIZE = 64

class DQNTrainer:
    def __init__(self, env, state_dim, action_dim, websocket):
        self.agent = DQNAgent(state_dim, action_dim)
        ...
    async def train(self):
        try:
            await self.websocket.connect()
            ...
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
                ...
                print(f"Episode {episode + 1}/{self.max_episodes}, Total Reward: {total_reward}")

                if (episode + 1) % 10 == 0:
                    self.agent.save_model()
        finally:
            await self.websocket.close()
...
if __name__ == "__main__":
    env = AttackEnvironment()
    ws_url = "ws://localhost:3000"
    websocket = WebSocketClient(ws_url)
    env.set_websocket(websocket)
    ...
    trainer = DQNTrainer(env, state_dim, env.max_actions, websocket)
    asyncio.run(trainer.train())
    print("Training completed!")