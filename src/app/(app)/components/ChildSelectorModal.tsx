import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import StatusModal from "../../../shared/components/StatusModal";
import {
  Avatar,
  Button,
  IconButton,
  Text,
} from "../../../shared/components/ui";
import {
  borderRadius,
  colors,
  shadows,
  spacing,
} from "../../../shared/theme";
import {
  useDeleteChild,
  useUpdateChildBirthDate,
} from "../hooks/useChildren";
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
  const updateBirthDateMutation = useUpdateChildBirthDate();
  const resetBirthDateMutation = updateBirthDateMutation.reset;

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [childToDelete, setChildToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [draftBirthDate, setDraftBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!visible) {
      setEditingChild(null);
      setShowDatePicker(false);
      resetBirthDateMutation();
    }
  }, [resetBirthDateMutation, visible]);

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

  const handleEditBirthDate = (child: Child) => {
    setEditingChild(child);
    setDraftBirthDate(parseDateOfBirth(child.dob));
    setShowDatePicker(false);
    updateBirthDateMutation.reset();
  };

  const handleDateChange = (event: { type: string }, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      setDraftBirthDate(selectedDate);
    }
    if (Platform.OS === "android" || event.type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  const handleSaveBirthDate = () => {
    if (!editingChild) return;

    updateBirthDateMutation.mutate(
      {
        childId: editingChild.childId,
        dob: formatDate(draftBirthDate),
      },
      {
        onSuccess: () => {
          setEditingChild(null);
          setShowDatePicker(false);
        },
      },
    );
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
              const isEditing = editingChild?.childId === child.childId;
              const isSaving =
                updateBirthDateMutation.isPending &&
                updateBirthDateMutation.variables?.childId === child.childId;

              return (
                <View key={child.childId} style={styles.childBlock}>
                  <View style={styles.itemContainer}>
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
                          {child.gender} · {formatAgeInMonths(child.dob)}
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
                      onPress={() => handleEditBirthDate(child)}
                      disabled={isSaving}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        isEditing && styles.editBtnActive,
                        pressed && styles.itemPressed,
                      ]}
                      hitSlop={6}
                      accessibilityLabel={`Edit ${child.firstName}'s date of birth`}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={isEditing ? colors.primary : colors.iconMuted}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        handleDeleteChild(child.childId, child.firstName)
                      }
                      disabled={isDeleting}
                      style={({ pressed }) => [
                        styles.actionBtn,
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

                  {isEditing ? (
                    <View style={styles.editor}>
                      <View style={styles.editorHeading}>
                        <View>
                          <Text variant="body" weight="semibold">
                            Edit date of birth
                          </Text>
                          <Text variant="caption" tone="secondary">
                            {formatAgeInMonths(formatDate(draftBirthDate))}
                          </Text>
                        </View>
                        <Ionicons
                          name="calendar"
                          size={20}
                          color={colors.primary}
                        />
                      </View>

                      <Pressable
                        onPress={() => setShowDatePicker(true)}
                        style={({ pressed }) => [
                          styles.dateField,
                          pressed && styles.itemPressed,
                        ]}
                      >
                        <Text variant="caption" tone="secondary">
                          Birth date
                        </Text>
                        <Text variant="body" weight="semibold">
                          {formatDate(draftBirthDate)}
                        </Text>
                      </Pressable>

                      {showDatePicker ? (
                        <DateTimePicker
                          value={draftBirthDate}
                          mode="date"
                          display={Platform.OS === "ios" ? "spinner" : "default"}
                          maximumDate={new Date()}
                          onChange={handleDateChange}
                        />
                      ) : null}

                      {updateBirthDateMutation.error ? (
                        <Text variant="caption" style={styles.errorText}>
                          {updateBirthDateMutation.error instanceof Error
                            ? updateBirthDateMutation.error.message
                            : "Could not update the date of birth"}
                        </Text>
                      ) : null}

                      <View style={styles.editorActions}>
                        <Button
                          label="Cancel"
                          variant="secondary"
                          size="sm"
                          fullWidth={false}
                          disabled={isSaving}
                          style={styles.editorButton}
                          onPress={() => {
                            setEditingChild(null);
                            setShowDatePicker(false);
                          }}
                        />
                        <Button
                          label="Save birth date"
                          size="sm"
                          fullWidth={false}
                          loading={isSaving}
                          style={styles.editorButton}
                          onPress={handleSaveBirthDate}
                        />
                      </View>
                    </View>
                  ) : null}
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

function parseDateOfBirth(dob: string): Date {
  const [year, month, day] = dob.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function calculateAgeInMonths(dob: string): number {
  const birthDate = parseDateOfBirth(dob);
  const today = new Date();
  let months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());
  if (today.getDate() < birthDate.getDate()) months -= 1;
  return Math.max(0, months);
}

function formatAgeInMonths(dob: string): string {
  const months = calculateAgeInMonths(dob);
  return `${months} month${months === 1 ? "" : "s"} old`;
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
  childBlock: {
    marginBottom: spacing[1],
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
  actionBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  editBtnActive: {
    backgroundColor: colors.primaryMuted,
  },
  editor: {
    marginHorizontal: spacing[3],
    marginBottom: spacing[3],
    padding: spacing[4],
    gap: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  editorHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateField: {
    gap: spacing[1],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  editorActions: {
    flexDirection: "row",
    gap: spacing[2],
  },
  editorButton: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
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
