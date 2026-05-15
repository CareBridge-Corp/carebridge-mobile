import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, spacing } from "../../../shared/theme";
import { Clinician } from "../store/clinicianStore";

interface VerifiedChildViewProps {
  clinician?: Clinician | null;
}

export function VerifiedChildView({ clinician }: VerifiedChildViewProps) {
  const router = useRouter();

  const treatmentPhases = [
    {
      title: "Phase 1 completed",
      subtitle: "Neurology specialist",
      status: "completed",
    },
    {
      title: "Speech therapy Phase 1",
      subtitle: "In Progress",
      status: "active",
      tasks: ["Playing games", "Walking and running", "Hearing exercise"],
      progress: [true, true, false, false, false],
    },
    { title: "Phase 3", subtitle: "Neurology specialist", status: "pending" },
  ];

  return (
    <View style={styles.container}>
      {/* Wave Section */}
      <View style={styles.waveContainer}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              {
                height: Math.random() * 30 + 10,
                backgroundColor: i % 2 === 0 ? "#BFDBFE" : "#94A3B8",
              },
            ]}
          />
        ))}
      </View>

      {/* Curator Section */}
      {clinician && (
        <TouchableOpacity
          style={styles.curatorCard}
          onPress={() =>
            router.push({
              pathname: "/(app)/(doctor)/doctor-details",
              params: { childId: clinician.userId }, // This would need the actual childId in reality
            } as any)
          }
        >
          <View style={styles.curatorInfo}>
            <View style={styles.curatorAvatarContainer}>
              {clinician.profilePictureUrl ? (
                <Image
                  source={{ uri: clinician.profilePictureUrl }}
                  style={styles.curatorAvatar}
                />
              ) : (
                <View style={[styles.curatorAvatar, styles.placeholderAvatar]}>
                  <Ionicons name="person" size={20} color={colors.white} />
                </View>
              )}
            </View>
            <View>
              <Text style={styles.curatorLabel}>Curated by</Text>
              <Text style={styles.curatorName}>
                {clinician.surname} {clinician.firstName} {clinician.lastName}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1DFE8" />
        </TouchableOpacity>
      )}

      {/* Timeline Section */}
      <View style={styles.timelineContainer}>
        {treatmentPhases.map((phase, index) => (
          <View key={index} style={styles.timelineItem}>
            {/* Connector Line */}
            {index < treatmentPhases.length - 1 && (
              <View style={styles.connector} />
            )}

            {/* Status Dot */}
            <View
              style={[
                styles.statusDot,
                phase.status === "completed" && styles.dotCompleted,
                phase.status === "active" && styles.dotActive,
              ]}
            />

            {/* Content */}
            <View style={styles.phaseContent}>
              <Text
                style={[
                  styles.phaseTitle,
                  phase.status === "completed" && styles.textMuted,
                ]}
              >
                {phase.title}
              </Text>
              <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>

              {phase.status === "active" && (
                <View style={styles.activePhaseCard}>
                  {phase.tasks?.map((task, i) => (
                    <View key={i} style={styles.taskItem}>
                      <View style={styles.taskCheckCircle} />
                      <Text style={styles.taskText}>{task}</Text>
                    </View>
                  ))}

                  <View style={styles.progressRow}>
                    <View style={styles.dotsContainer}>
                      {phase.progress?.map((done, i) => (
                        <View
                          key={i}
                          style={[
                            styles.progressDot,
                            done && styles.progressDotDone,
                          ]}
                        >
                          {done && (
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color="#0C4A6E"
                            />
                          )}
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity style={styles.expandButton}>
                      <Ionicons
                        name="arrow-up-outline"
                        size={20}
                        color="#0C4A6E"
                        style={{ transform: [{ rotate: "45deg" }] }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Resources Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Resources</Text>
        <TouchableOpacity style={styles.seeMore}>
          <Text style={styles.seeMoreText}>See More</Text>
          <Ionicons name="chevron-forward" size={14} color="#A0B8C8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.resourcesScroll}
      >
        <View style={styles.resourceCard}>
          <Text style={styles.resourceCategory}>Speech therapy</Text>
          <Text style={styles.resourceTitle} numberOfLines={4}>
            Speech therapy Phase 1 Fill out the information and start the
            treatment Fill out the information and start the treatment
          </Text>
        </View>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceCategory}>Speech therapy</Text>
          <Text style={styles.resourceTitle} numberOfLines={4}>
            Speech therapy Phase 2 Next steps in communication improvement
          </Text>
        </View>
      </ScrollView>

      {/* Sensory Games */}
      <Text
        style={[
          styles.sectionTitle,
          { marginTop: spacing.xl, marginBottom: spacing.md },
        ]}
      >
        Try this sensory Games
      </Text>
      <View style={styles.gamesRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.gamePlaceholder} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 40,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
  },
  curatorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: spacing.xxl,
  },
  curatorInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  curatorAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  curatorAvatar: { width: "100%", height: "100%" },
  placeholderAvatar: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  curatorLabel: {
    fontSize: 12,
    color: "#A0B8C8",
    marginBottom: 2,
  },
  curatorName: { fontSize: 16, fontWeight: "700", color: "#0C4A6E" },
  timelineContainer: {
    paddingLeft: spacing.xs,
    marginBottom: spacing.huge,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: spacing.xxl,
    position: "relative",
  },
  connector: {
    position: "absolute",
    left: 9,
    top: 24,
    bottom: -36,
    width: 2,
    backgroundColor: "#F1F5F9",
    zIndex: -1,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: colors.white,
    marginTop: 4,
  },
  dotCompleted: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  dotActive: {
    borderColor: "#0C4A6E",
    borderWidth: 5,
  },
  phaseContent: { marginLeft: spacing.lg, flex: 1 },
  phaseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0C4A6E",
    letterSpacing: -0.5,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: "#A0B8C8",
    marginTop: 4,
  },
  textMuted: { color: "#94A3B8" },
  activePhaseCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 28,
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginRight: 0,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: spacing.md,
  },
  taskCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: colors.white,
  },
  taskText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0C4A6E",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  dotsContainer: { flexDirection: "row", gap: 10 },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDF2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  progressDotDone: {
    backgroundColor: "#DBEAFE",
  },
  expandButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0C4A6E",
    letterSpacing: -0.5,
  },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeMoreText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },
  resourcesScroll: {
    marginHorizontal: -spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  resourceCard: {
    width: 280,
    backgroundColor: "#F8FAFC",
    borderRadius: 28,
    padding: spacing.xl,
    marginRight: spacing.lg,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  resourceCategory: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C4A6E",
    lineHeight: 24,
  },
  gamesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.xs,
  },
  gamePlaceholder: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
});
