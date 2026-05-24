import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import VerifyChildScreen from "../(child)/verify-child";
import VerifyParentScreen from "../(parent)/verify-parent";
import {
  IconButton,
  Screen,
  Text,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";
import { useProfile } from "../hooks/useProfile";
import { useChildrenStore } from "../store/childrenStore";

export default function VerificationStepperWrapper() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { activeChild } = useChildrenStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [initializing, setInitializing] = useState(true);

  const parentStatus = profile?.status || "UNVERIFIED";
  const childStatus = activeChild?.status || "UNVERIFIED";

  useEffect(() => {
    if (!profileLoading) {
      if (parentStatus === "VERIFIED" && childStatus !== "VERIFIED") {
        setStep(2);
      } else if (parentStatus !== "VERIFIED") {
        setStep(1);
      } else if (parentStatus === "VERIFIED" && childStatus === "VERIFIED") {
        router.back();
        return;
      }
      setInitializing(false);
    }
  }, [profileLoading, parentStatus, childStatus, router]);

  const handleParentSuccess = () => {
    if (childStatus === "VERIFIED") router.back();
    else setStep(2);
  };

  const handleChildSuccess = () => router.back();

  const handleBack = () => {
    if (step === 2 && parentStatus !== "VERIFIED") setStep(1);
    else router.back();
  };

  if (profileLoading || initializing) {
    return (
      <Screen background={colors.surfaceMuted}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" tone="secondary" style={{ marginTop: spacing[3] }}>
            Loading verification status...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-back"
          accessibilityLabel="Back"
          onPress={handleBack}
        />
        <View style={styles.stepper}>
          <StepNode
            label="Parent"
            active={step >= 1 || parentStatus === "VERIFIED"}
            completed={parentStatus === "VERIFIED"}
          />
          <View
            style={[
              styles.connector,
              parentStatus === "VERIFIED" && styles.connectorActive,
            ]}
          />
          <StepNode
            label="Child"
            active={step >= 2 || childStatus === "VERIFIED"}
            completed={childStatus === "VERIFIED"}
          />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <VerifyParentScreen onSuccess={handleParentSuccess} hideHeader />
        ) : (
          <VerifyChildScreen onSuccess={handleChildSuccess} hideHeader />
        )}
      </View>
    </Screen>
  );
}

function StepNode({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <View style={styles.stepNode}>
      <View
        style={[
          styles.stepCircle,
          active && styles.stepCircleActive,
          completed && styles.stepCircleCompleted,
        ]}
      >
        {completed ? (
          <Ionicons name="checkmark" size={14} color={colors.textInverse} />
        ) : (
          <Text
            variant="caption"
            style={{
              color: active ? colors.textInverse : colors.textTertiary,
            }}
          >
            {label.charAt(0)}
          </Text>
        )}
      </View>
      <Text
        variant="caption"
        tone={active ? "primary" : "tertiary"}
        weight={active ? "semibold" : "regular"}
        style={styles.stepLabel}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  stepper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  stepNode: {
    alignItems: "center",
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepLabel: {
    fontSize: 11,
  },
  connector: {
    width: 36,
    height: 2,
    backgroundColor: colors.borderSubtle,
    marginTop: -spacing[4],
  },
  connectorActive: {
    backgroundColor: colors.success,
  },
  content: {
    flex: 1,
  },
});
