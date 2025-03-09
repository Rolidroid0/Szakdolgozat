import matplotlib.pyplot as plt
import numpy as np
import re

rewards = []
file_path = ".\eredmenyek.txt"

with open(file_path, "r") as file:
        for line in file:
            match = re.search(r"Episode \d+: ([\-\d\.]+) points", line)
            if match:
                rewards.append(float(match.group(1)))

if not rewards:
    print("Nincs található adat a fájlban.")

#rewards = [-524.5, -240.5, -307.5, -413.0, -624.5, -298.5, -344.5, 208.5]
episodes = np.arange(1, len(rewards) + 1)

"""window_size = 3
moving_avg = np.convolve(rewards, np.ones(window_size)/window_size, mode='valid')

plt.figure(figsize=(10, 6))
plt.plot(episodes, rewards, marker='o', label='Episode Rewards')
plt.plot(episodes[:len(moving_avg)], moving_avg, label=f'{window_size}-Episode Moving Average', linestyle='--')"""

window_size = 10 if len(rewards) > 30 else 3
moving_avg = np.convolve(rewards, np.ones(window_size) / window_size, mode='valid')

plt.figure(figsize=(12, 7))

plt.scatter(episodes[::10], rewards[::10], color='blue', s=10, label='Episode Rewards (sampled)')
plt.plot(episodes[:len(moving_avg)], moving_avg, color='red', linewidth=2, label=f'{window_size}-Episode Moving Average')


plt.xlabel('Episode')
plt.ylabel('Reward')
plt.title('AI Learning Progress')
plt.legend()
plt.grid()
plt.show()