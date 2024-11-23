import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Platform, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { WebView } from "react-native-webview"; // For mobile devices
import sanitizeHtml from "sanitize-html";

export function RenderHTML({
  body,
  enableScrollView = false,
}: {
  body: string;
  enableScrollView?: boolean;
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
  if (Platform.OS === "web" && enableScrollView) {
    return (
      <BottomSheetScrollView style={styles.scrollView}>
        <div
          style={styles.webContainer}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </BottomSheetScrollView>
    );
  }

  if (Platform.OS === "web" && !enableScrollView) {
    return (
      <ScrollView style={styles.scrollView}>
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
      style={{ flex: 1 }}
      originWhitelist={["*"]}
    />
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginBottom: 14,
  },
  webContainer: {
    width: "100%",
    height: "100%",
  },
});
