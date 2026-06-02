import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSymbolName = string;

const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>["name"]> = {
  // Navigation / tabs
  "house.fill":                         "home",
  "magnifyingglass":                    "search",
  "heart.fill":                         "favorite",
  "heart":                              "favorite-border",
  "person.fill":                        "person",
  "calendar":                           "event",
  "paperplane.fill":                    "send",

  // Chevrons / arrows
  "chevron.right":                      "chevron-right",
  "chevron.left":                       "chevron-left",
  "chevron.up":                         "expand-less",
  "chevron.down":                       "expand-more",
  "chevron.left.forwardslash.chevron.right": "code",
  "arrowshape.left.fill":               "logout",
  "arrow.right":                        "arrow-forward",
  "arrow.left":                         "arrow-back",

  // Contact / communication
  "phone.fill":                         "phone",
  "message.fill":                       "chat",
  "envelope.fill":                      "email",

  // UI actions
  "checkmark":                          "check-circle",
  "xmark.circle.fill":                  "cancel",
  "xmark":                              "close",
  "star.fill":                          "star",
  "clock":                              "schedule",
  "pencil":                             "edit",
  "trash":                              "delete",
  "plus":                               "add",

  // Profile / support menu
  "doc.fill":                           "description",
  "lock.fill":                          "lock",
  "info.circle.fill":                   "info",
  "questionmark.circle.fill":           "help",
  "bell.fill":                          "notifications",
  "gear":                               "settings",
  "share":                              "share",
  "location.fill":                      "location-on",
  "camera.fill":                        "photo-camera",
  "globe":                              "language",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const materialName = MAPPING[name] ?? "circle";
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}
