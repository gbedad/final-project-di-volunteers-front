import React from 'react';
import { Container, Typography, Box, Divider, Link } from '@mui/material';

const GeneralConditions = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Mentions légales
      </Typography>

      <Box>
        <Typography variant="body1" paragraph>
          MyCogniverse est un site édité par l'association Séphora Berrebi,
          association loi 1901 d'intérêt général, domiciliée au 68, avenue Ledru
          Rollin 75012 Paris.
        </Typography>
        <Typography variant="body1" paragraph>
          RNA : W751237786
          <br /> SIRET : 827 780 602.
          <br /> Représentante légale : Madame Emmanuelle Berrebi.
          <br /> Présidente : Madame Emmanuelle Berrebi.
          <br /> Administrateur : Monsieur Gérald Berrebi.
          <br />
          Email :
          <Link
            href="mailto:associationsephoraberrebi@gmail.com"
            variant="body1">
            associationsephoraberrebi@gmail.com
          </Link>
        </Typography>
        <Typography variant="body1" paragraph>
          MyCogniverse est hébergé par Gandi SAS 63-65 boulevard Masséna 75013
          Paris France.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h5" gutterBottom>
          Description du site
        </Typography>
        <Typography variant="body1" paragraph>
          MyCogniverse est le site de référence de l'activité de tutorat
          solidaire de l'association Séphora Berrebi. A terme, l'objectif est de
          simplifier la gestion de cette activité notamment en optimisant la
          mise en relation entre tuteurs et bénéficiaires de tutorat et le suivi
          de l'activité. A ce jour, le site permet de faciliter le recrutement
          des tuteurs en particulier grâce au recueil des informations requises
          pour valider, ou pas, leur candidature.
        </Typography>
        <Typography variant="body1" paragraph>
          Les utilisateurs de MyCogniverse doivent créer un profil puis être
          validés par un représentant de l'administrateur pour utiliser le site.
          Les utilisateurs s'engagent à ne créer qu'un seul profil sur le site.
          Ce profil peut être modifié, administré et supprimé depuis le tableau
          de bord mis à disposition des utilisateurs.
        </Typography>
        <Typography variant="body1" paragraph>
          L'utilisation du site MyCogniverse est exclusivement réservée aux
          personnes physiques de plus de 16 ans. Si ces conditions ne sont pas
          respectées, MyCogniverse se réserve la possibilité de procéder à la
          suppression de votre compte.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h5" gutterBottom>
          Politique de confidentialité
        </Typography>
        <Typography variant="body1" paragraph>
          En sa qualité de responsable du traitement, l'association accorde une
          grande importance à la protection et au respect de votre vie privée.
          La présente politique vise à vous informer de nos pratiques concernant
          la collecte, l'utilisation et le partage des informations que les
          utilisateurs sont amenés à nous fournir par le biais de notre
          plateforme accessible depuis le site internet MyCogniverse.org.
        </Typography>
        <Typography variant="body1" paragraph>
          L'association Séphora Berrebi s'engage à ce que la collecte et le
          traitement de vos données, soient conformes au règlement général de
          protection des données (RGPD) et à la loi n° 78-17 du 6 janvier 1978
          dite "Informatique et libertés" pour assurer le meilleur niveau
          possible de protection.
        </Typography>
        <Typography variant="body1" paragraph>
          Les données sont conservées indéfiniment sauf vous sollicitez leur
          suppression en écrivant à{' '}
          <Link
            href="mailto:associationsephoraberrebi@gmail.com"
            variant="body1">
            associationsephoraberrebi@gmail.com
          </Link>
          .
        </Typography>
        <Typography variant="body1" paragraph>
          MyCogniverse ne vend ni ne loue aucune information ni donnée sur ses
          membres.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h5" gutterBottom>
          Conditions générales d'utilisation
        </Typography>
        <Typography variant="body1" paragraph>
          L'utilisation du site MyCogniverse est soumise à l'acceptation des
          présentes Conditions Générales. En accédant à MyCogniverse, vous vous
          engagez à vous référer régulièrement à la dernière version des
          Conditions Générales disponible en permanence sur le site.
          MyCogniverse se réserve le droit d'interdire l'accès au site en tant
          que membre. MyCogniverse se réserve le droit d'interdire ou de
          restreindre l'accès au site à un membre en cas de non-respect de ces
          conditions ou de mauvais comportement à l'égard d'un autre membre.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h5" gutterBottom>
          Dépôt de candidature
        </Typography>
        <Typography variant="body1" paragraph>
          Les utilisateurs déposent les informations demandées en suivant le
          parcours prévu sur le site. Les membres ne peuvent candidater qu'à une
          mission proposée. Une fois leur candidature validée, la mission
          convenue en définitive entre l'utilisateur et l'association pourra
          différer de celle à laquelle il a postulé initialement.
        </Typography>
        <Typography variant="body1" paragraph>
          Tout utilisateur s'engage à ne communiquer que des informations,
          contenus, photographies et vidéos qui lui appartiennent et dont il
          détient les droits. Les candidats tuteurs et tuteurs ne peuvent
          aucunement représenter une entité morale. Les éléments communiqués ne
          doivent pas comporter d'informations erronées, illicites ou de nature
          à induire leurs destinataires en erreur.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h5" gutterBottom>
          Clause de responsabilité
        </Typography>
        <Typography variant="body1" paragraph>
          La présente plateforme MyCogniverse.org fait partie intégrante du
          système d'information de l'association Séphora Berrebi. Malgré tout le
          soin apporté au respect des textes officiels, à la vérification des
          contenus et des informations, les éléments mis en ligne ne sauraient,
          de quelque manière que ce soit, prétendre à l'exactitude et engager la
          responsabilité de l'association Séphora Berrebi. Les informations
          et/ou documents disponibles sur ce site sont susceptibles d'être
          modifiés à tout moment, et peuvent faire l'objet de mises à jour. Les
          termes du présent document pourront être modifiés à tout moment, sans
          préavis, en fonction des modifications apportées à la plateforme, de
          l'évolution de la législation ou pour tout autre motif jugé
          nécessaire.
        </Typography>
        <Typography variant="body1" paragraph>
          L'association Séphora Berrebi ne pourra en aucun cas être tenue
          responsable de tout dommage de quelque nature qu'il soit résultant de
          l'interprétation ou de l'utilisation des informations et/ou documents
          disponibles sur ce site.
        </Typography>
      </Box>
    </Container>
  );
};

export default GeneralConditions;
