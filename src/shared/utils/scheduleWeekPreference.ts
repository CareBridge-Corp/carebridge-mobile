import AsyncStorage from "@react-native-async-storage/async-storage";

const storageKey = (childId: string) => `schedule-active-week-${childId}`;

export async function getPersistedWeekPlanId(
  childId: string,
): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(storageKey(childId));
  } catch {
    return null;
  }
}

export async function persistWeekPlanId(
  childId: string,
  weekPlanId: string,
): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(childId), weekPlanId);
  } catch {
    // ignore storage failures
  }
}

export function resolveMediaUrl(
  mediaUrl: string | null | undefined,
  mediaLinks: string[] | undefined,
): string | null {
  const trimmed = mediaUrl?.trim();
  if (trimmed) return trimmed;

  const links = mediaLinks ?? [];
  const preferred = links.find((link) =>
    /youtube\.com|youtu\.be|vimeo\.com/i.test(link),
  );
  return preferred ?? links[0] ?? null;
}

export function isYoutubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}
