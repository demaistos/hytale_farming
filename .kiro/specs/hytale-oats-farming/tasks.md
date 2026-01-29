# Plan d'Implémentation: Système de Culture d'Avoine Hytale

## Vue d'Ensemble

Ce plan décompose l'implémentation du système de culture d'avoine en tâches discrètes et incrémentales. Chaque tâche construit sur les précédentes et se termine par l'intégration du code. L'implémentation sera réalisée en TypeScript pour s'intégrer avec le moteur de jeu Hytale.

## Tâches

- [x] 1. Configurer la structure du projet et les interfaces de base
  - Créer la structure de dossiers pour le module farming-system (générique)
  - Définir les interfaces TypeScript abstraites pour les cultures (ICrop, ICropGrowth, ICropYield)
  - Créer une classe abstraite BaseCrop dont OatCrop héritera
  - Définir les interfaces communes (BlockPosition, GrowthStage, HarvestYield, etc.)
  - Configurer le framework de test (Jest + fast-check pour property-based testing)
  - Créer un système de configuration générique (CropConfig) extensible pour d'autres cultures
  - Implémenter OatSystemConfig qui étend CropConfig avec les valeurs spécifiques à l'avoine
  - _Exigences: 1.1, 1.2, 1.3, 1.4, 1.5_
  - _Note: Cette architecture permettra d'ajouter facilement du blé, du maïs, des tomates, etc._

- [x] 2. Implémenter les modèles de données et la persistance
  - [x] 2.1 Créer les structures de données génériques et spécifiques
    - Implémenter l'interface ICrop (générique pour toutes les cultures)
    - Implémenter la classe abstraite BaseCrop avec logique commune
    - Implémenter OatCrop qui étend BaseCrop avec spécificités de l'avoine
    - Implémenter l'interface BlockPosition avec coordonnées de chunk
    - Ajouter les méthodes de sérialisation/désérialisation génériques
    - _Exigences: 15.3_
    - _Note: BaseCrop pourra être réutilisé pour WheatCrop, CornCrop, TomatoCrop, etc._

  - [x] 2.2 Écrire le test de propriété pour la persistance round-trip
    - **Propriété 4: Persistance Round-Trip**
    - **Valide: Exigences 1.5, 15.1, 15.2, 15.3, 15.4**

  - [x] 2.3 Implémenter le système de sauvegarde/chargement de chunks générique
    - Créer ChunkCropData<T> générique pour stocker n'importe quelle culture
    - Implémenter CropPersistenceManager générique pour sauvegarder/restaurer
    - Spécialiser pour OatCrop avec ChunkOatData
    - Implémenter les méthodes de sauvegarde lors du déchargement de chunk
    - Implémenter les méthodes de restauration lors du chargement de chunk
    - Gérer la gestion des erreurs pour les données corrompues
    - _Exigences: 15.1, 15.2, 15.4_
    - _Note: Le système générique permettra de sauvegarder toutes les cultures de la même manière_

- [ ] 3. Implémenter le Validateur_Conditions générique
  - [x] 3.1 Créer la classe ConditionValidator générique avec validation du sol
    - Créer IConditionValidator<T> interface générique
    - Implémenter BaseConditionValidator avec logique commune
    - Implémenter OatConditionValidator qui spécialise pour l'avoine
    - Implémenter isValidSoil() configurable par type de culture
    - Implémenter hasSpaceAbove() réutilisable pour toutes les cultures
    - Implémenter canPlant() qui combine toutes les validations de plantation
    - _Exigences: 6.1, 6.2, 6.5_
    - _Note: D'autres cultures pourront avoir des exigences de sol différentes (ex: riz nécessite eau)_

  - [x] 3.2 Écrire le test de propriété pour la validation du sol
    - **Propriété 17: Validation du Sol**
    - **Valide: Exigences 6.1, 6.2**

  - [x] 3.3 Ajouter la validation des conditions de croissance
    - Implémenter getLightLevel() pour obtenir le niveau de lumière
    - Implémenter isExposedToSky() pour vérifier l'exposition au ciel
    - Implémenter canGrow() qui vérifie lumière et espace
    - _Exigences: 6.3, 6.4, 6.5, 6.6, 12.3_

  - [x] 3.4 Écrire les tests de propriété pour les conditions de croissance
    - **Propriété 18: Exigence de Lumière pour la Croissance**
    - **Valide: Exigences 6.3, 6.4**
    - **Propriété 19: Exigence d'Espace Libre**
    - **Valide: Exigences 6.5, 6.6**

  - [x] 3.5 Écrire les tests unitaires pour les cas limites de lumière
    - Tester lumière exactement 9 (doit permettre)
    - Tester lumière exactement 8 (doit bloquer)
    - _Exigences: 6.3, 6.4_

- [ ] 4. Implémenter le Gestionnaire_Biomes
  - [x] 4.1 Créer la classe BiomeManager avec liste des biomes incompatibles
    - Définir la liste des biomes interdits (EXTREME_DESERT, FROZEN_TUNDRA, NETHER, END)
    - Implémenter isCompatibleBiome() pour vérifier la compatibilité
    - Implémenter getIncompatibleBiomes() pour retourner la liste
    - _Exigences: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 4.2 Écrire le test de propriété pour les biomes compatibles
    - **Propriété 20: Autorisation dans Biomes Compatibles**
    - **Valide: Exigences 7.5**

  - [x] 4.3 Écrire les tests unitaires pour chaque biome incompatible
    - Tester Désert Extrême (doit bloquer)
    - Tester Toundra Gelée (doit bloquer)
    - Tester Nether (doit bloquer)
    - Tester End (doit bloquer)
    - _Exigences: 7.1, 7.2, 7.3, 7.4_

- [ ] 5. Implémenter le Calculateur_Bonus
  - [x] 5.1 Créer la classe BonusCalculator avec détection d'eau
    - Implémenter hasWaterNearby() avec distance Manhattan (rayon 4 blocs)
    - Implémenter isRaining() pour détecter la pluie active
    - Implémenter calculateBonuses() qui retourne GrowthBonuses
    - _Exigences: 2.2, 2.3, 11.1, 11.2, 11.4, 12.1, 12.3_

  - [x] 5.2 Écrire les tests de propriété pour les bonus
    - **Propriété 5: Application du Bonus d'Eau**
    - **Valide: Exigences 2.2, 11.2, 11.3**
    - **Propriété 6: Application du Bonus de Pluie**
    - **Valide: Exigences 2.3, 12.1, 12.2, 12.3, 12.4**
    - **Propriété 7: Cumul Additif des Bonus**
    - **Valide: Exigences 2.4**

  - [x] 5.3 Écrire le test unitaire pour la distance Manhattan
    - Tester des positions spécifiques d'eau à différentes distances
    - Vérifier que la distance diagonale n'est pas utilisée
    - _Exigences: 11.4_

- [x] 6. Checkpoint - Vérifier les validations et bonus
  - S'assurer que tous les tests passent
  - Vérifier que les validations bloquent correctement les cas invalides
  - Vérifier que les bonus sont calculés correctement
  - Demander à l'utilisateur si des questions se posent

- [ ] 7. Implémenter le Moteur_Croissance générique
  - [x] 7.1 Créer la classe GrowthEngine générique avec logique de progression
    - Créer IGrowthEngine<T> interface générique
    - Implémenter BaseGrowthEngine avec logique commune de progression
    - Implémenter OatGrowthEngine qui spécialise pour l'avoine
    - Implémenter calculateStageProgress() qui applique deltaTime et bonus
    - Implémenter shouldAdvanceStage() qui vérifie si le temps requis est atteint
    - Implémenter advanceStage() qui incrémente le stade et réinitialise la progression
    - Implémenter canGrow() qui utilise ConditionValidator
    - _Exigences: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_
    - _Note: Le moteur générique permettra des temps de croissance différents par culture_

  - [x] 7.2 Implémenter updateGrowth() avec gestion complète du cycle
    - Vérifier les conditions de croissance (lumière, espace)
    - Calculer les bonus (eau, pluie)
    - Mettre à jour la progression du stade
    - Gérer la transition entre stades
    - Arrêter la progression au stade 4
    - _Exigences: 1.3, 1.4, 6.3, 6.4, 6.5, 6.6_

  - [x] 7.3 Écrire les tests de propriété pour la croissance
    - **Propriété 2: Progression Séquentielle des Stades**
    - **Valide: Exigences 1.3**
    - **Propriété 3: Arrêt à Maturité**
    - **Valide: Exigences 1.4**

  - [x] 7.4 Écrire les tests unitaires pour les temps de croissance
    - Tester 4 jours de croissance sans bonus (doit atteindre stade 4)
    - Tester distribution uniforme du temps entre stades (25% chacun)
    - _Exigences: 2.1, 2.5_

- [ ] 8. Implémenter le Calculateur_Rendement générique
  - [x] 8.1 Créer la classe YieldCalculator générique avec génération de rendement
    - Créer IYieldCalculator<T> interface générique
    - Implémenter BaseYieldCalculator avec logique commune
    - Implémenter OatYieldCalculator qui spécialise pour l'avoine
    - Implémenter calculateItemCount() générique avec logique probabiliste configurable
    - Implémenter l'application de Fortune de manière générique
    - Implémenter calculateYield() qui combine tous les items (grains, graines, etc.)
    - Gérer le cas des plants immatures de manière configurable
    - _Exigences: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_
    - _Note: D'autres cultures auront des rendements différents (ex: tomates donnent 2-5 fruits)_

  - [x] 8.2 Écrire les tests de propriété pour le rendement de base
    - **Propriété 8: Rendement de Grains pour Plants Matures**
    - **Valide: Exigences 4.1**
    - **Propriété 9: Distribution Probabiliste des Grains**
    - **Valide: Exigences 4.2**
    - **Propriété 10: Rendement de Graines pour Plants Matures**
    - **Valide: Exigences 4.3**
    - **Propriété 11: Distribution Probabiliste des Graines**
    - **Valide: Exigences 4.4**

  - [x] 8.3 Écrire les tests de propriété pour les plants immatures et Fortune
    - **Propriété 12: Rendement des Plants Immatures**
    - **Valide: Exigences 4.5**
    - **Propriété 14: Effet de Fortune sur le Maximum**
    - **Valide: Exigences 5.1, 5.2, 5.3**
    - **Propriété 15: Minimum Garanti avec Fortune**
    - **Valide: Exigences 5.4**
    - **Propriété 16: Fortune N'Affecte Pas les Graines**
    - **Valide: Exigences 5.5**

  - [x] 8.4 Écrire les tests unitaires pour chaque niveau de Fortune
    - Tester Fortune I (max 5 grains)
    - Tester Fortune II (max 6 grains)
    - Tester Fortune III (max 7 grains)
    - _Exigences: 5.1, 5.2, 5.3_

- [ ] 9. Implémenter le Gestionnaire_Acquisition
  - [x] 9.1 Créer la classe AcquisitionManager avec système d'achat
    - Implémenter getSeedPrice() qui retourne 12 Essence_Vie
    - Implémenter purchaseSeeds() qui vérifie les fonds et effectue la transaction
    - Gérer le cas des fonds insuffisants
    - _Exigences: 8.1, 8.2, 8.3, 8.4_

  - [x] 9.2 Écrire les tests de propriété pour les achats
    - **Propriété 21: Transaction d'Achat Complète**
    - **Valide: Exigences 8.2, 8.3**
    - **Propriété 22: Prévention d'Achat Insuffisant**
    - **Valide: Exigences 8.4**

  - [x] 9.3 Écrire le test unitaire pour le prix exact
    - Vérifier que le prix est exactement 12 Essence_Vie pour 4 graines
    - _Exigences: 8.1_

  - [x] 9.4 Ajouter la génération de loot pour les villages
    - Implémenter shouldGenerateOatSeeds() avec probabilité 15-20%
    - Implémenter generateVillageLoot() qui ajoute 2-6 graines aux coffres agricoles
    - Vérifier que seuls les coffres agricoles reçoivent des graines
    - _Exigences: 9.1, 9.2, 9.3_

  - [x] 9.5 Écrire les tests de propriété pour le loot de village
    - **Propriété 23: Probabilité de Loot de Village**
    - **Valide: Exigences 9.1**
    - **Propriété 24: Quantité de Loot de Village**
    - **Valide: Exigences 9.2**
    - **Propriété 25: Exclusivité des Coffres Agricoles**
    - **Valide: Exigences 9.3**

  - [x] 9.6 Ajouter les drops d'herbe sauvage
    - Implémenter onGrassBreak() avec probabilité 5% en Prairie
    - Vérifier le biome avant de dropper
    - Générer exactement 1 graine quand drop
    - _Exigences: 10.1, 10.2, 10.3_

  - [x] 9.7 Écrire les tests de propriété pour les drops d'herbe
    - **Propriété 26: Probabilité de Drop d'Herbe en Prairie**
    - **Valide: Exigences 10.1**
    - **Propriété 27: Absence de Drop Hors Prairie**
    - **Valide: Exigences 10.2**
    - **Propriété 28: Quantité de Drop d'Herbe**
    - **Valide: Exigences 10.3**

- [x] 10. Checkpoint - Vérifier la logique métier
  - S'assurer que tous les tests de croissance et rendement passent
  - Vérifier que les distributions probabilistes sont correctes
  - Vérifier que l'acquisition fonctionne pour toutes les sources
  - Demander à l'utilisateur si des questions se posent

- [ ] 11. Implémenter le Moteur_Rendu générique
  - [x] 11.1 Créer la classe RenderEngine générique avec spécifications visuelles
    - Créer IRenderEngine<T> interface générique
    - Implémenter BaseRenderEngine avec logique commune de rendu
    - Implémenter OatRenderEngine qui spécialise pour l'avoine
    - Implémenter getStageVisuals() configurable par culture (couleur, hauteur, forme)
    - Implémenter renderCrop() générique qui applique les propriétés visuelles
    - Pour l'avoine: couleurs (lime, forêt, transition, beige doré) et hauteurs (0.15, 0.40, 0.70, 0.90-1.00)
    - Pour l'avoine: orientation DROOPING pour stade 4
    - _Exigences: 3.1, 3.2, 3.3, 3.4, 3.5, 13.1, 13.2_
    - _Note: Chaque culture aura ses propres couleurs et formes (ex: tomates rouges, maïs jaune vif)_

  - [x] 11.2 Écrire les tests unitaires pour chaque stade visuel
    - Tester stade 1: couleur #90EE90, hauteur 0.15
    - Tester stade 2: couleur #228B22, hauteur 0.40
    - Tester stade 3: transition couleur, hauteur 0.70
    - Tester stade 4: couleur #DAA520, hauteur 0.90-1.00
    - Tester stade 4: épis pendants (DROOPING)
    - _Exigences: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 12. Implémenter le Gestionnaire_Particules
  - [x] 12.1 Créer la classe ParticleManager avec génération de particules
    - Implémenter shouldSpawnParticles() qui vérifie stade 4 et vent actif
    - Implémenter spawnWindParticles() qui génère 3-5 particules dorées
    - Implémenter la logique de timer avec intervalle 0.5-2 secondes
    - Gérer l'arrêt des particules quand le vent cesse
    - _Exigences: 3.6, 14.1, 14.2, 14.3, 14.4_

  - [x] 12.2 Écrire les tests de propriété pour les particules
    - **Propriété 29: Intervalle de Particules**
    - **Valide: Exigences 14.3**
    - **Propriété 30: Nombre de Particules**
    - **Valide: Exigences 14.4**

  - [x] 12.3 Écrire les tests unitaires pour les particules
    - Tester génération avec stade 4 + vent (doit générer)
    - Tester arrêt quand vent cesse (doit arrêter)
    - _Exigences: 3.6, 14.1, 14.2_

- [ ] 13. Implémenter le Système de Culture principal (générique)
  - [x] 13.1 Créer la classe CropSystem générique avec orchestration des composants
    - Créer ICropSystem<T> interface générique
    - Implémenter BaseCropSystem<T> avec logique commune
    - Implémenter OatSystem qui spécialise BaseCropSystem pour l'avoine
    - Initialiser tous les composants (GrowthEngine, YieldCalculator, etc.)
    - Implémenter plantSeed() générique qui valide et crée un nouveau plant
    - Implémenter getCrop() et removeCrop() pour la gestion des plants
    - Créer une Map générique pour stocker les plants par position
    - _Exigences: 1.2, 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_
    - _Note: BaseCropSystem pourra être instancié pour WheatSystem, CornSystem, etc._

  - [x] 13.2 Écrire le test de propriété pour l'initialisation
    - **Propriété 1: Initialisation au Stade 1**
    - **Valide: Exigences 1.2**

  - [x] 13.3 Implémenter onTick() pour la mise à jour de croissance
    - Itérer sur tous les plants actifs
    - Appeler GrowthEngine.updateGrowth() pour chaque plant
    - Mettre à jour le rendu si le stade change
    - Gérer les erreurs de croissance
    - _Exigences: 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [x] 13.4 Implémenter onPlantHarvested() pour la récolte
    - Calculer le rendement avec YieldCalculator
    - Appliquer Fortune si présent
    - Retirer le plant du monde
    - Ajouter les items à l'inventaire du joueur
    - _Exigences: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 13.5 Écrire le test de propriété pour la suppression après récolte
    - **Propriété 13: Suppression après Récolte**
    - **Valide: Exigences 4.6**

  - [x] 13.6 Implémenter onChunkLoad() et onChunkUnload() pour la persistance
    - Sauvegarder tous les plants du chunk lors du déchargement
    - Restaurer tous les plants du chunk lors du chargement
    - Gérer les erreurs de corruption de données
    - _Exigences: 15.1, 15.2, 15.3, 15.4_

  - [x] 13.7 Écrire les tests unitaires pour la gestion des erreurs
    - Tester plantation sur sol invalide (doit échouer avec INVALID_SOIL)
    - Tester plantation dans biome incompatible (doit échouer avec INVALID_BIOME)
    - Tester plantation avec espace obstrué (doit échouer avec OBSTRUCTED_SPACE)
    - Tester corruption de données (doit logger et continuer)
    - _Exigences: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_

- [ ] 14. Intégration et câblage final
  - [x] 14.1 Intégrer le système de culture générique avec le moteur de jeu Hytale
    - Créer un CropRegistry pour enregistrer tous les types de cultures
    - Enregistrer OatSystem dans le CropRegistry
    - Connecter les événements de plantation, croissance et récolte de manière générique
    - Intégrer avec le système de chunks de Hytale
    - Intégrer avec le système d'inventaire
    - _Exigences: Toutes_
    - _Note: Le CropRegistry permettra d'ajouter facilement de nouvelles cultures sans modifier le code existant_

  - [x] 14.2 Ajouter les hooks pour les événements du jeu
    - Hook générique pour la plantation (clic droit avec graine de n'importe quelle culture)
    - Hook générique pour la récolte (clic gauche sur plant mature de n'importe quelle culture)
    - Hook pour le tick de jeu (mise à jour de croissance pour toutes les cultures)
    - Hook pour le chargement/déchargement de chunks (toutes les cultures)
    - _Exigences: Toutes_
    - _Note: Les hooks génériques détecteront automatiquement le type de culture_

  - [x] 14.3 Écrire les tests d'intégration end-to-end
    - Test: Cycle complet (acheter → planter → croître → récolter)
    - Test: Persistance multi-session (planter → sauvegarder → recharger)
    - Test: Interaction environnement (eau, pluie, lumière)
    - Test: Acquisition multi-sources (achat, village, herbe)
    - _Exigences: Toutes_

- [x] 15. Checkpoint final - Tests et validation
  - S'assurer que tous les tests passent (unitaires, propriétés, intégration)
  - Vérifier la couverture de code (objectif > 90%)
  - Vérifier que toutes les 30 propriétés sont testées
  - Vérifier que toutes les exigences sont couvertes
  - Effectuer des tests de performance (80 plants < 1ms, 1000 plants < 10ms)
  - Demander à l'utilisateur si des questions se posent

## Notes

- Toutes les tâches sont obligatoires pour une implémentation complète
- Chaque tâche référence les exigences spécifiques pour la traçabilité
- **Architecture générique**: Le système est conçu pour être extensible
  - `BaseCrop`, `BaseCropSystem`, `BaseGrowthEngine`, etc. sont réutilisables
  - Pour ajouter une nouvelle culture (blé, maïs, tomate, etc.):
    1. Créer une classe qui hérite de `BaseCrop` (ex: `WheatCrop`)
    2. Créer une configuration spécifique (ex: `WheatConfig`)
    3. Spécialiser les composants si nécessaire (ex: `WheatYieldCalculator`)
    4. Enregistrer dans le `CropRegistry`
  - Les interfaces génériques (`ICrop<T>`, `ICropSystem<T>`) permettent le polymorphisme
  - Le `CropRegistry` gère tous les types de cultures de manière uniforme
- Les checkpoints assurent une validation incrémentale
- Les tests de propriétés valident la correction universelle
- Les tests unitaires valident des exemples spécifiques et cas limites
- L'implémentation est en TypeScript pour s'intégrer avec Hytale
- Configuration des tests de propriétés: minimum 100 itérations avec fast-check
- Format de tag pour les tests: `Feature: hytale-oats-farming, Property {number}: {property_text}`
