import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import StatusModal from "../../../shared/components/StatusModal";
import {
  Avatar,
  IconButton,
  Text,
} from "../../../shared/components/ui";
import {
  borderRadius,
  colors,
  shadows,
  spacing,
} from "../../../shared/theme";
import { useDeleteChild } from "../hooks/useChildren";
import { useEntitlements } from "../hooks/useEntitlements";
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
  const { data: entitlements } = useEntitlements();
  const deleteMutation = useDeleteChild();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [childToDelete, setChildToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSelectChild = (child: Child) => {
    setActiveChild(child);
    onClose();
  };

  const handleAddChild = () => {
    onClose();
    if (entitlements && !entitlements.canAddChild) {
      router.push("/(app)/payment" as Href);
      return;
    }
    router.push("/(app)/(child)/create-child" as Href);
  };

  const handleDeleteChild = (childId: string, childName: string) => {
    setChildToDelete({ id: childId, name: childName });
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (!childToDelete) return;
    deleteMutation.mutate(childToDelete.id, {
      onSuccess: () => {
        if (activeChild?.childId === childToDelete.id) {
          setActiveChild(null);
        }
        setDeleteModalVisible(false);
        setChildToDelete(null);
      },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text variant="title2">Select child</Text>
            <IconButton
              icon="close"
              accessibilityLabel="Close"
              onPress={onClose}
            />
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {children.map((child) => {
              const isActive = activeChild?.childId === child.childId;
              const isDeleting =
                deleteMutation.isPending &&
                deleteMutation.variables === child.childId;

              return (
                <View key={child.childId} style={styles.itemContainer}>
                  <Pressable
                    onPress={() => handleSelectChild(child)}
                    style={({ pressed }) => [
                      styles.item,
                      isActive && styles.itemActive,
                      pressed && styles.itemPressed,
                    ]}
                  >
                    <Avatar
                      uri={child.profilePictureUrl}
                      name={child.firstName}
                      size="md"
                    />
                    <View style={styles.itemInfo}>
                      <Text variant="body" weight="semibold">
                        {child.firstName}
                      </Text>
                      <Text variant="caption" tone="secondary">
                        {child.gender} · {calculateAge(child.dob)}
                      </Text>
                    </View>
                    {isActive ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.success}
                      />
                    ) : null}
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      handleDeleteChild(child.childId, child.firstName)
                    }
                    disabled={isDeleting}
                    style={({ pressed }) => [
                      styles.deleteBtn,
                      pressed && styles.itemPressed,
                    ]}
                    hitSlop={6}
                    accessibilityLabel={`Delete ${child.firstName}`}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.error}
                      />
                    )}
                  </Pressable>
                </View>
              );
            })}

            <Pressable
              style={({ pressed }) => [
                styles.addRow,
                pressed && styles.itemPressed,
              ]}
              onPress={handleAddChild}
            >
              <View style={styles.addIcon}>
                <Ionicons name="add" size={22} color={colors.primary} />
              </View>
              <Text variant="body" weight="semibold" tone="brand">
                Add another child
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>

      <StatusModal
        visible={deleteModalVisible}
        type="error"
        title="Delete child profile"
        message={`Remove ${childToDelete?.name}? This action cannot be undone.`}
        primaryButtonText={
          deleteMutation.isPending ? "Deleting..." : "Yes, delete"
        }
        onPrimaryPress={confirmDelete}
        secondaryButtonText="Cancel"
        onSecondaryPress={() => {
          setDeleteModalVisible(false);
          setChildToDelete(null);
        }}
      />
    </Modal>
  );
}

function calculateAge(dob: string): string {
  const birthDate = new Date(dob);
  const today = new Date();
  const months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""}`;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing[2],
    paddingBottom: spacing[8],
    maxHeight: "80%",
    ...shadows.lg,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  list: {
    paddingHorizontal: spacing[3],
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
  },
  itemActive: {
    backgroundColor: colors.primaryMuted,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemInfo: {
    flex: 1,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    marginTop: spacing[2],
    borderRadius: borderRadius.lg,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
});
