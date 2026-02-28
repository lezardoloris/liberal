/**
 * TEMPORARY reseed endpoint — adds the 31 new Gemini-sourced signalements.
 * Protected by AUTH_SECRET header. Remove after use.
 *
 * Usage: curl -X POST https://domain/api/admin/reseed -H "x-reseed-key: <AUTH_SECRET>"
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { like } from 'drizzle-orm';

interface SeedItem {
  title: string;
  description: string;
  amount: number;
  sourceUrl: string;
  ministryTag: string;
}

const NEW_SEEDS: SeedItem[] = [
  // === INSTITUTIONS ===
  {
    title: 'Budget de fonctionnement du CESE : 34,4 M\u20ac/an d\u2019auto-saisines',
    description:
      'Le CESE est vivement critiqué pour son manque d\u2019utilité publique : 79 % de ses rapports sont des auto-saisines pour justifier son existence. La Cour des comptes a également pointé le non-respect du temps de travail légal des agents.',
    amount: 34_400_000,
    sourceUrl: 'https://www.ccomptes.fr/sites/default/files/2025-07/20250711-S2025-0776-Conseil-economique-social-et-environnemental.pdf',
    ministryTag: 'Institutions',
  },
  {
    title: 'Coût de fonctionnement cumulé des CESER : 55 M\u20ac/an',
    description:
      'Les Conseils économiques, sociaux et environnementaux régionaux (CESER) coûtent entre 50 et 60 M\u20ac annuellement. Leur suppression, couplée à celle du CESE national, générerait jusqu\u2019à 95 M\u20ac d\u2019économies.',
    amount: 55_000_000,
    sourceUrl: 'https://www.ifrap.org/fonction-publique-et-administration/le-cese-sur-la-sellette',
    ministryTag: 'Institutions',
  },
  {
    title: 'Maintien des 317 Comités \u00ab Théodule \u00bb : 30 M\u20ac/an',
    description:
      'Instances consultatives redondantes (ex : Commission d\u2019enrichissement de la langue française en doublon avec l\u2019Académie). Leur coût stagne malgré les annonces politiques successives de suppression.',
    amount: 30_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/agnes-verdier-molinie-parmi-les-agences-de-letat-les-doublons-et-les-instances-inutiles-ont-la-peau-dure',
    ministryTag: 'Institutions',
  },
  {
    title: 'Maintien des 243 taxes à faible rendement : 307 M\u20ac/an de coût net',
    description:
      'La persistance de ces micro-taxes engendre des coûts de collecte et une complexité bureaucratique largement supérieurs aux bénéfices des recettes générées, pénalisant l\u2019administration et les entreprises.',
    amount: 307_000_000,
    sourceUrl: 'https://www.ccomptes.fr/sites/default/files/2025-04/20250417-Taxes-a-faible-rendement_0.pdf',
    ministryTag: 'Institutions',
  },
  // === SANTÉ ===
  {
    title: 'Surcoût institutionnel des Agences de Santé : 4 Mds\u20ac/an',
    description:
      'Coût annuel massif dû à l\u2019empilement d\u2019agences (Anses, ANSM, HAS, SPF, ARS) créant un doublon flagrant de compétences avec la CNAM (72 200 agents) et le Ministère.',
    amount: 4_000_000_000,
    sourceUrl: 'https://www.senat.fr/fileadmin/Illustrations/Controle/Structures_temporaires/2024-2025/CE-Agences_Etat/TOME_I_-_Rapport_CE_Agences.pdf',
    ministryTag: 'Santé',
  },
  {
    title: 'Fraude non recouvrée à l\u2019Assurance Maladie : 4,15 Mds\u20ac/an',
    description:
      'La fraude aux prestations (majoritairement le fait de professionnels de santé et d\u2019arrêts de travail) est estimée entre 3,8 et 4,5 Md\u20ac. Seuls 467 M\u20ac sont détectés et stoppés.',
    amount: 4_150_000_000,
    sourceUrl: 'https://www.ccomptes.fr/sites/default/files/2024-05/20240529-RALFSS-2024.pdf',
    ministryTag: 'Santé',
  },
  {
    title: 'Hypertrophie administrative des ARS : 800 M\u20ac/an',
    description:
      'L\u2019existence de 8 000 agents dans les Agences Régionales de Santé en parallèle des structures territoriales de la Sécurité Sociale alourdit les coûts de pilotage de l\u2019hôpital public.',
    amount: 800_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/dyn/opendata/PRJLANR5L15B3360.html',
    ministryTag: 'Santé',
  },
  // === SOCIAL ===
  {
    title: 'Fraudes avérées aux prestations de la branche Famille : 1 Md\u20ac/an',
    description:
      'Malgré 32 millions de contrôles ayant identifié 49 000 cas en 2024, les détournements restent massifs en raison de la complexité des critères d\u2019éligibilité au RSA et aux primes.',
    amount: 1_000_000_000,
    sourceUrl: 'https://www.ifrap.org/budget-et-fiscalite/fraudes-dans-la-branche-famille-des-resultats-2024-en-demi-teinte',
    ministryTag: 'Social',
  },
  {
    title: 'Gaspillages dans la sous-traitance de l\u2019Aide Sociale à l\u2019Enfance : 500 M\u20ac/an',
    description:
      'Les départements allouent des budgets colossaux à l\u2019ASE, mais l\u2019absence de contrôle sur les prestataires privés (hôtels sociaux, associations) entraîne une déperdition majeure de fonds publics.',
    amount: 500_000_000,
    sourceUrl: 'https://contribuablesassocies.org/categories/actualites/gaspillages-publics/',
    ministryTag: 'Social',
  },
  // === NUMÉRIQUE ===
  {
    title: 'Surcoûts et dérive calendaire du projet SI-SAMU : 218 M\u20ac',
    description:
      'Lancé en 2014, le projet de modernisation des centres de régulation du 15 dérive sur un calendrier de 15,3 ans, rendant la technologie obsolète avant son déploiement.',
    amount: 218_000_000,
    sourceUrl: 'https://www.cio-online.com/actualites/lire-les-45-plus-grands-projets-it-de-l-etat-pesent-3-3-mdeteuro-16500.html',
    ministryTag: 'Numérique',
  },
  {
    title: 'Risques budgétaires sur le Réseau Radio du Futur (RRF) : 900 M\u20ac',
    description:
      'Projet massif du ministère de l\u2019Intérieur, pointé pour sa complexité tentaculaire et l\u2019évitement prolongé des audits préalables de la DINUM. 8 ans de développement prévu.',
    amount: 900_000_000,
    sourceUrl: 'https://www.cio-online.com/actualites/lire-les-45-plus-grands-projets-it-de-l-etat-pesent-3-3-mdeteuro-16500.html',
    ministryTag: 'Numérique',
  },
  {
    title: 'Dérapage du projet de Facturation Électronique (AIFE) : 259 M\u20ac',
    description:
      'Augmentation imprévue de 28 M\u20ac en six mois. Durée prévue de 8 ans avec de multiples reports d\u2019application, perturbant la visibilité des entreprises assujetties.',
    amount: 259_000_000,
    sourceUrl: 'https://www.cio-online.com/actualites/lire-les-45-plus-grands-projets-it-de-l-etat-pesent-3-3-mdeteuro-16500.html',
    ministryTag: 'Numérique',
  },
  {
    title: 'Abandon définitif du logiciel Scribe : 13,3 M\u20ac perdus',
    description:
      'Logiciel de procédure pénale pour la Police nationale, soumis à l\u2019expertise de la DINUM avec quatre ans de retard. Abandonné en 2021, perte totale des fonds engagés.',
    amount: 13_300_000,
    sourceUrl: 'https://www.ccomptes.fr/system/files/2020-10/20201014-58-2-conduite-grands-projets-numeriques-Etat.pdf',
    ministryTag: 'Numérique',
  },
  // === TRANSPORT ===
  {
    title: 'Subventions aux 70 aéroports régionaux déficitaires : 140 M\u20ac/an',
    description:
      'Maintien artificiel d\u2019aéroports locaux (moins d\u20191 M de passagers) au nom de l\u2019aménagement du territoire. Ces structures absorbent des fonds massifs sans perspective de rentabilité.',
    amount: 140_000_000,
    sourceUrl: 'https://www.apna-asso.com/les-dossiers/70-aeroports-regionaux-tres-defeicitaires-le-cas-daurillac',
    ministryTag: 'Transport',
  },
  {
    title: 'Déficit d\u2019exploitation de la liaison aérienne Aurillac-Paris : 5 M\u20ac/an',
    description:
      'Ligne massivement subventionnée au titre de l\u2019OSP. La subvention atteint 200 à 300 \u20ac d\u2019argent public par passager, contredisant toute logique économique et environnementale.',
    amount: 5_000_000,
    sourceUrl: 'https://www.apna-asso.com/les-dossiers/70-aeroports-regionaux-tres-defeicitaires-le-cas-daurillac',
    ministryTag: 'Transport',
  },
  // === AMÉNAGEMENT ===
  {
    title: 'Doublons administratifs territoriaux (Cerema, ANCT, Ademe) : 600 M\u20ac/an',
    description:
      'La non-fusion de ces trois agences d\u2019ingénierie territoriale (2 400 + 360 + 1 197 agents) maintient un surcoût structurel. L\u2019Ademe fait notamment doublon avec les 7 800 agents des DREAL.',
    amount: 600_000_000,
    sourceUrl: 'https://www.ifrap.org/etat-et-collectivites/agnes-verdier-molinie-parmi-les-agences-de-letat-les-doublons-et-les-instances-inutiles-ont-la-peau-dure',
    ministryTag: 'Aménagement',
  },
  {
    title: 'Surcoûts et lignes inutiles du Grand Paris Express : 3 Mds\u20ac de dérive',
    description:
      'Les Lignes 17 Nord et 18 Ouest sont dénoncées comme des gaspillages détruisant des terres agricoles, basés sur des prévisions de trafic surévaluées. Qualifié d\u2019\u00ab éléphant blanc \u00bb.',
    amount: 3_000_000_000,
    sourceUrl: 'https://www.colos.info/actualites/8-grand-paris',
    ministryTag: 'Aménagement',
  },
  // === DÉFENSE ===
  {
    title: 'Arriérés de paiement de l\u2019État à Naval Group : 836 M\u20ac',
    description:
      'L\u2019État retarde ses paiements contractuels massifs. L\u2019industriel naval doit autofinancer la production, ce qui génère des surcoûts sur le prix des sous-marins et frégates.',
    amount: 836_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/dyn/17/rapports/cion_def/l17b2048-tv_rapport-avis.pdf',
    ministryTag: 'Défense',
  },
  {
    title: 'Reports de charges impayés à l\u2019OCCAr : 380 M\u20ac',
    description:
      'Défaut de paiement de la France à l\u2019organisme européen de coopération en matière d\u2019armement. Une pratique qui mine la confiance des partenaires de défense.',
    amount: 380_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/dyn/17/rapports/cion_def/l17b2048-tv_rapport-avis.pdf',
    ministryTag: 'Défense',
  },
  {
    title: 'Surcoûts explosifs du MCO dus aux retards industriels : 1,879 Md\u20ac',
    description:
      'Les retards de livraison de nouveaux équipements (SLAM-F, Patrouilleurs) obligent à réparer des matériels obsolètes. Les crédits d\u2019entretien bondissent de 105 % (dépense subie).',
    amount: 1_879_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/dyn/17/rapports/cion_def/l17b2048-tv_rapport-avis.pdf',
    ministryTag: 'Défense',
  },
  // === AGRICULTURE ===
  {
    title: 'Subventions agricoles défavorables à l\u2019environnement : 3,8 Mds\u20ac/an',
    description:
      'Dépenses (exonérations sur les carburants fossiles et aides PAC couplées à l\u2019élevage) contredisant directement les objectifs climatiques de l\u2019État. 7 % des 53,6 Mds\u20ac du système alimentaire.',
    amount: 3_800_000_000,
    sourceUrl: 'https://www.i4ce.org/wp-content/uploads/2024/09/Les-financements-publics-du-systeme-alimentaire-francais.pdf',
    ministryTag: 'Agriculture',
  },
  {
    title: 'Budget de l\u2019Agence Bio en doublon : 15 M\u20ac/an',
    description:
      'Agence ciblée par une recommandation de suppression par le Sénat. Ses prérogatives font doublon avec celles de l\u2019administration centrale et des Chambres d\u2019agriculture.',
    amount: 15_000_000,
    sourceUrl: 'https://www.senat.fr/fileadmin/Illustrations/Controle/Structures_temporaires/2024-2025/CE-Agences_Etat/TOME_I_-_Rapport_CE_Agences.pdf',
    ministryTag: 'Agriculture',
  },
  // === RECHERCHE ===
  {
    title: 'Inefficience du Crédit Impôt Recherche (CIR) : 7 Mds\u20ac/an d\u2019effet d\u2019aubaine',
    description:
      'Dépense fiscale majeure accusée d\u2019effets d\u2019aubaine. Dépourvu de conditionnalité, de grands groupes captent l\u2019aide tout en supprimant des emplois scientifiques en France.',
    amount: 7_000_000_000,
    sourceUrl: 'https://www.ofce.sciences-po.fr/blog2024/fr/2025/20250115_ES/',
    ministryTag: 'Recherche',
  },
  // === ENVIRONNEMENT ===
  {
    title: 'Budget de communication de l\u2019Ademe : 150 M\u20ac/an contestés',
    description:
      'Dépense vivement contestée au Parlement pour financer des campagnes publicitaires jugées inefficaces. Le Parlement réclame la réinternalisation de ces missions.',
    amount: 150_000_000,
    sourceUrl: 'https://www.assemblee-nationale.fr/17/cr-dvp/25-26/c2526011.asp',
    ministryTag: 'Environnement',
  },
  // === CULTURE ===
  {
    title: 'Dotation surdimensionnée de France Télévisions : 2,568 Mds\u20ac/an',
    description:
      'Dépense critiquée par le Sénat en raison de la lenteur du processus de fusion avec Radio France et des refus de mutualisation des rédactions et fonctions supports.',
    amount: 2_568_000_000,
    sourceUrl: 'https://www.senat.fr/rap/a23-133-41/a23-133-41_mono.html',
    ministryTag: 'Culture',
  },
  {
    title: 'Subvention inutile au dispositif Pass Culture : 210 M\u20ac/an',
    description:
      'Effet d\u2019aubaine : l\u2019aide finance massivement la consommation de biens grand public (mangas, jeux vidéo) chez les grands distributeurs plutôt que la découverte artistique. Suppression recommandée par le Sénat.',
    amount: 210_000_000,
    sourceUrl: 'https://www.senat.fr/fileadmin/Illustrations/Controle/Structures_temporaires/2024-2025/CE-Agences_Etat/TOME_I_-_Rapport_CE_Agences.pdf',
    ministryTag: 'Culture',
  },
  // === TRAVAIL ===
  {
    title: 'Fraudes et siphonnage du Compte Personnel de Formation (CPF) : 500 M\u20ac/an',
    description:
      'Sur les 2 Md\u20ac annuels du CPF, des sommes colossales ont été détournées (49 000 fraudes identifiées) par des sociétés écrans en raison d\u2019une sécurisation défaillante au lancement.',
    amount: 500_000_000,
    sourceUrl: 'https://www.caissedesdepots.fr/sites/cdc.fr/files/2025-11/Mon%20Compte%20Formation%20_%20la%20Caisse%20des%20D%C3%A9p%C3%B4ts%20publie%20le%20rapport%20annuel%20de%20gestion%202024.pdf',
    ministryTag: 'Travail',
  },
  // === ÉDUCATION ===
  {
    title: 'Généralisation aveugle du Service National Universel (SNU) : 200 M\u20ac/an',
    description:
      'L\u2019État tente de généraliser ce service sans disposer de suivi budgétaire exhaustif des coûts complets par jeune. La Cour des comptes exige une remise à plat de ce projet.',
    amount: 200_000_000,
    sourceUrl: 'https://www.ccomptes.fr/sites/default/files/2024-09/20240913-SNU.pdf',
    ministryTag: 'Éducation',
  },
  // === COLLECTIVITÉS ===
  {
    title: 'Dérapage du déficit de fonctionnement des collectivités (APUL) : 16,7 Mds\u20ac',
    description:
      'Les collectivités locales refusent d\u2019appliquer l\u2019objectif de baisse de 0,5 % de leurs dépenses fixé par la LPFP, creusant dangereusement le besoin de financement de la Nation.',
    amount: 16_700_000_000,
    sourceUrl: 'https://www.agence-france-locale.fr/actualite/decryptage-face-a-des-comptes-publics-sous-pression-en-2024-quelle-contribution-des-collectivites-locales-a-laccroissement-du-deficit-et-de-la-dette/',
    ministryTag: 'Collectivités',
  },
  {
    title: 'Saupoudrage des subventions associatives de Paris : 1,8 Md\u20ac sur le mandat',
    description:
      'Volume cumulé des subventions distribuées par l\u2019exécutif parisien à des associations. Dépense décriée pour son manque de contrôle de performance et ses fins clientélistes.',
    amount: 1_800_000_000,
    sourceUrl: 'https://contribuablesassocies.org/categories/actualites/gaspillages-publics/',
    ministryTag: 'Collectivités',
  },
  {
    title: 'Dépenses d\u2019autopromotion des exécutifs locaux : 1 Md\u20ac/an',
    description:
      'Coût évalué des magazines municipaux et campagnes marketing. L\u2019Observatoire de l\u2019Éthique Publique dénonce l\u2019utilisation des deniers publics pour la promotion politique pré-électorale.',
    amount: 1_000_000_000,
    sourceUrl: 'https://www.observatoireethiquepublique.com/nos-propositions/notes/mieux-encadrer-les-depenses-de-communication-des-collectivites-territoriales.html',
    ministryTag: 'Collectivités',
  },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

function calculateHotScore(upvotes: number, downvotes: number, createdAt: Date): number {
  const score = upvotes - downvotes;
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const seconds = createdAt.getTime() / 1000;
  return order + (sign * seconds) / 45000;
}

export async function POST(request: NextRequest) {
  // Auth via secret key (same as AUTH_SECRET)
  const key = request.headers.get('x-reseed-key');
  if (!key || key !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < NEW_SEEDS.length; i++) {
      const item = NEW_SEEDS[i];

      // Check if already exists (by title pattern — first 40 chars)
      const titlePrefix = item.title.slice(0, 40);
      const existing = await db
        .select({ id: submissions.id })
        .from(submissions)
        .where(like(submissions.title, `${titlePrefix}%`))
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Spread across recent months for timeline variety
      const monthsBack = Math.floor((i / NEW_SEEDS.length) * 6);
      const dayOffset = i % 28;
      const createdAt = new Date(
        now.getFullYear(),
        now.getMonth() - monthsBack,
        Math.max(1, now.getDate() - dayOffset),
        10 + (i % 12),
      );
      const hotScore = calculateHotScore(0, 0, createdAt);

      await db.insert(submissions).values({
        authorDisplay: 'Nicolas Paye',
        title: item.title,
        slug: generateSlug(item.title),
        description: item.description,
        sourceUrl: item.sourceUrl,
        amount: String(item.amount),
        ministryTag: item.ministryTag,
        costPerTaxpayer: String(Math.round((item.amount / 18_600_000) * 100) / 100),
        status: 'published',
        moderationStatus: 'approved',
        hotScore: String(hotScore),
        isSeeded: 1,
        createdAt,
      });
      inserted++;
    }

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      total: NEW_SEEDS.length,
    });
  } catch (error) {
    console.error('Reseed error:', error);
    return NextResponse.json(
      { error: 'Reseed failed', details: String(error) },
      { status: 500 },
    );
  }
}
