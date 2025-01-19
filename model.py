import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

from collections import Counter
import torch.multiprocessing as mp
mp.set_start_method('spawn', force=True)

import requests
import random
import io

from datasets import DatasetDict, Dataset, load_dataset

from PIL import Image
import torchvision.transforms as transforms

import numpy as np

from transformers import ViTImageProcessor, AutoModelForImageClassification, AutoTokenizer

from tqdm import tqdm
import os

from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.utils import shuffle

#load the dataset
ds = load_dataset("indu22/Waste_classification")
print(ds)

#split the dataset
split = ds['train'].train_test_split(test_size=0.2, shuffle=True)
train_data = split['train']
test_data = split['test']

#preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Resize to the size expected by ViT model
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # ImageNet mean and std
])

class WasteClassificationDataset(DatasetDict):
    def __init__(self, dataset, transform=None):
        self.dataset = dataset
        self.transform = transform
        self.image_column = 'image'
        self.label_column = 'label'

        # Label encoder
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit([sample[self.label_column] for sample in self.dataset])  # Fit label encoder

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        image = self.dataset[idx][self.image_column]
        label = self.dataset[idx][self.label_column]

        #label encoding
        label = self.label_encoder.transform([label])[0]

        if isinstance(image, torch.Tensor):
            image = transforms.ToPILImage()(image)

        if self.transform:
            image = image.convert("RGB")
            image = self.transform(image)

        return image, label

# Create DataLoader instances using the custom dataset
train_dataset = WasteClassificationDataset(dataset=train_data, transform=transform)
test_dataset = WasteClassificationDataset(dataset=test_data, transform=transform)

train_dataloader = DataLoader(train_dataset, batch_size=2, shuffle=True, num_workers=0, pin_memory=True)
test_dataloader = DataLoader(test_dataset, batch_size=1, shuffle=False, pin_memory=True)

#training function
def train_model(model, train_dataloader, optimizer, criterion, device, epochs=850):
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        correct_preds = 0
        total_preds = 0

        for batch in tqdm(train_dataloader, desc=f"Training Epoch {epoch+1}"):
            optimizer.zero_grad()

            pixel_values, labels = batch
            pixel_values = pixel_values.to(device)  # Move image data to device
            labels = labels.to(device)  # Move labels to device

            # Forward pass: predict
            outputs = model(pixel_values, labels=labels)
            loss = outputs.loss
            logits = outputs.logits

            # Backward pass: evaluate losses and optimize weights
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

            # Reshape predicted logits and labels to 1D
            _, predicted = torch.max(logits, 1)

            correct_preds += (predicted.view(-1) == labels.view(-1)).sum().item()
            total_preds += labels.size(0)

        accuracy = 100 * correct_preds / total_preds
        print(f"Epoch {epoch+1}: Loss = {total_loss / len(train_dataloader)}, Accuracy = {accuracy}%")

# Initialize the model
model_name = "google/vit-base-patch16-224-in21k"
model = AutoModelForImageClassification.from_pretrained(model_name, num_labels=10)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Loss function
criterion = nn.CrossEntropyLoss()

# Optimizer
optimizer = optim.AdamW(model.parameters(), lr=5e-5)

# Train the model
train_model(model, train_dataloader, optimizer, criterion, device, epochs=1)

# Evaluate the model
def evaluate_model(model, test_dataloader, device):
    model.eval()
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for batch in tqdm(test_dataloader, desc="Evaluating"):
            pixel_values = batch[0].to(device)
            labels = batch[1].to(device)

            # Forward pass
            outputs = model(pixel_values)
            logits = outputs.logits

            _, predicted = torch.max(logits, 1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    accuracy = accuracy_score(all_labels, all_preds)
    print(f"Test Accuracy: {accuracy * 100:.2f}%")

evaluate_model(model, test_dataloader, device)

# Save the model
model_dir = '/Users/Delisha/Documents/eco-cycle/'
model_path = os.path.join(model_dir, 'eco_cycle_model.pth')

if not os.path.exists(model_dir):
    os.makedirs(model_dir)

torch.save(model.state_dict(), model_path)
print(f"Model state_dict saved at: {model_path}")