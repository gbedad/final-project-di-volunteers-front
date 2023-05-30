import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import Home from './components/Home';
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
import CardList from './components/cards/Cards';
import { UserProvider } from './UserContext';
import MissionList from './components/missions/MissionList';
import AdminPanel from './components/AdminPanel';
import DocumentCheckbox from './components/files/filesSaved';
import SelectFormActivity from './components/SelectActivity';
import AddressAutocomplete from './components/AddressAutocomplete';

function App() {
  return (
    <UserProvider>
      <AppBarMenu />

      <Routes>
        <Route path="/register" element={<Register />} />
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
        {/* <Route path="/view-users" element={<AdminPanel />} /> */}
        <Route path="/change-status" element={<ChangeUserStatus />} />
        <Route path="/update-files-received" element={<DocumentCheckbox />} />
        <Route path="/add-activity" element={<SelectFormActivity />} />
        <Route path="update-address" element={<AddressAutocomplete />} />
        {/* <Route path="/" element={<CardList />} /> */}
        <Route path="/missions" element={<MissionList />} />
        <Route exact path="/" element={<Home />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
