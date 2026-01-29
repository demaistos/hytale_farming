# Document d'Exigences - Système de Culture d'Avoine Hytale

## Introduction

Ce document définit les exigences pour l'implémentation du système de culture d'avoine (Oats) dans Hytale. L'avoine est une céréale de Tier 1 destinée principalement à l'élevage, offrant une alternative au blé avec des caractéristiques de croissance et visuelles distinctes. Le système comprend 4 stades de croissance, un système de rendement avec bonus, des conditions environnementales spécifiques, et plusieurs méthodes d'acquisition.

## Glossaire

- **Système_Avoine**: Le système complet de culture d'avoine incluant la croissance, le rendu visuel, et la récolte
- **Moteur_Croissance**: Le composant responsable de la progression temporelle des plants d'avoine
- **Calculateur_Rendement**: Le composant qui détermine la quantité de grains et graines récoltés
- **Validateur_Conditions**: Le composant qui vérifie les conditions environnementales de croissance
- **Gestionnaire_Acquisition**: Le composant qui gère l'obtention des graines d'avoine
- **Moteur_Rendu**: Le composant responsable de l'affichage visuel des plants
- **Gestionnaire_Biomes**: Le composant qui vérifie la compatibilité des biomes
- **Calculateur_Bonus**: Le composant qui calcule les bonus de croissance (eau, pluie)
- **Jour_Jeu**: Unité de temps dans Hytale équivalant à 24 heures réelles
- **Terre_Labourée**: Bloc de terre préparé avec une houe pour la culture
- **Niveau_Lumière**: Valeur de 0 à 15 indiquant l'intensité lumineuse
- **Fortune**: Enchantement augmentant les drops de ressources
- **Essence_Vie**: Monnaie du jeu utilisée pour les transactions

## Exigences

### Exigence 1: Stades de Croissance

**User Story:** En tant que joueur, je veux que l'avoine pousse à travers plusieurs stades visuellement distincts, afin de pouvoir suivre la progression de ma culture.

#### Critères d'Acceptation

1. LE Système_Avoine DOIT implémenter exactement 4 stades de croissance séquentiels
2. QUAND un plant d'avoine est planté, LE Moteur_Croissance DOIT initialiser le plant au stade 1 (Germination)
3. QUAND un plant atteint le temps requis pour un stade, LE Moteur_Croissance DOIT faire progresser le plant au stade suivant
4. QUAND un plant atteint le stade 4 (Maturité), LE Moteur_Croissance DOIT arrêter la progression
5. LE Système_Avoine DOIT stocker l'état actuel de croissance de chaque plant

### Exigence 2: Temps de Croissance

**User Story:** En tant que joueur, je veux que l'avoine pousse en 4 jours de jeu, afin d'avoir une culture plus rapide que le blé.

#### Critères d'Acceptation

1. LE Moteur_Croissance DOIT faire progresser un plant du stade 1 au stade 4 en exactement 4 Jours_Jeu sans bonus
2. QUAND le temps de croissance est calculé, LE Calculateur_Bonus DOIT appliquer un bonus de +15% si de l'eau est présente dans un rayon de 4 blocs
3. QUAND le temps de croissance est calculé, LE Calculateur_Bonus DOIT appliquer un bonus de +10% si la pluie est active
4. QUAND plusieurs bonus sont actifs, LE Calculateur_Bonus DOIT cumuler les bonus de manière additive
5. LE Moteur_Croissance DOIT distribuer le temps de croissance uniformément entre les 4 stades

### Exigence 3: Rendu Visuel des Stades

**User Story:** En tant que joueur, je veux voir des changements visuels clairs à chaque stade de croissance, afin d'identifier facilement l'état de mes cultures.

#### Critères d'Acceptation

1. QUAND un plant est au stade 1, LE Moteur_Rendu DOIT afficher une couleur vert lime (#90EE90) avec une hauteur de 0.15 blocs
2. QUAND un plant est au stade 2, LE Moteur_Rendu DOIT afficher une couleur vert forêt (#228B22) avec une hauteur de 0.40 blocs
3. QUAND un plant est au stade 3, LE Moteur_Rendu DOIT afficher une transition de vert forêt (#228B22) vers jaune pâle (#F0E68C) avec une hauteur de 0.70 blocs
4. QUAND un plant est au stade 4, LE Moteur_Rendu DOIT afficher une couleur beige doré (#DAA520) avec une hauteur entre 0.90 et 1.00 blocs
5. QUAND un plant est au stade 4, LE Moteur_Rendu DOIT afficher des épis pendants (non droits)
6. QUAND un plant est au stade 4 ET que le vent souffle, LE Moteur_Rendu DOIT générer des particules dorées

### Exigence 4: Système de Rendement

**User Story:** En tant que joueur, je veux récolter des grains et des graines d'avoine, afin de pouvoir nourrir mes animaux et replanter.

#### Critères d'Acceptation

1. QUAND un plant au stade 4 est récolté, LE Calculateur_Rendement DOIT générer entre 3 et 4 grains d'avoine
2. QUAND le nombre de grains est calculé, LE Calculateur_Rendement DOIT avoir 80% de chance de générer 4 grains et 20% de chance de générer 3 grains
3. QUAND un plant au stade 4 est récolté, LE Calculateur_Rendement DOIT générer entre 1 et 2 graines d'avoine
4. QUAND le nombre de graines est calculé, LE Calculateur_Rendement DOIT avoir 70% de chance de générer 2 graines et 30% de chance de générer 1 graine
5. QUAND un plant aux stades 1, 2 ou 3 est récolté, LE Calculateur_Rendement DOIT générer 0 grains et 1 graine
6. QUAND un plant est récolté, LE Système_Avoine DOIT retirer le plant du monde

### Exigence 5: Support de l'Enchantement Fortune

**User Story:** En tant que joueur, je veux que l'enchantement Fortune augmente mon rendement d'avoine, afin de récompenser mon investissement en équipement.

#### Critères d'Acceptation

1. QUAND un plant au stade 4 est récolté avec Fortune I, LE Calculateur_Rendement DOIT augmenter le maximum de grains à 5
2. QUAND un plant au stade 4 est récolté avec Fortune II, LE Calculateur_Rendement DOIT augmenter le maximum de grains à 6
3. QUAND un plant au stade 4 est récolté avec Fortune III, LE Calculateur_Rendement DOIT augmenter le maximum de grains à 7
4. QUAND Fortune est appliqué, LE Calculateur_Rendement DOIT maintenir le minimum de grains à 4
5. LE Calculateur_Rendement NE DOIT PAS modifier le rendement de graines avec Fortune

### Exigence 6: Conditions de Croissance

**User Story:** En tant que joueur, je veux que l'avoine nécessite des conditions spécifiques pour pousser, afin d'ajouter de la stratégie à l'agriculture.

#### Critères d'Acceptation

1. QUAND une graine d'avoine est plantée, LE Validateur_Conditions DOIT vérifier que le bloc en dessous est de la Terre_Labourée
2. QUAND une graine d'avoine est plantée sur un bloc non valide, LE Système_Avoine DOIT empêcher la plantation
3. QUAND un plant d'avoine tente de croître, LE Validateur_Conditions DOIT vérifier que le Niveau_Lumière est supérieur ou égal à 9
4. QUAND le Niveau_Lumière est inférieur à 9, LE Moteur_Croissance DOIT suspendre la croissance du plant
5. QUAND un plant d'avoine tente de croître, LE Validateur_Conditions DOIT vérifier que l'espace au-dessus du plant est libre
6. QUAND l'espace au-dessus est obstrué, LE Moteur_Croissance DOIT suspendre la croissance du plant

### Exigence 7: Restrictions de Biomes

**User Story:** En tant que joueur, je veux que l'avoine ne pousse que dans des biomes appropriés, afin de refléter un comportement agricole réaliste.

#### Critères d'Acceptation

1. QUAND une graine d'avoine est plantée dans un biome Désert Extrême, LE Gestionnaire_Biomes DOIT empêcher la plantation
2. QUAND une graine d'avoine est plantée dans un biome Toundra Gelée, LE Gestionnaire_Biomes DOIT empêcher la plantation
3. QUAND une graine d'avoine est plantée dans le Nether, LE Gestionnaire_Biomes DOIT empêcher la plantation
4. QUAND une graine d'avoine est plantée dans l'End, LE Gestionnaire_Biomes DOIT empêcher la plantation
5. QUAND une graine d'avoine est plantée dans un biome compatible, LE Gestionnaire_Biomes DOIT autoriser la plantation

### Exigence 8: Acquisition par Achat

**User Story:** En tant que joueur, je veux acheter des graines d'avoine avec de l'Essence de Vie, afin de démarrer ma culture.

#### Critères d'Acceptation

1. LE Gestionnaire_Acquisition DOIT permettre l'achat de graines d'avoine pour 12 Essence_Vie
2. QUAND un joueur achète des graines d'avoine, LE Gestionnaire_Acquisition DOIT fournir exactement 4 graines
3. QUAND un joueur achète des graines d'avoine, LE Gestionnaire_Acquisition DOIT déduire 12 Essence_Vie de l'inventaire du joueur
4. QUAND un joueur n'a pas assez d'Essence_Vie, LE Gestionnaire_Acquisition DOIT empêcher l'achat

### Exigence 9: Acquisition par Loot de Villages

**User Story:** En tant que joueur, je veux trouver des graines d'avoine dans les coffres de villages, afin d'avoir une source alternative d'acquisition.

#### Critères d'Acceptation

1. QUAND un coffre agricole de village est généré, LE Gestionnaire_Acquisition DOIT avoir entre 15% et 20% de chance de contenir des graines d'avoine
2. QUAND des graines d'avoine sont ajoutées à un coffre, LE Gestionnaire_Acquisition DOIT générer entre 2 et 6 graines
3. LE Gestionnaire_Acquisition DOIT appliquer cette probabilité uniquement aux coffres de type agricole

### Exigence 10: Acquisition par Herbe Sauvage

**User Story:** En tant que joueur, je veux obtenir des graines d'avoine en cassant de l'herbe sauvage, afin d'avoir une méthode d'acquisition gratuite.

#### Critères d'Acceptation

1. QUAND un bloc d'herbe sauvage est détruit dans un biome Prairie, LE Gestionnaire_Acquisition DOIT avoir 5% de chance de dropper 1 graine d'avoine
2. QUAND un bloc d'herbe sauvage est détruit dans un biome non-Prairie, LE Gestionnaire_Acquisition NE DOIT PAS dropper de graine d'avoine
3. QUAND une graine d'avoine est droppée, LE Gestionnaire_Acquisition DOIT générer exactement 1 graine

### Exigence 11: Bonus de Proximité d'Eau

**User Story:** En tant que joueur, je veux que mes plants d'avoine poussent plus vite près de l'eau, afin d'optimiser ma ferme.

#### Critères d'Acceptation

1. QUAND un plant d'avoine croît, LE Calculateur_Bonus DOIT vérifier la présence d'eau dans un rayon de 4 blocs
2. QUAND de l'eau est détectée dans le rayon, LE Calculateur_Bonus DOIT appliquer un multiplicateur de vitesse de 1.15
3. QUAND aucune eau n'est détectée dans le rayon, LE Calculateur_Bonus DOIT appliquer un multiplicateur de vitesse de 1.0
4. LE Calculateur_Bonus DOIT effectuer la vérification en utilisant une distance Manhattan (pas diagonale)

### Exigence 12: Bonus de Pluie

**User Story:** En tant que joueur, je veux que mes plants d'avoine poussent plus vite sous la pluie, afin de bénéficier des conditions météorologiques.

#### Critères d'Acceptation

1. QUAND un plant d'avoine croît ET que la pluie est active, LE Calculateur_Bonus DOIT appliquer un multiplicateur de vitesse de 1.10
2. QUAND la pluie n'est pas active, LE Calculateur_Bonus DOIT appliquer un multiplicateur de vitesse de 1.0
3. LE Calculateur_Bonus DOIT vérifier que le plant est exposé au ciel pour appliquer le bonus de pluie
4. QUAND le plant est couvert, LE Calculateur_Bonus NE DOIT PAS appliquer le bonus de pluie même si la pluie est active

### Exigence 13: Distinction Visuelle avec le Blé

**User Story:** En tant que joueur, je veux pouvoir distinguer visuellement l'avoine du blé, afin de gérer mes cultures efficacement.

#### Critères d'Acceptation

1. QUAND un plant d'avoine au stade 4 est rendu, LE Moteur_Rendu DOIT afficher des épis pendants (orientation vers le bas)
2. QUAND un plant d'avoine au stade 4 est rendu, LE Moteur_Rendu DOIT utiliser une couleur beige doré (#DAA520) distincte du jaune vif du blé
3. QUAND un plant d'avoine au stade 4 est rendu, LE Moteur_Rendu DOIT afficher des grains individuellement visibles
4. LE Moteur_Rendu DOIT maintenir une différence visuelle claire à tous les stades de croissance

### Exigence 14: Particules de Vent

**User Story:** En tant que joueur, je veux voir des effets visuels sur l'avoine mature par temps venteux, afin d'améliorer l'immersion.

#### Critères d'Acceptation

1. QUAND un plant d'avoine est au stade 4 ET que le vent souffle, LE Moteur_Rendu DOIT générer des particules dorées
2. QUAND le vent cesse, LE Moteur_Rendu DOIT arrêter la génération de particules
3. LE Moteur_Rendu DOIT générer des particules avec une fréquence aléatoire entre 0.5 et 2 secondes
4. LE Moteur_Rendu DOIT limiter le nombre de particules à 3-5 par plant pour optimiser les performances

### Exigence 15: Persistance de l'État

**User Story:** En tant que joueur, je veux que mes plants d'avoine conservent leur état de croissance quand je quitte et reviens, afin de ne pas perdre ma progression.

#### Critères d'Acceptation

1. QUAND un chunk contenant des plants d'avoine est déchargé, LE Système_Avoine DOIT sauvegarder l'état de croissance de chaque plant
2. QUAND un chunk contenant des plants d'avoine est rechargé, LE Système_Avoine DOIT restaurer l'état de croissance de chaque plant
3. LE Système_Avoine DOIT sauvegarder le stade actuel, le temps écoulé dans le stade, et la position du plant
4. QUAND un plant est sauvegardé puis restauré, LE Moteur_Croissance DOIT reprendre la croissance exactement où elle s'était arrêtée
