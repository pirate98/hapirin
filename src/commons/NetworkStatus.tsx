import React, { useEffect, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Modal,
  Text,
  View,
  I18nManager,
  StyleSheet,
} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';

// Translation getter
const translationGetters: Record<string, () => object> = {
  jp: () => require('../languages/japanese.json'),
};

// Set up i18n config
const setI18nConfig = () => {
  const fallback = { languageTag: 'jp', isRTL: false };

  const { languageTag, isRTL } =
    RNLocalize.findBestLanguageTag(Object.keys(translationGetters)) || fallback;

  I18nManager.forceRTL(isRTL);
  (i18n as any).translations = { [languageTag]: translationGetters[languageTag]() };
  (i18n as any).locale = languageTag;
  (i18n as any).fallbacks = true;

};

const NetworkStatus: React.FC = () => {
  const [locale, setLocale] = useState(RNLocalize.getLocales()[0]?.languageTag);

  useEffect(() => {
    setI18nConfig(); // Initial config

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const currentLocale = RNLocalize.getLocales()[0]?.languageTag;
        if (currentLocale && currentLocale !== locale) {
          setLocale(currentLocale);
          setI18nConfig();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [locale]);

  return (
    <Modal onRequestClose={() => null} visible={true} transparent={true}>
      <View style={styles.viewModal}>
        <View style={styles.viewContentModal}>
          <View style={styles.viewText}>
            <Text style={styles.contentNetwork}>
              {(i18n as any).t('txt_dialog_disconnect_internet')}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  viewModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewContentModal: {
    borderColor: 'gray',
    borderWidth: 0.5,
    width: 300,
    height: 120,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  viewText: {
    padding: 20,
  },
  contentNetwork: {
    fontSize: 15,
  },
});

export default NetworkStatus;
