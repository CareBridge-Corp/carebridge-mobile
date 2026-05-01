import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In
    console.log("Google Sign-In pressed");
  };

  const handleEmailSignUp = () => {
    router.push("/(auth)/signup");
  };

  const handleSkipToHome = () => {
    router.replace("/(app)" as Href);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkipToHome}>
        <Text style={styles.skipText}>Skip</Text>
        <Ionicons name="arrow-forward" size={16} color="#4A5568" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.message}>
          Autism is not a disease,{"\n"}it is a developmental{"\n"}disorder.
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        {/* Google Sign In Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Email Sign Up Button */}
        <TouchableOpacity
          style={styles.emailButton}
          onPress={handleEmailSignUp}
          activeOpacity={0.7}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color="#4A5568"
            style={styles.emailIcon}
          />
          <Text style={styles.emailButtonText}>Sign up with Email</Text>
        </TouchableOpacity>

        {/* Page Indicator */}
        <View style={styles.pageIndicator}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 16,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A5568",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  message: {
    fontSize: 32,
    fontWeight: "600",
    color: "#1A365D",
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: 16,
    borderRadius: 28,
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
  },
  emailIcon: {
    marginRight: 4,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A5568",
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E0",
  },
  dotActive: {
    backgroundColor: "#4A5568",
  },
});
