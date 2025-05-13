import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BackHandler } from 'react-native';
import Constants from '../constants/Constants';

import Toolbar from '../screens/toolbar/Toolbar';
import Home from '../screens/home/Home';
import Settings from '../screens/settings/Settings';
import RegisterInfo from '../screens/register/RegisterInfo';
import ShareInfor from '../screens/share/ShareInfor';
import Start from '../screens/start/Start';
import Introduce from '../screens/introduce/Introduce';
import Webview from '../screens/webview/Webview';
import NotificationInfo from '../screens/notification/NotificationInfo';
import TermsOfService from '../screens/term_of_services/TermsOfService';
import PrivacyPolicy from '../screens/privacy_policy/PrivacyPolicy';
import CompanyProfile from '../screens/company_profile/CompanyProfile';
import Versions from '../screens/version/Versions';
import Sound from '../screens/sound/Sound';
import Confirm from '../screens/confirm/Confirm';
import EditUser from '../screens/edit_user/EditUser';
import ListHabit from '../screens/list_habit/ListHabit';
import ListAllHabit from '../screens/list_habit/ListAllHabit';
import ListHabitHealth from '../screens/list_habit/ListHabitHealth';
import ListHabitLearning from '../screens/list_habit/ListHabitLearning';
import ListHabitContribution from '../screens/list_habit/ListHabitContribution';
import CreateHabit from '../screens/habit/CreateHabit';
import PreviewHabit from '../screens/preview_habit/PreviewHabit';
import Privacy from '../screens/privacy/Privacy';
import Charing from '../screens/charing/Charing';
import ChooseHabitCharing from '../screens/charing/ChooseHabitCharing';
import CreatHabitOnlyToday from '../screens/charing/CreateHabitOnlyToday';
import CharinHistory from '../screens/charin_history/CharinHistory';
import Calendar from '../screens/calendar/Calendar';
import PdfView from '../screens/privacy/PdfView';

const Stack = createStackNavigator();

const Route = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Constants.SCREEN_START.KEY}
        screenOptions={{
          headerShown: false, // Hide headers globally (you can customize per screen)
        }}
      >
        <Stack.Screen
          name={Constants.SCREEN_START.KEY}
          component={Start}
        />
        <Stack.Screen
          name={Constants.SCREEN_INTRODUCE.KEY}
          component={Introduce}
        />
        <Stack.Screen
          name={Constants.SCREEN_HOME.KEY}
          component={Home}
        />
        <Stack.Screen
          name={Constants.TOOL_BAR.KEY}
          component={Toolbar}
        />
        <Stack.Screen
          name={Constants.SCREEN_REGISTER_INFO.KEY}
          component={RegisterInfo}
        />
        <Stack.Screen
          name={Constants.SCREEN_OTHER.KEY}
          component={Settings}
        />
        <Stack.Screen
          name={Constants.SCREEN_SHARE_INFOR.KEY}
          component={ShareInfor}
        />
        <Stack.Screen
          name={Constants.SCREEN_WEBVIEW.KEY}
          component={Webview}
        />
        <Stack.Screen
          name={Constants.SCREEN_NOTIFICATION_INFO.KEY}
          component={NotificationInfo}
        />
        <Stack.Screen
          name={Constants.SCREEN_TERMS_OF_SERVICE.KEY}
          component={TermsOfService}
        />
        <Stack.Screen
          name={Constants.SCREEN_PRIVACY_POLICY.KEY}
          component={PrivacyPolicy}
        />
        <Stack.Screen
          name={Constants.SCREEN_COMPANY_PROFILE.KEY}
          component={CompanyProfile}
        />
        <Stack.Screen
          name={Constants.SCREEN_VERSION.KEY}
          component={Versions}
        />
        <Stack.Screen
          name={Constants.SCREEN_SOUND.KEY}
          component={Sound}
        />
        <Stack.Screen
          name={Constants.SCREEN_CONFIRM.KEY}
          component={Confirm}
        />
        <Stack.Screen
          name={Constants.SCREEN_LIST_HABIT.KEY}
          component={ListHabit}
        />
        <Stack.Screen
          name={Constants.SCREEN_LIST_ALL_HABIT.KEY}
          component={ListAllHabit}
        />
        <Stack.Screen
          name={Constants.SCREEN_LIST_HABIT_HEALTH.KEY}
          component={ListHabitHealth}
        />
        <Stack.Screen
          name={Constants.SCREEN_LIST_HABIT_LEARNING.KEY}
          component={ListHabitLearning}
        />
        <Stack.Screen
          name={Constants.SCREEN_LIST_HABIT_CONTRIBUTION.KEY}
          component={ListHabitContribution}
        />
        <Stack.Screen
          name={Constants.SCREEN_CREATE_HABIT.KEY}
          component={CreateHabit}
        />
        <Stack.Screen
          name={Constants.SCREEN_EDIT_USER.KEY}
          component={EditUser}
        />
        <Stack.Screen
          name={Constants.SCREEN_PREVIEW_HABIT.KEY}
          component={PreviewHabit}
        />
        <Stack.Screen
          name={Constants.SCREEN_PRIVACY.KEY}
          component={Privacy}
        />
        <Stack.Screen
          name={Constants.SCREEN_CHARING.KEY}
          component={Charing}
        />
        <Stack.Screen
          name={Constants.SCREEN_CHOOSE_HABIT_CHARING.KEY}
          component={ChooseHabitCharing}
        />
        <Stack.Screen
          name={Constants.SCREEN_CREATE_HABIT_ONLY_TODAY.KEY}
          component={CreatHabitOnlyToday}
        />
        <Stack.Screen
          name={Constants.SCREEN_CHARIN_HISTORY.KEY}
          component={CharinHistory}
        />
        <Stack.Screen
          name={Constants.SCREEN_CALENDAR.KEY}
          component={Calendar}
        />
        <Stack.Screen
          name={Constants.SCREEN_PDF_VIEW.KEY}
          component={PdfView}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Route;
