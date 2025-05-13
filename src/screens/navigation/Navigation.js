import {Actions} from 'react-native-router-flux';
import Constants from '../../constants/Constants';

export default class Navigation {
  /**
   * function define navigate to Home with @{params}
   *
   * @param {datas} object
   */
  static navigateToHome(datas) {
    if (Actions.currentScene !== Constants.SCREEN_HOME.KEY) {
      Actions[Constants.SCREEN_HOME.KEY](datas);
    }
  }

  static navigateToRegisterInfo(datas) {
    if (Actions.currentScene !== Constants.SCREEN_REGISTER_INFO.KEY) {
      Actions[Constants.SCREEN_REGISTER_INFO.KEY](datas);
    }
  }

  static gotoCharing(datas) {
    if (Actions.currentScene !== Constants.SCREEN_CHARING.KEY) {
      Actions[Constants.SCREEN_CHARING.KEY](datas);
    }
  }

  static gotoCreateHabitOnlyToday(datas) {
    if (Actions.currentScene !== Constants.SCREEN_CREATE_HABIT_ONLY_TODAY.KEY) {
      Actions[Constants.SCREEN_CREATE_HABIT_ONLY_TODAY.KEY](datas);
    }
  }

  static gotoChooseHabitCharing(datas) {
    if (Actions.currentScene !== Constants.SCREEN_CHOOSE_HABIT_CHARING.KEY) {
      Actions[Constants.SCREEN_CHOOSE_HABIT_CHARING.KEY](datas);
    }
  }

  static gotoHabitType1(datas) {
    if (Actions.currentScene !== Constants.SCREEN_LIST_HABIT.KEY) {
      Actions[Constants.SCREEN_LIST_HABIT.KEY](datas);
    }
  }

  static gotoHabitType2(datas) {
    if (Actions.currentScene !== Constants.SCREEN_LIST_HABIT.KEY) {
      Actions[Constants.SCREEN_LIST_HABIT.KEY](datas);
    }
  }

  static gotoHabitType3(datas) {
    if (Actions.currentScene !== Constants.SCREEN_LIST_HABIT.KEY) {
      Actions[Constants.SCREEN_LIST_HABIT.KEY](datas);
    }
  }

  static gotoCalendar(datas) {
    if (Actions.currentScene !== Constants.SCREEN_CALENDAR.KEY) {
      Actions[Constants.SCREEN_CALENDAR.KEY](datas);
    }
  }

  static gotoOtherSetting(datas) {
    if (Actions.currentScene !== Constants.SCREEN_OTHER.KEY) {
      Actions[Constants.SCREEN_OTHER.KEY](datas);
    }
  }

  static gotoShareInfo(datas) {
    if (Actions.currentScene !== Constants.SCREEN_SHARE_INFOR.KEY) {
      Actions[Constants.SCREEN_SHARE_INFOR.KEY](datas);
    }
  }
  static gotoIntroduceInfo(datas) {
    if (Actions.currentScene !== Constants.SCREEN_INTRODUCE.KEY) {
      Actions[Constants.SCREEN_INTRODUCE.KEY](datas);
    }
  }

  static gotoWebview(datas) {
    if (Actions.currentScene !== Constants.SCREEN_WEBVIEW.KEY) {
      Actions[Constants.SCREEN_WEBVIEW.KEY](datas);
    }
  }

  static gotoNotificationInfo(datas) {
    if (Actions.currentScene !== Constants.SCREEN_NOTIFICATION_INFO.KEY) {
      Actions[Constants.SCREEN_NOTIFICATION_INFO.KEY](datas);
    }
  }

  static gotoTermsOfService(datas) {
    if (Actions.currentScene !== Constants.SCREEN_TERMS_OF_SERVICE.KEY) {
      Actions[Constants.SCREEN_TERMS_OF_SERVICE.KEY](datas);
    }
  }

  static gotoPrivacyPolicy(datas) {
    if (Actions.currentScene !== Constants.SCREEN_PRIVACY_POLICY.KEY) {
      Actions[Constants.SCREEN_PRIVACY_POLICY.KEY](datas);
    }
  }

  static gotoCompanyProfile(datas) {
    if (Actions.currentScene !== Constants.SCREEN_COMPANY_PROFILE.KEY) {
      Actions[Constants.SCREEN_COMPANY_PROFILE.KEY](datas);
    }
  }

  static gotoVersions(datas) {
    if (Actions.currentScene !== Constants.SCREEN_VERSION.KEY) {
      Actions[Constants.SCREEN_VERSION.KEY](datas);
    }
  }
  static gotoSound(datas) {
    if (Actions.currentScene !== Constants.SCREEN_SOUND.KEY) {
      Actions[Constants.SCREEN_SOUND.KEY](datas);
    }
  }
  static gotoConfirm(datas) {
    if (Actions.currentScene !== Constants.SCREEN_CONFIRM.KEY) {
      Actions[Constants.SCREEN_CONFIRM.KEY](datas);
    }
  }
  static gotoListHabit(datas) {
    if (Actions.currentScene !== Constants.SCREEN_LIST_HABIT.KEY) {
      Actions[Constants.SCREEN_LIST_HABIT.KEY](datas);
    }
  }
  static gotoHome(datas) {
    if (
      (Actions.currentScene === Constants.SCREEN_CHARIN_HISTORY.KEY ||
        Actions.currentScene === Constants.SCREEN_CHOOSE_HABIT_CHARING.KEY ||
        Actions.currentScene === Constants.SCREEN_OTHER.KEY) &&
      datas === 'back'
    ) {
      Actions.replace(Constants.SCREEN_HOME.KEY);
    } else if (Actions.currentScene === Constants.SCREEN_START.KEY) {
      Actions.jump(Constants.SCREEN_HOME.KEY);
    }
  }

  static gotoCreateHabit(datas) {
    if (Actions.currentScene !== Constants.SCREEN_CREATE_HABIT.KEY) {
      Actions[Constants.SCREEN_CREATE_HABIT.KEY](datas);
    }
  }
  static gotoEditUser(datas) {
    if (Actions.currentScene !== Constants.SCREEN_EDIT_USER.KEY) {
      Actions[Constants.SCREEN_EDIT_USER.KEY](datas);
    }
  }
  static gotoPreviewHabit(datas) {
    if (Actions.currentScene !== Constants.SCREEN_PREVIEW_HABIT.KEY) {
      Actions[Constants.SCREEN_PREVIEW_HABIT.KEY](datas);
    }
  }
  static gotoPrivacy(datas) {
    if (Actions.currentScene !== Constants.SCREEN_PRIVACY.KEY) {
      Actions[Constants.SCREEN_PRIVACY.KEY](datas);
    }
  }
  static gotoCharinHistory(datas) {
    if (Actions.currentScene !== Constants.SCREEN_CHARIN_HISTORY.KEY) {
      Actions[Constants.SCREEN_CHARIN_HISTORY.KEY](datas);
    }
  }

  static gotoPdfView(datas) {
    if (Actions.currentScene !== Constants.SCREEN_PDF_VIEW.KEY) {
      Actions[Constants.SCREEN_PDF_VIEW.KEY](datas);
    }
  }

  static gotoStart(datas) {
    Actions.replace(Constants.SCREEN_START.KEY);
  }
}
