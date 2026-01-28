# Hytale - Avoine (Oats) - Résumé Technique Complet

## 📋 Informations du Projet

- **Nom du projet** : Ajout de la céréale Avoine dans Hytale
- **Version** : 1.0
- **Date** : 28 janvier 2026
- **Phase actuelle** : Phase 1 - Caractéristiques de base
- **Statut** : ✅ Spécifications complètes - Prêt pour tests d'intégration

---

## 🎯 Objectifs

L'avoine enrichit le système agricole de Hytale en offrant :

1. **Une culture spécialisée pour l'élevage** - Différenciation claire avec le blé
2. **Une option accessible** - Tier 1, croissance rapide (4 jours)
3. **Un gameplay orienté animaux** - Nourriture premium pour montures
4. **Une synergie avec les systèmes existants** - S'intègre naturellement

---

## 📊 Données Clés

### Croissance
- **Temps total** : 4 jours de jeu (96h réelles)
- **Stades** : 4 (Germination → Jeune pousse → Croissance → Maturité)
- **Bonus eau** : +15% vitesse
- **Bonus pluie** : +10% vitesse

### Rendement (Stade 4 - Maturité)
- **Grains** : 3-4 (80% chance de 4)
- **Graines** : 1-2 (70% chance de 2)
- **Fortune III max** : 4-7 grains

### Acquisition
- **Achat** : 12 Essence de Vie pour 4 graines (Tier 1)
- **Loot villages** : 15-20% dans coffres agricoles
- **Herbe sauvage** : 5% de drop dans prairies

---

## 🎨 Spécifications Visuelles

### Palette de Couleurs

| Stade | Couleur Principale | Code Hex |
|-------|-------------------|----------|
| 1 - Germination | Vert lime | #90EE90 |
| 2 - Jeune pousse | Vert forêt | #228B22 |
| 3 - Croissance | Transition vert→jaune | #228B22 → #F0E68C |
| 4 - Maturité | Beige doré | #DAA520 |

### Hauteurs

| Stade | Hauteur (blocs) |
|-------|-----------------|
| 1 | 0.15 |
| 2 | 0.40 |
| 3 | 0.70 |
| 4 | 0.90-1.00 |

### Caractéristiques Visuelles Distinctives
- **Épis pendants** (différent du blé qui a des épis droits)
- **Couleur beige doré** (vs jaune vif du blé)
- **Particules dorées** au stade 4 quand le vent souffle
- **Grains visibles** individuellement à maturité

---

## ⚙️ Mécaniques de Jeu

### Conditions de Croissance

✅ **Requis** :
- Terre labourée (houe sur terre)
- Lumière niveau 9+ (soleil ou torches)
- Espace libre au-dessus

✅ **Optionnel** (bonus) :
- Eau dans rayon de 4 blocs : +15% croissance
- Pluie active : +10% croissance

❌ **Incompatible** :
- Désert extrême
- Toundra gelée
- Nether/End

### Configuration Optimale (9×9)

```
□ □ □ □ □ □ □ □ □
□ ■ ■ ■ ■ ■ ■ ■ □
□ ■ ■ ■ ■ ■ ■ ■ □
□ ■ ■ ■ ■ ■ ■ ■ □
□ ■ ■ ■ 💧 ■ ■ ■ □
□ ■ ■ ■ ■ ■ ■ ■ □
□ ■ ■ ■ ■ ■ ■ ■ □
□ ■ ■ ■ ■ ■ ■ ■ □
□ □ □ □ □ □ □ □ □

💧 = Eau centrale
■ = Terre labourée (80 plants)
□ = Bordure / Chemin
```

---

## 📈 Progression et Équilibrage

### ROI (Retour sur Investissement)

**Setup initial (80 plants)** :
- Coût : 240 Essence de Vie
- Première récolte (4 jours) : ~300 grains + ~136 graines
- ROI complet : 2 récoltes (8 jours)

### Comparaison Avoine vs Blé

| Métrique | Avoine | Blé | Avantage |
|----------|--------|-----|----------|
| Croissance | 4 jours | 5 jours | ✅ Avoine +20% |
| Grains/plant | 3-4 | 2-3 | ✅ Avoine |
| Tier | 1 | 1 | = |
| Usage principal | Animaux | Pain | Différenciation |

---

## 🗂️ Structure des Fichiers

```
hytale_farming/
│
├── README.md                           # Documentation principale
│
├── docs/                               # Documents de design
│   └── Hytale_Avoine_Design_Doc.docx   # Document Word complet
│
├── specs/                              # Spécifications détaillées
│   ├── oat_visual_specs.md             # Apparence visuelle
│   ├── oat_mechanics_specs.md          # Mécaniques de jeu
│   ├── oat_acquisition_specs.md        # Obtention des graines
│   └── PROJECT_SUMMARY.md              # Ce fichier
│
├── assets/                             # Ressources (à créer)
│   └── textures/                       # Textures de l'avoine
│
└── scripts/                            # Scripts utilitaires
    └── generate_design_doc.js          # Générateur Word
```

---

## ✅ Phase 1 - Checklist de Validation

### Spécifications Complètes
- [x] Apparence visuelle (4 stades détaillés)
- [x] Statistiques de culture (temps, conditions, rendement)
- [x] Méthodes d'acquisition (5 méthodes documentées)
- [x] Équilibrage vs cultures existantes
- [x] Documentation technique complète

### Documents Livrables
- [x] README.md du projet
- [x] Spécifications visuelles (Markdown)
- [x] Spécifications mécaniques (Markdown)
- [x] Spécifications d'acquisition (Markdown)
- [x] Résumé de projet (ce document)
- [ ] Document Word de design (en cours)

### Prochaines Étapes (Phase 2)
- [ ] Définir les recettes culinaires
- [ ] Spécifier l'utilisation pour l'élevage
- [ ] Créer le système de crafting
- [ ] Intégration économique
- [ ] Tests de gameplay

---

## 📝 Notes d'Implémentation

### Variables Configurables

```javascript
// Croissance
const OAT_GROWTH_TIME = 4.0;          // jours
const OAT_WATER_BONUS = 0.15;         // +15%
const OAT_RAIN_BONUS = 0.10;          // +10%

// Rendement
const OAT_GRAIN_MIN = 3;
const OAT_GRAIN_MAX = 4;
const OAT_SEED_MIN = 1;
const OAT_SEED_MAX = 2;

// Acquisition
const OAT_SEED_COST = 12;             // Essence de Vie (pack de 4)
const OAT_VILLAGE_LOOT_CHANCE = 0.15; // 15%
```

### Points d'Attention
1. **Performance** : Optimiser le rendu en grands champs (instancing)
2. **Différenciation** : S'assurer que l'avoine est visuellement distincte du blé
3. **Équilibrage** : Tester le ROI et ajuster si nécessaire
4. **UX** : Le stade mature doit être clairement identifiable

---

## 🔗 Références

### Documents Connexes
- `oat_visual_specs.md` - Détails visuels complets
- `oat_mechanics_specs.md` - Toutes les mécaniques de jeu
- `oat_acquisition_specs.md` - Méthodes d'obtention détaillées
- `README.md` - Vue d'ensemble du projet

### Systèmes Hytale Liés
- Système de farming (Établi de Fermier)
- Système d'élevage (à détailler en Phase 2)
- Système économique (Essence de Vie, Commerce)
- Système météorologique (Bonus de pluie)

---

## 📞 Contact et Contribution

**Statut actuel** : 🟡 Phase 1 complète, en attente de validation

**Pour toute question** :
- Créer une issue dans le dépôt
- Consulter les specs détaillées
- Référencer ce document de résumé

---

**Version** : 1.0  
**Dernière mise à jour** : 28 janvier 2026  
**Auteur** : Équipe Game Design - Système Agricole  
**Révision** : En attente
