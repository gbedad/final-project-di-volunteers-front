import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useJwt } from 'react-jwt';
import './App.css';
// import IconButton from '@mui/material/IconButton';
// import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// import Home from './pages/HomePage';
import Register from './components/RegisterForm';
import Login from './components/Login';
import ProfilePage from './components/Profile';
import AlertCancelRegistration from './components/AlertCancelRegistration';
import AppBarMenu from './components/navbar/AppBarMenu';

import AllUsers from './components/AllUsers';
import ChangeUserStatus from './components/ChangeUserStatus';
import Stepper from './components/Stepper';
import Uploads from './components/FileUploader';
import DaySlotSkill from './components/DaySlotSkills';
import TopicSkills from './components/TopicSkills';

// import { UserProvider } from './UserContext';
// import MissionList from './components/missions/MissionList';
// import AdminPanel from './components/AdminPanel';
import DocumentCheckbox from './components/files/filesSaved';
import SelectFormActivity from './components/SelectActivity';
import AddressAutocomplete from './components/AddressAutocomplete';
import FormInterviewComponent from './components/interviews/Interview';
import FormPreInterviewComponent from './components/interviews/PreInterview';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
// import ResetPasswordForm from './components/ResetPasswordForm';
import MissionsPage from './components/missions/MissionsPage';
import MissionCard from './components/missions/MissionCard';

import { AuthProvider } from './AuthContext.js';
import { CourseProvider } from './components/courses/CourseContext';
import CardList from './components/cards/Cards';
// import Lassociation from './pages/lassociation';
import Tutorat from './pages/focusTutorat';
import HomePage from './pages/HomePage';
import Faq from './pages/faq';
import MentionsLegales from './pages/mentionsLegales.js';
import BottomNavigation from './components/navbar/BottomNavigation.js';
// import CoursePage from './components/courses/CoursePage';
import VirtualizedTable from './components/courses/CoursePage2';
import Error404 from './pages/404';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/navbar/AppBarLayout.js';

import CoursesModule from './modules/Courses/CoursesModule';

import {
  cyan,
  purple,
  green,
  grey,
  // orange,
  // red,
  // blue,
  blueGrey,
} from '@mui/material/colors';
import RecruitmentModule from './Recruitment.js';

const theme = createTheme({
  palette: {
    primary: { main: cyan[900] },
    light: { main: cyan[500] },
    secondary: { main: purple[400], dark: purple[700] },
    trash: { main: blueGrey[200] },
    success: { main: green[500], tooltip: green[100] },
    menu: { main: blueGrey[400] },

    text: {
      disabled: grey[500],
      label: grey[600],
    },

    background: {
      disabled: 'transparent',
    },
  },
  select: {
    p: { fontSize: '1rem' },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 425,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
      '3xl': 1920,
      '4xl': 2560,
      '5xl': 3200,
    },
  },
});

function App() {
  // }

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <AppBarMenu />
        {/* <AppLayout> */}
        <Toaster />

        <Routes>
          <Route path="/courses" element={<CoursesModule />} />
          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:id/:token"
            element={<ResetPassword />}
          />
          <Route path="/cgu" element={<MentionsLegales />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" />
          <Route path="/stepper" element={<Stepper />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-skill" element={<DaySlotSkill />} />
          <Route path="/create-skill" element={<TopicSkills />} />
          <Route path="/upload" element={<Uploads />} />

          <Route
            path="/cancel-registration"
            element={<AlertCancelRegistration />}
          />
          <Route path="/view-users" element={<AllUsers />} />
          <Route path="/change-status" element={<ChangeUserStatus />} />
          <Route path="/update-files-received" element={<DocumentCheckbox />} />
          <Route path="/add-activity" element={<SelectFormActivity />} />
          <Route path="update-address" element={<AddressAutocomplete />} />
          <Route path="add-interviews" element={<FormInterviewComponent />} />
          <Route
            path="add-pre-interview"
            element={<FormPreInterviewComponent />}
          />
          <Route path="/all-missions" element={<MissionsPage />} />

          <Route path="/missions/update/:id" element={<MissionCard />} />
          <Route path="/tutorat" element={<Tutorat />} />
          <Route path="/missions" element={<CardList />} />

          <Route path="/courses2" element={<VirtualizedTable />} />

          <Route exact path="/" element={<HomePage />} />

          <Route path="*" element={<Error404 />} />
        </Routes>
        {/* </AppLayout> */}
        <BottomNavigation />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
