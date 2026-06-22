# BirdCLEF+ 2026 — Class Imbalance Experiments
**Course:** COSE47400  
**Team Member:** Saanvi (2024120091)  
**Focus:** Class Imbalance & Loss Strategy

## Experiments

| Experiment | Description | Final AUC |
|---|---|---|
| Exp01 Baseline | BCEWithLogitsLoss uniform | 0.988 |
| Exp02 Weighted Loss | pos_weight inverse frequency | 0.980 |
| Exp03 Sampler | WeightedRandomSampler | 0.982 |
| Exp04 Combined | Weighted Loss + Sampler | 0.977 |
| Exp05 Focal Loss | FocalLoss α=1 γ=2 | 0.989 |

## Key Finding
Focal Loss (γ=2) achieved the best results — Val AUC 0.989 
and MacroF1 0.711, meaning 71% of rare species correctly detected.

## Environment
- GPU: A100 20GB (Elice Cloud)
- Framework: PyTorch 2.1.0
- Backbone: EfficientNetV2-B0 (timm)