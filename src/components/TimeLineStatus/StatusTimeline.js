import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import HotelIcon from '@mui/icons-material/Hotel';
import RepeatIcon from '@mui/icons-material/Repeat';
import Typography from '@mui/material/Typography';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksOneOutlinedIcon from '@mui/icons-material/LooksOneOutlined';
import LooksTwoOutlinedIcon from '@mui/icons-material/LooksTwoOutlined';
import Looks3OutlinedIcon from '@mui/icons-material/Looks3Outlined';
import { TbNumber1 } from 'react-icons/tb';
import { TbNumber2 } from 'react-icons/tb';
import { TbNumber3 } from 'react-icons/tb';
import { TbNumber4 } from 'react-icons/tb';
import { TbNumber5 } from 'react-icons/tb';

export default function StatusTimelineComponent(props) {
  const { userStatusStep } = props;
  console.log(parseFloat(userStatusStep));
  return (
    <Timeline position="alternate">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) >= 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="p" component="span">
            Créer votre compte
          </Typography>
          <Typography variant="body2">
            Seules quelques informations basiques sont demandées, ainsi qu'un
            texte de motivation que nous lirons attentivement.
          </Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        {/* <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          align="right"
          variant="body2"
          color="text.secondary">
          9:30 am
        </TimelineOppositeContent> */}
        <TimelineSeparator>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) >= 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
          <TimelineDot color="secondary">
            <TbNumber1 style={{ fontSize: '22px' }} />
          </TimelineDot>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="p" component="span" color="success.main">
            Votre compte est créé
          </Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          {/* <TimelineDot /> */}
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="p" component="span"></Typography>
          <Typography variant="body2"></Typography>
        </TimelineContent>
      </TimelineItem>
      {/* <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          variant="body2"
          color="text.secondary">
          10:00 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <KeyboardOutlinedIcon />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            Code
          </Typography>
          <Typography>Because it&apos;s awesome!</Typography>
        </TimelineContent>
      </TimelineItem> */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
          <TimelineDot
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}>
            <TbNumber2 style={{ fontSize: '22px' }} />
          </TimelineDot>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="p" component="span" color="success.main">
            Nous aimerions en savoir plus
          </Typography>
          {/* <Typography variant="body2">
            Qui vous êtes (MON PROFIL), dans quelles matières vous souhaitez
            accompagner un élève et à quel niveau (JE PEUX AIDER).
          </Typography> */}
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          {/* <TimelineDot variant="outlined" /> */}
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 1
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="p" component="span">
            Nous en dire plus
          </Typography>
          <Typography variant="body2">
            Qui vous êtes (MON PROFIL), dans quelles matières vous souhaitez
            accompagner un élève et à quel niveau (JE PEUX AIDER).
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem>
        <TimelineSeparator>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) >= 3
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
          <TimelineDot
            sx={{
              bgcolor:
                parseFloat(userStatusStep) >= 3
                  ? 'secondary.main'
                  : 'standard.main',
            }}>
            <TbNumber3 style={{ fontSize: '22px' }} />
          </TimelineDot>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 3
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="p" component="span" color={'success.main'}>
            Le moment est venu de nous entretenir
          </Typography>
          {/* <Typography variant="body2">
            Nous prenons contact pour vous proposer un ou plusieurs rendez-vous.
          </Typography> */}
        </TimelineContent>
      </TimelineItem>

      <TimelineItem>
        <TimelineSeparator>
          {/* <TimelineDot variant="outlined" /> */}
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) >= 3
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="p" component="span">
            Nous entretenir
          </Typography>
          <Typography variant="body2">
            Nous prenons contact pour vous proposer un ou plusieurs rendez-vous.
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem>
        <TimelineSeparator>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) >= 4
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
          <TimelineDot
            sx={{
              bgcolor:
                parseFloat(userStatusStep) >= 4
                  ? 'secondary.main'
                  : 'standard.main',
            }}>
            <TbNumber4 style={{ fontSize: '22px' }} />
          </TimelineDot>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 4
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="p" component="span" color="success.main">
            Il reste à compléter votre dossier
          </Typography>
          {/* <Typography variant="body2">
            - Téléchargez vous pièces d'identité, extrait de casier judiciaire,
            CV et/ou diplômes et/ou attestations. - Passez le test de français
            (niveau collège) - Signez la convention d'engagement réciproque.
          </Typography> */}
        </TimelineContent>
      </TimelineItem>

      <TimelineItem>
        <TimelineSeparator>
          {/* <TimelineDot variant="outlined" /> */}
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 4
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="p" component="span">
            Finaliser
          </Typography>
          <Typography variant="body2">
            - Téléchargez vous pièces d'identité, extrait de casier judiciaire,
            CV et/ou diplômes et/ou attestations. - Passez le test de français
            (niveau collège) - Signez la convention d'engagement réciproque.
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem>
        <TimelineSeparator>
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) >= 5
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
          <TimelineDot
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 4
                  ? 'secondary.main'
                  : 'standard.main',
            }}>
            <TbNumber5 style={{ fontSize: '22px' }} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="p" component="span" color="success.main">
            Votre candidature est validée
          </Typography>
          {/* <Typography variant="body2">
            Nous cherchons parmi les demandes en attente, celles qui
            correspondent à vos souhaits.
          </Typography> */}
        </TimelineContent>
      </TimelineItem>

      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 4
                  ? 'success.main'
                  : 'standard.main',
            }}
          />
          <TimelineConnector
            sx={{
              bgcolor:
                parseFloat(userStatusStep) > 4
                  ? 'secondary.main'
                  : 'standard.main',
            }}
          />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="p" component="span">
            Bienvenue !
          </Typography>
          <Typography variant="body2">
            Nous cherchons parmi les demandes en attente, celles qui
            correspondent à vos souhaits.
          </Typography>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
