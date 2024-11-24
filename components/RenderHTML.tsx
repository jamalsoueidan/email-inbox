import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Platform, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { WebView } from "react-native-webview";
import sanitizeHtml from "sanitize-html";

export function RenderHTML({
  body,
  inModal = false,
  withRadius = true,
}: {
  body: string;
  withRadius?: boolean;
  inModal?: boolean;
}) {
  // Sanitize the HTML content
  const sanitizedHtml = sanitizeHtml(body, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "style"], // Allow images
    },
  });

  // Web rendering using sanitized HTML
  if (Platform.OS === "web" && inModal) {
    return (
      <BottomSheetScrollView style={[withRadius && styles.radius]}>
        <div
          style={styles.webContainer}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </BottomSheetScrollView>
    );
  }

  if (Platform.OS === "web" && !inModal) {
    return (
      <ScrollView style={[withRadius && styles.radius]}>
        <div
          style={styles.webContainer}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </ScrollView>
    );
  }

  // Mobile rendering using WebView
  return (
    <WebView
      source={{ html: sanitizedHtml }}
      containerStyle={[withRadius && styles.radius]}
      style={{ flex: 1 }}
      scalesPageToFit={false}
      originWhitelist={["*"]}
      nestedScrollEnabled
    />
  );
}

const styles = StyleSheet.create({
  radius: {
    borderBottomRightRadius: 7,
    borderBottomLeftRadius: 7,
  },
  webContainer: {
    width: "100%",
    height: "100%",
    padding: 8,
  },
});
