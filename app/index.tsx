import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Text, View } from "react-native";

export default function Index() {
  const emails = useQuery(api.email.list);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>ygygu</Text>
      {emails?.map(({ _id, From }) => <Text key={_id}>{From}</Text>)}
    </View>
  );
}
