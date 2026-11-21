// The freelance kit, sold as an add-on to lifetime (MOLLIE_ADDONS.kit) and
// served by api/addons.js to the emails that bought it. Kept in a module, not
// in a file read at runtime, so it ships with the function.
//
// Each section is a title, a short intro and blocks; a block is a title and a
// text the buyer copies as is. Square brackets are the parts to fill in.
// French only: it is written for selling sites to French clients (devis,
// micro-entreprise mentions, French law).
export const FREELANCE_KIT = {
  title: "Kit freelance",
  intro: "Tout ce qu'il faut pour vendre un site à un client : combien le facturer, le devis, le contrat, et les messages pour trouver le client. Les passages entre [crochets] sont à remplacer par tes informations.",
  notice: "Ces modèles sont une base de travail à adapter à ta situation. Ils ne remplacent pas le conseil d'un juriste ou d'un expert-comptable, surtout pour un contrat important.",
  sections: [
    {
      id: "prix",
      title: "1. Grille de prix",
      intro: "Des fourchettes réalistes pour un freelance qui démarre en France. Monte tes prix dès que tu as 2 ou 3 sites à montrer.",
      blocks: [
        {
          title: "Les trois offres à proposer",
          text: `OFFRE ESSENTIEL : 600 à 900 €
Pour qui : indépendant, artisan, commerce local qui n'a pas de site.
Contenu : site vitrine une page (accueil, services, contact), adapté au mobile, formulaire de contact, mise en ligne.
Délai : 5 à 7 jours.

OFFRE PRO : 1 200 à 1 800 €
Pour qui : PME, cabinet, restaurant, marque qui veut se démarquer.
Contenu : site animé de 3 à 5 pages, textes retravaillés, images optimisées, référencement de base (titres, descriptions), mise en ligne et prise en main.
Délai : 10 à 15 jours.

OFFRE PREMIUM : 2 000 à 3 500 €
Pour qui : marque, lancement de produit, entreprise qui veut un site haut de gamme.
Contenu : site sur mesure avec animations avancées (3D, défilement, vidéo), 5 à 8 pages, réservation ou paiement en ligne si besoin, 30 jours de suivi.
Délai : 3 à 4 semaines.`,
        },
        {
          title: "Les options qui augmentent le panier",
          text: `Nom de domaine et hébergement gérés pour le client : 120 à 200 € par an
Maintenance mensuelle (mises à jour, petites modifications, sauvegardes) : 40 à 90 € par mois
Page supplémentaire : 100 à 200 €
Rédaction des textes : 50 à 100 € par page
Référencement local (fiche Google, mots-clés de la ville) : 150 à 300 €
Version en deuxième langue : 20 à 30 % du prix du site
Livraison express (moitié du délai) : + 30 %`,
        },
        {
          title: "Comment fixer ton prix",
          text: `1. Compte ton temps réel : échanges avec le client, création, corrections, mise en ligne. Avec un prompt Movento, un site vitrine prend 1 à 2 jours, pas 2 semaines.
2. Fixe ton tarif journalier : 250 à 350 € au début, 400 à 600 € avec des références.
3. Ne facture pas ton temps, facture le résultat : le client paie un site qui lui ramène des clients, pas des heures.
4. Annonce toujours trois offres. La plupart des clients prennent celle du milieu.
5. Ne baisse jamais ton prix sans retirer quelque chose : « à ce budget, je retire la page blog ».
6. La maintenance mensuelle est ton revenu régulier : propose-la à chaque client.`,
        },
      ],
    },
    {
      id: "devis",
      title: "2. Modèle de devis",
      intro: "À envoyer en PDF après le premier échange. Le client le signe avec la mention « Bon pour accord » avant que tu commences.",
      blocks: [
        {
          title: "Devis",
          text: `DEVIS N° [2026-001]
Date : [JJ/MM/AAAA]
Valable jusqu'au : [date + 30 jours]

PRESTATAIRE
[Ton nom ou nom commercial]
[Adresse]
SIRET : [numéro]
[Email] · [Téléphone]

CLIENT
[Nom de l'entreprise ou du client]
[Adresse]
[SIRET si c'est une entreprise]

OBJET : création du site internet de [nom du client]

DÉTAIL DE LA PRESTATION
1. Conception et création du site ([nombre] pages : [liste des pages]) : [montant] €
2. Adaptation mobile et tablette : inclus
3. Intégration des textes et images fournis par le client : inclus
4. Mise en ligne sur le nom de domaine du client : inclus
5. [Option : rédaction des textes] : [montant] €
6. [Option : maintenance mensuelle] : [montant] € par mois

TOTAL : [montant] €
TVA non applicable, art. 293 B du CGI.

DÉLAI DE LIVRAISON
[Nombre] jours ouvrés à partir de la réception de l'acompte et des contenus (textes, logo, images).

CONDITIONS DE PAIEMENT
Acompte de 40 % à la signature : [montant] €
Solde de 60 % à la livraison, avant la mise en ligne : [montant] €
Paiement par virement bancaire. IBAN : [ton IBAN]

MODIFICATIONS
Deux séries de corrections sont incluses. Toute demande supplémentaire ou hors du périmètre ci-dessus fait l'objet d'un nouveau devis.

RETARD DE PAIEMENT
En cas de retard de paiement, des pénalités sont appliquées au taux de [3 fois le taux d'intérêt légal], ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement (clients professionnels).

Signature du client, précédée de la date et de la mention « Bon pour accord » :`,
        },
        {
          title: "À vérifier avant d'envoyer",
          text: `La mention « TVA non applicable, art. 293 B du CGI » ne vaut que si tu es en franchise de TVA (micro-entrepreneur sous les seuils). Sinon, indique les montants HT, la TVA et le TTC.
Numérote tes devis dans l'ordre, sans trou.
Liste précisément les pages et ce qui est inclus : c'est ce qui te protège quand le client demande « juste une petite chose en plus ».
Pour un particulier (pas une entreprise), retire la ligne sur l'indemnité de 40 € : elle ne s'applique qu'entre professionnels.`,
        },
      ],
    },
    {
      id: "contrat",
      title: "3. Contrat type de prestation",
      intro: "À joindre au devis pour les projets à partir de 1 000 €. Pour un petit projet, le devis signé suffit.",
      blocks: [
        {
          title: "Contrat de création de site internet",
          text: `CONTRAT DE PRESTATION DE SERVICES
Création de site internet

Entre
[Ton nom ou nom commercial], [statut : micro-entrepreneur], SIRET [numéro], [adresse], ci-après « le Prestataire »,
et
[Nom du client], [forme et SIRET si entreprise], [adresse], ci-après « le Client ».

Article 1. Objet
Le Prestataire réalise pour le Client le site internet décrit dans le devis n° [numéro] du [date], annexé au présent contrat et qui en fait partie.

Article 2. Déroulement
Le projet se déroule en quatre étapes : (1) remise des contenus par le Client, (2) présentation d'une première version, (3) corrections, (4) validation et mise en ligne.
Le délai de livraison indiqué au devis court à partir de la réception de l'acompte et de tous les contenus.

Article 3. Engagements du Client
Le Client fournit les textes, le logo, les images et les accès nécessaires dans un délai de [7] jours après la signature. Il garantit qu'il a le droit d'utiliser ces contenus.
Il répond aux demandes de validation dans un délai de [5] jours ouvrés. Tout retard du Client reporte d'autant la date de livraison.

Article 4. Corrections
Deux séries de corrections sont incluses dans le prix. Les demandes qui sortent du périmètre du devis, ou qui interviennent après la validation, font l'objet d'un devis complémentaire.

Article 5. Prix et paiement
Le prix est celui du devis. Un acompte de 40 % est versé à la signature ; le solde est versé à la livraison, avant la mise en ligne.
En cas de retard de paiement, les pénalités et l'indemnité forfaitaire prévues au devis s'appliquent, et le Prestataire peut suspendre le travail.

Article 6. Propriété
Le Client devient propriétaire du site et de ses contenus à la date du paiement complet. Avant cette date, le site reste la propriété du Prestataire.
Les outils, polices, bibliothèques et images de tiers utilisés dans le site restent soumis à leurs propres licences.
Le Prestataire peut citer le projet et en montrer des captures dans ses références, sauf demande contraire écrite du Client.

Article 7. Nom de domaine et hébergement
Le nom de domaine et l'hébergement sont souscrits au nom du Client, qui en règle les frais. [Si une option de gestion est prévue au devis, le Prestataire s'en charge pour le compte du Client.]

Article 8. Garantie
Pendant 30 jours après la mise en ligne, le Prestataire corrige gratuitement les défauts de fonctionnement du site tel qu'il a été livré. Cette garantie ne couvre pas les modifications faites par le Client ou par un tiers.

Article 9. Responsabilité
Le Prestataire est tenu à une obligation de moyens. Il ne garantit ni un positionnement dans les moteurs de recherche ni un niveau de chiffre d'affaires. Sa responsabilité est limitée au montant payé par le Client pour la prestation.
Le Client est responsable des contenus publiés sur son site, de ses mentions légales et du respect de la réglementation sur les données personnelles.

Article 10. Fin du contrat
Si le Client met fin au projet avant la livraison, l'acompte reste acquis au Prestataire et le travail déjà réalisé au-delà de l'acompte est facturé.
Si l'une des parties ne respecte pas ses engagements, l'autre peut résilier le contrat 15 jours après une mise en demeure écrite restée sans effet.

Article 11. Droit applicable
Le présent contrat est soumis au droit français. En cas de désaccord, les parties cherchent d'abord une solution amiable ; à défaut, les tribunaux de [ville] sont compétents.

Fait à [ville], le [date], en deux exemplaires.

Le Prestataire                                Le Client
[Nom et signature]                            [Nom et signature]`,
        },
        {
          title: "À adapter selon le client",
          text: `Client particulier (pas une entreprise) : s'il signe à distance ou hors de tes locaux, il dispose en principe d'un délai de rétractation de 14 jours. Renseigne-toi avant de commencer le travail, ou fais-lui demander par écrit un démarrage immédiat.
Clause sur les tribunaux (article 11) : avec un particulier, tu ne peux pas imposer le tribunal de ta ville. Retire cette précision.
Maintenance : si tu vends une maintenance mensuelle, fais un contrat séparé avec sa durée, son prix et ce qu'elle couvre.
Fais relire ce contrat par un professionnel avant de l'utiliser pour un projet important.`,
        },
      ],
    },
    {
      id: "prospection",
      title: "4. Messages de prospection",
      intro: "Cible les entreprises locales sans site, ou avec un site daté. Envoie 10 messages personnalisés par jour plutôt que 100 identiques.",
      blocks: [
        {
          title: "Premier email",
          text: `Objet : Une idée pour le site de [nom de l'entreprise]

Bonjour [prénom],

Je suis tombé sur [nom de l'entreprise] en cherchant [un restaurant / un coiffeur / un artisan] à [ville]. [Une phrase précise et sincère : vos avis sont excellents / vos réalisations sont très belles.]

J'ai remarqué que [vous n'avez pas encore de site / votre site ne s'affiche pas bien sur téléphone]. C'est dommage, parce que la plupart de vos clients vous cherchent d'abord sur leur mobile.

Je crée des sites modernes et animés pour des entreprises comme la vôtre. J'ai préparé une maquette de ce que pourrait donner votre page d'accueil : [lien].

Si ça vous plaît, on peut en parler 15 minutes cette semaine ?

Bonne journée,
[Ton prénom]
[Téléphone]`,
        },
        {
          title: "Message Instagram ou LinkedIn",
          text: `Bonjour [prénom], j'adore ce que vous faites avec [nom de l'entreprise], surtout [un détail précis].

Je crée des sites internet animés pour des [restaurants / artisans / marques]. Je me suis amusé à imaginer votre page d'accueil : [lien].

Aucune obligation, je voulais juste vous la montrer. Dites-moi ce que vous en pensez !`,
        },
        {
          title: "Relance après 3 jours",
          text: `Bonjour [prénom],

Je me permets de revenir vers vous au sujet de la maquette que je vous ai envoyée : [lien].

Je peux l'adapter à vos couleurs et à vos textes en quelques jours, pour un site en ligne avant [date].

Est-ce que c'est un sujet pour vous en ce moment ?

[Ton prénom]`,
        },
        {
          title: "Dernière relance après 7 jours",
          text: `Bonjour [prénom],

Dernier message de ma part, je ne veux pas vous déranger.

Si le site n'est pas une priorité pour l'instant, aucun souci. Je garde la maquette de côté : vous pouvez me recontacter quand vous voulez.

Belle continuation à [nom de l'entreprise] !

[Ton prénom]`,
        },
        {
          title: "Après un appel : envoi du devis",
          text: `Bonjour [prénom],

Merci pour notre échange. Comme convenu, voici le devis pour le site de [nom de l'entreprise] : [pièce jointe].

En résumé :
- [nombre] pages : [liste]
- livraison sous [nombre] jours
- [montant] €, dont 40 % à la signature

Pour lancer le projet, il suffit de me renvoyer le devis signé avec la mention « Bon pour accord ». Je démarre dès réception de l'acompte.

Je reste disponible si vous avez des questions.

[Ton prénom]`,
        },
        {
          title: "À la livraison : avis et recommandation",
          text: `Bonjour [prénom],

Votre site est en ligne : [lien]. Merci pour votre confiance, j'ai pris beaucoup de plaisir à travailler sur ce projet.

Deux petites choses qui m'aideraient énormément :
1. Un avis en quelques lignes, que je pourrais citer sur mon site.
2. Si vous connaissez un autre entrepreneur qui a besoin d'un site, je lui offre [10 %] de votre part.

Et si vous souhaitez que je m'occupe des mises à jour, je propose une formule de maintenance à [montant] € par mois.

À bientôt,
[Ton prénom]`,
        },
      ],
    },
    {
      id: "methode",
      title: "5. La méthode en 6 étapes",
      intro: "Le déroulé d'une vente, du premier message à la mise en ligne.",
      blocks: [
        {
          title: "De la prospection à la livraison",
          text: `1. CHOISIS UNE CIBLE. Un métier et une ville : « les restaurants de Lyon », « les coachs sportifs de Nantes ». Tu réutilises les mêmes prompts et les mêmes arguments.

2. PRÉPARE UNE MAQUETTE. Prends un prompt Movento adapté au métier, colle-le dans Lovable ou Claude, remplace le nom et les couleurs par ceux du prospect. 20 minutes par maquette.

3. ENVOIE LE PREMIER MESSAGE avec le lien de la maquette. Un prospect qui voit son propre site répond beaucoup plus qu'un prospect à qui on propose « un site ».

4. FAIS UN APPEL DE 15 MINUTES. Pose trois questions : comment vos clients vous trouvent aujourd'hui ? Qu'est-ce qu'un nouveau client vous rapporte ? Pour quand voulez-vous le site ? Annonce ensuite tes trois offres.

5. ENVOIE LE DEVIS LE JOUR MÊME, puis commence dès réception de l'acompte. Demande tous les contenus en une fois (textes, logo, photos).

6. LIVRE, FAIS VALIDER, METS EN LIGNE. Encaisse le solde avant la mise en ligne, propose la maintenance, puis demande un avis et une recommandation.`,
        },
        {
          title: "Liste de contrôle avant la mise en ligne",
          text: `Le site s'affiche correctement sur téléphone, tablette et ordinateur
Tous les liens et boutons fonctionnent
Le formulaire de contact envoie bien un email au client
Les textes sont relus, sans faute
Les images sont légères et se chargent vite
Le titre et la description de chaque page sont remplis (pour Google)
Les mentions légales et la politique de confidentialité sont en ligne
Le nom de domaine pointe vers le site, en https
Le client a ses accès (hébergement, nom de domaine)
Le solde est encaissé`,
        },
      ],
    },
  ],
};
