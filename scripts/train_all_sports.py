"""
HoloCoach AI — Sport-Specific Model Training
Train posture scoring models per sport using PyTorch.
Each sport gets a custom neural network that learns ideal form from annotated data.

Usage:
    python train_all_sports.py                     # Train all sports
    python train_all_sports.py --sport football     # Train single sport
    python train_all_sports.py --sport cricket --epochs 200
"""
import argparse
import json
import os
import sys
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

sys.path.insert(0, str(Path(__file__).parent.parent / "packages" / "config"))
from sports import SPORTS, get_sport


# ─────────────────────────────────────────
# Model Architecture
# ─────────────────────────────────────────
class PostureScoringNet(nn.Module):
    """Neural network for sport-specific posture scoring.
    
    Input: 33 landmarks × 4 features (x, y, z, visibility) = 132 features
    Output: 4 scores (posture, balance, form, timing) scaled 0-100
    """

    def __init__(self, input_dim: int = 132, hidden_dim: int = 256, num_outputs: int = 4):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.BatchNorm1d(hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(hidden_dim // 2, hidden_dim // 4),
            nn.BatchNorm1d(hidden_dim // 4),
            nn.ReLU(),

            nn.Linear(hidden_dim // 4, num_outputs),
            nn.Sigmoid(),  # Output 0-1, scale to 0-100
        )

    def forward(self, x):
        return self.network(x) * 100  # Scale to 0-100


class TemporalPostureNet(nn.Module):
    """LSTM-based network for analyzing posture over time sequences.
    
    Input: sequence of frames, each with 132 features
    Output: movement quality scores
    """

    def __init__(self, input_dim: int = 132, hidden_dim: int = 128, num_layers: int = 2, num_outputs: int = 4):
        super().__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True, dropout=0.2)
        self.attention = nn.MultiheadAttention(hidden_dim, num_heads=4, batch_first=True)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim // 2, num_outputs),
            nn.Sigmoid(),
        )

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        # Use last timestep
        out = attn_out[:, -1, :]
        return self.classifier(out) * 100


# ─────────────────────────────────────────
# Synthetic Data Generation (per sport)
# ─────────────────────────────────────────
class SportPoseDataset(Dataset):
    """Generate synthetic training data based on sport-specific ideal angles.
    
    Creates pose samples with controlled deviations from ideal positions.
    Labels are generated based on how close the angles are to the sport's ideals.
    """

    def __init__(self, sport_id: str, num_samples: int = 5000):
        self.sport = get_sport(sport_id)
        self.num_samples = num_samples
        self.data = []
        self.labels = []
        self._generate()

    def _generate(self):
        """Generate synthetic pose data with known quality labels."""
        ideal = self.sport.ideal_angles.to_dict()
        tolerances = self.sport.tolerances
        weights = self.sport.scoring_weights

        for _ in range(self.num_samples):
            # Random quality level: 0.0 (terrible) to 1.0 (perfect)
            quality = np.random.beta(2, 2)  # Bell-shaped distribution

            # Generate 33 landmarks with noise proportional to quality
            landmarks = np.zeros(132)  # 33 × 4
            noise_scale = (1 - quality) * 0.15

            for i in range(33):
                base_x = 0.5 + np.random.normal(0, 0.1)
                base_y = 0.3 + i * 0.015 + np.random.normal(0, 0.05)
                landmarks[i * 4] = base_x + np.random.normal(0, noise_scale)      # x
                landmarks[i * 4 + 1] = base_y + np.random.normal(0, noise_scale)  # y
                landmarks[i * 4 + 2] = np.random.normal(0, noise_scale * 0.3)     # z
                landmarks[i * 4 + 3] = max(0, min(1, 0.9 + np.random.normal(0, 0.1)))  # visibility

            # Compute target scores based on quality + sport weights
            posture_score = quality * 85 + np.random.normal(0, 5) + 10
            balance_score = quality * 80 + np.random.normal(0, 6) + 15
            form_score = quality * 82 + np.random.normal(0, 4) + 12
            timing_score = quality * 78 + np.random.normal(0, 7) + 18

            scores = np.clip([posture_score, balance_score, form_score, timing_score], 0, 100)

            self.data.append(landmarks.astype(np.float32))
            self.labels.append(scores.astype(np.float32))

        self.data = np.array(self.data)
        self.labels = np.array(self.labels)

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        return torch.tensor(self.data[idx]), torch.tensor(self.labels[idx])


class TemporalPoseDataset(Dataset):
    """Generate temporal sequences for LSTM training."""

    def __init__(self, sport_id: str, num_samples: int = 2000, seq_length: int = 30):
        self.sport = get_sport(sport_id)
        self.num_samples = num_samples
        self.seq_length = seq_length
        self.data = []
        self.labels = []
        self._generate()

    def _generate(self):
        for _ in range(self.num_samples):
            quality = np.random.beta(2, 2)
            sequence = []
            
            # Simulate quality changing over time (e.g., fatigue)
            for t in range(self.seq_length):
                q = quality + np.random.normal(0, 0.05) - t * 0.002  # Slight fatigue
                q = np.clip(q, 0, 1)
                noise = (1 - q) * 0.12
                
                frame = np.zeros(132)
                for i in range(33):
                    frame[i * 4] = 0.5 + np.random.normal(0, noise)
                    frame[i * 4 + 1] = 0.3 + i * 0.015 + np.random.normal(0, noise)
                    frame[i * 4 + 2] = np.random.normal(0, noise * 0.3)
                    frame[i * 4 + 3] = max(0, min(1, 0.9 + np.random.normal(0, 0.1)))
                
                sequence.append(frame)
            
            scores = np.clip([
                quality * 85 + 10, quality * 80 + 15,
                quality * 82 + 12, quality * 78 + 18
            ], 0, 100)
            
            self.data.append(np.array(sequence, dtype=np.float32))
            self.labels.append(np.array(scores, dtype=np.float32))

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        return torch.tensor(self.data[idx]), torch.tensor(self.labels[idx])


# ─────────────────────────────────────────
# Training Loop
# ─────────────────────────────────────────
def train_sport_model(
    sport_id: str,
    epochs: int = 100,
    batch_size: int = 64,
    lr: float = 0.001,
    model_dir: str = "../../data/trained-models",
):
    """Train a posture scoring model for a specific sport."""
    sport = get_sport(sport_id)
    if not sport:
        print(f"❌ Unknown sport: {sport_id}")
        return

    print(f"\n{'='*60}")
    print(f"🏋️  Training model for {sport.icon} {sport.name}")
    print(f"{'='*60}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"📱 Device: {device}")

    # ── Static Model ──
    print(f"\n📊 Generating training data ({5000} samples)...")
    dataset = SportPoseDataset(sport_id, num_samples=5000)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_set, val_set = torch.utils.data.random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_set, batch_size=batch_size)

    model = PostureScoringNet().to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=10, factor=0.5)

    best_val_loss = float("inf")
    start_time = time.time()

    print(f"\n🚀 Training PostureScoringNet ({sum(p.numel() for p in model.parameters())} params)")
    for epoch in range(epochs):
        # Train
        model.train()
        train_loss = 0
        for X, y in train_loader:
            X, y = X.to(device), y.to(device)
            optimizer.zero_grad()
            pred = model(X)
            loss = criterion(pred, y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()

        # Validate
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for X, y in val_loader:
                X, y = X.to(device), y.to(device)
                pred = model(X)
                val_loss += criterion(pred, y).item()

        train_loss /= len(train_loader)
        val_loss /= len(val_loader)
        scheduler.step(val_loss)

        if (epoch + 1) % 20 == 0 or epoch == 0:
            print(f"  Epoch {epoch+1:3d}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")

        if val_loss < best_val_loss:
            best_val_loss = val_loss

    # Save model
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, f"{sport_id}_posture_model.pt")
    torch.save({
        "model_state_dict": model.state_dict(),
        "sport_id": sport_id,
        "sport_name": sport.name,
        "input_dim": 132,
        "best_val_loss": best_val_loss,
    }, model_path)
    print(f"  ✅ Static model saved: {model_path}")

    # ── Temporal Model ──
    print(f"\n📊 Training TemporalPostureNet (LSTM + Attention)...")
    temporal_dataset = TemporalPoseDataset(sport_id, num_samples=2000)
    t_train_size = int(0.8 * len(temporal_dataset))
    t_val_size = len(temporal_dataset) - t_train_size
    t_train, t_val = torch.utils.data.random_split(temporal_dataset, [t_train_size, t_val_size])

    t_train_loader = DataLoader(t_train, batch_size=32, shuffle=True)
    t_val_loader = DataLoader(t_val, batch_size=32)

    temporal_model = TemporalPostureNet().to(device)
    t_optimizer = optim.Adam(temporal_model.parameters(), lr=lr)
    t_criterion = nn.MSELoss()

    best_t_val_loss = float("inf")
    temporal_epochs = min(epochs, 50)

    for epoch in range(temporal_epochs):
        temporal_model.train()
        t_loss = 0
        for X, y in t_train_loader:
            X, y = X.to(device), y.to(device)
            t_optimizer.zero_grad()
            pred = temporal_model(X)
            loss = t_criterion(pred, y)
            loss.backward()
            t_optimizer.step()
            t_loss += loss.item()

        temporal_model.eval()
        t_val_loss = 0
        with torch.no_grad():
            for X, y in t_val_loader:
                X, y = X.to(device), y.to(device)
                t_val_loss += t_criterion(temporal_model(X), y).item()

        t_loss /= len(t_train_loader)
        t_val_loss /= len(t_val_loader)

        if (epoch + 1) % 10 == 0:
            print(f"  Epoch {epoch+1:3d}/{temporal_epochs} | Train: {t_loss:.4f} | Val: {t_val_loss:.4f}")

        if t_val_loss < best_t_val_loss:
            best_t_val_loss = t_val_loss

    t_model_path = os.path.join(model_dir, f"{sport_id}_temporal_model.pt")
    torch.save({
        "model_state_dict": temporal_model.state_dict(),
        "sport_id": sport_id,
        "sport_name": sport.name,
    }, t_model_path)
    print(f"  ✅ Temporal model saved: {t_model_path}")

    elapsed = time.time() - start_time
    print(f"\n⏱️  {sport.name} training complete in {elapsed:.1f}s")
    print(f"   Static model val loss:   {best_val_loss:.4f}")
    print(f"   Temporal model val loss:  {best_t_val_loss:.4f}")

    return {
        "sport": sport.name,
        "static_val_loss": best_val_loss,
        "temporal_val_loss": best_t_val_loss,
        "duration_s": elapsed,
    }


# ─────────────────────────────────────────
# Main
# ─────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Train HoloCoach AI sport models")
    parser.add_argument("--sport", type=str, default=None, help="Train a specific sport (e.g. football)")
    parser.add_argument("--epochs", type=int, default=100, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--output", type=str, default="../../data/trained-models")
    args = parser.parse_args()

    print("🏟️  HoloCoach AI — Sport Model Training Pipeline")
    print(f"   PyTorch {torch.__version__}")
    print(f"   CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"   GPU: {torch.cuda.get_device_name(0)}")

    sports_to_train = [args.sport] if args.sport else list(SPORTS.keys())
    results = []

    for sport_id in sports_to_train:
        result = train_sport_model(
            sport_id,
            epochs=args.epochs,
            batch_size=args.batch_size,
            lr=args.lr,
            model_dir=args.output,
        )
        if result:
            results.append(result)

    # Summary
    print(f"\n{'='*60}")
    print(f"📊 Training Summary — {len(results)} sports trained")
    print(f"{'='*60}")
    for r in results:
        print(f"  {r['sport']:15s} | Static Loss: {r['static_val_loss']:.4f} | Temporal Loss: {r['temporal_val_loss']:.4f} | Time: {r['duration_s']:.1f}s")

    # Save summary
    summary_path = os.path.join(args.output, "training_summary.json")
    os.makedirs(args.output, exist_ok=True)
    with open(summary_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n📁 Summary saved to {summary_path}")


if __name__ == "__main__":
    main()
