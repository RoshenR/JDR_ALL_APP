import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const itemTemplates = [
  // ============ ARMES - JUJUTSU KAISEN ============
  {
    name: "Épée de l'Âme Fendue",
    description: "Une lame maudite capable de trancher l'énergie occulte elle-même. Forgée à partir d'un esprit vengeur.",
    category: "weapon",
    rarity: "legendary",
    minValue: 5000,
    maxValue: 8000,
    properties: JSON.stringify({ damage: "2d8+3", type: "slashing", cursedEnergy: true }),
    tags: JSON.stringify(["maudit", "katana", "jujutsu"])
  },
  {
    name: "Bâton Maudit de Purification",
    description: "Un bâton utilisé par les exorcistes pour canaliser l'énergie occulte et purifier les fléaux.",
    category: "weapon",
    rarity: "epic",
    minValue: 2500,
    maxValue: 4000,
    properties: JSON.stringify({ damage: "1d8+2", type: "bludgeoning", bonusExorcism: 3 }),
    tags: JSON.stringify(["maudit", "bâton", "jujutsu", "exorcisme"])
  },
  {
    name: "Lame de Playful Cloud",
    description: "Une section du légendaire Playful Cloud, un outil maudit de grade spécial composé de trois segments.",
    category: "weapon",
    rarity: "legendary",
    minValue: 6000,
    maxValue: 10000,
    properties: JSON.stringify({ damage: "3d6+4", type: "bludgeoning", special: "Force augmentée" }),
    tags: JSON.stringify(["maudit", "outil-spécial", "jujutsu", "grade-spécial"])
  },
  {
    name: "Couteau à Fléaux",
    description: "Une dague spécialement conçue pour achever les fléaux affaiblis.",
    category: "weapon",
    rarity: "uncommon",
    minValue: 300,
    maxValue: 600,
    properties: JSON.stringify({ damage: "1d4+1", type: "piercing", bonusVsCurses: 2 }),
    tags: JSON.stringify(["maudit", "dague", "jujutsu"])
  },
  {
    name: "Chaîne d'Emprisonnement",
    description: "Une chaîne imprégnée d'énergie occulte capable de restreindre les fléaux.",
    category: "weapon",
    rarity: "rare",
    minValue: 1200,
    maxValue: 2000,
    properties: JSON.stringify({ damage: "1d6", type: "bludgeoning", restraint: true }),
    tags: JSON.stringify(["maudit", "chaîne", "jujutsu", "contrôle"])
  },
  {
    name: "Arc des Ombres Errantes",
    description: "Un arc maudit dont les flèches traquent les sources d'énergie occulte.",
    category: "weapon",
    rarity: "epic",
    minValue: 3000,
    maxValue: 4500,
    properties: JSON.stringify({ damage: "1d8+2", type: "piercing", homing: true, range: 150 }),
    tags: JSON.stringify(["maudit", "arc", "jujutsu"])
  },

  // ============ ARMES - CLASSIQUES ============
  {
    name: "Épée Longue",
    description: "Une épée à une main classique, bien équilibrée.",
    category: "weapon",
    rarity: "common",
    minValue: 50,
    maxValue: 100,
    properties: JSON.stringify({ damage: "1d8", type: "slashing" }),
    tags: JSON.stringify(["épée", "une-main"])
  },
  {
    name: "Épée à Deux Mains",
    description: "Une grande épée nécessitant deux mains pour être maniée efficacement.",
    category: "weapon",
    rarity: "common",
    minValue: 100,
    maxValue: 200,
    properties: JSON.stringify({ damage: "2d6", type: "slashing", twoHanded: true }),
    tags: JSON.stringify(["épée", "deux-mains"])
  },
  {
    name: "Dague",
    description: "Une lame courte et légère, parfaite pour les attaques furtives.",
    category: "weapon",
    rarity: "common",
    minValue: 10,
    maxValue: 30,
    properties: JSON.stringify({ damage: "1d4", type: "piercing", finesse: true, thrown: true }),
    tags: JSON.stringify(["dague", "légère", "lancer"])
  },
  {
    name: "Arc Court",
    description: "Un arc compact idéal pour les combats rapprochés.",
    category: "weapon",
    rarity: "common",
    minValue: 25,
    maxValue: 50,
    properties: JSON.stringify({ damage: "1d6", type: "piercing", range: 80 }),
    tags: JSON.stringify(["arc", "distance"])
  },
  {
    name: "Arc Long",
    description: "Un arc puissant avec une excellente portée.",
    category: "weapon",
    rarity: "uncommon",
    minValue: 75,
    maxValue: 150,
    properties: JSON.stringify({ damage: "1d8", type: "piercing", range: 150, twoHanded: true }),
    tags: JSON.stringify(["arc", "distance", "deux-mains"])
  },
  {
    name: "Bâton de Combat",
    description: "Un simple bâton de bois dur, arme polyvalente.",
    category: "weapon",
    rarity: "common",
    minValue: 5,
    maxValue: 15,
    properties: JSON.stringify({ damage: "1d6", type: "bludgeoning", versatile: "1d8" }),
    tags: JSON.stringify(["bâton", "polyvalent"])
  },
  {
    name: "Masse d'Armes",
    description: "Une masse lourde capable de briser les armures.",
    category: "weapon",
    rarity: "common",
    minValue: 30,
    maxValue: 60,
    properties: JSON.stringify({ damage: "1d6", type: "bludgeoning" }),
    tags: JSON.stringify(["masse", "contondant"])
  },
  {
    name: "Hache de Bataille",
    description: "Une hache redoutable au combat.",
    category: "weapon",
    rarity: "uncommon",
    minValue: 80,
    maxValue: 150,
    properties: JSON.stringify({ damage: "1d8", type: "slashing", versatile: "1d10" }),
    tags: JSON.stringify(["hache", "polyvalent"])
  },
  {
    name: "Rapière",
    description: "Une épée fine et élégante privilégiant la précision.",
    category: "weapon",
    rarity: "uncommon",
    minValue: 100,
    maxValue: 200,
    properties: JSON.stringify({ damage: "1d8", type: "piercing", finesse: true }),
    tags: JSON.stringify(["épée", "finesse"])
  },
  {
    name: "Épée Runique",
    description: "Une épée gravée de runes anciennes qui luisent faiblement.",
    category: "weapon",
    rarity: "rare",
    minValue: 800,
    maxValue: 1500,
    properties: JSON.stringify({ damage: "1d8+2", type: "slashing", magical: true }),
    tags: JSON.stringify(["épée", "magique", "runes"])
  },
  {
    name: "Lame du Crépuscule",
    description: "Une épée noire comme la nuit qui absorbe la lumière autour d'elle.",
    category: "weapon",
    rarity: "epic",
    minValue: 2000,
    maxValue: 3500,
    properties: JSON.stringify({ damage: "2d6+2", type: "slashing", magical: true, darkness: true }),
    tags: JSON.stringify(["épée", "magique", "ténèbres"])
  },

  // ============ ARMURES - JUJUTSU KAISEN ============
  {
    name: "Uniforme de l'École de Tokyo",
    description: "L'uniforme standard des étudiants en jujutsu, renforcé contre les attaques maudites.",
    category: "armor",
    rarity: "uncommon",
    minValue: 400,
    maxValue: 800,
    properties: JSON.stringify({ ac: 12, cursedResistance: 1 }),
    tags: JSON.stringify(["uniforme", "jujutsu", "école"])
  },
  {
    name: "Tenue de Combat Renforcée",
    description: "Une tenue de combat utilisée par les exorcistes de grade 1, tissée avec des fibres imprégnées d'énergie.",
    category: "armor",
    rarity: "rare",
    minValue: 1500,
    maxValue: 2500,
    properties: JSON.stringify({ ac: 14, cursedResistance: 2, mobility: true }),
    tags: JSON.stringify(["armure", "jujutsu", "grade-1"])
  },
  {
    name: "Voile de Protection",
    description: "Un voile qui crée une barrière subtile contre les malédictions mineures.",
    category: "armor",
    rarity: "rare",
    minValue: 1000,
    maxValue: 1800,
    properties: JSON.stringify({ ac: 11, barrier: true, cursedResistance: 3 }),
    tags: JSON.stringify(["voile", "jujutsu", "barrière"])
  },

  // ============ ARMURES - CLASSIQUES ============
  {
    name: "Armure de Cuir",
    description: "Une armure légère en cuir tanné offrant une protection basique.",
    category: "armor",
    rarity: "common",
    minValue: 30,
    maxValue: 60,
    properties: JSON.stringify({ ac: 11, type: "light" }),
    tags: JSON.stringify(["cuir", "légère"])
  },
  {
    name: "Armure de Cuir Clouté",
    description: "Une armure de cuir renforcée de rivets métalliques.",
    category: "armor",
    rarity: "common",
    minValue: 60,
    maxValue: 120,
    properties: JSON.stringify({ ac: 12, type: "light" }),
    tags: JSON.stringify(["cuir", "légère", "clouté"])
  },
  {
    name: "Cotte de Mailles",
    description: "Une armure composée d'anneaux de métal entrelacés.",
    category: "armor",
    rarity: "uncommon",
    minValue: 150,
    maxValue: 300,
    properties: JSON.stringify({ ac: 14, type: "medium", stealthDisadvantage: true }),
    tags: JSON.stringify(["mailles", "moyenne"])
  },
  {
    name: "Cuirasse",
    description: "Une armure de plaques protégeant le torse.",
    category: "armor",
    rarity: "uncommon",
    minValue: 200,
    maxValue: 400,
    properties: JSON.stringify({ ac: 14, type: "medium" }),
    tags: JSON.stringify(["plaques", "moyenne"])
  },
  {
    name: "Armure de Plaques",
    description: "Une armure lourde offrant une protection maximale.",
    category: "armor",
    rarity: "rare",
    minValue: 800,
    maxValue: 1500,
    properties: JSON.stringify({ ac: 18, type: "heavy", strengthReq: 15, stealthDisadvantage: true }),
    tags: JSON.stringify(["plaques", "lourde"])
  },
  {
    name: "Bouclier",
    description: "Un bouclier en bois et métal.",
    category: "armor",
    rarity: "common",
    minValue: 20,
    maxValue: 50,
    properties: JSON.stringify({ acBonus: 2 }),
    tags: JSON.stringify(["bouclier"])
  },
  {
    name: "Bouclier de la Sentinelle",
    description: "Un bouclier enchanté qui pulse d'une lueur protectrice.",
    category: "armor",
    rarity: "rare",
    minValue: 600,
    maxValue: 1200,
    properties: JSON.stringify({ acBonus: 2, magicalResistance: 1 }),
    tags: JSON.stringify(["bouclier", "magique"])
  },
  {
    name: "Armure d'Écailles de Dragon",
    description: "Une armure rare fabriquée à partir d'écailles de dragon.",
    category: "armor",
    rarity: "epic",
    minValue: 3000,
    maxValue: 5000,
    properties: JSON.stringify({ ac: 16, type: "medium", fireResistance: true }),
    tags: JSON.stringify(["dragon", "moyenne", "résistance-feu"])
  },

  // ============ CONSOMMABLES - JUJUTSU KAISEN ============
  {
    name: "Pilule de Récupération d'Énergie",
    description: "Une pilule qui restaure partiellement l'énergie occulte épuisée.",
    category: "consumable",
    rarity: "uncommon",
    minValue: 200,
    maxValue: 400,
    properties: JSON.stringify({ restoreCursedEnergy: 20 }),
    tags: JSON.stringify(["pilule", "jujutsu", "énergie"])
  },
  {
    name: "Talisman de Scellement",
    description: "Un talisman à usage unique capable de sceller temporairement un fléau faible.",
    category: "consumable",
    rarity: "rare",
    minValue: 500,
    maxValue: 900,
    properties: JSON.stringify({ sealPower: 10, duration: "1 heure" }),
    tags: JSON.stringify(["talisman", "jujutsu", "scellement"])
  },
  {
    name: "Encens Purificateur",
    description: "Un encens qui, une fois brûlé, repousse les fléaux mineurs de la zone.",
    category: "consumable",
    rarity: "uncommon",
    minValue: 150,
    maxValue: 300,
    properties: JSON.stringify({ areaEffect: true, repelCurses: true, duration: "10 minutes" }),
    tags: JSON.stringify(["encens", "jujutsu", "purification"])
  },
  {
    name: "Doigt de Sukuna (Réplique)",
    description: "Une réplique d'entraînement d'un doigt du Roi des Fléaux. Dégage une aura menaçante mais inoffensive.",
    category: "consumable",
    rarity: "legendary",
    minValue: 1000,
    maxValue: 2000,
    properties: JSON.stringify({ training: true, cursedAura: "intimidation" }),
    tags: JSON.stringify(["sukuna", "jujutsu", "entraînement", "réplique"])
  },
  {
    name: "Onigiri Béni",
    description: "Un onigiri préparé avec une bénédiction protectrice. Restaure la santé et l'esprit.",
    category: "consumable",
    rarity: "common",
    minValue: 20,
    maxValue: 50,
    properties: JSON.stringify({ healing: 10, blessingDuration: "1 heure" }),
    tags: JSON.stringify(["nourriture", "jujutsu", "bénédiction"])
  },

  // ============ CONSOMMABLES - CLASSIQUES ============
  {
    name: "Potion de Soin",
    description: "Une potion rouge qui restaure les points de vie.",
    category: "consumable",
    rarity: "common",
    minValue: 50,
    maxValue: 100,
    properties: JSON.stringify({ healing: "2d4+2" }),
    tags: JSON.stringify(["potion", "soin"])
  },
  {
    name: "Potion de Soin Supérieure",
    description: "Une potion de soin plus puissante.",
    category: "consumable",
    rarity: "uncommon",
    minValue: 150,
    maxValue: 300,
    properties: JSON.stringify({ healing: "4d4+4" }),
    tags: JSON.stringify(["potion", "soin"])
  },
  {
    name: "Potion de Soin Majeure",
    description: "Une potion de soin très puissante.",
    category: "consumable",
    rarity: "rare",
    minValue: 400,
    maxValue: 700,
    properties: JSON.stringify({ healing: "8d4+8" }),
    tags: JSON.stringify(["potion", "soin"])
  },
  {
    name: "Antidote",
    description: "Neutralise les poisons courants.",
    category: "consumable",
    rarity: "common",
    minValue: 30,
    maxValue: 60,
    properties: JSON.stringify({ curePoison: true }),
    tags: JSON.stringify(["antidote", "poison"])
  },
  {
    name: "Potion de Force",
    description: "Augmente temporairement la force du buveur.",
    category: "consumable",
    rarity: "uncommon",
    minValue: 200,
    maxValue: 350,
    properties: JSON.stringify({ strengthBonus: 4, duration: "1 heure" }),
    tags: JSON.stringify(["potion", "buff", "force"])
  },
  {
    name: "Potion d'Invisibilité",
    description: "Rend invisible pendant une courte durée.",
    category: "consumable",
    rarity: "rare",
    minValue: 500,
    maxValue: 900,
    properties: JSON.stringify({ invisibility: true, duration: "1 heure" }),
    tags: JSON.stringify(["potion", "invisibilité"])
  },
  {
    name: "Élixir de Résistance au Feu",
    description: "Confère une résistance aux dégâts de feu.",
    category: "consumable",
    rarity: "uncommon",
    minValue: 180,
    maxValue: 320,
    properties: JSON.stringify({ fireResistance: true, duration: "1 heure" }),
    tags: JSON.stringify(["élixir", "résistance", "feu"])
  },
  {
    name: "Ration de Voyage",
    description: "De la nourriture séchée pour plusieurs jours.",
    category: "consumable",
    rarity: "common",
    minValue: 5,
    maxValue: 10,
    properties: JSON.stringify({ food: true, days: 3 }),
    tags: JSON.stringify(["nourriture", "voyage"])
  },
  {
    name: "Parchemin de Boule de Feu",
    description: "Un parchemin contenant le sort Boule de Feu.",
    category: "consumable",
    rarity: "rare",
    minValue: 600,
    maxValue: 1000,
    properties: JSON.stringify({ spell: "Fireball", damage: "8d6", saveType: "Dexterity" }),
    tags: JSON.stringify(["parchemin", "sort", "feu"])
  },
  {
    name: "Parchemin de Soin de Groupe",
    description: "Un parchemin qui soigne tous les alliés proches.",
    category: "consumable",
    rarity: "rare",
    minValue: 500,
    maxValue: 850,
    properties: JSON.stringify({ spell: "Mass Cure Wounds", healing: "3d8+5" }),
    tags: JSON.stringify(["parchemin", "sort", "soin"])
  },

  // ============ OBJETS DIVERS - JUJUTSU KAISEN ============
  {
    name: "Lunettes de Détection Maudite",
    description: "Des lunettes permettant de voir l'énergie occulte et les résidus de malédictions.",
    category: "misc",
    rarity: "rare",
    minValue: 800,
    maxValue: 1400,
    properties: JSON.stringify({ detectCurses: true, range: 30 }),
    tags: JSON.stringify(["lunettes", "jujutsu", "détection"])
  },
  {
    name: "Téléphone de l'École",
    description: "Un téléphone spécial utilisé par les exorcistes pour communiquer et recevoir des missions.",
    category: "misc",
    rarity: "uncommon",
    minValue: 200,
    maxValue: 400,
    properties: JSON.stringify({ communication: true, missionTracking: true }),
    tags: JSON.stringify(["téléphone", "jujutsu", "école"])
  },
  {
    name: "Carte des Voiles",
    description: "Une carte qui révèle l'emplacement des barrières et voiles actifs dans une zone.",
    category: "misc",
    rarity: "rare",
    minValue: 600,
    maxValue: 1100,
    properties: JSON.stringify({ detectBarriers: true, mapRadius: "1 km" }),
    tags: JSON.stringify(["carte", "jujutsu", "barrière"])
  },
  {
    name: "Poupée Maudite",
    description: "Une petite poupée imprégnée d'énergie occulte. Peut servir de réceptacle pour un sort.",
    category: "misc",
    rarity: "uncommon",
    minValue: 300,
    maxValue: 550,
    properties: JSON.stringify({ spellStorage: 1, cursedEnergy: true }),
    tags: JSON.stringify(["poupée", "jujutsu", "maudit"])
  },
  {
    name: "Grimoire des Techniques",
    description: "Un livre ancien décrivant diverses techniques d'exorcisme et leurs applications.",
    category: "misc",
    rarity: "epic",
    minValue: 2000,
    maxValue: 3500,
    properties: JSON.stringify({ learnTechnique: true, techniques: 5 }),
    tags: JSON.stringify(["grimoire", "jujutsu", "techniques"])
  },

  // ============ OBJETS DIVERS - CLASSIQUES ============
  {
    name: "Torche",
    description: "Une torche qui brûle pendant 1 heure.",
    category: "misc",
    rarity: "common",
    minValue: 1,
    maxValue: 2,
    properties: JSON.stringify({ light: 20, duration: "1 heure" }),
    tags: JSON.stringify(["lumière", "basique"])
  },
  {
    name: "Corde (15m)",
    description: "Une corde solide de 15 mètres.",
    category: "misc",
    rarity: "common",
    minValue: 5,
    maxValue: 10,
    properties: JSON.stringify({ length: 15 }),
    tags: JSON.stringify(["corde", "exploration"])
  },
  {
    name: "Outils de Crochetage",
    description: "Un set d'outils pour crocheter les serrures.",
    category: "misc",
    rarity: "uncommon",
    minValue: 50,
    maxValue: 100,
    properties: JSON.stringify({ lockpickBonus: 2 }),
    tags: JSON.stringify(["outils", "crochetage"])
  },
  {
    name: "Lanterne à Capuchon",
    description: "Une lanterne dont la lumière peut être masquée.",
    category: "misc",
    rarity: "common",
    minValue: 15,
    maxValue: 30,
    properties: JSON.stringify({ light: 30, hooded: true }),
    tags: JSON.stringify(["lumière", "lanterne"])
  },
  {
    name: "Sac à Dos d'Aventurier",
    description: "Un sac à dos robuste avec plusieurs compartiments.",
    category: "misc",
    rarity: "common",
    minValue: 20,
    maxValue: 40,
    properties: JSON.stringify({ capacity: 30, compartments: 4 }),
    tags: JSON.stringify(["sac", "rangement"])
  },
  {
    name: "Longue-Vue",
    description: "Permet de voir clairement à grande distance.",
    category: "misc",
    rarity: "uncommon",
    minValue: 100,
    maxValue: 200,
    properties: JSON.stringify({ magnification: 3 }),
    tags: JSON.stringify(["optique", "exploration"])
  },
  {
    name: "Amulette de Protection",
    description: "Une amulette qui offre une légère protection magique.",
    category: "misc",
    rarity: "rare",
    minValue: 500,
    maxValue: 900,
    properties: JSON.stringify({ savingThrowBonus: 1 }),
    tags: JSON.stringify(["amulette", "protection", "magique"])
  },
  {
    name: "Anneau de Stockage",
    description: "Un anneau magique contenant un petit espace de stockage extra-dimensionnel.",
    category: "misc",
    rarity: "rare",
    minValue: 800,
    maxValue: 1500,
    properties: JSON.stringify({ extraStorage: 50 }),
    tags: JSON.stringify(["anneau", "magique", "stockage"])
  },
  {
    name: "Cape de l'Ombre",
    description: "Une cape qui aide à se fondre dans les ombres.",
    category: "misc",
    rarity: "rare",
    minValue: 700,
    maxValue: 1200,
    properties: JSON.stringify({ stealthBonus: 3 }),
    tags: JSON.stringify(["cape", "discrétion", "magique"])
  },
  {
    name: "Bottes de Vitesse",
    description: "Des bottes enchantées qui augmentent la vitesse de déplacement.",
    category: "misc",
    rarity: "rare",
    minValue: 900,
    maxValue: 1600,
    properties: JSON.stringify({ speedBonus: 3 }),
    tags: JSON.stringify(["bottes", "vitesse", "magique"])
  },
  {
    name: "Pierre de Communication",
    description: "Une paire de pierres permettant de communiquer à distance.",
    category: "misc",
    rarity: "uncommon",
    minValue: 250,
    maxValue: 450,
    properties: JSON.stringify({ communication: true, range: "1 km" }),
    tags: JSON.stringify(["pierre", "communication"])
  },
  {
    name: "Tente de Voyage",
    description: "Une tente légère pouvant abriter 2 personnes.",
    category: "misc",
    rarity: "common",
    minValue: 30,
    maxValue: 60,
    properties: JSON.stringify({ shelter: true, capacity: 2 }),
    tags: JSON.stringify(["tente", "camping"])
  },
  {
    name: "Kit de Premiers Soins",
    description: "Un kit contenant des bandages et des herbes médicinales.",
    category: "misc",
    rarity: "common",
    minValue: 25,
    maxValue: 50,
    properties: JSON.stringify({ healingKitUses: 10 }),
    tags: JSON.stringify(["médecine", "soins"])
  },
  {
    name: "Grappin",
    description: "Un grappin avec corde pour l'escalade.",
    category: "misc",
    rarity: "uncommon",
    minValue: 40,
    maxValue: 80,
    properties: JSON.stringify({ climbingAid: true, ropeLength: 15 }),
    tags: JSON.stringify(["grappin", "escalade"])
  },
  {
    name: "Miroir Enchanté",
    description: "Un petit miroir qui révèle les illusions.",
    category: "misc",
    rarity: "rare",
    minValue: 600,
    maxValue: 1000,
    properties: JSON.stringify({ seeIllusions: true }),
    tags: JSON.stringify(["miroir", "magique", "illusion"])
  },

  // ============ OBJETS DE QUÊTE ============
  {
    name: "Fragment de Sceau Ancien",
    description: "Un fragment d'un ancien sceau brisé. Semble important.",
    category: "quest",
    rarity: "rare",
    minValue: 0,
    maxValue: 0,
    properties: JSON.stringify({ questItem: true }),
    tags: JSON.stringify(["fragment", "sceau", "quête"])
  },
  {
    name: "Lettre Scellée",
    description: "Une lettre avec un sceau officiel. Le contenu est inconnu.",
    category: "quest",
    rarity: "common",
    minValue: 0,
    maxValue: 0,
    properties: JSON.stringify({ questItem: true, sealed: true }),
    tags: JSON.stringify(["lettre", "quête"])
  },
  {
    name: "Clé Mystérieuse",
    description: "Une clé ornée qui ne correspond à aucune serrure connue.",
    category: "quest",
    rarity: "uncommon",
    minValue: 0,
    maxValue: 0,
    properties: JSON.stringify({ questItem: true, key: true }),
    tags: JSON.stringify(["clé", "quête"])
  },
  {
    name: "Cristal d'Énergie Occulte",
    description: "Un cristal pulsant d'énergie maudite. Les exorcistes le recherchent.",
    category: "quest",
    rarity: "epic",
    minValue: 0,
    maxValue: 0,
    properties: JSON.stringify({ questItem: true, cursedEnergy: "élevée" }),
    tags: JSON.stringify(["cristal", "jujutsu", "quête"])
  },
  {
    name: "Médaillon du Clan",
    description: "Un médaillon portant l'emblème d'un clan de sorciers.",
    category: "quest",
    rarity: "rare",
    minValue: 0,
    maxValue: 0,
    properties: JSON.stringify({ questItem: true, clanSymbol: true }),
    tags: JSON.stringify(["médaillon", "jujutsu", "clan", "quête"])
  }
]

async function main() {
  console.log('🌱 Début du seeding...')

  // Supprimer les anciens templates
  await prisma.itemTemplate.deleteMany()
  console.log('🗑️  Anciens templates supprimés')

  // Créer les nouveaux templates
  for (const template of itemTemplates) {
    await prisma.itemTemplate.create({
      data: template
    })
  }

  console.log(`✅ ${itemTemplates.length} templates d'objets créés !`)

  // Résumé par catégorie
  const summary = itemTemplates.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('\n📊 Résumé par catégorie:')
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count} objets`)
  })

  // Résumé par rareté
  const raritySum = itemTemplates.reduce((acc, item) => {
    acc[item.rarity] = (acc[item.rarity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('\n💎 Résumé par rareté:')
  Object.entries(raritySum).forEach(([rarity, count]) => {
    console.log(`   - ${rarity}: ${count} objets`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
