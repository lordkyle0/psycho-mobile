/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import notifee from 'react-native-notify-kit';
import App from './App';
import { name as appName } from './app.json';
import { handleBackgroundEvent } from './src/services/notifications.service';

// Doit être enregistré au démarrage du bundle, avant tout rendu.
notifee.onBackgroundEvent(handleBackgroundEvent);

AppRegistry.registerComponent(appName, () => App);
