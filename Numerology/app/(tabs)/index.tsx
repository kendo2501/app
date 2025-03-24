// App.js
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import NumerologyForm from "../../components/NumerologyForm";

const App = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <NumerologyForm />
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
