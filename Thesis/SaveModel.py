def save_model(self, filepath="dqn_model_checkpoint.pth"):
        torch.save(self.q_network.state_dict(), filepath)
        print(f"Model saved to {filepath}")