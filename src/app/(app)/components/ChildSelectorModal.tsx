import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { Child, useChildrenStore } from "../store/childrenStore";

interface ChildSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChildSelectorModal({
  visible,
  onClose,
}: ChildSelectorModalProps) {
  const router = useRouter();
  const { children, activeChild, setActiveChild } = useChildrenStore();

  const handleSelectChild = (child: Child) => {
    setActiveChild(child);
    onClose();
  };

  const handleAddChild = () => {
    onClose();
    router.push("/(app)/create-child" as Href);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Select Child</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#0C4A6E" />
                </TouchableOpacity>
              </View>

              {/* Children List */}
              <ScrollView
                style={styles.childrenList}
                showsVerticalScrollIndicator={false}
              >
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.childId}
                    style={[
                      styles.childItem,
                      activeChild?.childId === child.childId &&
                        styles.childItemActive,
                    ]}
                    onPress={() => handleSelectChild(child)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.childAvatar}>
                      {child.profilePictureUrl ? (
                        <Image
                          source={{ uri: child.profilePictureUrl }}
                          style={styles.childAvatarImage}
                        />
                      ) : (
                        <Ionicons name="person" size={24} color="#0C4A6E" />
                      )}
                    </View>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.firstName}</Text>
                      <Text style={styles.childDetails}>
                        {child.gender} • {calculateAge(child.dob)}
                      </Text>
                    </View>
                    {activeChild?.childId === child.childId && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#10B981"
                      />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Add Child Button */}
                <TouchableOpacity
                  style={styles.addChildButton}
                  onPress={handleAddChild}
                  activeOpacity={0.7}
                >
                  <View style={styles.addChildIcon}>
                    <Ionicons name="add" size={24} color="#0C4A6E" />
                  </View>
                  <Text style={styles.addChildText}>Add Another Child</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function calculateAge(dob: string): string {
  const birthDate = new Date(dob);
  const today = new Date();
  const months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());

  if (months < 12) {
    return `${months} months`;
  } else {
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxHeight: "70%",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0F5",
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  closeButton: {
    padding: spacing.xs,
  },
  childrenList: {
    maxHeight: 400,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  childItemActive: {
    backgroundColor: "#F0F7FB",
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  childAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  childDetails: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  addChildButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E8F0F5",
  },
  addChildIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  addChildText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
});
