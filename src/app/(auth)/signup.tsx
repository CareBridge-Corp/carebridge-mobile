import { StyleSheet, View } from "react-native";
import { SignupForm } from "./components/SignupForm";

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <SignupForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
