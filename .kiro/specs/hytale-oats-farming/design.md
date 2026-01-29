# Document de Conception - Système de Culture d'Avoine Hytale

## Vue d'Ensemble

Le système de culture d'avoine est une fonctionnalité agricole complète pour Hytale qui permet aux joueurs de cultiver, récolter et gérer des plants d'avoine. Ce système s'intègre aux mécaniques existantes de farming tout en offrant des caractéristiques uniques qui le distinguent du blé.

### Objectifs de Conception

1. **Système de croissance temporel**: Implémenter un système de progression en 4 stades avec gestion du temps de jeu
2. **Rendu visuel distinctif**: Créer des représentations visuelles claires et différenciées du blé
3. **Système de rendement probabiliste**: Générer des récompenses avec randomisation contrôlée
4. **Bonus environnementaux**: Calculer et appliquer des modificateurs basés sur l'eau et la météo
5. **Validation de conditions**: Vérifier les prérequis de plantation et de croissance
6. **Acquisition multi-sources**: Gérer plusieurs méthodes d'obtention de graines

### Contraintes Techniques

- Compatibilité avec le système de chunks de Hytale
- Performance optimisée pour des fermes de 80+ plants
- Persistance de l'état entre les sessions
- Intégration avec le système d'enchantements existant
- Support du système météorologique de Hytale

## Architecture

### Architecture Globale

Le système suit une architecture modulaire avec séparation des responsabilités:

```
┌─────────────────────────────────────────────────────────┐
│                    Couche Interface                      │
│  (Interactions Joueur, Commandes, Events)               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  Couche Logique Métier                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Moteur     │  │ Calculateur  │  │ Validateur   │  │
│  │  Croissance  │  │  Rendement   │  │ Conditions   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Calculateur  │  │ Gestionnaire │  │ Gestionnaire │  │
│  │    Bonus     │  │  Acquisition │  │   Biomes     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   Couche Rendu                           │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │   Moteur     │  │ Gestionnaire │                     │
│  │    Rendu     │  │  Particules  │                     │
│  └──────────────┘  └──────────────┘                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                  Couche Persistance                      │
│  (Sauvegarde État, Chargement Chunks)                   │
└─────────────────────────────────────────────────────────┘
```

### Flux de Données Principaux

**Flux de Plantation:**
```
Joueur plante graine
    → Validateur_Conditions vérifie sol/biome
    → Gestionnaire_Biomes valide le biome
    → Système_Avoine crée plant au stade 1
    → Moteur_Rendu affiche le plant
```

**Flux de Croissance:**
```
Tick de jeu
    → Moteur_Croissance vérifie conditions (lumière, espace)
    → Calculateur_Bonus calcule multiplicateurs (eau, pluie)
    → Moteur_Croissance met à jour progression
    → Si stade complété: progression au stade suivant
    → Moteur_Rendu met à jour l'affichage
```

**Flux de Récolte:**
```
Joueur récolte plant
    → Vérification stade du plant
    → Calculateur_Rendement génère grains/graines
    → Application de Fortune si présent
    → Système_Avoine retire le plant
    → Items ajoutés à l'inventaire
```

## Composants et Interfaces

### 1. Système_Avoine (Composant Principal)

**Responsabilités:**
- Orchestration des composants
- Gestion du cycle de vie des plants
- Interface avec le moteur de jeu Hytale

**Interface:**
```typescript
interface OatSystem {
  // Gestion des plants
  plantSeed(position: BlockPosition, player: Player): PlantResult;
  removePlant(position: BlockPosition): void;
  getPlant(position: BlockPosition): OatPlant | null;
  
  // Cycle de vie
  onTick(deltaTime: number): void;
  onChunkLoad(chunk: Chunk): void;
  onChunkUnload(chunk: Chunk): void;
  
  // Événements
  onPlantHarvested(position: BlockPosition, player: Player): HarvestResult;
  onBlockBroken(position: BlockPosition): void;
}

type PlantResult = 
  | { success: true; plant: OatPlant }
  | { success: false; reason: PlantFailureReason };

enum PlantFailureReason {
  INVALID_SOIL,
  INVALID_BIOME,
  OBSTRUCTED_SPACE,
  ALREADY_PLANTED
}
```

### 2. Moteur_Croissance

**Responsabilités:**
- Progression temporelle des plants
- Application des bonus de croissance
- Gestion des transitions de stades

**Interface:**
```typescript
interface GrowthEngine {
  // Progression
  updateGrowth(plant: OatPlant, deltaTime: number, bonuses: GrowthBonuses): void;
  canGrow(plant: OatPlant): boolean;
  
  // Calculs
  calculateStageProgress(plant: OatPlant, deltaTime: number, bonuses: GrowthBonuses): number;
  shouldAdvanceStage(plant: OatPlant): boolean;
  advanceStage(plant: OatPlant): void;
}

interface GrowthBonuses {
  waterBonus: number;    // 1.0 (aucun) ou 1.15 (avec eau)
  rainBonus: number;     // 1.0 (aucun) ou 1.10 (avec pluie)
}
```

**Algorithme de Croissance:**
```
Pour chaque tick de jeu:
  1. Vérifier si le plant peut croître (lumière, espace)
  2. Si non: retourner sans progression
  3. Calculer les bonus (eau, pluie)
  4. Calculer progression = deltaTime * (1 + waterBonus + rainBonus)
  5. Ajouter progression au temps écoulé du stade actuel
  6. Si temps écoulé >= temps requis pour le stade:
     - Passer au stade suivant
     - Réinitialiser le temps écoulé
     - Mettre à jour le rendu
```

### 3. Calculateur_Rendement

**Responsabilités:**
- Génération aléatoire des drops
- Application de l'enchantement Fortune
- Calcul des rendements par stade

**Interface:**
```typescript
interface YieldCalculator {
  // Calcul principal
  calculateYield(plant: OatPlant, fortuneLevel: number): HarvestYield;
  
  // Calculs spécifiques
  calculateGrainCount(stage: GrowthStage, fortuneLevel: number): number;
  calculateSeedCount(stage: GrowthStage): number;
}

interface HarvestYield {
  grains: number;
  seeds: number;
}

enum GrowthStage {
  GERMINATION = 1,
  YOUNG_SPROUT = 2,
  GROWTH = 3,
  MATURITY = 4
}
```

**Algorithme de Rendement:**
```
Fonction calculateYield(plant, fortuneLevel):
  Si plant.stage < MATURITY:
    retourner { grains: 0, seeds: 1 }
  
  // Calcul des grains
  baseMin = 3
  baseMax = 4
  
  Si fortuneLevel > 0:
    max = baseMax + fortuneLevel  // Fortune I: 5, II: 6, III: 7
    min = baseMax                  // Minimum garanti: 4
  Sinon:
    max = baseMax
    min = baseMin
  
  // Probabilité pour grains
  Si fortuneLevel == 0:
    grains = (random() < 0.80) ? 4 : 3
  Sinon:
    grains = randomInt(min, max)
  
  // Calcul des graines (non affecté par Fortune)
  seeds = (random() < 0.70) ? 2 : 1
  
  retourner { grains, seeds }
```

### 4. Validateur_Conditions

**Responsabilités:**
- Vérification des conditions de plantation
- Vérification des conditions de croissance
- Validation de l'environnement

**Interface:**
```typescript
interface ConditionValidator {
  // Validation plantation
  canPlant(position: BlockPosition): ValidationResult;
  isValidSoil(block: Block): boolean;
  hasSpaceAbove(position: BlockPosition): boolean;
  
  // Validation croissance
  canGrow(position: BlockPosition): ValidationResult;
  getLightLevel(position: BlockPosition): number;
  isExposedToSky(position: BlockPosition): boolean;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
}
```

**Règles de Validation:**
```
Plantation:
  - Bloc en dessous DOIT être Terre_Labourée
  - Espace au-dessus DOIT être libre (air)
  - Biome DOIT être compatible

Croissance:
  - Niveau de lumière >= 9
  - Espace au-dessus libre
  - Terre labourée toujours présente
```

### 5. Calculateur_Bonus

**Responsabilités:**
- Détection de l'eau à proximité
- Détection de la pluie
- Calcul des multiplicateurs

**Interface:**
```typescript
interface BonusCalculator {
  // Détection
  hasWaterNearby(position: BlockPosition, radius: number): boolean;
  isRaining(position: BlockPosition): boolean;
  
  // Calcul
  calculateBonuses(position: BlockPosition): GrowthBonuses;
}
```

**Algorithme de Détection d'Eau:**
```
Fonction hasWaterNearby(position, radius):
  Pour x de -radius à +radius:
    Pour z de -radius à +radius:
      Si abs(x) + abs(z) <= radius:  // Distance Manhattan
        checkPos = position + (x, 0, z)
        Si getBlock(checkPos) est Eau:
          retourner true
  retourner false
```

### 6. Gestionnaire_Biomes

**Responsabilités:**
- Vérification de compatibilité des biomes
- Liste des biomes interdits

**Interface:**
```typescript
interface BiomeManager {
  isCompatibleBiome(biome: Biome): boolean;
  getIncompatibleBiomes(): Biome[];
}
```

**Biomes Incompatibles:**
- Désert Extrême (EXTREME_DESERT)
- Toundra Gelée (FROZEN_TUNDRA)
- Nether (NETHER)
- End (END)

### 7. Gestionnaire_Acquisition

**Responsabilités:**
- Gestion des achats de graines
- Génération de loot dans les coffres
- Drops d'herbe sauvage

**Interface:**
```typescript
interface AcquisitionManager {
  // Achat
  purchaseSeeds(player: Player, quantity: number): PurchaseResult;
  getSeedPrice(): number;  // Retourne 12 Essence_Vie pour 4 graines
  
  // Loot
  generateVillageLoot(chest: Chest): void;
  shouldGenerateOatSeeds(): boolean;  // 15-20% chance
  
  // Drops herbe
  onGrassBreak(position: BlockPosition, biome: Biome): ItemDrop[];
}

interface PurchaseResult {
  success: boolean;
  seedsReceived?: number;
  reason?: string;
}
```

### 8. Moteur_Rendu

**Responsabilités:**
- Affichage visuel des plants
- Gestion des couleurs et hauteurs
- Rendu des épis pendants

**Interface:**
```typescript
interface RenderEngine {
  // Rendu principal
  renderPlant(plant: OatPlant, position: BlockPosition): void;
  updatePlantVisuals(plant: OatPlant): void;
  
  // Propriétés visuelles
  getStageColor(stage: GrowthStage): Color;
  getStageHeight(stage: GrowthStage): number;
  getEarOrientation(stage: GrowthStage): Orientation;
}

interface Color {
  hex: string;
  r: number;
  g: number;
  b: number;
}

enum Orientation {
  UPRIGHT,
  DROOPING
}
```

**Spécifications Visuelles par Stade:**
```
Stade 1 (Germination):
  - Couleur: #90EE90 (vert lime)
  - Hauteur: 0.15 blocs
  - Forme: Petite pousse simple

Stade 2 (Jeune Pousse):
  - Couleur: #228B22 (vert forêt)
  - Hauteur: 0.40 blocs
  - Forme: Tige avec premières feuilles

Stade 3 (Croissance):
  - Couleur: Gradient #228B22 → #F0E68C
  - Hauteur: 0.70 blocs
  - Forme: Tige développée, début d'épis

Stade 4 (Maturité):
  - Couleur: #DAA520 (beige doré)
  - Hauteur: 0.90-1.00 blocs (variation aléatoire)
  - Forme: Épis pendants complets
  - Grains individuels visibles
```

### 9. Gestionnaire_Particules

**Responsabilités:**
- Génération de particules dorées
- Gestion de la fréquence d'apparition
- Optimisation des performances

**Interface:**
```typescript
interface ParticleManager {
  // Génération
  spawnWindParticles(position: BlockPosition): void;
  shouldSpawnParticles(plant: OatPlant, windActive: boolean): boolean;
  
  // Configuration
  getParticleCount(): number;  // 3-5 particules
  getSpawnInterval(): number;  // 0.5-2 secondes
}
```

## Modèles de Données

### OatPlant (Structure Principale)

```typescript
interface OatPlant {
  // Identification
  id: string;                    // UUID unique
  position: BlockPosition;       // Position dans le monde
  
  // État de croissance
  stage: GrowthStage;            // Stade actuel (1-4)
  stageProgress: number;         // Temps écoulé dans le stade (en secondes)
  totalAge: number;              // Âge total du plant (en secondes)
  
  // Métadonnées
  plantedAt: number;             // Timestamp de plantation
  lastUpdateTime: number;        // Dernier tick de mise à jour
  
  // État visuel
  visualHeight: number;          // Hauteur actuelle pour le rendu
  particleTimer: number;         // Timer pour les particules
}
```

### BlockPosition

```typescript
interface BlockPosition {
  x: number;
  y: number;
  z: number;
  world: string;                 // Identifiant du monde
  chunk: ChunkCoordinates;       // Coordonnées du chunk
}

interface ChunkCoordinates {
  chunkX: number;
  chunkZ: number;
}
```

### Configuration du Système

```typescript
interface OatSystemConfig {
  // Temps de croissance
  baseGrowthTime: number;        // 4 jours = 96 heures = 345600 secondes
  stageDistribution: number[];   // [0.25, 0.25, 0.25, 0.25] - temps par stade
  
  // Bonus
  waterBonusMultiplier: number;  // 1.15 (+15%)
  rainBonusMultiplier: number;   // 1.10 (+10%)
  waterDetectionRadius: number;  // 4 blocs
  
  // Rendement
  grainMinBase: number;          // 3
  grainMaxBase: number;          // 4
  grainHighChance: number;       // 0.80 (80% pour 4 grains)
  seedMinBase: number;           // 1
  seedMaxBase: number;           // 2
  seedHighChance: number;        // 0.70 (70% pour 2 graines)
  
  // Fortune
  fortuneGrainBonus: number[];   // [0, 1, 2, 3] pour Fortune 0-III
  fortuneMinGrains: number;      // 4 (minimum avec Fortune)
  
  // Conditions
  minLightLevel: number;         // 9
  
  // Acquisition
  seedPurchasePrice: number;     // 12 Essence_Vie
  seedPurchaseQuantity: number;  // 4 graines
  villageLootChanceMin: number;  // 0.15 (15%)
  villageLootChanceMax: number;  // 0.20 (20%)
  villageLootQuantityMin: number; // 2 graines
  villageLootQuantityMax: number; // 6 graines
  grassDropChance: number;       // 0.05 (5%)
  
  // Particules
  particleCountMin: number;      // 3
  particleCountMax: number;      // 5
  particleIntervalMin: number;   // 0.5 secondes
  particleIntervalMax: number;   // 2.0 secondes
  
  // Biomes incompatibles
  incompatibleBiomes: string[];  // ["EXTREME_DESERT", "FROZEN_TUNDRA", "NETHER", "END"]
}
```

### Données de Persistance

```typescript
interface OatPlantSaveData {
  id: string;
  position: BlockPosition;
  stage: number;
  stageProgress: number;
  totalAge: number;
  plantedAt: number;
  lastUpdateTime: number;
}

interface ChunkOatData {
  chunkCoords: ChunkCoordinates;
  plants: OatPlantSaveData[];
  version: number;              // Version du format de sauvegarde
}
```

### Structures d'Événements

```typescript
interface PlantEvent {
  type: PlantEventType;
  plant: OatPlant;
  timestamp: number;
}

enum PlantEventType {
  PLANTED,
  STAGE_ADVANCED,
  HARVESTED,
  DESTROYED,
  GROWTH_BLOCKED
}

interface HarvestEvent extends PlantEvent {
  type: PlantEventType.HARVESTED;
  yield: HarvestYield;
  fortuneLevel: number;
  player: Player;
}
```


## Propriétés de Correction

*Une propriété est une caractéristique ou un comportement qui doit être vrai pour toutes les exécutions valides d'un système - essentiellement, une déclaration formelle sur ce que le système devrait faire. Les propriétés servent de pont entre les spécifications lisibles par l'humain et les garanties de correction vérifiables par machine.*

### Propriété 1: Initialisation au Stade 1

*Pour tout* plant d'avoine nouvellement planté à une position valide, le stade initial doit être 1 (Germination) et le temps de progression doit être 0.

**Valide: Exigences 1.2**

### Propriété 2: Progression Séquentielle des Stades

*Pour tout* plant d'avoine à un stade donné (1-3), lorsque le temps requis pour ce stade est atteint, le plant doit progresser exactement au stade suivant (stade + 1).

**Valide: Exigences 1.3**

### Propriété 3: Arrêt à Maturité

*Pour tout* plant d'avoine au stade 4 (Maturité), quel que soit le temps écoulé supplémentaire, le stade doit rester 4 et ne jamais progresser au-delà.

**Valide: Exigences 1.4**

### Propriété 4: Persistance Round-Trip

*Pour tout* plant d'avoine avec un état de croissance donné, sauvegarder puis restaurer le plant doit produire un état équivalent (même stade, même progression, même position).

**Valide: Exigences 1.5, 15.1, 15.2, 15.3, 15.4**

### Propriété 5: Application du Bonus d'Eau

*Pour tout* plant d'avoine, si de l'eau est présente dans un rayon de 4 blocs (distance Manhattan), le multiplicateur de vitesse de croissance doit être 1.15, sinon 1.0.

**Valide: Exigences 2.2, 11.2, 11.3**

### Propriété 6: Application du Bonus de Pluie

*Pour tout* plant d'avoine exposé au ciel, si la pluie est active, le multiplicateur de vitesse de croissance doit être 1.10, sinon 1.0. Si le plant est couvert, le multiplicateur doit être 1.0 même avec pluie.

**Valide: Exigences 2.3, 12.1, 12.2, 12.3, 12.4**

### Propriété 7: Cumul Additif des Bonus

*Pour tout* plant d'avoine, lorsque plusieurs bonus sont actifs (eau et pluie), le multiplicateur total doit être la somme des bonus individuels (ex: 1.0 + 0.15 + 0.10 = 1.25).

**Valide: Exigences 2.4**

### Propriété 8: Rendement de Grains pour Plants Matures

*Pour tout* plant d'avoine au stade 4 récolté sans Fortune, le nombre de grains générés doit être entre 3 et 4 inclus.

**Valide: Exigences 4.1**

### Propriété 9: Distribution Probabiliste des Grains

*Pour tout* ensemble de 1000 plants d'avoine au stade 4 récoltés sans Fortune, environ 80% (±5%) doivent générer 4 grains et environ 20% (±5%) doivent générer 3 grains.

**Valide: Exigences 4.2**

### Propriété 10: Rendement de Graines pour Plants Matures

*Pour tout* plant d'avoine au stade 4 récolté, le nombre de graines générées doit être entre 1 et 2 inclus.

**Valide: Exigences 4.3**

### Propriété 11: Distribution Probabiliste des Graines

*Pour tout* ensemble de 1000 plants d'avoine au stade 4 récoltés, environ 70% (±5%) doivent générer 2 graines et environ 30% (±5%) doivent générer 1 graine.

**Valide: Exigences 4.4**

### Propriété 12: Rendement des Plants Immatures

*Pour tout* plant d'avoine aux stades 1, 2 ou 3 récolté, le rendement doit être exactement 0 grains et 1 graine.

**Valide: Exigences 4.5**

### Propriété 13: Suppression après Récolte

*Pour tout* plant d'avoine récolté à n'importe quel stade, le plant ne doit plus exister à sa position après la récolte.

**Valide: Exigences 4.6**

### Propriété 14: Effet de Fortune sur le Maximum

*Pour tout* plant d'avoine au stade 4 récolté avec Fortune niveau N (1-3), le nombre maximum de grains possibles doit être 4 + N (Fortune I: 5, Fortune II: 6, Fortune III: 7).

**Valide: Exigences 5.1, 5.2, 5.3**

### Propriété 15: Minimum Garanti avec Fortune

*Pour tout* plant d'avoine au stade 4 récolté avec Fortune (niveau 1-3), le nombre de grains générés doit être au minimum 4.

**Valide: Exigences 5.4**

### Propriété 16: Fortune N'Affecte Pas les Graines

*Pour tout* plant d'avoine au stade 4 récolté, le nombre de graines générées doit être identique avec ou sans Fortune (toujours entre 1 et 2).

**Valide: Exigences 5.5**

### Propriété 17: Validation du Sol

*Pour toute* tentative de plantation d'une graine d'avoine, si le bloc en dessous n'est pas de la Terre_Labourée, la plantation doit échouer.

**Valide: Exigences 6.1, 6.2**

### Propriété 18: Exigence de Lumière pour la Croissance

*Pour tout* plant d'avoine, si le niveau de lumière à sa position est inférieur à 9, la croissance doit être suspendue (progression = 0).

**Valide: Exigences 6.3, 6.4**

### Propriété 19: Exigence d'Espace Libre

*Pour tout* plant d'avoine, si l'espace au-dessus du plant est obstrué par un bloc solide, la croissance doit être suspendue (progression = 0).

**Valide: Exigences 6.5, 6.6**

### Propriété 20: Autorisation dans Biomes Compatibles

*Pour tout* biome qui n'est pas dans la liste des biomes incompatibles (Désert Extrême, Toundra Gelée, Nether, End), la plantation d'avoine doit être autorisée.

**Valide: Exigences 7.5**

### Propriété 21: Transaction d'Achat Complète

*Pour tout* joueur avec au moins 12 Essence_Vie, l'achat de graines d'avoine doit déduire exactement 12 Essence_Vie et ajouter exactement 4 graines à l'inventaire.

**Valide: Exigences 8.2, 8.3**

### Propriété 22: Prévention d'Achat Insuffisant

*Pour tout* joueur avec moins de 12 Essence_Vie, la tentative d'achat de graines d'avoine doit échouer sans modifier l'inventaire.

**Valide: Exigences 8.4**

### Propriété 23: Probabilité de Loot de Village

*Pour tout* ensemble de 1000 coffres agricoles de village générés, entre 15% et 20% doivent contenir des graines d'avoine.

**Valide: Exigences 9.1**

### Propriété 24: Quantité de Loot de Village

*Pour tout* coffre agricole de village contenant des graines d'avoine, le nombre de graines doit être entre 2 et 6 inclus.

**Valide: Exigences 9.2**

### Propriété 25: Exclusivité des Coffres Agricoles

*Pour tout* coffre de village de type non-agricole, la probabilité de contenir des graines d'avoine doit être 0%.

**Valide: Exigences 9.3**

### Propriété 26: Probabilité de Drop d'Herbe en Prairie

*Pour tout* ensemble de 1000 blocs d'herbe sauvage détruits dans un biome Prairie, environ 5% (±2%) doivent dropper 1 graine d'avoine.

**Valide: Exigences 10.1**

### Propriété 27: Absence de Drop Hors Prairie

*Pour tout* bloc d'herbe sauvage détruit dans un biome qui n'est pas Prairie, aucune graine d'avoine ne doit être droppée.

**Valide: Exigences 10.2**

### Propriété 28: Quantité de Drop d'Herbe

*Pour tout* bloc d'herbe sauvage qui droppe des graines d'avoine, le nombre de graines droppées doit être exactement 1.

**Valide: Exigences 10.3**

### Propriété 29: Intervalle de Particules

*Pour tout* plant d'avoine au stade 4 avec vent actif, l'intervalle entre deux générations de particules doit être entre 0.5 et 2.0 secondes.

**Valide: Exigences 14.3**

### Propriété 30: Nombre de Particules

*Pour tout* plant d'avoine au stade 4 générant des particules, le nombre de particules générées par événement doit être entre 3 et 5 inclus.

**Valide: Exigences 14.4**

## Gestion des Erreurs

### Stratégie Générale

Le système adopte une approche défensive avec validation précoce et messages d'erreur clairs:

1. **Validation à la Plantation**: Vérifier toutes les conditions avant de créer un plant
2. **Vérification Continue**: Valider les conditions de croissance à chaque tick
3. **Dégradation Gracieuse**: Suspendre la croissance plutôt que de supprimer les plants
4. **Logging Détaillé**: Enregistrer les erreurs pour le débogage

### Cas d'Erreur Spécifiques

#### Erreur: Sol Invalide

**Condition**: Tentative de plantation sur un bloc qui n'est pas de la Terre_Labourée

**Comportement**:
- Retourner `PlantResult.failure` avec raison `INVALID_SOIL`
- Ne pas consommer la graine
- Afficher un message au joueur: "L'avoine nécessite de la terre labourée"
- Logger l'événement avec la position et le type de bloc

#### Erreur: Biome Incompatible

**Condition**: Tentative de plantation dans un biome interdit

**Comportement**:
- Retourner `PlantResult.failure` avec raison `INVALID_BIOME`
- Ne pas consommer la graine
- Afficher un message au joueur: "L'avoine ne peut pas pousser dans ce biome"
- Logger le biome et la position

#### Erreur: Espace Obstrué

**Condition**: Bloc solide au-dessus de la position de plantation

**Comportement**:
- Retourner `PlantResult.failure` avec raison `OBSTRUCTED_SPACE`
- Ne pas consommer la graine
- Afficher un message au joueur: "Espace insuffisant pour planter"

#### Erreur: Fonds Insuffisants

**Condition**: Joueur tente d'acheter des graines sans assez d'Essence_Vie

**Comportement**:
- Retourner `PurchaseResult.failure` avec raison "Insufficient funds"
- Ne pas modifier l'inventaire
- Afficher le coût requis et le montant actuel
- Ne pas logger (comportement normal)

#### Erreur: Corruption de Données

**Condition**: Données de sauvegarde invalides lors du chargement d'un chunk

**Comportement**:
- Logger l'erreur avec détails complets
- Ignorer le plant corrompu
- Continuer le chargement des autres plants
- Notifier l'administrateur du serveur

#### Erreur: Lumière Insuffisante

**Condition**: Niveau de lumière < 9 pendant la croissance

**Comportement**:
- Suspendre la croissance (progression = 0)
- Ne pas afficher de message (comportement normal)
- Reprendre automatiquement quand la lumière revient
- Ne pas logger (trop fréquent)

### Gestion des Cas Limites

#### Cas: Plant à la Limite de Chunk

**Problème**: Plant positionné exactement à la frontière entre deux chunks

**Solution**:
- Assigner le plant au chunk contenant sa position (x, z)
- Lors du chargement, vérifier les chunks adjacents
- Éviter la duplication en utilisant l'UUID unique

#### Cas: Récolte Simultanée

**Problème**: Deux joueurs récoltent le même plant simultanément

**Solution**:
- Utiliser un verrou atomique sur le plant
- Premier joueur obtient le rendement
- Deuxième joueur reçoit un événement "already harvested"
- Pas de duplication d'items

#### Cas: Changement de Biome

**Problème**: Biome change après la plantation (rare mais possible)

**Solution**:
- Vérifier le biome uniquement à la plantation
- Plants existants continuent de pousser
- Cohérent avec le comportement de Minecraft

#### Cas: Débordement de Temps

**Problème**: Très long temps sans chargement du chunk (plusieurs mois)

**Solution**:
- Plafonner la progression à 100% du stade 4
- Éviter les débordements numériques
- Logger les cas extrêmes (> 30 jours)

## Stratégie de Test

### Approche Duale

Le système utilise une combinaison de tests unitaires et de tests basés sur les propriétés pour assurer une couverture complète:

- **Tests unitaires**: Vérifient des exemples spécifiques, des cas limites et des conditions d'erreur
- **Tests de propriétés**: Vérifient les propriétés universelles sur de nombreuses entrées générées aléatoirement
- Les deux approches sont complémentaires et nécessaires

### Équilibre des Tests Unitaires

Les tests unitaires doivent se concentrer sur:
- Des exemples spécifiques démontrant le comportement correct
- Les points d'intégration entre composants
- Les cas limites et conditions d'erreur
- Les scénarios de régression identifiés

Les tests de propriétés gèrent la couverture exhaustive des entrées, donc éviter trop de tests unitaires redondants.

### Configuration des Tests de Propriétés

**Bibliothèque**: fast-check (pour TypeScript/JavaScript)

**Configuration**:
- Minimum 100 itérations par test de propriété (en raison de la randomisation)
- Chaque test de propriété doit référencer sa propriété du document de conception
- Format de tag: `Feature: hytale-oats-farming, Property {number}: {property_text}`
- Chaque propriété de correction DOIT être implémentée par UN SEUL test de propriété

### Plan de Test par Composant

#### Moteur_Croissance

**Tests de Propriétés**:
- Propriété 2: Progression séquentielle (générer plants aléatoires à différents stades)
- Propriété 3: Arrêt à maturité (générer plants matures avec temps aléatoire)
- Propriété 5: Bonus d'eau (générer positions aléatoires avec/sans eau)
- Propriété 6: Bonus de pluie (générer plants aléatoires avec différentes conditions météo)
- Propriété 7: Cumul des bonus (générer combinaisons aléatoires de bonus)

**Tests Unitaires**:
- Temps de croissance exact de 4 jours sans bonus (Exigence 2.1)
- Distribution uniforme du temps entre stades (Exigence 2.5)
- Distance Manhattan pour détection d'eau (Exigence 11.4)

#### Calculateur_Rendement

**Tests de Propriétés**:
- Propriété 8: Rendement de grains (générer 1000 récoltes)
- Propriété 9: Distribution probabiliste grains (vérifier distribution sur 1000 échantillons)
- Propriété 10: Rendement de graines (générer 1000 récoltes)
- Propriété 11: Distribution probabiliste graines (vérifier distribution sur 1000 échantillons)
- Propriété 12: Rendement immature (générer plants aléatoires stades 1-3)
- Propriété 14: Fortune maximum (générer plants avec Fortune aléatoire)
- Propriété 15: Fortune minimum (générer plants avec Fortune aléatoire)
- Propriété 16: Fortune n'affecte pas graines (comparer avec/sans Fortune)

**Tests Unitaires**:
- Cas spécifiques pour chaque niveau de Fortune (I, II, III)
- Cas limite: récolte au stade 1, 2, 3

#### Validateur_Conditions

**Tests de Propriétés**:
- Propriété 17: Validation du sol (générer positions avec types de sol aléatoires)
- Propriété 18: Exigence de lumière (générer niveaux de lumière aléatoires)
- Propriété 19: Exigence d'espace (générer obstructions aléatoires)

**Tests Unitaires**:
- Cas limite: lumière exactement 9 (doit permettre croissance)
- Cas limite: lumière exactement 8 (doit bloquer croissance)

#### Gestionnaire_Biomes

**Tests de Propriétés**:
- Propriété 20: Autorisation biomes compatibles (générer biomes aléatoires compatibles)

**Tests Unitaires (Edge Cases)**:
- Désert Extrême doit bloquer (Exigence 7.1)
- Toundra Gelée doit bloquer (Exigence 7.2)
- Nether doit bloquer (Exigence 7.3)
- End doit bloquer (Exigence 7.4)

#### Gestionnaire_Acquisition

**Tests de Propriétés**:
- Propriété 21: Transaction d'achat (générer joueurs avec fonds suffisants)
- Propriété 22: Prévention achat (générer joueurs avec fonds insuffisants)
- Propriété 23: Probabilité loot village (générer 1000 coffres)
- Propriété 24: Quantité loot (générer coffres avec loot)
- Propriété 25: Exclusivité coffres agricoles (générer types de coffres aléatoires)
- Propriété 26: Probabilité drop herbe (générer 1000 blocs d'herbe en Prairie)
- Propriété 27: Absence drop hors Prairie (générer biomes aléatoires non-Prairie)
- Propriété 28: Quantité drop herbe (générer drops aléatoires)

**Tests Unitaires**:
- Prix exact: 12 Essence_Vie pour 4 graines (Exigence 8.1)

#### Moteur_Rendu

**Tests Unitaires**:
- Stade 1: couleur #90EE90, hauteur 0.15 (Exigence 3.1)
- Stade 2: couleur #228B22, hauteur 0.40 (Exigence 3.2)
- Stade 3: transition couleur, hauteur 0.70 (Exigence 3.3)
- Stade 4: couleur #DAA520, hauteur 0.90-1.00 (Exigence 3.4)
- Stade 4: épis pendants (Exigence 3.5)
- Stade 4 + vent: particules dorées (Exigence 3.6)
- Arrêt particules quand vent cesse (Exigence 14.2)

#### Gestionnaire_Particules

**Tests de Propriétés**:
- Propriété 29: Intervalle particules (générer événements aléatoires)
- Propriété 30: Nombre particules (générer générations aléatoires)

#### Système_Avoine (Intégration)

**Tests de Propriétés**:
- Propriété 1: Initialisation stade 1 (générer plantations aléatoires)
- Propriété 4: Persistance round-trip (générer plants aléatoires, sauvegarder/restaurer)
- Propriété 13: Suppression après récolte (générer récoltes aléatoires)

**Tests Unitaires**:
- Flux complet: plantation → croissance → récolte
- Gestion des erreurs pour chaque type d'échec
- Cas de corruption de données

### Générateurs de Données pour Tests de Propriétés

```typescript
// Générateurs fast-check
const arbOatPlant = fc.record({
  stage: fc.integer({ min: 1, max: 4 }),
  stageProgress: fc.float({ min: 0, max: 86400 }),
  position: arbBlockPosition
});

const arbBlockPosition = fc.record({
  x: fc.integer({ min: -1000, max: 1000 }),
  y: fc.integer({ min: 0, max: 255 }),
  z: fc.integer({ min: -1000, max: 1000 })
});

const arbFortuneLevel = fc.integer({ min: 0, max: 3 });

const arbLightLevel = fc.integer({ min: 0, max: 15 });

const arbBiome = fc.oneof(
  fc.constant("PLAINS"),
  fc.constant("FOREST"),
  fc.constant("EXTREME_DESERT"),
  fc.constant("FROZEN_TUNDRA")
);
```

### Métriques de Couverture

**Objectifs**:
- Couverture de code: > 90%
- Couverture des branches: > 85%
- Couverture des propriétés: 100% (toutes les 30 propriétés testées)
- Couverture des exigences: 100% (toutes les 60+ critères d'acceptation)

### Tests de Performance

**Scénarios**:
- Ferme de 80 plants: < 1ms par tick de croissance
- Ferme de 1000 plants: < 10ms par tick de croissance
- Chargement de chunk avec 100 plants: < 50ms
- Sauvegarde de chunk avec 100 plants: < 30ms

**Outils**:
- Profilage avec Chrome DevTools (pour JavaScript)
- Benchmarks avec Benchmark.js
- Tests de charge avec k6 ou Artillery

### Tests d'Intégration

**Scénarios**:
1. **Cycle Complet de Culture**:
   - Acheter graines → Planter → Attendre croissance → Récolter
   - Vérifier rendement et état final

2. **Persistance Multi-Session**:
   - Planter → Sauvegarder → Quitter → Recharger → Vérifier état
   - Tester avec différents stades de croissance

3. **Interaction avec Environnement**:
   - Planter près d'eau → Vérifier bonus
   - Planter sous pluie → Vérifier bonus
   - Obstruer plant → Vérifier suspension

4. **Acquisition Multi-Sources**:
   - Acheter graines → Vérifier inventaire
   - Générer village → Vérifier coffres
   - Casser herbe → Vérifier drops

### Stratégie de Régression

- Tous les bugs corrigés doivent avoir un test de régression
- Tests de régression ajoutés à la suite principale
- Exécution automatique sur chaque commit
- Blocage des merges si tests échouent
