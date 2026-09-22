import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
