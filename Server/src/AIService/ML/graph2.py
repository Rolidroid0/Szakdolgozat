import re
import matplotlib.pyplot as plt
import numpy as np

file_path = "eredmenyek.txt"

rewards = []
with open(file_path, "r") as file:
    for line in file:
        match = re.search(r"Episode \d+: ([\-\d\.]+) points", line)
        if match:
            rewards.append(float(match.group(1)))

chunk_size = 10
win_counts = [sum(1 for r in rewards[i:i+chunk_size] if r > 0) for i in range(0, len(rewards), chunk_size)]

plt.figure(figsize=(10, 5))
plt.bar(range(1, len(win_counts)+1), win_counts, color='mediumseagreen')
plt.xlabel('10 epizódos csoportok (pl. 1 = Epizód 1-10)')
plt.ylabel('Pozitív jutalmak száma')
plt.title('AI nyerések száma 10 epizódos bontásban')
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()

window_size = 5
moving_avg = np.convolve(rewards, np.ones(window_size)/window_size, mode='valid')
episodes = np.arange(1, len(rewards) + 1)

plt.figure(figsize=(10, 5))
plt.plot(episodes, rewards, marker='o', linestyle='', alpha=0.3, label='Eredeti jutalmak')
plt.plot(episodes[:len(moving_avg)], moving_avg, color='royalblue', linewidth=2, label=f'{window_size}-epizódos mozgóátlag')
plt.axhline(0, color='gray', linestyle='--')
plt.xlabel('Epizód')
plt.ylabel('Jutalom')
plt.title('AI tanulási görbe - mozgóátlaggal')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()
