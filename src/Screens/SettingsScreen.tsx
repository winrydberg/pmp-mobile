import React, { useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Avatar, Divider, Text } from "@rneui/themed";
import { useAuth } from "../Context/AuthContext";
import { secondaryColor } from "../helpers/colors";

type User = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

type SettingsScreenProps = {
  route: {
    params?: {
      user?: User;
    };
  };
  navigation: {
    push: (screen: string) => void;
    replace: (screen: string) => void;
  };
};

export default function SettingsScreen({
  route,
  navigation,
}: SettingsScreenProps) {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const { authData, logout } = useAuth();

  useEffect(() => {
    // If you still want to fetch from storage, keep your helper here
    // getAuthUser().then(usr => setUser(usr));
    setUser(authData?.user ?? null);
  }, [authData]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout(); // This clears auth and navigates appropriately
    } catch (error: any) {
      console.error("Logout Error: ", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Profile Info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingHorizontal: 20,
          paddingVertical: 24,
        }}
      >
        <Avatar
          containerStyle={{ backgroundColor: secondaryColor }}
          size={68}
          rounded
          title={
            authData?.user?.first_name && authData?.user?.last_name
              ? `${authData?.user.first_name[0]}${authData?.user.last_name[0]}`
              : "G"
          }
        />
        <View>
          <Text style={{ fontSize: 20, fontWeight: "500" }}>
            {authData?.user?.first_name ?? "Guest"} {authData?.user?.last_name ?? ""}
          </Text>
          <Text style={{ fontSize: 16, color: 'gray' }}>{authData?.user?.email ?? 'johndoe@gmail.com'}</Text>
        </View>
      </View>

      <Divider />

      {/* Settings List */}
      <ScrollView
        style={{
          flex: 1,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Settings Section */}
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          Account Settings
        </Text>

        {[
          {
            label: "Personal Information",
            icon: <Feather name="user" size={24} />,
            screen: "PersonalInfo",
          },
          {
            label: "Password & Security",
            icon: <Feather name="lock" size={24} />,
            screen: "PasswordSecurity",
          },
          {
            label: "Notification Preferences",
            icon: <Ionicons name="notifications-outline" size={24} />,
            screen: "NotificationPreferences",
          },
        ].map(({ label, icon, screen }) => (
          <TouchableOpacity
            key={label}
            onPress={() => navigation.push(screen)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              {icon}
              <Text>{label}</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#30a280" />
          </TouchableOpacity>
        ))}

        {/* Other Section */}
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            marginVertical: 16,
          }}
        >
          Other
        </Text>

        {[
          {
            label: "FAQ",
            icon: <Feather name="help-circle" size={24} />,
            screen: "FAQ",
          },
          {
            label: "Help Center",
            icon: <Ionicons name="chatbubble-ellipses-outline" size={24} />,
            screen: "HelpCenter",
          },
          {
            label: "Privacy Policy",
            icon: <Feather name="info" size={24} />,
            screen: "PrivacyPolicyScreen",
          },
        ].map(({ label, icon, screen }) => (
          <TouchableOpacity
            key={label}
            onPress={() => navigation.push(screen)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              {icon}
              <Text>{label}</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#30a280" />
          </TouchableOpacity>
        ))}

        <Divider style={{ marginVertical: 24 }} />

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 16,
            gap: 16,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <AntDesign name="logout" size={24} color="red" />
          )}
          <Text style={{ color: "red" }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "700",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
  },
  profileEmail: {
    fontSize: 16,
  },
  scrollView: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    justifyContent: "center",
  },
  logoutText: {
    color: "red",
    fontSize: 20,
    fontWeight: "600",
  },
});
