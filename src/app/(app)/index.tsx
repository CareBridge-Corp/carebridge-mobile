import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

export default function AppHomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.userName}>Abenezer</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={colors.text} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Pediatricians Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            More than 20{"\n"}Pediatricians
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.doctorsScroll}
          >
            {/* Doctor Card 1 */}
            <View style={styles.doctorCard}>
              <Image
                source={require("../../../assets/docs/doc1.png")}
                style={styles.doctorImage}
                resizeMode="cover"
              />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Ermias Lema</Text>
                <Text style={styles.doctorSpecialty}>Neurology specialist</Text>
              </View>
              <TouchableOpacity style={styles.favoriteButton}>
                <View style={styles.favoriteCircle} />
              </TouchableOpacity>
            </View>

            {/* Doctor Card 2 */}
            <View style={styles.doctorCard}>
              <Image
                source={require("../../../assets/docs/doc2.png")}
                style={styles.doctorImage}
                resizeMode="cover"
              />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Ermias Lema</Text>
                <Text style={styles.doctorSpecialty}>Neurology specialist</Text>
              </View>
              <TouchableOpacity style={styles.favoriteButton}>
                <View style={styles.favoriteCircle} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Child Info Card */}
        <View style={styles.childInfoCard}>
          <View style={styles.childInfoHeader}>
            <View style={styles.childInfoTextContainer}>
              <Text style={styles.childInfoTitle}>
                Provide us your{"\n"}child's info
              </Text>
              <Text style={styles.childInfoSubtitle}>
                Lorem ipsum doler situm amet and his{"\n"}Your information is
                safe with us
              </Text>
            </View>
            <View style={styles.childInfoCircle} />
          </View>

          {/* Safety Info */}
          <View style={styles.safetyInfo}>
            <View style={styles.shieldIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={styles.safetyTitle}>Safety and regulations</Text>
              <Text style={styles.safetySubtitle}>
                Your information is safe with us
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} activeOpacity={0.8}>
            <View style={styles.continueIconCircle}>
              <View style={styles.continueIconInner} />
            </View>
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.primary}
              style={styles.chevronSecond}
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBlue,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.md,
    color: colors.textMedium,
    marginBottom: 4,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.tight * typography.fontSize.xxl,
  },
  doctorsScroll: {
    marginHorizontal: -spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  doctorCard: {
    width: 200,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginRight: spacing.lg,
    position: "relative",
  },
  doctorImage: {
    width: "100%",
    height: 120,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  doctorInfo: {
    gap: 4,
  },
  doctorName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  doctorSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.textMedium,
  },
  favoriteButton: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
  },
  favoriteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  childInfoCard: {
    backgroundColor: colors.cardLightBlue,
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xl,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
  },
  childInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xxxl,
  },
  childInfoTextContainer: {
    flex: 1,
  },
  childInfoTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.tight * typography.fontSize.xxl,
  },
  childInfoSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textMedium,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  childInfoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    opacity: 0.5,
  },
  safetyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  shieldIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  safetyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  safetySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textMedium,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  continueIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  continueIconInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
  },
  continueText: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  chevronSecond: {
    marginLeft: -16,
  },
});
