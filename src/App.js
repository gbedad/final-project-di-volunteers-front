import { Route, Routes } from 'react-router-dom';
import './App.css';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import Home from './pages/HomePage';
import Register from './components/RegisterForm';
import Login from './components/Login';
import ProfilePage from './components/Profile';
import AlertCancelRegistration from './components/AlertCancelRegistration';
import AppBarMenu from './components/AppBarMenu';
import AllUsers from './components/AllUsers';
import ChangeUserStatus from './components/ChangeUserStatus';
import Stepper from './components/Stepper';
import Uploads from './components/FileUploader';
import DaySlotSkill from './components/DaySlotSkills';
import TopicSkills from './components/TopicSkills';

import { UserProvider } from './UserContext';
import MissionList from './components/missions/MissionList';
import AdminPanel from './components/AdminPanel';
import DocumentCheckbox from './components/files/filesSaved';
import SelectFormActivity from './components/SelectActivity';
import AddressAutocomplete from './components/AddressAutocomplete';
import FormInterviewComponent from './components/interviews/Interview';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ResetPasswordForm from './components/ResetPasswordForm';
import MissionsPage from './components/missions/MissionsPage';
import MissionCard from './components/missions/MissionCard';
import { AuthProvider } from './AuthContext';
import { CourseProvider } from './components/courses/CourseContext';
import CardList from './components/cards/Cards';
import Lassociation from './pages/lassociation';
import Tutorat from './pages/focusTutorat';
import HomePage from './pages/HomePage';
import CoursePage from './components/courses/CoursePage';
import VirtualizedTable from './components/courses/CoursePage2';

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <AppBarMenu />

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:id/:token"
            element={<ResetPassword />}
          />

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
          {/* <Route path="/view-users" element={<AdminPanel />} /> */}
          <Route path="/change-status" element={<ChangeUserStatus />} />
          <Route path="/update-files-received" element={<DocumentCheckbox />} />
          <Route path="/add-activity" element={<SelectFormActivity />} />
          <Route path="update-address" element={<AddressAutocomplete />} />
          <Route path="add-interviews" element={<FormInterviewComponent />} />
          {/* <Route path="/" element={<CardList />} /> */}
          <Route path="/all-missions" element={<MissionsPage />} />
          <Route path="/missions/update/:id" element={<MissionCard />} />
          <Route path="/tutorat" element={<Tutorat />} />
          <Route path="/missions" element={<CardList />} />

          <Route path="/courses" element={<CoursePage />} />
          <Route path="/courses2" element={<VirtualizedTable />} />

          <Route exact path="/" element={<HomePage />} />
        </Routes>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
